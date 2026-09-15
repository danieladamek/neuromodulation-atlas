import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ClaimsModel } from '@/types';
import { isNullResult } from '@/lib/claims-model';
import { assetUrl, provenance, readyVolumes } from '@/lib/data';
import { loadClaims, loadReferences, useAsync } from '@/lib/heavy';
import { toCypher, toEdgesCsv, toGraphml, toJson, toNodesCsv } from '@/lib/graph-export';
import { TYPE_STYLE, styleForType } from '@/lib/graph-style';
import { downloadBlob } from '@/components/figures/download';
import GraphCanvas from '@/components/graph/GraphCanvas';
import ClaimCard, { NodeChip, NullResultChip } from '@/components/graph/ClaimCard';
import ClaimsTable from '@/components/graph/ClaimsTable';
import GraphAnalytics from '@/components/graph/GraphAnalytics';
import Neo4jPanel from '@/components/graph/Neo4jPanel';

const FILTERS = ['volume', 'status', 'level', 'evidence', 'type', 'predicate', 'species', 'finding'] as const;
type FilterKey = (typeof FILTERS)[number];
const LABELS: Record<FilterKey, string> = {
  volume: 'Volume', status: 'Status', level: 'Level', evidence: 'Evidence', type: 'Node type', predicate: 'Predicate', species: 'Species', finding: 'Finding',
};

export default function Graph() {
  const model = useAsync(loadClaims);
  const references = useAsync(loadReferences);
  const [params, setParams] = useSearchParams();
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [restingOn, setRestingOn] = useState<number[] | null>(null);

  /**
   * All URL state changes go through one update. Two `setSearchParams` calls in the same handler both compute from
   * the params as they were before the handler ran, so the second silently drops the first's change — which is how
   * selecting a claim while a filter was set used to clear the selection.
   */
  const setParams2 = useCallback((changes: Record<string, string | null>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) { if (v === null) next.delete(k); else next.set(k, v); }
      return next;
    }, { replace: true, preventScrollReset: true });
  }, [setParams]);
  const setParam = useCallback((k: string, v: string | null) => setParams2({ [k]: v }), [setParams2]);

  useEffect(() => {
    const refs = params.get('refs');
    if (refs) setRestingOn(refs.split(',').map(Number).filter(Number.isFinite));
  }, [params]);

  if (!model) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl sm:text-4xl">The claims graph</h1>
        {/* as tall as a screen, so the footer does not start in view and then jump down when the claims arrive */}
        <p className="mt-4 min-h-[80vh] bx-muted" role="status">Loading {provenance.claims?.total ?? ''} claims…</p>
      </div>
    );
  }
  return <GraphLab model={model} references={references} params={params} setParam={setParam} setParams2={setParams2} highlight={highlight} setHighlight={setHighlight} restingOn={restingOn} setRestingOn={setRestingOn} />;
}

