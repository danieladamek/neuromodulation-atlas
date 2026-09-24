import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type Simulation, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';

/**
 * The claims canvas layout, shared by the content build and the browser (E1).
 *
 * The full atlas is laid out once at build time into src/data/graph-layout.json, so /graph draws it straight away
 * with no simulation on the main thread. A filtered view is a different subgraph, and the browser still lays that
 * out with these same forces. d3-force seeds its jitter from a fixed LCG and places unpositioned nodes on a
 * phyllotaxis spiral, so the same nodes and claims in the same order always give the same positions, in Node or in a
 * browser. No pack change means byte-identical layout.
 */

export interface LayoutNode extends SimulationNodeDatum { id: string; degree: number }
export type LayoutLink<N extends LayoutNode = LayoutNode> = SimulationLinkDatum<N>;
export interface LayoutFile { ticks: number; positions: Record<string, [number, number]> }

export const LAYOUT_TICKS = 160;
export const nodeRadius = (d: { degree: number }) => 4 + Math.min(9, Math.sqrt(d.degree) * 2.2);

export function createSimulation<N extends LayoutNode>(nodes: N[], links: LayoutLink<N>[]): Simulation<N, LayoutLink<N>> {
  return forceSimulation<N, LayoutLink<N>>(nodes)
    .force('link', forceLink<N, LayoutLink<N>>(links).id((d) => d.id).distance(70).strength(0.6))
    .force('charge', forceManyBody().strength(-110).distanceMax(600))
    .force('collide', forceCollide<N>().radius((d) => nodeRadius(d) + 6))
    .force('x', forceX(0).strength(0.045))
    .force('y', forceY(0).strength(0.06))
    .force('centre', forceCenter(0, 0))
    .stop();
}

/** Degree per node id, counted over the given claims. */
export function degrees(claims: { source: string; target: string }[]): Map<string, number> {
  const degree = new Map<string, number>();
  for (const c of claims) { degree.set(c.source, (degree.get(c.source) ?? 0) + 1); degree.set(c.target, (degree.get(c.target) ?? 0) + 1); }
  return degree;
}

/** Lay out the whole graph synchronously (the build). Positions are rounded to 0.1 px so the file is stable and small. */
export function computeLayout(nodes: { id: string }[], claims: { source: string; target: string }[], ticks = LAYOUT_TICKS): LayoutFile {
  const degree = degrees(claims);
  const simNodes: LayoutNode[] = nodes.map((n) => ({ id: n.id, degree: degree.get(n.id) ?? 0 }));
  const byId = new Map(simNodes.map((n) => [n.id, n]));
  const links = claims.filter((c) => byId.has(c.source) && byId.has(c.target)).map((c) => ({ source: byId.get(c.source)!, target: byId.get(c.target)! }));
  const sim = createSimulation(simNodes, links);
  for (let i = 0; i < ticks; i++) sim.tick();
  const r = (v: number | undefined) => Math.round((v ?? 0) * 10) / 10 || 0;
  return { ticks, positions: Object.fromEntries(simNodes.map((n) => [n.id, [r(n.x), r(n.y)]])) };
}
