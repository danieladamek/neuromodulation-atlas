import { useEffect, useMemo, useRef, useState } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type Simulation, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type D3ZoomEvent } from 'd3-zoom';
import type { AtlasClaim, AtlasNode } from '@/types';
import { isNullResult } from '@/lib/claims-model';
import { styleForType } from '@/lib/graph-style';

interface Sim extends SimulationNodeDatum { id: string; label: string; type: string; degree: number }
type Link = SimulationLinkDatum<Sim> & { claim: AtlasClaim };

interface Props {
  nodes: AtlasNode[];
  claims: AtlasClaim[];
  selected: { kind: 'node' | 'claim'; id: string } | null;
  highlight: Set<string>;               // node ids to emphasise (analytics, paths)
  onSelect: (s: { kind: 'node' | 'claim'; id: string } | null) => void;
  height?: number;
}

const radius = (d: Sim) => 4 + Math.min(9, Math.sqrt(d.degree) * 2.2);

/**
 * Neo4j-Browser-style canvas over the claims, and nothing else: one circle per node, one line per claim. Contested
 * claims are dashed, inferred claims carry a ◆ synthesis mark at their midpoint, and null results carry ∅ — none of
 * them is distinguished by colour alone. Layout is a force simulation run in slices so the page stays responsive;
 * the equivalent keyboard-accessible view is the claims table below the canvas.
 */