function GraphLab({ model, references, params, setParam, setParams2, highlight, setHighlight, restingOn, setRestingOn }: {
  model: ClaimsModel;
  references: ReturnType<typeof useAsync<Awaited<ReturnType<typeof loadReferences>>>>;
  params: URLSearchParams;
  setParam: (k: string, v: string | null) => void;
  setParams2: (changes: Record<string, string | null>) => void;
  highlight: Set<string>;
  setHighlight: (s: Set<string>) => void;
  restingOn: number[] | null;
  setRestingOn: (r: number[] | null) => void;
}) {
  const nodesById = useMemo(() => new Map(model.nodes.map((n) => [n.id, n])), [model]);
  const q = params.get('q') ?? '';
  const termFilter = params.get('term');

  const options = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs)].sort();
    return {
      volume: uniq(model.claims.map((c) => c.volume)),
      status: uniq(model.claims.map((c) => c.status)),
      level: model.vocabulary.levels.filter((l) => model.claims.some((c) => c.level === l)),
      evidence: model.vocabulary.evidence.filter((e) => model.claims.some((c) => c.evidence === e)),
      type: model.vocabulary.node_types.filter((t) => model.nodes.some((n) => n.type === t)),
      predicate: model.vocabulary.predicates.filter((p) => model.claims.some((c) => c.predicate === p)),
      species: uniq(model.claims.flatMap((c) => c.species ?? ['(not stated)'])),
      finding: ['null-result', 'positive'],
    } satisfies Record<FilterKey, string[]>;
  }, [model]);

  const claims = useMemo(() => {
    const get = (k: FilterKey) => params.get(k);
    const needle = q.trim().toLowerCase();
    return model.claims.filter((c) => {
      const s = nodesById.get(c.source); const o = nodesById.get(c.target);
      if (get('volume') && c.volume !== get('volume')) return false;
      if (get('status') && c.status !== get('status')) return false;
      if (get('level') && c.level !== get('level')) return false;
      if (get('evidence') && c.evidence !== get('evidence')) return false;
      if (get('predicate') && c.predicate !== get('predicate')) return false;
      if (get('type') && s?.type !== get('type') && o?.type !== get('type')) return false;
      const sp = get('species');
      if (sp && !(sp === '(not stated)' ? c.species === null : c.species?.includes(sp))) return false;
      const f = get('finding');
      if (f === 'null-result' && !isNullResult(c)) return false;
      if (f === 'positive' && isNullResult(c)) return false;
      if (termFilter && s?.term !== termFilter && o?.term !== termFilter) return false;
      if (needle && ![c.id, c.predicate, s?.label, o?.label, c.section].some((x) => x?.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [model, params, q, termFilter, nodesById]);

  const nodes = useMemo(() => {
    const used = new Set(claims.flatMap((c) => [c.source, c.target]));
    return model.nodes.filter((n) => used.has(n.id));
  }, [model, claims]);

  const selected = params.get('claim') ? { kind: 'claim' as const, id: params.get('claim')! } : params.get('node') ? { kind: 'node' as const, id: params.get('node')! } : null;
  const selectedClaim = selected?.kind === 'claim' ? model.claims.find((c) => c.id === selected.id) : undefined;
  const selectedNode = selected?.kind === 'node' ? nodesById.get(selected.id) : undefined;
  const group = selectedClaim?.hypothesis_group ? model.hypotheses.find((h) => h.id === selectedClaim.hypothesis_group) : undefined;

  const select = (s: { kind: 'node' | 'claim'; id: string } | null) =>
    setParams2({ claim: s?.kind === 'claim' ? s.id : null, node: s?.kind === 'node' ? s.id : null });
  const reset = () => {
    setParams2(Object.fromEntries([...FILTERS, 'q', 'term', 'claim', 'node', 'refs'].map((k) => [k, null])));
    setHighlight(new Set());
    setRestingOn(null);
  };
  const activeFilters = [...FILTERS.filter((k) => params.get(k)), ...(q ? ['q'] : []), ...(termFilter ? ['term'] : [])];

  const download = (name: string, text: string, type: string) => downloadBlob(new Blob([text], { type }), name);
  const viewLabel = claims.length === model.claims.length ? 'the full atlas' : 'a filtered view';
  const filtered = { label: viewLabel };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">The claims graph</h1>
      <p className="bx-prose mt-2 max-w-3xl">
        Every mechanism claim the review argues, as a typed and cited edge: <strong>{model.claims.length} claims</strong> between <strong>{model.nodes.length} nodes</strong>, from
        {' '}<code className="font-mono text-xs">content-pack/claims.yaml</code> and nothing else. No node or edge is derived from the prose, the glossary or the figures, and nothing is
        added here that the review does not state. Contested claims are dashed and open the competing-hypothesis group they belong to; inferred claims carry the synthesis mark;
        the {provenance.claims?.null_results.length} null results are marked ∅ wherever they appear.
      </p>

      <section className="bx-card mt-5 p-3" aria-labelledby="filters-h">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="filters-h" className="text-[11px] font-semibold tracking-[0.15em] bx-muted">FILTERS</h2>
          <div className="ml-auto flex flex-wrap gap-1">
            <button type="button" className={`bx-btn !py-1 ${params.get('status') === 'contested' ? 'bx-btn-on' : ''}`} onClick={() => setParam('status', params.get('status') === 'contested' ? null : 'contested')} data-testid="preset-contested">Contested only</button>
            <button type="button" className={`bx-btn !py-1 ${params.get('finding') === 'null-result' ? 'bx-btn-on' : ''}`} onClick={() => setParam('finding', params.get('finding') === 'null-result' ? null : 'null-result')} data-testid="preset-null">Null results only</button>
            <button type="button" className="bx-btn !py-1" onClick={reset} disabled={!activeFilters.length && !selected}>Reset</button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          {FILTERS.map((k) => (
            <label key={k} className="text-sm">{LABELS[k]}
              <select className="bx-input mt-1 !w-auto max-w-[12rem]" value={params.get(k) ?? ''} onChange={(e) => setParam(k, e.target.value || null)} data-testid={`filter-${k}`}>
                <option value="">any</option>
                {options[k].map((v) => <option key={v} value={v}>{k === 'volume' ? `Volume ${v.slice(1)}` : v}</option>)}
              </select>
            </label>
          ))}
          <label className="text-sm">Search
            <input className="bx-input mt-1 min-w-[14rem]" value={q} onChange={(e) => setParam('q', e.target.value || null)} placeholder="node label, claim id, predicate…" data-testid="filter-q" />
          </label>
        </div>
        <p className="mt-2 text-sm" role="status" data-testid="view-counts">
          Showing <strong>{claims.length}</strong> of {model.claims.length} claims and {nodes.length} of {model.nodes.length} nodes
          {termFilter && <> · glossary term <code className="font-mono text-xs">{termFilter}</code></>}
          {highlight.size > 0 && <> · {highlight.size} nodes highlighted <button type="button" className="underline" onClick={() => setHighlight(new Set())}>clear</button></>}
        </p>
      </section>

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-4">
        <div className="min-w-0">
          <GraphCanvas nodes={nodes} claims={claims} selected={selected} highlight={highlight} onSelect={select} />
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer bx-muted">Node types in this view ({[...new Set(nodes.map((n) => n.type))].length})</summary>
            <ul className="mt-1 flex flex-wrap gap-2 text-xs">
              {Object.keys(TYPE_STYLE).filter((t) => nodes.some((n) => n.type === t)).map((t) => (
                <li key={t}><button type="button" className="bx-chip border border-[color:var(--bx-line)]" onClick={() => setParam('type', t)}><span aria-hidden="true" style={{ color: styleForType(t).colour }}>{styleForType(t).glyph}</span> {t} ({nodes.filter((n) => n.type === t).length})</button></li>
              ))}
            </ul>
          </details>
        </div>
        <aside className="mt-4 lg:mt-0 min-w-0">
          <div className="bx-card p-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto" data-testid="details-panel">
            {selectedClaim ? (
              <ClaimCard claim={selectedClaim} nodes={nodesById} claims={model.claims} group={group} references={references}
                onSelectNode={(id) => select({ kind: 'node', id })} onSelectClaim={(id) => select({ kind: 'claim', id })} onRestingOn={(refs) => { setRestingOn(refs); setParams2({ refs: refs.join(',') }); }} />
            ) : selectedNode ? (
              <div data-testid={`node-card-${selectedNode.id}`}>
                <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">NODE</p>
                <h2 className="text-xl mt-1">{selectedNode.label}</h2>
                <p className="mt-2"><NodeChip node={selectedNode} /></p>
                <p className="mt-2 text-sm bx-muted">{model.claims.filter((c) => c.source === selectedNode.id || c.target === selectedNode.id).length} claims touch this node.</p>
                <ul className="mt-2 grid gap-1 text-sm">
                  {model.claims.filter((c) => c.source === selectedNode.id || c.target === selectedNode.id).map((c) => (
                    <li key={c.id}>
                      <button type="button" className="underline font-mono text-xs" onClick={() => select({ kind: 'claim', id: c.id })}>{c.id}</button>{' '}
                      {c.source === selectedNode.id ? '→' : '←'} {nodesById.get(c.source === selectedNode.id ? c.target : c.source)?.label} <span className="bx-muted">({c.predicate}, {c.status})</span>
                      {isNullResult(c) && <> <NullResultChip /></>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">NOTHING SELECTED</p>
                <p className="mt-2 text-sm bx-prose">Click a node or a claim on the canvas — or any claim id in the table below — to see what it says, which references support it, which section argues it, and, where it is contested, every rival position side by side.</p>
                <p className="mt-2 text-sm bx-muted">{model.hypotheses.length} hypothesis groups · {model.hypotheses.reduce((a, h) => a + h.rivals.length, 0)} rival positions · {provenance.claims?.null_results.length} null results · {provenance.claims?.species_not_stated} claims with no species stated.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-8" aria-labelledby="table-h">
        <h2 id="table-h" className="text-2xl">Claims in this view</h2>
        <p className="bx-prose mt-1">The same claims as the canvas, readable and keyboard-navigable.</p>
        <div className="mt-2"><ClaimsTable claims={claims} nodes={nodesById} selected={selectedClaim?.id ?? null} onSelect={(id) => select({ kind: 'claim', id })} /></div>
      </section>

      <section className="mt-10" aria-labelledby="analytics-h">
        <h2 id="analytics-h" className="text-2xl">Analytics</h2>
        <div className="mt-2">
          <GraphAnalytics nodes={nodes} claims={claims} onSelectNode={(id) => select({ kind: 'node', id })} onSelectClaim={(id) => select({ kind: 'claim', id })} onHighlight={(ids) => setHighlight(new Set(ids))} restingOn={restingOn} />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="export-h">
        <h2 id="export-h" className="text-2xl">Export</h2>
        <p className="bx-prose mt-1">
          The whole atlas is generated at build time into <code className="font-mono text-xs">public/graph/</code> — the same files every time, from the same pack. The current view exports the
          same five ways, generated in your browser by the same code.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="bx-card p-3">
            <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">THE FULL ATLAS ({model.claims.length} CLAIMS)</p>
            <ul className="mt-1 grid gap-1 text-sm">
              {(provenance.claims?.exports ?? []).map((f) => <li key={f.file}><a className="underline" href={assetUrl(f.file)} download>{f.file.replace('graph/', '')}</a> <span className="bx-muted">({Math.round(f.bytes / 1024)} kB)</span></li>)}
            </ul>
          </div>
          <div className="bx-card p-3">
            <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">THIS VIEW ({claims.length} CLAIMS)</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <button type="button" className="bx-btn" onClick={() => download('claims-view.cypher', toCypher(model, claims, filtered), 'text/plain')}>Cypher</button>
              <button type="button" className="bx-btn" onClick={() => download('nodes-view.csv', toNodesCsv(model, claims), 'text/csv')}>nodes.csv</button>
              <button type="button" className="bx-btn" onClick={() => download('edges-view.csv', toEdgesCsv(claims), 'text/csv')}>edges.csv</button>
              <button type="button" className="bx-btn" onClick={() => download('claims-view.graphml', toGraphml(model, claims, filtered), 'application/xml')}>GraphML</button>
              <button type="button" className="bx-btn" onClick={() => download('claims-view.json', toJson(model, claims, filtered), 'application/json')}>JSON</button>
            </div>
            <p className="mt-2 text-xs bx-muted">Cypher is idempotent <code className="font-mono text-xs">MERGE</code>s with uniqueness constraints; the CSVs carry <code className="font-mono text-xs">neo4j-admin import</code> headers; every relationship keeps its claim id, references, status, evidence, level, species and section.</p>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="neo4j-section-h">
        <h2 id="neo4j-section-h" className="text-2xl">Your own database</h2>
        <div className="mt-2"><Neo4jPanel model={model} claims={claims} /></div>
      </section>

      <p className="mt-10 text-sm bx-muted">
        The graph is the review’s claims, not a knowledge base: it is as complete as {readyVolumes.map((v) => `Volume ${v.id.slice(1)}`).join(' and ')}, and it grows when a volume does.
        Section 15 of the review proposes the schema behind it, and <Link className="underline" to="/methods#graph">Methods</Link> records how it was validated.
      </p>
    </div>
  );
}
