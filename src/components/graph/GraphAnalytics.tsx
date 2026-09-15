import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AtlasClaim, AtlasNode } from '@/types';
import { isNullResult } from '@/lib/claims-model';
import { betweennessCentrality, claimsAlongPath, claimsRestingOn, communities, components, degrees, pageRank, reachable, shortestPath, simplePaths } from '@/lib/graph-analytics';
import { styleForType } from '@/lib/graph-style';

type Metric = 'degree' | 'pagerank' | 'betweenness' | 'components' | 'louvain';
const METRIC_NOTE: Record<Metric, string> = {
  degree: 'How many claims touch the node, in and out. Counted in claims, so two claims between the same pair count twice.',
  pagerank: 'PageRank over the claim graph, weighted by how many claims join each pair. A node scores highly when claims from well-connected nodes point at it.',
  betweenness: 'Betweenness on the undirected projection: how often a node lies on a shortest path between two others. High betweenness marks a joint between literatures.',
  components: 'Weakly connected components — how the claim set breaks into disconnected islands. The claims are the review’s, so islands mean the review never joins those mechanisms.',
  louvain: 'Louvain communities on the undirected weighted projection, at the resolution you choose. Communities are a property of the algorithm as much as of the graph: change the resolution and they change.',
};

const fmt = (v: number) => (v >= 0.01 ? v.toFixed(4) : v.toExponential(2));

