/**
 * claims.yaml — the graph seed (CONTENT-PACK v0.4 §claims, v0.7 finding). Validated against its own vocabulary and
 * against the references, glossary and sections, with the same rules as tools/validate_pack.py, then turned into the
 * one claims model the exports, analytics and /graph share. Nothing is derived from prose, glossary or figures.
 */
import { z } from 'zod';
import { zodErrors, type BuildError } from './schemas';
import { nodeId, volumeOfSection, type AtlasClaim, type AtlasNode, type ClaimsModel, type HypothesisGroup } from '../../src/lib/claims-model';

const nonEmptyList = (name: string) => z.array(z.string().min(1)).min(1, `vocabulary.${name} missing or empty`);

export const VocabularySchema = z.object({
  node_types: nonEmptyList('node_types'),
  predicates: nonEmptyList('predicates'),
  levels: nonEmptyList('levels'),
  evidence: nonEmptyList('evidence'),
}).strict();

const RivalSchema = z.object({ id: z.string().min(1), label: z.string().min(1), refs: z.array(z.number().int()).default([]) }).strict();

export const HypothesisSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1, 'a hypothesis group needs a question'),
  section: z.string().optional(),
  rivals: z.array(RivalSchema).min(2, 'a hypothesis group needs ≥ 2 rivals'),
}).strict();

const NodeRefSchema = z.object({
  label: z.string().min(1, 'label missing'),
  type: z.string().min(1),
  term: z.string().optional(),
  xref: z.string().optional(),
}).strict();

export const ClaimSchema = z.object({
  id: z.string().min(1),
  subject: NodeRefSchema,
  predicate: z.string().min(1),
  object: NodeRefSchema,
  level: z.string().min(1),
  evidence: z.string().min(1),
  species: z.array(z.string().min(1)).optional(),
  parameters: z.record(z.union([z.string(), z.number(), z.boolean()])).nullable().optional(),
  status: z.enum(['supported', 'contested', 'inferred'], { errorMap: () => ({ message: 'status must be supported | contested | inferred' }) }),
  hypothesis: z.string().optional(),
  refs: z.array(z.number().int()).min(1, 'refs required'),
  section: z.string().min(1),
  synthesis: z.boolean().default(false),
  // Spelled out on purpose: a bare `null` in YAML is nothing, and `true` is not a finding. Anything but the literal fails.
  finding: z.literal('null-result', { errorMap: () => ({ message: "finding must be the literal string 'null-result' when present" }) }).optional(),
  finding_note: z.string().min(1, 'finding_note may not be empty').optional(),
}).strict();

export const ClaimsFileSchema = z.object({
  vocabulary: VocabularySchema,
  hypotheses: z.array(HypothesisSchema).default([]),
  claims: z.array(ClaimSchema),
}).strict();

export interface ClaimsContext {
  refs: Map<number, { verified: boolean }>;
  sections: Set<string>;
  termIds: Set<string>;
  readyVolumes: string[];
}

export interface ClaimsResult { model: ClaimsModel | null; errors: BuildError[]; warnings: string[] }

const CURIE = /^[A-Za-z][A-Za-z0-9_.-]*:\S+$/;

