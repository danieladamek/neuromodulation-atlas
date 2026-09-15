/**
 * Zod schemas mirroring docs/CONTENT-PACK.md v0.7 (topic mode, volumes, levelled 101s) and tools/validate_pack.py.
 * claims.yaml has its own module (./claims.ts) because it is validated against its own vocabulary and against the
 * rest of the pack. Everything the content build accepts is declared here; anything else is a loud failure.
 */
import { z } from 'zod';

export const kebab = z.string().regex(/^[a-z0-9-]+$/, 'must be kebab-case');
/** YAML dates are read with the CORE schema (see build-content.ts), so they arrive as strings, never Date objects. */
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a YYYY-MM-DD date');

export const VolumeEntrySchema = z.object({
  id: z.string().regex(/^v\d+$/, 'volume id must be v0, v1, …'),
  title: z.string().min(1, 'a volume needs a title'),
  status: z.enum(['ready', 'planned']),
  as_of: dateString.optional(),
});
export type VolumeEntry = z.infer<typeof VolumeEntrySchema>;

export const ManifestSchema = z
  .object({
    mode: z.enum(['manuscript', 'topic']).default('manuscript'),
    slug: kebab,
    title: z.string().min(1),
    short_title: z.string().min(1),
    question: z.string().optional(),
    purpose: z.string().optional(),
    as_of: dateString.optional(),
    authors: z.array(z.string().min(1)).min(1),
    venue: z.string().min(1),
    year: z.number().int(),
    doi: z.string().optional(),
    url: z.string().optional(),
    concept_levels: z.boolean().default(false),
    volumes: z.array(VolumeEntrySchema).optional(),
    plain_abstract: z.string().default(''),
    reading_minutes: z.number().optional(),
    audience: z.string().optional(),
    palette: z.object({ groups: z.record(z.string()) }).default({ groups: {} }),
    permissions: z.object({
      text: z.string().min(1, 'permissions.text is REQUIRED — no pack ships without it'),
      figures: z.string().optional(),
    }),
    delivery: z.enum(['local', 'pages']).default('local'),
    link_every_occurrence: z.boolean().default(false),
    builder: z.object({ name: z.string(), version: z.string(), date: z.string() }),
    github_account: z.string().min(1),
  })
  .superRefine((m, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    if (m.mode === 'topic') {
      for (const k of ['question', 'purpose', 'as_of'] as const) if (!m[k]) issue([k], `${k} is REQUIRED in topic mode`);
      if (!/peer/i.test(m.venue)) issue(['venue'], 'topic mode: venue must make the non-peer-reviewed status unmissable');
    } else {
      if (!(m.doi || m.url)) issue([], 'doi or url required');
      if (m.volumes) issue(['volumes'], 'volumes are only allowed in topic mode');
    }
    if (m.delivery === 'pages' && ['', 'unknown', 'tbd', '?'].includes(m.permissions.text.trim().toLowerCase())) {
      issue(['permissions', 'text'], "delivery 'pages' requires a real permissions.text — nothing public ships from text of unknown provenance");
    }
    if (m.volumes) {
      const ids = m.volumes.map((v) => v.id);
      const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dup.length) issue(['volumes'], `duplicate volume ids ${[...new Set(dup)].join(', ')}`);
      if (!m.volumes.some((v) => v.status === 'ready')) issue(['volumes'], 'volumes declared but none is ready');
    }
  });
export type Manifest = z.infer<typeof ManifestSchema>;

export const GLOSSARY_KINDS = ['science', 'methods', 'statistics', 'notation', 'drug'] as const;
export const GlossaryEntrySchema = z.object({
  id: kebab,
  term: z.string().min(1),
  kind: z.enum(GLOSSARY_KINDS),
  variants: z.array(z.string().min(1)).default([]),
  short: z.string().min(1).max(200, 'short > 200 chars'),
  definition: z.string().min(1),
  concept: kebab.optional(),
  see: z.array(kebab).default([]),
  sources: z.array(z.string()).default([]),
});
export const GlossarySchema = z.array(GlossaryEntrySchema);
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;

