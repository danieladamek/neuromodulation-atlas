import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateSyntax } from '@neo4j-cypher/language-support';
import type { ClaimsModel } from '../../src/lib/claims-model';
import { cypherString, splitCypher, toCypher, toEdgesCsv, toGraphml, toJson, toNodesCsv } from '../../src/lib/graph-export';

const ROOT = path.resolve(__dirname, '../..');

const model: ClaimsModel = {
  vocabulary: { node_types: ['ExogenousDrive', 'Outcome'], predicates: ['modulates'], levels: ['clinical'], evidence: ['human-interventional'] },
  hypotheses: [{ id: 'H-x', question: 'Does it?', section: 'v0-1-a', rivals: [{ id: 'H-x-p1', label: 'Yes', refs: [1] }, { id: 'H-x-p2', label: 'No', refs: [2] }] }],
  nodes: [
    { id: 'drive-1', label: "Tracey's drive \\ with quotes", type: 'ExogenousDrive', term: 'tacs', xref: null },
    { id: 'outcome-1', label: 'An outcome <with> & markup', type: 'Outcome', term: null, xref: 'UBERON:0000955' },
  ],
  claims: [
    { id: 'C0001', source: 'drive-1', target: 'outcome-1', predicate: 'modulates', level: 'clinical', evidence: 'human-interventional', species: ['human', 'rat'], parameters: { dose: "2 mA, 'as published'" }, status: 'contested', hypothesis: 'H-x-p1', hypothesis_group: 'H-x', refs: [1, 2], section: 'v0-1-a', volume: 'v0', synthesis: false, finding: null, finding_note: null },
    { id: 'C0002', source: 'drive-1', target: 'outcome-1', predicate: 'modulates', level: 'clinical', evidence: 'human-interventional', species: null, parameters: {}, status: 'supported', hypothesis: null, hypothesis_group: null, refs: [2], section: 'v0-1-a', volume: 'v0', synthesis: false, finding: 'null-result', finding_note: 'the primary endpoint was not met' },
  ],
};

describe('Cypher', () => {
  const cypher = toCypher(model);
  it('escapes quotes and backslashes rather than breaking the statement', () => {
    expect(cypherString("it's")).toBe("'it\\'s'");
    expect(cypherString('back\\slash')).toBe("'back\\\\slash'");
    expect(cypherString('a\nb')).toBe("'a\\nb'");
    expect(cypher).toContain("n.label = 'Tracey\\'s drive \\\\ with quotes'");
  });
  it('writes uniqueness constraints, then an idempotent MERGE per node and per claim', () => {
    const { schema, data } = splitCypher(cypher);
    expect(schema).toHaveLength(3); // Entity + the two node labels
    expect(schema.every((s) => /^CREATE CONSTRAINT .* IF NOT EXISTS/.test(s))).toBe(true);
    expect(data.filter((s) => s.startsWith('MERGE (n:Entity'))).toHaveLength(2);
    expect(data.filter((s) => s.includes('MERGE (s)-['))).toHaveLength(2);
  });
  it('carries claim_id, refs, status, evidence, level, species, section — and the null result', () => {
    expect(cypher).toContain("MERGE (s)-[r:MODULATES {claim_id: 'C0001'}]->(o)");
    expect(cypher).toContain('r.refs = [1, 2]');
    expect(cypher).toContain("r.species = ['human', 'rat']");
    expect(cypher).toContain("r.status = 'contested'");
    expect(cypher).toContain("r.hypothesis = 'H-x-p1'");
    expect(cypher).toContain("r.finding = 'null-result'");
    expect(cypher).toContain("r.finding_note = 'the primary endpoint was not met'");
    // a claim whose species the pack does not state gets no species property, rather than an invented one
    const c2 = cypher.split('\n').find((l) => l.includes("'C0002'"))!;
    expect(c2).not.toContain('r.species');
  });
  it('is deterministic', () => {
    expect(toCypher(model)).toBe(cypher);
  });
});

