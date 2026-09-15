/**
 * Cypher / neo4j-admin CSV / GraphML / JSON generation from the claims model.
 *
 * Runs at build time (scripts/build-content.ts → public/graph/) and in the browser (the /graph "export this view"
 * buttons), so the two can never disagree. Output is deterministic: nodes sorted by id, claims by id, fixed key
 * order, no timestamps — a rebuild with no pack change is byte-identical.
 */
import type { AtlasClaim, AtlasNode, ClaimsModel } from './claims-model';

export interface ExportScope {
  /** Human-readable description written into file headers, e.g. "the full atlas" or "a filtered view". */
  label: string;
}

const byId = <T extends { id: string }>(a: T, b: T) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** Nodes referenced by the given claims, sorted. A view never exports a node no claim touches. */
export function nodesFor(model: Pick<ClaimsModel, 'nodes'>, claims: AtlasClaim[]): AtlasNode[] {
  const used = new Set<string>();
  for (const c of claims) { used.add(c.source); used.add(c.target); }
  return model.nodes.filter((n) => used.has(n.id)).sort(byId);
}

export const relType = (predicate: string) => predicate.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

/* ───────────────────────── Cypher */

export function cypherString(s: string): string {
  let out = "'";
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    if (ch === '\\') out += '\\\\';
    else if (ch === "'") out += "\\'";
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (code < 0x20) out += `\\u${code.toString(16).padStart(4, '0')}`;
    else out += ch;
  }
  return out + "'";
}

const cypherList = (xs: (string | number)[]) => `[${xs.map((x) => (typeof x === 'number' ? String(x) : cypherString(x))).join(', ')}]`;
const constraintName = (label: string) => `atlas_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_id`;

/**
 * One statement per line, each ending in `;`. Constraints first (schema statements — Neo4j will not run them in the
 * same transaction as data writes), then an idempotent MERGE per node and per claim. Every relationship carries
 * claim_id, refs, status, evidence, level, species and section (APP-SPEC §4.1), plus the claim's other fields.
 */
export function toCypher(model: ClaimsModel, claims: AtlasClaim[] = model.claims, scope: ExportScope = { label: 'the full atlas' }): string {
  const cs = [...claims].sort(byId);
  const nodes = nodesFor(model, cs);
  const types = [...new Set(nodes.map((n) => n.type))].sort();
  const lines: string[] = [
    `// Neuromodulation atlas — ${scope.label}, generated from content-pack/claims.yaml. Do not edit by hand.`,
    `// ${nodes.length} nodes, ${cs.length} relationships (one per claim). Idempotent: running it twice changes nothing.`,
    '// Schema statements come first; run them before the data statements (Neo4j does not mix the two in one transaction).',
    `CREATE CONSTRAINT ${constraintName('Entity')} IF NOT EXISTS FOR (n:Entity) REQUIRE n.id IS UNIQUE;`,
    ...types.map((t) => `CREATE CONSTRAINT ${constraintName(t)} IF NOT EXISTS FOR (n:${t}) REQUIRE n.id IS UNIQUE;`),
  ];
  for (const n of nodes) {
    const sets = [`n:${n.type}`, `n.label = ${cypherString(n.label)}`, `n.type = ${cypherString(n.type)}`];
    if (n.term) sets.push(`n.term = ${cypherString(n.term)}`);
    if (n.xref) sets.push(`n.xref = ${cypherString(n.xref)}`);
    lines.push(`MERGE (n:Entity {id: ${cypherString(n.id)}}) SET ${sets.join(', ')};`);
  }
  for (const c of cs) {
    const sets = [
      `r.predicate = ${cypherString(c.predicate)}`,
      `r.refs = ${cypherList(c.refs)}`,
      `r.status = ${cypherString(c.status)}`,
      `r.evidence = ${cypherString(c.evidence)}`,
      `r.level = ${cypherString(c.level)}`,
    ];
    if (c.species) sets.push(`r.species = ${cypherList(c.species)}`);
    sets.push(`r.section = ${cypherString(c.section)}`, `r.volume = ${cypherString(c.volume)}`, `r.synthesis = ${c.synthesis ? 'true' : 'false'}`);
    if (c.finding) sets.push(`r.finding = ${cypherString(c.finding)}`);
    if (c.finding_note) sets.push(`r.finding_note = ${cypherString(c.finding_note)}`);
    if (c.hypothesis) sets.push(`r.hypothesis = ${cypherString(c.hypothesis)}`);
    if (c.hypothesis_group) sets.push(`r.hypothesis_group = ${cypherString(c.hypothesis_group)}`);
    if (Object.keys(c.parameters).length) sets.push(`r.parameters = ${cypherString(JSON.stringify(c.parameters))}`);
    lines.push(
      `MATCH (s:Entity {id: ${cypherString(c.source)}}) MATCH (o:Entity {id: ${cypherString(c.target)}}) ` +
      `MERGE (s)-[r:${relType(c.predicate)} {claim_id: ${cypherString(c.id)}}]->(o) SET ${sets.join(', ')};`,
    );
  }
  return lines.join('\n') + '\n';
}