export const ConceptFrontmatterSchema = z.object({
  id: kebab,
  title: z.string().min(1),
  one_liner: z.string().min(1),
  why_here: z.string().min(1),
  prerequisites: z.array(kebab).default([]),
  terms: z.array(kebab).default([]),
  figures: z.array(kebab).default([]),
  further_reading: z
    .array(z.object({ title: z.string().min(1), url: z.string().min(1), kind: z.string().optional() }))
    .min(2, 'needs ≥2 further_reading'),
  self_check: z
    .array(
      z
        .object({ q: z.string().min(1), options: z.array(z.string()).min(2), answer: z.number().int(), explanation: z.string().default('') })
        .refine((q) => q.answer >= 0 && q.answer < q.options.length, { message: 'self_check answer index out of range' }),
    )
    .min(1, 'needs ≥1 self_check'),
});
export type ConceptFrontmatter = z.infer<typeof ConceptFrontmatterSchema>;

export const FIGURE_KINDS = ['chart', 'table', 'network', 'pathway', 'image'] as const;
export const CHART_TYPES = ['line', 'bar', 'grouped-bar', 'stacked-bar', 'scatter', 'area', 'step', 'box', 'heatmap', 'forest'] as const;
const AxisSchema = z.object({
  field: z.string().optional(),
  label: z.string().optional(),
  unit: z.string().optional(),
  scale: z.enum(['linear', 'log']).optional(),
});
/**
 * CONTENT-PACK writes an axis as `{field, label, unit}`; this pack writes the shorthand `x: entry` plus flat keys
 * (`y_high`, `unit`, `log_scale`, `group_by`, `facet_by`, `orientation`). Both are accepted and normalised by the
 * build into one shape, so the app never guesses.
 */
export const ChartSpecSchema = z.object({
  type: z.enum(CHART_TYPES),
  data: z.string().optional(),
  x: z.union([z.string(), AxisSchema]).optional(),
  y: z.union([z.string(), AxisSchema]).optional(),
  y_high: z.string().optional(),
  unit: z.string().optional(),
  log_scale: z.boolean().optional(),
  group_by: z.string().optional(),
  facet_by: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  series: z.string().optional(),
  ci: z.tuple([z.string(), z.string()]).optional(),
});
export const ExplainSchema = z.object({ on: z.string().min(1), text: z.string().min(1), term: kebab.optional(), concept: kebab.optional() });
export const HotspotSchema = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number(), text: z.string().min(1), term: kebab.optional() });
export const FigureSchema = z.object({
  id: kebab,
  label: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(FIGURE_KINDS),
  synthesis: z.enum(['data', 'conceptual']).optional(),
  refs: z.array(z.number().int()).default([]),
  data: z.string().optional(),
  image: z.string().optional(),
  columns: z.array(z.object({ field: z.string(), label: z.string().optional() })).optional(),
  chart: ChartSpecSchema.optional(),
  caption: z.string().min(1),
  how_to_read: z.string().min(1),
  explain: z.array(ExplainSchema).default([]),
  hotspots: z.array(HotspotSchema).default([]),
  concepts: z.array(kebab).default([]),
  discussed_in: z.array(z.string()).default([]),
  cites: z.array(z.number().int()).default([]),
  source: z.string().min(1),
});
export const FiguresSchema = z.array(FigureSchema);
export type FigureDef = z.infer<typeof FigureSchema>;

/** Node/edge JSON for network and pathway figures. Extra properties are kept and shown on hover, never dropped. */
export const GraphSchema = z.object({
  layout: z.enum(['layered', 'fixed']).default('layered'),
  nodes: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), term: kebab.nullable().optional(), x: z.number().optional(), y: z.number().optional() }).passthrough()).min(1),
  edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional(), via: z.string().optional() }).passthrough()),
});
export type Graph = z.infer<typeof GraphSchema>;

export const REF_ROLES = ['support', 'method', 'contrast', 'prior-result', 'data-source', 'background', 'guideline', 'review', 'consensus'] as const;
export const REF_TIERS = ['seminal', 'classic', 'current', 'background'] as const;
export const ReferenceSchema = z
  .object({
    n: z.number().int().positive(),
    tier: z.enum(REF_TIERS).optional(),
    anchor: z.boolean().default(false),
    citation: z.string().min(1),
    year: z.number().int().optional(),
    doi: z.string().optional(),
    url: z.string().optional(),
    summary: z.string().default(''),
    why_it_mattered: z.string().default(''),
    role_here: z.enum(REF_ROLES),
    role_note: z.string().default(''),
    cited_in: z.array(z.string()).default([]),
    verified: z.boolean().default(false),
    verified_how: z.string().optional(),
    species: z.array(z.string()).default([]),
    evidence_kind: z.string().optional(),
    contested: z.string().nullable().optional(),
    _key: z.string().optional(),
    _sections: z.array(z.string()).optional(),
  })
  .refine((r) => !!(r.doi || r.url), { message: 'doi or url required' })
  .refine((r) => r.summary.trim().length > 0 || !r.verified, { message: 'no summary (a missing summary is allowed only with verified: false)' });