export function validateClaims(raw: unknown, ctx: ClaimsContext): ClaimsResult {
  const errors: BuildError[] = [];
  const warnings: string[] = [];
  const E = (where: string, message: string) => errors.push({ where, message });

  const parsed = ClaimsFileSchema.safeParse(raw ?? {});
  if (!parsed.success) return { model: null, errors: zodErrors('claims', parsed.error), warnings };
  const { vocabulary: voc, hypotheses, claims } = parsed.data;
  const inVoc = { node_types: new Set(voc.node_types), predicates: new Set(voc.predicates), levels: new Set(voc.levels), evidence: new Set(voc.evidence) };

  // hypothesis groups and their rivals
  const rivalGroup = new Map<string, string>();
  const hids = new Set<string>();
  for (const h of hypotheses) {
    if (hids.has(h.id)) E('claims', `duplicate hypothesis id ${h.id}`);
    hids.add(h.id);
    if (h.section && !ctx.sections.has(h.section)) E(`claims/${h.id}`, `hypothesis section ${h.section} unknown`);
    for (const r of h.rivals) {
      if (rivalGroup.has(r.id)) E('claims', `duplicate rival id ${r.id}`);
      rivalGroup.set(r.id, h.id);
      for (const n of r.refs) if (!ctx.refs.has(n)) E(`claims/${r.id}`, `rival refs [${n}] has no reference entry`);
    }
  }

  const nodes = new Map<string, AtlasNode>();
  const touch = (where: string, end: 'subject' | 'object', ref: z.infer<typeof NodeRefSchema>): string => {
    if (!inVoc.node_types.has(ref.type)) E(where, `${end}.type ${JSON.stringify(ref.type)} not in vocabulary`);
    if (ref.term && !ctx.termIds.has(ref.term)) E(where, `${end}.term ${ref.term} unknown`);
    if (ref.xref && !CURIE.test(ref.xref)) E(where, `${end}.xref ${JSON.stringify(ref.xref)} is not a CURIE`);
    const id = nodeId(ref.type, ref.label);
    const prev = nodes.get(id);
    if (!prev) {
      nodes.set(id, { id, label: ref.label, type: ref.type, term: ref.term ?? null, xref: ref.xref ?? null });
    } else {
      if (prev.label !== ref.label || prev.type !== ref.type) E(where, `node id collision: ${id} names both "${prev.type}: ${prev.label}" and "${ref.type}: ${ref.label}"`);
      for (const k of ['term', 'xref'] as const) {
        const v = ref[k] ?? null;
        if (v && prev[k] && prev[k] !== v) warnings.push(`claims: node "${ref.label}" (${ref.type}) carries ${k} ${prev[k]} in one claim and ${v} in ${where}; the first is kept`);
        else if (v && !prev[k]) prev[k] = v;
      }
    }
    return id;
  };

  const seen = new Set<string>();
  const rivalUsed = new Set<string>();
  const out: AtlasClaim[] = [];
  for (const c of claims) {
    const where = `claims/${c.id}`;
    if (seen.has(c.id)) E('claims', `duplicate id ${c.id}`);
    seen.add(c.id);
    const source = touch(where, 'subject', c.subject);
    const target = touch(where, 'object', c.object);
    if (!inVoc.predicates.has(c.predicate)) E(where, `predicate ${JSON.stringify(c.predicate)} not in vocabulary.predicates`);
    if (!inVoc.levels.has(c.level)) E(where, `level ${JSON.stringify(c.level)} not in vocabulary.levels`);
    if (!inVoc.evidence.has(c.evidence)) E(where, `evidence ${JSON.stringify(c.evidence)} not in vocabulary.evidence`);
    for (const n of c.refs) {
      const r = ctx.refs.get(n);
      if (!r) E(where, `refs [${n}] has no reference entry`);
      else if (!r.verified) E(where, `refs [${n}] is verified: false — no claim may rest on it`);
    }
    if (!ctx.sections.has(c.section)) E(where, `section ${JSON.stringify(c.section)} unknown`);
    if (!c.species?.length) warnings.push(`claims/${c.id}: species not stated`);
    let group: string | null = null;
    if (c.status === 'contested') {
      if (!c.hypothesis || !rivalGroup.has(c.hypothesis)) E(where, `contested claims need hypothesis = an existing rival id (got ${JSON.stringify(c.hypothesis ?? null)})`);
      else { rivalUsed.add(c.hypothesis); group = rivalGroup.get(c.hypothesis)!; }
    } else if (c.hypothesis) {
      if (rivalGroup.has(c.hypothesis)) { rivalUsed.add(c.hypothesis); group = rivalGroup.get(c.hypothesis)!; }
      else E(where, `hypothesis ${JSON.stringify(c.hypothesis)} unknown`);
    }
    const inferred = c.status === 'inferred';
    const flagged = c.synthesis || c.evidence === 'inferred';
    if (inferred !== flagged) E(where, 'status inferred ⇔ synthesis: true or evidence: inferred');
    if (c.finding && !c.finding_note) E(where, "finding 'null-result' needs a finding_note saying what was not found");
    if (c.finding_note && !c.finding) E(where, "finding_note without finding: 'null-result'");
    out.push({
      id: c.id, source, target, predicate: c.predicate, level: c.level, evidence: c.evidence,
      species: c.species?.length ? c.species : null,
      parameters: Object.fromEntries(Object.entries(c.parameters ?? {}).map(([k, v]) => [k, String(v)])),
      status: c.status, hypothesis: c.hypothesis ?? null, hypothesis_group: group, refs: c.refs, section: c.section,
      volume: volumeOfSection(c.section), synthesis: c.synthesis, finding: c.finding ?? null, finding_note: c.finding_note ?? null,
    });
  }
  for (const r of rivalGroup.keys()) if (!rivalUsed.has(r)) warnings.push(`claims: rival ${r} is used by no claim`);
  for (const v of ctx.readyVolumes) if (!out.some((c) => c.volume === v)) warnings.push(`claims: volume ${v} has no claims yet`);

  const groups: HypothesisGroup[] = hypotheses.map((h) => ({ id: h.id, question: h.question, section: h.section ?? null, rivals: h.rivals }));
  const model: ClaimsModel = {
    vocabulary: voc,
    hypotheses: groups,
    nodes: [...nodes.values()].sort((a, b) => (a.id < b.id ? -1 : 1)),
    claims: out.sort((a, b) => (a.id < b.id ? -1 : 1)),
  };
  return { model, errors, warnings };
}
