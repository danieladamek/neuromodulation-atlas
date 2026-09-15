/**
 * Client-side analytics over the claims graph (APP-SPEC §4.1), on graphology. Pure functions over the claims model,
 * so the same code is unit-tested on a fixture graph with known answers (tests/unit/analytics.test.ts).
 *
 * Two graphs are derived, and neither adds anything to the claims:
 * - the claim multigraph is collapsed to a simple weighted graph (weight = number of claims between the pair) for
 *   PageRank, betweenness and Louvain, which are defined on simple graphs;
 * - direction is a switch: claims are subject → object, but "delivered_by" and "part_of" read backwards as often as
 *   forwards, so paths and centrality can be computed either way. Components are always weak (direction ignored).
 */
import Graph from 'graphology';
import pagerank from 'graphology-metrics/centrality/pagerank';
import betweenness from 'graphology-metrics/centrality/betweenness';
import louvain from 'graphology-communities-louvain';
import { connectedComponents } from 'graphology-components';
import { bidirectional } from 'graphology-shortest-path/unweighted';
import { allSimplePaths } from 'graphology-simple-path';
import type { AtlasClaim, AtlasNode } from './claims-model';

export interface AnalyticsInput { nodes: Pick<AtlasNode, 'id'>[]; claims: Pick<AtlasClaim, 'id' | 'source' | 'target' | 'refs'>[] }

export function buildGraph({ nodes, claims }: AnalyticsInput, directed: boolean): Graph {
  const g = new Graph({ type: directed ? 'directed' : 'undirected', multi: false, allowSelfLoops: true });
  for (const n of nodes) g.mergeNode(n.id);
  for (const c of claims) {
    if (!g.hasNode(c.source) || !g.hasNode(c.target)) continue;
    const existing = g.edge(c.source, c.target);
    if (existing) {
      g.updateEdgeAttribute(existing, 'weight', (w: number | undefined) => (w ?? 0) + 1);
      g.updateEdgeAttribute(existing, 'claims', (ids: string[] | undefined) => [...(ids ?? []), c.id]);
    } else g.addEdge(c.source, c.target, { weight: 1, claims: [c.id] });
  }
  return g;
}

export interface DegreeRow { id: string; in: number; out: number; total: number }

/** Degree counted in claims, not in distinct neighbours: two claims between the same pair are two edges. */
export function degrees({ nodes, claims }: AnalyticsInput): DegreeRow[] {
  const d = new Map(nodes.map((n) => [n.id, { id: n.id, in: 0, out: 0, total: 0 }]));
  for (const c of claims) {
    const s = d.get(c.source); const t = d.get(c.target);
    if (s) { s.out++; s.total++; }
    if (t) { t.in++; t.total++; }
  }
  return [...d.values()];
}

export function pageRank(input: AnalyticsInput, opts: { directed?: boolean; alpha?: number } = {}): Record<string, number> {
  const g = buildGraph(input, opts.directed ?? true);
  if (g.order === 0) return {};
  return pagerank(g, { alpha: opts.alpha ?? 0.85, getEdgeWeight: 'weight', maxIterations: 200, tolerance: 1e-10 });
}

export function betweennessCentrality(input: AnalyticsInput, opts: { directed?: boolean; normalized?: boolean } = {}): Record<string, number> {
  const g = buildGraph(input, opts.directed ?? false);
  if (g.order === 0) return {};
  return betweenness(g, { normalized: opts.normalized ?? true, getEdgeWeight: null });
}

/** Weakly connected components, largest first (ties broken by the smallest node id, for determinism). */
export function components(input: AnalyticsInput): string[][] {
  const g = buildGraph(input, false);
  return connectedComponents(g)
    .map((c) => [...c].sort())
    .sort((a, b) => b.length - a.length || (a[0] < b[0] ? -1 : 1));
}

/** Seeded PRNG so the same resolution always gives the same communities. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Communities { membership: Record<string, number>; count: number; modularity: number }

/** Louvain on the undirected weighted projection. Isolated nodes form their own community. */
export function communities(input: AnalyticsInput, resolution = 1, seed = 42): Communities {
  const g = buildGraph(input, false);
  if (g.size === 0) {
    const membership = Object.fromEntries(g.nodes().map((n, i) => [n, i]));
    return { membership, count: g.order, modularity: 0 };
  }
  const detailed = louvain.detailed(g, { resolution, rng: mulberry32(seed), getEdgeWeight: 'weight' });
  return { membership: detailed.communities, count: detailed.count, modularity: detailed.modularity };
}

export function shortestPath(input: AnalyticsInput, source: string, target: string, directed = true): string[] | null {
  const g = buildGraph(input, directed);
  if (!g.hasNode(source) || !g.hasNode(target)) return null;
  if (source === target) return [source];
  return bidirectional(g, source, target);
}

/** Every simple path of at most `maxDepth` edges, capped at `limit` paths (sorted shortest first). */
export function simplePaths(input: AnalyticsInput, source: string, target: string, opts: { maxDepth?: number; directed?: boolean; limit?: number } = {}): { paths: string[][]; truncated: boolean } {
  const g = buildGraph(input, opts.directed ?? true);
  if (!g.hasNode(source) || !g.hasNode(target) || source === target) return { paths: [], truncated: false };
  const all = allSimplePaths(g, source, target, { maxDepth: opts.maxDepth ?? 4 });
  const sorted = all.sort((a, b) => a.length - b.length || a.join('|').localeCompare(b.join('|')));
  const limit = opts.limit ?? 200;
  return { paths: sorted.slice(0, limit), truncated: sorted.length > limit };
}

/** The claims joining consecutive nodes on a path (either direction when undirected). */
export function claimsAlongPath(claims: Pick<AtlasClaim, 'id' | 'source' | 'target'>[], path: string[], directed = true): string[] {
  const ids: string[] = [];
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i]; const b = path[i + 1];
    for (const c of claims) {
      if ((c.source === a && c.target === b) || (!directed && c.source === b && c.target === a)) ids.push(c.id);
    }
  }
  return [...new Set(ids)];
}

/** "What else rests on these references": every claim citing at least one of them. */
export function claimsRestingOn<T extends Pick<AtlasClaim, 'refs'>>(claims: T[], refs: number[]): T[] {
  const want = new Set(refs);
  return claims.filter((c) => c.refs.some((n) => want.has(n)));
}

/** Nodes reachable from `source` within `maxDepth` edges — used to offer only the outcomes a drive can reach. */
export function reachable(input: AnalyticsInput, source: string, maxDepth: number, directed = true): Set<string> {
  const g = buildGraph(input, directed);
  const seen = new Set<string>();
  if (!g.hasNode(source)) return seen;
  let frontier = [source];
  seen.add(source);
  for (let d = 0; d < maxDepth && frontier.length; d++) {
    const next: string[] = [];
    for (const u of frontier) {
      const ns = directed ? g.outNeighbors(u) : g.neighbors(u);
      for (const v of ns) if (!seen.has(v)) { seen.add(v); next.push(v); }
    }
    frontier = next;
  }
  seen.delete(source);
  return seen;
}