export const ReferencesSchema = z.array(ReferenceSchema);
export type Reference = z.infer<typeof ReferenceSchema>;

export const TodoSchema = z.array(z.object({ where: z.string().min(1), what: z.string().min(1) }));
export type TodoItem = z.infer<typeof TodoSchema>[number];

/* ───────────────────────── scope.yaml (topic mode) — published content, rendered by /methods */

export const DEPTHS = ['brief', 'standard', 'deep', 'textbook'] as const;

export const SearchStrategySchema = z.object({
  run_on: z.string().min(1),
  sources: z.array(z.string()).min(1),
  queries: z
    .array(z.object({ q: z.string().min(1), source: z.string().optional(), hits: z.number().int({ message: 'every query needs q + hits' }), kept: z.number().int().optional(), date: z.string().optional(), lane: z.string().optional() }))
    .min(1),
  snowball: z.array(z.string()).default([]),
  inclusion: z.array(z.string()).min(1),
  exclusion: z.array(z.string()).min(1),
  known_gaps: z.array(z.string()).default([]),
});
export type SearchStrategy = z.infer<typeof SearchStrategySchema>;

export const CorpusProfileSchema = z
  .object({
    by_tier: z.record(z.number().int()),
    year_range: z.array(z.number().int()).optional(),
    concentration: z.string().default(''),
    dissent_represented: z.boolean().default(false),
  })
  .passthrough();

export const VolumeScopeSchema = z.object({
  depth: z.enum(DEPTHS),
  outline_approved: z.string().nullable().default(null),
  search_strategy: SearchStrategySchema,
  corpus_profile: CorpusProfileSchema,
});

/** The interview is quoted as asked: either a list of Q&A pairs or rounds of named answers. */
const InterviewSchema = z.union([
  z.array(z.object({ q: z.string(), answer: z.string(), asked: z.string().optional() })),
  z.record(z.record(z.string())),
]);

export const ScopeSchema = z
  .object({
    topic: z.string().min(1),
    question: z.string().min(1),
    purpose: z.string().optional(),
    lineage: z.string().optional(),
    graph_edges: z.record(z.string()).optional(),
    boundary: z.object({
      in: z.array(z.string()).min(1, 'boundary.in is empty — the scope must say what is in'),
      out: z.array(z.string()).min(1, 'boundary.out is empty — the scope must say what was deliberately left out'),
      rationale: z.string().default(''),
    }),
    level: z.string().optional(),
    time_window: z.object({ current_from: z.number().int().optional(), seminal: z.string().optional() }),
    stance: z.string().optional(),
    depth: z.enum(DEPTHS),
    anchors_note: z.string().optional(),
    anchors: z.array(z.object({ citation: z.string(), doi: z.string().optional(), url: z.string().optional(), why: z.string().default('') })).default([]),
    excluded: z.array(z.object({ what: z.string(), why: z.string().default('') })).default([]),
    assumed: z.boolean().default(false),
    interview: InterviewSchema.default([]),
    volumes_plan: z.object({ form: z.string().default(''), volumes: z.array(z.object({ id: z.string(), title: z.string(), depth: z.string().optional() })).default([]) }).optional(),
    search_strategy: SearchStrategySchema.optional(),
    corpus_profile: CorpusProfileSchema.optional(),
    volumes: z.record(VolumeScopeSchema).optional(),
  })
  .superRefine((s, ctx) => {
    if (!s.volumes) {
      if (!s.search_strategy) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['search_strategy'], message: 'search_strategy is required when there are no volumes' });
      if (!s.corpus_profile) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['corpus_profile'], message: 'corpus_profile is required when there are no volumes' });
      if (s.depth === 'textbook') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['depth'], message: 'depth textbook is only allowed for volume packs' });
    }
  });
export type Scope = z.infer<typeof ScopeSchema>;

export interface BuildError { where: string; message: string }

/** Flatten a zod error into build errors with a stable "where" prefix. */
export function zodErrors(where: string, err: z.ZodError): BuildError[] {
  return err.issues.map((i) => ({ where: i.path.length ? `${where}/${i.path.join('/')}` : where, message: i.message }));
}