/** Split a generated Cypher file into schema and data statements (one per line; comments skipped). */
export function splitCypher(text: string): { schema: string[]; data: string[] } {
  const schema: string[] = [];
  const data: string[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('//')) continue;
    const stmt = line.replace(/;$/, '');
    (/^CREATE CONSTRAINT\b/.test(stmt) ? schema : data).push(stmt);
  }
  return { schema, data };
}

/* ───────────────────────── neo4j-admin import CSV */

function csvCell(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvRow = (cells: (string | number | boolean | null | undefined)[]) => cells.map(csvCell).join(',');

export const NODES_CSV_HEADER = ['id:ID(Entity)', ':LABEL', 'label', 'type', 'term', 'xref'];
export const EDGES_CSV_HEADER = [
  ':START_ID(Entity)', ':END_ID(Entity)', ':TYPE', 'claim_id', 'predicate', 'refs:int[]', 'status', 'evidence', 'level',
  'species:string[]', 'section', 'volume', 'synthesis:boolean', 'finding', 'finding_note', 'hypothesis', 'hypothesis_group', 'parameters',
];

export function toNodesCsv(model: ClaimsModel, claims: AtlasClaim[] = model.claims): string {
  const nodes = nodesFor(model, claims);
  return [NODES_CSV_HEADER.join(','), ...nodes.map((n) => csvRow([n.id, `Entity;${n.type}`, n.label, n.type, n.term, n.xref]))].join('\n') + '\n';
}

export function toEdgesCsv(claims: AtlasClaim[]): string {
  const cs = [...claims].sort(byId);
  return [
    EDGES_CSV_HEADER.join(','),
    ...cs.map((c) => csvRow([
      c.source, c.target, relType(c.predicate), c.id, c.predicate, c.refs.join(';'), c.status, c.evidence, c.level,
      c.species ? c.species.join(';') : null, c.section, c.volume, c.synthesis, c.finding, c.finding_note, c.hypothesis, c.hypothesis_group,
      Object.keys(c.parameters).length ? JSON.stringify(c.parameters) : null,
    ])),
  ].join('\n') + '\n';
}

/* ───────────────────────── GraphML */

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NODE_KEYS = ['label', 'type', 'term', 'xref'] as const;
const EDGE_KEYS = ['claim_id', 'predicate', 'refs', 'status', 'evidence', 'level', 'species', 'section', 'volume', 'synthesis', 'finding', 'finding_note', 'hypothesis', 'hypothesis_group', 'parameters'] as const;

export function toGraphml(model: ClaimsModel, claims: AtlasClaim[] = model.claims, scope: ExportScope = { label: 'the full atlas' }): string {
  const cs = [...claims].sort(byId);
  const nodes = nodesFor(model, cs);
  const out: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Neuromodulation atlas — ${xml(scope.label)}, generated from content-pack/claims.yaml. Lists (refs, species) are ";"-separated. -->`,
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
    ...NODE_KEYS.map((k) => `  <key id="n_${k}" for="node" attr.name="${k}" attr.type="string"/>`),
    ...EDGE_KEYS.map((k) => `  <key id="e_${k}" for="edge" attr.name="${k}" attr.type="${k === 'synthesis' ? 'boolean' : 'string'}"/>`),
    '  <graph id="neuromodulation-atlas" edgedefault="directed">',
  ];
  const data = (prefix: string, k: string, v: string | null) => (v === null || v === '' ? '' : `<data key="${prefix}_${k}">${xml(v)}</data>`);
  for (const n of nodes) {
    out.push(`    <node id="${xml(n.id)}">${data('n', 'label', n.label)}${data('n', 'type', n.type)}${data('n', 'term', n.term)}${data('n', 'xref', n.xref)}</node>`);
  }
  for (const c of cs) {
    const vals: Record<(typeof EDGE_KEYS)[number], string | null> = {
      claim_id: c.id, predicate: c.predicate, refs: c.refs.join(';'), status: c.status, evidence: c.evidence, level: c.level,
      species: c.species ? c.species.join(';') : null, section: c.section, volume: c.volume, synthesis: c.synthesis ? 'true' : 'false',
      finding: c.finding, finding_note: c.finding_note, hypothesis: c.hypothesis, hypothesis_group: c.hypothesis_group,
      parameters: Object.keys(c.parameters).length ? JSON.stringify(c.parameters) : null,
    };
    out.push(`    <edge id="${xml(c.id)}" source="${xml(c.source)}" target="${xml(c.target)}">${EDGE_KEYS.map((k) => data('e', k, vals[k])).join('')}</edge>`);
  }
  out.push('  </graph>', '</graphml>');
  return out.join('\n') + '\n';
}

/* ───────────────────────── JSON */

export function toJson(model: ClaimsModel, claims: AtlasClaim[] = model.claims, scope: ExportScope = { label: 'the full atlas' }): string {
  const cs = [...claims].sort(byId);
  const nodes = nodesFor(model, cs);
  const groups = new Set(cs.map((c) => c.hypothesis_group).filter(Boolean));
  return JSON.stringify({
    source: 'content-pack/claims.yaml',
    scope: scope.label,
    counts: { nodes: nodes.length, claims: cs.length },
    vocabulary: model.vocabulary,
    hypotheses: scope.label === 'the full atlas' ? model.hypotheses : model.hypotheses.filter((h) => groups.has(h.id)),
    nodes,
    claims: cs,
  }, null, 2) + '\n';
}