describe('the generated exports in public/graph', () => {
  const graphDir = path.join(ROOT, 'public/graph');
  const cypherFile = path.join(graphDir, 'claims.cypher');
  it('exist', () => {
    for (const f of ['claims.cypher', 'nodes.csv', 'edges.csv', 'claims.graphml', 'claims.json']) {
      expect(fs.existsSync(path.join(graphDir, f)), `${f} is missing — run npm run build:content`).toBe(true);
    }
  });
  it('parse as Cypher (every statement, by the Neo4j Cypher parser)', () => {
    const text = fs.readFileSync(cypherFile, 'utf8');
    const { schema, data } = splitCypher(text);
    expect(schema.length + data.length).toBeGreaterThan(1000);
    const problems: string[] = [];
    for (const stmt of [...schema, ...data]) {
      const diagnostics = validateSyntax(stmt, {});
      if (diagnostics.length) problems.push(`${stmt.slice(0, 80)}… → ${diagnostics[0].message}`);
      if (problems.length > 3) break;
    }
    expect(problems).toEqual([]);
  });
  it('the JSON export holds the same claims as src/data/claims.json', () => {
    const exported = JSON.parse(fs.readFileSync(path.join(graphDir, 'claims.json'), 'utf8')) as { claims: unknown[]; nodes: unknown[] };
    const built = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/claims.json'), 'utf8')) as ClaimsModel;
    expect(exported.claims).toHaveLength(built.claims.length);
    expect(exported.nodes).toHaveLength(built.nodes.length);
  });
});

describe('CSV for neo4j-admin import', () => {
  it('writes typed headers and ;-separated arrays', () => {
    const nodes = toNodesCsv(model).split('\n');
    expect(nodes[0]).toBe('id:ID(Entity),:LABEL,label,type,term,xref');
    expect(nodes[1]).toContain('Entity;ExogenousDrive');
    // apostrophes and backslashes need no CSV quoting; commas and quotes do
    expect(nodes[1]).toContain("Tracey's drive \\ with quotes");
    const withComma = toNodesCsv({ ...model, nodes: [{ ...model.nodes[0], label: 'A label, with a comma and a "quote"' }] }, [model.claims[0]]);
    expect(withComma).toContain('"A label, with a comma and a ""quote"""');
    const edges = toEdgesCsv(model.claims).split('\n');
    expect(edges[0]).toContain(':START_ID(Entity),:END_ID(Entity),:TYPE,claim_id,predicate,refs:int[]');
    expect(edges[1]).toContain('1;2');
    expect(edges[1]).toContain('human;rat');
    expect(edges[2]).toContain('null-result');
  });
});

describe('GraphML and JSON', () => {
  it('escapes XML and keeps every edge key', () => {
    const xml = toGraphml(model);
    expect(xml).toContain('<node id="outcome-1">');
    expect(xml).toContain('An outcome &lt;with&gt; &amp; markup');
    expect(xml).toContain('<edge id="C0001" source="drive-1" target="outcome-1">');
    expect(xml).toContain('<data key="e_finding">null-result</data>');
  });
  it('JSON keeps the vocabulary, the hypotheses and the claims', () => {
    const json = JSON.parse(toJson(model)) as { vocabulary: unknown; hypotheses: unknown[]; claims: unknown[]; counts: { nodes: number; claims: number } };
    expect(json.counts).toEqual({ nodes: 2, claims: 2 });
    expect(json.hypotheses).toHaveLength(1);
    expect(json.vocabulary).toEqual(model.vocabulary);
  });
  it('a filtered view exports only the claims in it, and only the nodes they touch', () => {
    const one = [model.claims[1]];
    expect(JSON.parse(toJson(model, one, { label: 'a filtered view' })).counts).toEqual({ nodes: 2, claims: 1 });
    expect(toEdgesCsv(one).trim().split('\n')).toHaveLength(2);
  });
});
