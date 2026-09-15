import { Fragment, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Figure, FigureGraph, GraphEdge, GraphNode } from '@/types';
import { getTerm } from '@/lib/data';
import { useTermDrawer } from '@/components/ui/TermDrawer';
import { downloadSvg, svgToPng } from './download';

/**
 * Layered layout, not a force simulation: every diagram in this pack reads in a direction (drive → coupling →
 * outcome, modality → endpoint, dispute → position, type → type), and says so in its "how to read this" text. Nodes
 * are ranked into columns by longest path and ordered by barycentre, so they cannot overlap.
 *
 * The pack's node and edge JSON carries different properties per figure (relation, evidence kind, species, refs,
 * contested, single_laboratory, weakest_join, anchor, unanchored, split_about…). None is dropped: all of them are
 * shown on hover/focus and in the text list under the diagram. Two change the drawing: `contested: true` edges are
 * dashed, `weakest_join: true` edges are drawn heavier; nodes with `unanchored: true` get a dashed outline.
 */

interface Placed extends GraphNode { px: number; py: number; w: number; h: number; lines: string[]; rank: number }

const CHAR_W = 6.3; const LINE_H = 14; const PAD_X = 11; const PAD_Y = 9; const MAX_CHARS = 26;
const ROW_GAP = 16; const MARGIN = 16; const COL_GAP = 110;
const HIDDEN = new Set(['id', 'label', 'from', 'to', 'x', 'y', 'via']);

function wrap(label: string, max = MAX_CHARS): string[] {
  const words = label.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return lines;
}

function rankNodes(g: FigureGraph): Map<string, number> {
  const ids = g.nodes.map((n) => n.id);
  const edges = g.edges.flatMap((e) => (e.via ? [{ from: e.from, to: e.via }, { from: e.via, to: e.to }] : [{ from: e.from, to: e.to }])).filter((e) => ids.includes(e.from) && ids.includes(e.to) && e.from !== e.to);
  const out = new Map<string, string[]>(ids.map((i) => [i, []]));
  const indeg = new Map<string, number>(ids.map((i) => [i, 0]));
  for (const e of edges) { out.get(e.from)!.push(e.to); indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1); }
  const rank = new Map<string, number>();
  const queue = ids.filter((i) => (indeg.get(i) ?? 0) === 0);
  for (const i of queue) rank.set(i, 0);
  const deg = new Map(indeg);
  while (queue.length) {
    const u = queue.shift()!;
    for (const v of out.get(u)!) {
      rank.set(v, Math.max(rank.get(v) ?? 0, (rank.get(u) ?? 0) + 1));
      deg.set(v, (deg.get(v) ?? 0) - 1);
      if ((deg.get(v) ?? 0) === 0) queue.push(v);
    }
  }
  // nodes left in a cycle: one column right of a neighbour that already has one
  const settled = new Set(rank.keys());
  const bfs = [...settled];
  while (bfs.length) {
    const u = bfs.shift()!;
    for (const v of out.get(u)!) if (!settled.has(v)) { rank.set(v, (rank.get(u) ?? 0) + 1); settled.add(v); bfs.push(v); }
  }
  for (const i of ids) if (!settled.has(i)) rank.set(i, 0);
  return rank;
}

function layout(g: FigureGraph): { nodes: Placed[]; width: number; height: number } {
  const base: Placed[] = g.nodes.map((n) => {
    const lines = wrap(n.label);
    return { ...n, lines, rank: 0, w: Math.max(...lines.map((l) => l.length)) * CHAR_W + PAD_X * 2, h: lines.length * LINE_H + PAD_Y * 2, px: 0, py: 0 };
  });
  const rank = rankNodes(g);
  for (const n of base) n.rank = rank.get(n.id) ?? 0;
  const maxRank = Math.max(0, ...base.map((n) => n.rank));
  const columns: Placed[][] = Array.from({ length: maxRank + 1 }, () => []);
  for (const n of base) columns[n.rank].push(n);
  const left = new Map<string, string[]>(base.map((n) => [n.id, []]));
  for (const e of g.edges) left.get(e.to)?.push(e.from);
  const order = new Map<string, number>();
  columns.forEach((col) => col.forEach((n, i) => order.set(n.id, i)));
  for (let pass = 0; pass < 4; pass++) {
    for (let r = 1; r <= maxRank; r++) {
      const bary = (n: Placed) => { const ns = (left.get(n.id) ?? []).map((id) => order.get(id)).filter((v): v is number => v !== undefined); return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : order.get(n.id) ?? 0; };
      columns[r].sort((a, b) => bary(a) - bary(b));
      columns[r].forEach((n, i) => order.set(n.id, i));
    }
  }
  const colWidth = columns.map((col) => Math.max(...col.map((n) => n.w), 0));
  const colHeight = columns.map((col) => col.reduce((a, n) => a + n.h, 0) + ROW_GAP * Math.max(0, col.length - 1));
  const height = Math.max(...colHeight, 0) + MARGIN * 2;
  let x = MARGIN;
  columns.forEach((col, r) => {
    let y = MARGIN + (height - MARGIN * 2 - colHeight[r]) / 2;
    for (const n of col) { n.px = x + colWidth[r] / 2; n.py = y + n.h / 2; y += n.h + ROW_GAP; }
    x += colWidth[r] + COL_GAP;
  });
  return { nodes: base, width: x - COL_GAP + MARGIN, height };
}