export default function GraphCanvas({ nodes, claims, selected, highlight, onSelect, height = 560 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simRef = useRef<Simulation<Sim, Link> | null>(null);
  const [tick, setTick] = useState(0);
  const [transform, setTransform] = useState(zoomIdentity);
  const [laying, setLaying] = useState(true);
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);

  const { simNodes, links } = useMemo(() => {
    const degree = new Map<string, number>();
    for (const c of claims) { degree.set(c.source, (degree.get(c.source) ?? 0) + 1); degree.set(c.target, (degree.get(c.target) ?? 0) + 1); }
    const simNodes: Sim[] = nodes.map((n) => ({ id: n.id, label: n.label, type: n.type, degree: degree.get(n.id) ?? 0 }));
    const byId = new Map(simNodes.map((n) => [n.id, n]));
    const links: Link[] = claims.filter((c) => byId.has(c.source) && byId.has(c.target)).map((c) => ({ source: byId.get(c.source)!, target: byId.get(c.target)!, claim: c }));
    return { simNodes, links };
  }, [nodes, claims]);

  // Layout runs in slices after first paint, then stops — no permanent animation loop, and nothing competes with
  // the page's own rendering while the reader is still seeing it appear.
  useEffect(() => {
    setLaying(true);
    let start = 0;
    const sim = forceSimulation<Sim, Link>(simNodes)
      .force('link', forceLink<Sim, Link>(links).id((d) => d.id).distance(70).strength(0.6))
      .force('charge', forceManyBody().strength(-110).distanceMax(600))
      .force('collide', forceCollide<Sim>().radius((d) => radius(d) + 6))
      .force('x', forceX(0).strength(0.045))
      .force('y', forceY(0).strength(0.06))
      .force('centre', forceCenter(0, 0))
      .stop();
    simRef.current = sim;
    let frame = 0;
    let done = 0;
    const TOTAL = 160;
    const run = () => {
      const slice = Math.min(16, TOTAL - done);
      for (let i = 0; i < slice; i++) sim.tick();
      done += slice;
      setTick((t) => t + 1);
      if (done < TOTAL) frame = requestAnimationFrame(run);
      else setLaying(false);
    };
    start = window.setTimeout(() => { frame = requestAnimationFrame(run); }, 60);
    return () => { window.clearTimeout(start); cancelAnimationFrame(frame); sim.stop(); };
  }, [simNodes, links]);

  // pan and zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = zoom<SVGSVGElement, unknown>().scaleExtent([0.15, 6]).on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => setTransform(e.transform));
    select(svg).call(z);
    return () => { select(svg).on('.zoom', null); };
  }, []);

  const width = 1200;
  const showLabels = transform.k > 1.1;
  const isDim = (id: string) => highlight.size > 0 && !highlight.has(id);

  return (
    <div className="relative">
      <svg
        ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="bx-graph-canvas w-full rounded-lg border border-[color:var(--bx-line)] bg-white/50 dark:bg-night-2/50" style={{ height }}
        role="img" aria-label={`Claims canvas: ${nodes.length} nodes and ${claims.length} claims, laid out by force. Drag to pan, scroll to zoom. The same claims are listed, keyboard-accessible, in the table below.`}
        data-testid="graph-canvas"
      >
        <defs>
          <marker id="claim-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bx-muted)" /></marker>
        </defs>
        <g ref={gRef} transform={`translate(${transform.x + width / 2},${transform.y + height / 2}) scale(${transform.k})`} data-tick={tick}>
          {links.map((l) => {
            const s = l.source as Sim; const t = l.target as Sim;
            if (s.x === undefined || t.x === undefined) return null;
            const sel = selected?.kind === 'claim' && selected.id === l.claim.id;
            const dim = isDim(s.id) && isDim(t.id);
            const mx = ((s.x ?? 0) + (t.x ?? 0)) / 2; const my = ((s.y ?? 0) + (t.y ?? 0)) / 2;
            const nul = isNullResult(l.claim);
            return (
              <g key={l.claim.id} className="edge" opacity={dim ? 0.12 : 1} onClick={() => onSelect({ kind: 'claim', id: l.claim.id })}
                onMouseEnter={() => setHover({ x: mx, y: my, text: `${s.label} — ${l.claim.predicate} → ${t.label}${nul ? ' (NULL RESULT)' : ''}` })} onMouseLeave={() => setHover(null)}>
                <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth={8} />
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={sel ? 'var(--bx-accent)' : 'var(--bx-muted)'}
                  strokeWidth={sel ? 2.6 : 1.2}
                  strokeDasharray={l.claim.status === 'contested' ? '6 4' : undefined}
                  markerEnd="url(#claim-arrow)"
                  data-status={l.claim.status}
                  data-finding={l.claim.finding ?? 'positive'}
                  data-claim={l.claim.id}
                />
                {l.claim.status === 'inferred' && <text x={mx} y={my + 3} textAnchor="middle" fontSize={9} fill="var(--bx-muted)" aria-hidden="true">◆</text>}
                {nul && <text x={mx} y={my + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--bx-ink)" paintOrder="stroke" stroke="var(--bx-bg)" strokeWidth={3} aria-hidden="true">∅</text>}
              </g>
            );
          })}
          {simNodes.map((n) => {
            const st = styleForType(n.type);
            const sel = selected?.kind === 'node' && selected.id === n.id;
            return (
              <g key={n.id} className="node" opacity={isDim(n.id) ? 0.15 : 1} onClick={() => onSelect({ kind: 'node', id: n.id })}
                onMouseEnter={() => setHover({ x: n.x ?? 0, y: n.y ?? 0, text: `${n.label} · ${n.type}` })} onMouseLeave={() => setHover(null)} data-node={n.id}>
                <circle cx={n.x} cy={n.y} r={radius(n)} fill={st.colour} stroke={sel ? 'var(--bx-accent)' : 'var(--bx-bg)'} strokeWidth={sel ? 3 : 1} />
                {(showLabels || sel || highlight.has(n.id)) && (
                  <text x={(n.x ?? 0) + radius(n) + 3} y={(n.y ?? 0) + 3} fontSize={9} fill="var(--bx-ink)" paintOrder="stroke" stroke="var(--bx-bg)" strokeWidth={2.5} aria-hidden="true">
                    {n.label.length > 42 ? `${n.label.slice(0, 41)}…` : n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {laying && <p className="absolute left-3 top-3 text-xs bx-muted bg-paper/80 dark:bg-night/80 rounded px-2 py-1" role="status">Laying out {nodes.length} nodes…</p>}
      {hover && (
        <div className="bx-card pointer-events-none absolute z-10 p-2 text-xs max-w-[22rem] bg-paper dark:bg-night"
          style={{ left: Math.max(4, Math.min(transform.applyX(hover.x) + 12, 1000)), top: Math.max(4, transform.applyY(hover.y) + 12) }} role="status">
          {hover.text}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs no-print">
        <button type="button" className="bx-btn !py-0.5" onClick={() => setTransform(zoomIdentity)}>Reset view</button>
        <span className="bx-muted">Scroll or pinch to zoom, drag to pan. Labels appear as you zoom in. Dashed = contested · ◆ = inferred (synthesis) · ∅ = null result.</span>
      </div>
    </div>
  );
}
