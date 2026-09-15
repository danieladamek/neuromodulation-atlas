import { describe, expect, it } from 'vitest';
import { betweennessCentrality, claimsAlongPath, claimsRestingOn, communities, components, degrees, pageRank, reachable, shortestPath, simplePaths } from '../../src/lib/graph-analytics';

/**
 * A 10-node fixture with answers that can be worked out by hand:
 *
 *   A → B → C → D        E → B, F → B, G → C        H → I        J isolated
 *
 * so D is the only sink, B has three claims in and one out, and the graph falls into three weak components.
 */
const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((id) => ({ id }));
const edges: [string, string, number[]][] = [
  ['A', 'B', [1]], ['B', 'C', [1, 2]], ['C', 'D', [2]], ['E', 'B', [3]], ['F', 'B', [3]], ['G', 'C', [4]], ['H', 'I', [5]],
];
const claims = edges.map(([source, target, refs], i) => ({ id: `C${i + 1}`, source, target, refs }));
const input = { nodes, claims };

describe('degree', () => {
  it('counts claims, in and out', () => {
    const d = Object.fromEntries(degrees(input).map((r) => [r.id, r]));
    expect(d.B).toMatchObject({ in: 3, out: 1, total: 4 });
    expect(d.D).toMatchObject({ in: 1, out: 0, total: 1 });
    expect(d.J).toMatchObject({ in: 0, out: 0, total: 0 });
  });
});

describe('PageRank', () => {
  const scores = pageRank(input, { directed: true });
  it('ranks the sink above the node that feeds it, and both above the leaves', () => {
    const order = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([id]) => id);
    expect(order[0]).toBe('D');
    expect(order.indexOf('D')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    for (const leaf of ['A', 'E', 'F', 'G']) expect(scores.B).toBeGreaterThan(scores[leaf]);
  });
  it('sums to one across every node', () => {
    expect(Object.values(scores).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });
});

describe('betweenness', () => {
  it('puts the two nodes on the chain’s interior above every other node', () => {
    const b = betweennessCentrality(input, { normalized: false });
    expect(b.B).toBeGreaterThan(0);
    expect(b.C).toBeGreaterThan(0);
    for (const leaf of ['A', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) expect(b.C).toBeGreaterThan(b[leaf]);
  });
});

describe('components', () => {
  it('finds three weak components, largest first', () => {
    const cs = components(input);
    expect(cs).toHaveLength(3);
    expect(cs[0]).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(cs[1]).toEqual(['H', 'I']);
    expect(cs[2]).toEqual(['J']);
  });
});

describe('paths', () => {
  it('finds the shortest path along the chain', () => {
    expect(shortestPath(input, 'A', 'D')).toEqual(['A', 'B', 'C', 'D']);
    expect(shortestPath(input, 'A', 'J')).toBeNull();
    expect(shortestPath(input, 'D', 'A')).toBeNull();               // direction is followed
    expect(shortestPath(input, 'D', 'A', false)).toEqual(['D', 'C', 'B', 'A']);
  });
  it('bounds simple paths by depth', () => {
    expect(simplePaths(input, 'A', 'D', { maxDepth: 3 }).paths).toEqual([['A', 'B', 'C', 'D']]);
    expect(simplePaths(input, 'A', 'D', { maxDepth: 2 }).paths).toEqual([]);
    expect(simplePaths(input, 'E', 'D', { maxDepth: 4 }).paths).toEqual([['E', 'B', 'C', 'D']]);
  });
  it('names the claims along a path', () => {
    expect(claimsAlongPath(claims, ['A', 'B', 'C', 'D'])).toEqual(['C1', 'C2', 'C3']);
  });
  it('lists what is reachable within a depth', () => {
    expect([...reachable(input, 'A', 2)].sort()).toEqual(['B', 'C']);
    expect([...reachable(input, 'A', 3)].sort()).toEqual(['B', 'C', 'D']);
  });
});

describe('communities', () => {
  it('is deterministic for a resolution and separates the components', () => {
    const a = communities(input, 1);
    const b = communities(input, 1);
    expect(a.membership).toEqual(b.membership);
    expect(a.membership.H).toBe(a.membership.I);
    expect(a.membership.A).not.toBe(a.membership.H);
    expect(a.count).toBeGreaterThanOrEqual(3);
  });
});

describe('what else rests on these references', () => {
  it('finds every claim citing one of them', () => {
    expect(claimsRestingOn(claims, [3]).map((c) => c.id)).toEqual(['C4', 'C5']);
    expect(claimsRestingOn(claims, [1, 5]).map((c) => c.id)).toEqual(['C1', 'C2', 'C7']);
  });
});