function edgePoint(cx: number, cy: number, w: number, h: number, tx: number, ty: number, margin = 3) {
  const dx = tx - cx, dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const s = Math.min(Math.abs(dx) > 0 ? (w / 2 + margin) / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? (h / 2 + margin) / Math.abs(dy) : Infinity);
  return { x: cx + dx * s, y: cy + dy * s };
}

const isContested = (e: GraphEdge) => e.contested === true;
const isWeakest = (e: GraphEdge) => e.weakest_join === true;
const showValue = (v: unknown): string => (Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v));
const propsOf = (o: Record<string, unknown>) => Object.entries(o).filter(([k, v]) => !HIDDEN.has(k) && v !== null && v !== undefined && v !== '');

/** Property list for hover cards and the text list; `refs` become reference links in the list. */
function Props({ o, links }: { o: Record<string, unknown>; links?: boolean }) {
  const entries = propsOf(o);
  if (!entries.length) return null;
  return (
    <dl className="mt-1 grid gap-0.5">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-1.5"><dt className="bx-muted shrink-0">{k.replace(/_/g, ' ')}:</dt>
          <dd>{k === 'refs' && Array.isArray(v) && links ? v.map((n, i) => <Fragment key={i}>{i > 0 && ' '}<Link className="underline" to={`/references#ref-${n}`}>[{String(n)}]</Link></Fragment>) : k === 'term' ? getTerm(String(v))?.term ?? String(v) : showValue(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PathwayDiagram({ figure, graph, inline }: { figure: Figure; graph: FigureGraph; inline?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; title: string; o: Record<string, unknown> } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawer = useTermDrawer();
  const { nodes, width, height } = useMemo(() => layout(graph), [graph]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of graph.edges) for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) { if (!m.has(a)) m.set(a, new Set()); m.get(a)!.add(b); }
    return m;
  }, [graph]);
  const dim = (id: string) => selected !== null && selected !== id && !neighbours.get(selected)?.has(id);
  const edgeDim = (e: GraphEdge) => selected !== null && e.from !== selected && e.to !== selected;
  const contested = graph.edges.filter(isContested).length;
  const weakest = graph.edges.filter(isWeakest).length;
  const unanchored = graph.nodes.filter((n) => n.unanchored === true).length;
  const filename = `${figure.id}-${figure.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <p className="text-xs bx-muted">Click a node to highlight what it connects to (and open its glossary entry if it has one); click again to clear. Hover or focus anything for all its properties.{width > 900 && ' The diagram is wider than the page — scroll it sideways.'}</p>
        {selected && <button type="button" className="bx-btn" onClick={() => setSelected(null)}>Clear highlight</button>}
        {!inline && (
          <div className="ml-auto inline-flex gap-1">
            <button type="button" className="bx-btn" onClick={() => svgRef.current && svgToPng(svgRef.current, `${filename}.png`)}>PNG</button>
            <button type="button" className="bx-btn" onClick={() => svgRef.current && downloadSvg(svgRef.current, `${filename}.svg`)}>SVG</button>
          </div>
        )}
      </div>
      <div className="mt-3 relative overflow-auto" style={{ maxHeight: inline ? 560 : 900 }}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ fontFamily: 'inherit', display: 'block' }} role="group"
          aria-label={`${figure.label}: ${figure.title}. A left-to-right diagram with ${nodes.length} nodes and ${graph.edges.length} connections${contested ? `, ${contested} marked contested` : ''}. Every connection is also listed as text below.`}
          data-testid={`pathway-${figure.id}`}>
          <defs>
            <marker id={`arrow-${figure.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker>
          </defs>
          <g color="var(--bx-ink)">
            {graph.edges.map((e, i) => {
              const a = byId.get(e.from); const b = byId.get(e.to); if (!a || !b) return null;
              const p1 = edgePoint(a.px, a.py, a.w, a.h, b.px, b.py);
              const p2 = edgePoint(b.px, b.py, b.w, b.h, a.px, a.py);
              const back = b.rank <= a.rank;
              const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
              const d = back ? `M ${p1.x} ${p1.y} Q ${mx} ${my - 60} ${p2.x} ${p2.y}` : `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
              const title = `${a.label} → ${b.label}${e.label ? ` (${e.label})` : ''}`;
              const show = () => setHover({ x: mx, y: back ? my - 30 : my, title, o: e });
              return (
                <g key={i} opacity={edgeDim(e) ? 0.12 : 1} tabIndex={inline ? -1 : 0} role="img" aria-label={`${title}${isContested(e) ? ', contested' : ''}`} className="outline-none" onMouseEnter={show} onMouseLeave={() => setHover(null)} onFocus={show} onBlur={() => setHover(null)} data-edge={`${e.from}->${e.to}`}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth={10} />
                  <path d={d} fill="none" stroke={isContested(e) ? 'var(--bx-muted)' : 'currentColor'} strokeWidth={isWeakest(e) ? 3 : isContested(e) ? 1.8 : 1.3} strokeDasharray={isContested(e) ? '6 4' : undefined} markerEnd={`url(#arrow-${figure.id})`} />
                </g>
              );
            })}
          </g>
          {nodes.map((n) => {
            const term = getTerm(n.term ?? undefined);
            const isSel = selected === n.id;
            const act = () => { setSelected(isSel ? null : n.id); if (term && !isSel) drawer.openTerm(term.id); };
            const show = () => setHover({ x: n.px, y: n.py + n.h / 2, title: n.label, o: n });
            return (
              <g key={n.id} transform={`translate(${n.px - n.w / 2},${n.py - n.h / 2})`} opacity={dim(n.id) ? 0.22 : 1} role="button" tabIndex={inline ? -1 : 0} aria-pressed={isSel}
                aria-label={`${n.label}${n.unanchored === true ? ', unanchored' : ''}${term ? `. Opens glossary entry ${term.term}` : ''}`} className="cursor-pointer outline-none"
                onClick={act} onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); act(); } }}
                onMouseEnter={show} onMouseLeave={() => setHover(null)} onFocus={show} onBlur={() => setHover(null)} data-testid={`node-${n.id}`}>
                <rect width={n.w} height={n.h} rx={8} fill="var(--bx-bg-2)" stroke={isSel ? 'var(--bx-accent)' : 'var(--bx-ink)'} strokeWidth={isSel ? 3 : 1.2} strokeDasharray={n.unanchored === true ? '5 3' : undefined} />
                <text fontSize={11} fontWeight={600} fill="var(--bx-ink)" aria-hidden="true">
                  {n.lines.map((l, i) => <tspan key={i} x={n.w / 2} y={PAD_Y + LINE_H * (i + 1) - 3} textAnchor="middle">{l}</tspan>)}
                </text>
              </g>
            );
          })}
        </svg>
        {hover && (
          <div className="bx-card pointer-events-none absolute z-10 p-2 text-xs max-w-[22rem] bg-paper dark:bg-night" style={{ left: Math.min(hover.x, width - 200), top: hover.y, transform: 'translate(-30%, 8px)' }} role="status">
            <span className="font-semibold">{hover.title}</span>
            <Props o={hover.o} />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs bx-muted flex flex-wrap gap-x-4 gap-y-1">
        <span><span aria-hidden="true">→</span> a relationship as the cited sources report it — not a measured flux</span>
        {contested > 0 && <span><span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed align-middle" /> contested ({contested})</span>}
        {weakest > 0 && <span><span aria-hidden="true" className="inline-block w-6 border-t-[3px] align-middle" style={{ borderColor: 'currentColor' }} /> weakest join ({weakest})</span>}
        {unanchored > 0 && <span>dashed outline: unanchored — no ontology supplies identifiers ({unanchored})</span>}
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer bx-muted">All {graph.edges.length} connections as text</summary>
        <ul className="mt-1 grid gap-2 list-disc pl-5">
          {graph.edges.map((e, i) => (
            <li key={i}>
              <span className="font-semibold">{byId.get(e.from)?.label ?? e.from}</span> → <span className="font-semibold">{byId.get(e.to)?.label ?? e.to}</span>
              {e.label && <span className="bx-muted"> — {e.label}</span>}
              <div className="text-xs"><Props o={e} links /></div>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