export default function GraphAnalytics({ nodes, claims, onSelectNode, onSelectClaim, onHighlight, restingOn }: {
  nodes: AtlasNode[];
  claims: AtlasClaim[];
  onSelectNode: (id: string) => void;
  onSelectClaim: (id: string) => void;
  onHighlight: (ids: string[]) => void;
  restingOn: number[] | null;
}) {
  const uid = useId();
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const input = useMemo(() => ({ nodes, claims }), [nodes, claims]);
  const [metric, setMetric] = useState<Metric>('degree');
  const [directed, setDirected] = useState(true);
  const [resolution, setResolution] = useState(1);
  const [ran, setRan] = useState<{ metric: Metric; rows: { id: string; value: number; note?: string }[]; summary: string } | null>(null);

  // paths
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [depth, setDepth] = useState(4);
  const [preset, setPreset] = useState<'any' | 'drive-outcome'>('any');
  const [paths, setPaths] = useState<{ list: string[][]; truncated: boolean; note: string } | null>(null);

  const labelOf = (id: string) => byId.get(id)?.label ?? id;
  const optionLabel = (n: AtlasNode) => `${n.label} — ${n.type}`;
  const pickable = useMemo(() => {
    const all = [...nodes].sort((a, b) => a.label.localeCompare(b.label));
    if (preset !== 'drive-outcome') return { sources: all, targets: all };
    return { sources: all.filter((n) => n.type === 'ExogenousDrive'), targets: all.filter((n) => n.type === 'Outcome') };
  }, [nodes, preset]);
  const idFor = (text: string, pool: AtlasNode[]) => pool.find((n) => optionLabel(n) === text)?.id ?? pool.find((n) => n.label === text)?.id ?? '';

  const run = () => {
    if (metric === 'components') {
      const cs = components(input);
      const rows = cs.slice(0, 50).map((c, i) => ({ id: c[0], value: c.length, note: `component ${i + 1}: ${c.slice(0, 3).map(labelOf).join(', ')}${c.length > 3 ? ` and ${c.length - 3} more` : ''}` }));
      setRan({ metric, rows, summary: `${cs.length} weakly connected components; the largest holds ${cs[0]?.length ?? 0} of ${nodes.length} nodes.` });
      onHighlight(cs[0] ?? []);
      return;
    }
    if (metric === 'louvain') {
      const c = communities(input, resolution);
      const sizes = new Map<number, string[]>();
      for (const [id, com] of Object.entries(c.membership)) { if (!sizes.has(com)) sizes.set(com, []); sizes.get(com)!.push(id); }
      const rows = [...sizes.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 50)
        .map(([com, ids]) => ({ id: ids[0], value: ids.length, note: `community ${com}: ${ids.slice(0, 3).map(labelOf).join(', ')}${ids.length > 3 ? ` and ${ids.length - 3} more` : ''}` }));
      setRan({ metric, rows, summary: `${c.count} communities at resolution ${resolution.toFixed(1)}; modularity ${c.modularity.toFixed(3)}.` });
      onHighlight([...sizes.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[1] ?? []);
      return;
    }
    const scores = metric === 'degree'
      ? Object.fromEntries(degrees(input).map((d) => [d.id, d.total]))
      : metric === 'pagerank' ? pageRank(input, { directed }) : betweennessCentrality(input, { directed: false });
    const rows = Object.entries(scores).map(([id, value]) => ({ id, value })).sort((a, b) => b.value - a.value || a.id.localeCompare(b.id)).slice(0, 50);
    setRan({ metric, rows, summary: `${metric === 'degree' ? 'Degree' : metric === 'pagerank' ? `PageRank (${directed ? 'directed' : 'undirected'})` : 'Betweenness (undirected)'} over ${nodes.length} nodes and ${claims.length} claims. Top 50 shown.` });
    onHighlight(rows.slice(0, 20).map((r) => r.id));
  };

  const findPaths = () => {
    const a = idFor(from, pickable.sources);
    const b = idFor(to, pickable.targets);
    if (!a || !b) { setPaths({ list: [], truncated: false, note: 'Pick a start and an end node from the lists.' }); return; }
    const sp = shortestPath(input, a, b, directed);
    const all = simplePaths(input, a, b, { maxDepth: depth, directed });
    const list = all.paths.length ? all.paths : sp ? [sp] : [];
    const note = list.length
      ? `${all.paths.length} simple path(s) of at most ${depth} claims${all.truncated ? ' (truncated to 200)' : ''}; the shortest has ${(sp?.length ?? 1) - 1} claims.`
      : `No path of ${depth} claims or fewer${directed ? ' following claim direction' : ''} joins these two nodes. The claim set is the review's: where it never joins two mechanisms, the graph has no path.`;
    setPaths({ list, truncated: all.truncated, note });
    onHighlight(list.flat());
  };

  const reachableFrom = useMemo(() => {
    const a = idFor(from, pickable.sources);
    return a ? reachable(input, a, depth, directed) : null;
  }, [from, pickable.sources, input, depth, directed]);

  const resting = restingOn ? claimsRestingOn(claims, restingOn) : null;

  return (
    <div className="grid gap-6">
      <section aria-labelledby={`${uid}-metrics-h`}>
        <h3 id={`${uid}-metrics-h`} className="text-xl">Analyse in your browser</h3>
        <p className="bx-prose mt-1">Everything here runs on the claims in the current view, in this tab. Nothing is sent anywhere.</p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-sm">Measure
            <select className="bx-input mt-1 !w-auto" value={metric} onChange={(e) => setMetric(e.target.value as Metric)} data-testid="metric-select">
              <option value="degree">Degree</option><option value="pagerank">PageRank</option><option value="betweenness">Betweenness</option>
              <option value="components">Connected components</option><option value="louvain">Louvain communities</option>
            </select>
          </label>
          {(metric === 'pagerank' || metric === 'degree') && (
            <label className="text-sm inline-flex items-center gap-1"><input type="checkbox" checked={directed} onChange={(e) => setDirected(e.target.checked)} /> follow claim direction</label>
          )}
          {metric === 'louvain' && (
            <label className="text-sm">Resolution {resolution.toFixed(1)}
              <input className="block mt-1" type="range" min={0.4} max={2} step={0.1} value={resolution} onChange={(e) => setResolution(Number(e.target.value))} data-testid="resolution" />
            </label>
          )}
          <button type="button" className="bx-btn-primary" onClick={run} data-testid="run-metric">Compute</button>
        </div>
        <p className="mt-2 text-sm bx-muted">{METRIC_NOTE[metric]}</p>
        {ran && (
          <>
            <p className="mt-3 text-sm" role="status" data-testid="metric-summary">{ran.summary}</p>
            <div className="relative mt-2 overflow-x-auto">
              <table className="w-full text-sm border-collapse" data-testid="metric-table">
                <caption className="sr-only">{ran.metric} results</caption>
                <thead><tr>{['#', 'Node', 'Type', ran.metric === 'components' || ran.metric === 'louvain' ? 'Size' : 'Value'].map((h) => <th key={h} scope="col" className="border-b-2 border-[color:var(--bx-line)] px-2 py-1 text-left font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {ran.rows.map((r, i) => {
                    const n = byId.get(r.id);
                    return (
                      <tr key={`${r.id}-${i}`} className="odd:bg-white/40 dark:odd:bg-night-2/40">
                        <td className="border-b border-[color:var(--bx-line)] px-2 py-1 tabular-nums bx-muted">{i + 1}</td>
                        <td className="border-b border-[color:var(--bx-line)] px-2 py-1"><button type="button" className="underline text-left" onClick={() => onSelectNode(r.id)}>{n?.label ?? r.id}</button>{r.note && <span className="block text-xs bx-muted">{r.note}</span>}</td>
                        <td className="border-b border-[color:var(--bx-line)] px-2 py-1 text-xs">{n && <><span aria-hidden="true" style={{ color: styleForType(n.type).colour }}>{styleForType(n.type).glyph}</span> {n.type}</>}</td>
                        <td className="border-b border-[color:var(--bx-line)] px-2 py-1 tabular-nums">{Number.isInteger(r.value) ? r.value : fmt(r.value)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby={`${uid}-paths-h`}>
        <h3 id={`${uid}-paths-h`} className="text-xl">Paths</h3>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-sm">Preset
            <select className="bx-input mt-1 !w-auto" value={preset} onChange={(e) => { setPreset(e.target.value as 'any' | 'drive-outcome'); setFrom(''); setTo(''); setPaths(null); }} data-testid="path-preset">
              <option value="any">Any node → any node</option>
              <option value="drive-outcome">Drive → outcome</option>
            </select>
          </label>
          <label className="text-sm">From
            <input className="bx-input mt-1 min-w-[16rem]" list={`${uid}-sources`} value={from} onChange={(e) => setFrom(e.target.value)} placeholder={preset === 'drive-outcome' ? 'an ExogenousDrive…' : 'a node…'} data-testid="path-from" />
            <datalist id={`${uid}-sources`}>{pickable.sources.map((n) => <option key={n.id} value={optionLabel(n)} />)}</datalist>
          </label>
          <label className="text-sm">To
            <input className="bx-input mt-1 min-w-[16rem]" list={`${uid}-targets`} value={to} onChange={(e) => setTo(e.target.value)} placeholder={preset === 'drive-outcome' ? 'an Outcome…' : 'a node…'} data-testid="path-to" />
            <datalist id={`${uid}-targets`}>{(reachableFrom ? pickable.targets.filter((n) => reachableFrom.has(n.id)) : pickable.targets).map((n) => <option key={n.id} value={optionLabel(n)} />)}</datalist>
          </label>
          <label className="text-sm">At most
            <select className="bx-input mt-1 !w-auto" value={depth} onChange={(e) => setDepth(Number(e.target.value))}>{[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d} claims</option>)}</select>
          </label>
          <button type="button" className="bx-btn-primary" onClick={findPaths} data-testid="find-paths">Find paths</button>
        </div>
        {reachableFrom && <p className="mt-2 text-xs bx-muted">{reachableFrom.size} nodes are reachable from the start node within {depth} claims{preset === 'drive-outcome' ? `, of which ${pickable.targets.filter((n) => reachableFrom.has(n.id)).length} are outcomes — the "To" list shows only those` : ''}.</p>}
        {paths && (
          <>
            <p className="mt-2 text-sm" role="status" data-testid="paths-note">{paths.note}</p>
            <ol className="mt-2 grid gap-2 text-sm">
              {paths.list.slice(0, 25).map((p, i) => (
                <li key={i} className="bx-card p-2">
                  <p className="flex flex-wrap items-center gap-1">{p.map((id, j) => <span key={id}>{j > 0 && <span aria-hidden="true" className="mx-1">→</span>}<button type="button" className="underline" onClick={() => onSelectNode(id)}>{labelOf(id)}</button></span>)}</p>
                  <p className="mt-1 text-xs flex flex-wrap gap-1">
                    {claimsAlongPath(claims, p, directed).map((cid) => {
                      const c = claims.find((x) => x.id === cid)!;
                      return <button key={cid} type="button" className="bx-btn !py-0 !px-1.5 font-mono text-[11px]" onClick={() => onSelectClaim(cid)}>{cid}{isNullResult(c) ? ' ∅' : ''}</button>;
                    })}
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      {resting && (
        <section aria-labelledby={`${uid}-refs-h`} data-testid="resting-on">
          <h3 id={`${uid}-refs-h`} className="text-xl">What else rests on {restingOn!.map((n) => `[${n}]`).join(' ')}</h3>
          <p className="bx-prose mt-1">{resting.length} claim(s) in the whole atlas cite at least one of these references.</p>
          <ul className="mt-2 grid gap-1 text-sm">
            {resting.map((c) => (
              <li key={c.id}>
                <button type="button" className="underline font-mono text-xs" onClick={() => onSelectClaim(c.id)}>{c.id}</button>{' '}
                {c.predicate} · {c.status}{isNullResult(c) && <> · <span className="bx-null"><span aria-hidden="true">∅</span> null result</span></>} · <Link className="underline" to={`/references#ref-${c.refs[0]}`}>[{c.refs.join(', ')}]</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
