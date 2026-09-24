import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ClaimsModel } from '../../src/lib/claims-model';
import { LAYOUT_TICKS, computeLayout, createSimulation, degrees, type LayoutFile, type LayoutNode } from '../../src/lib/graph-layout';

const ROOT = path.resolve(__dirname, '../..');
const model = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/claims.json'), 'utf8')) as ClaimsModel;
const committed = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/graph-layout.json'), 'utf8')) as LayoutFile;

describe('precomputed graph layout (E1)', () => {
  it('covers every node of the atlas, with finite positions', () => {
    expect(Object.keys(committed.positions).sort()).toEqual(model.nodes.map((n) => n.id).sort());
    for (const [x, y] of Object.values(committed.positions)) { expect(Number.isFinite(x)).toBe(true); expect(Number.isFinite(y)).toBe(true); }
    expect(committed.ticks).toBe(LAYOUT_TICKS);
  });

  it('is deterministic: the same pack gives byte-identical positions, and the committed file is current', () => {
    const a = JSON.stringify(computeLayout(model.nodes, model.claims));
    const b = JSON.stringify(computeLayout(model.nodes, model.claims));
    expect(a).toBe(b);
    expect(a).toBe(JSON.stringify(committed));
  });

  it('is what the canvas used to compute in the browser for the full atlas, to 0.1 px', () => {
    // The canvas's own path before E1: its own node objects (with labels and types), links carrying their claims,
    // the same forces, LAYOUT_TICKS ticks in slices of 16.
    const degree = degrees(model.claims);
    const nodes: (LayoutNode & { label: string; type: string })[] = model.nodes.map((n) => ({ id: n.id, label: n.label, type: n.type, degree: degree.get(n.id) ?? 0 }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links = model.claims.map((c) => ({ source: byId.get(c.source)!, target: byId.get(c.target)!, claim: c }));
    const sim = createSimulation(nodes, links);
    for (let done = 0; done < LAYOUT_TICKS; done += 16) for (let i = 0; i < Math.min(16, LAYOUT_TICKS - done); i++) sim.tick();
    for (const n of nodes) {
      const [x, y] = committed.positions[n.id];
      expect(Math.abs(n.x! - x)).toBeLessThanOrEqual(0.05 + 1e-9);
      expect(Math.abs(n.y! - y)).toBeLessThanOrEqual(0.05 + 1e-9);
    }
  });
});
