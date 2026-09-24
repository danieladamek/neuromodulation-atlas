/**
 * build-content.ts — validate the content pack, link terms, emit src/data/*.json, public/provenance.json and the
 * graph exports in public/graph/.
 *
 * Topic mode with volumes (APP-SPEC §1.2, §6.1; CONTENT-PACK v0.7): every `status: ready` volume's review.md is
 * parsed with the same rules (section ids must carry the volume prefix), the citation-coverage gate is enforced per
 * block, every `<!-- synthesis -->` block gets a stable id, scope.yaml is published content, references are tiered,
 * 101s are split into L1–L4, and claims.yaml is validated against its vocabulary and the rest of the pack before it
 * becomes /graph and the Cypher/CSV/GraphML/JSON exports.
 *
 * Fails loudly (exit 1) on any schema violation, unresolved [n], unknown term/concept/figure/section id, missing data
 * file, ambiguous term variant, uncited block, claim resting on an unverified reference, or an id that a previous
 * build published and this one no longer has. Errors go to content-pack/BUILD-ERRORS.md and src/data/build-errors.json
 * so /methods can surface them; whatever validated is still emitted. The pack itself is never modified.
 * Idempotent: outputs are rewritten only when their bytes changed, and nothing emitted carries a timestamp.
 *
 * Environment (used by the fixture-volume build in tests; defaults are the real app):
 *   CONTENT_PACK=content-pack   DATA_DIR=src/data   PUBLIC_DIR=public
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import type { Element, Nodes, Root } from 'hast';
import {
  ConceptFrontmatterSchema, FiguresSchema, GlossarySchema, ManifestSchema, ReferencesSchema, ScopeSchema, TodoSchema, zodErrors,
  type BuildError, type ConceptFrontmatter, type FigureDef, type GlossaryEntry, type Reference, type Scope,
} from './lib/schemas';
import { buildMatcher, findAmbiguousVariants } from './lib/linker';
import { parseReview, type Section } from './lib/parse';
import { loadFigureData, type LoadedFigure } from './lib/figures';
import { mdToHast } from './lib/render';
import { LEVELS, levelOf, linkConceptCitations, splitConceptBody, type LevelId } from './lib/concepts';
import { validateClaims } from './lib/claims';
import { isNullResult, slugify, type ClaimsModel } from '../src/lib/claims-model';
import { toCypher, toEdgesCsv, toGraphml, toJson, toNodesCsv } from '../src/lib/graph-export';
import { computeLayout } from '../src/lib/graph-layout';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.resolve(ROOT, process.env.CONTENT_PACK ?? 'content-pack');
const DATA = path.resolve(ROOT, process.env.DATA_DIR ?? 'src/data');
const PUBLIC = path.resolve(ROOT, process.env.PUBLIC_DIR ?? 'public');

const errors: BuildError[] = [];
const warnings: string[] = [];
const E = (where: string, message: string) => errors.push({ where, message });
const W = (m: string) => warnings.push(m);
const written: { file: string; status: 'written' | 'unchanged'; bytes: number }[] = [];

function readYaml(file: string): unknown {
  const p = path.join(PACK, file);
  if (!fs.existsSync(p)) { E(file, 'missing file'); return undefined; }
  // CORE schema: YAML dates stay strings (never Date objects), and `null-result` stays the string it is.
  try { return yaml.load(fs.readFileSync(p, 'utf8'), { schema: yaml.CORE_SCHEMA }); } catch (e) { E(file, `YAML parse error: ${(e as Error).message}`); return undefined; }
}

function emit(abs: string, content: string | Buffer) {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const same = fs.existsSync(abs) && Buffer.compare(fs.readFileSync(abs), buf) === 0;
  if (!same) fs.writeFileSync(abs, buf);
  written.push({ file: path.relative(ROOT, abs), status: same ? 'unchanged' : 'written', bytes: buf.length });
}
/** Readable JSON for the small files; the hast-bearing volume and concept files are written compact. */
const emitData = (rel: string, data: unknown, compact = false) => emit(path.join(DATA, rel), (compact ? JSON.stringify(data) : JSON.stringify(data, null, 1)) + '\n');
const count = <T,>(xs: T[], key: (x: T) => string | undefined | null) => {
  const out: Record<string, number> = {};
  for (const x of xs) { const k = key(x); if (k) out[k] = (out[k] ?? 0) + 1; }
  return out;
};

// ───────────────────────── 1. manifest, glossary, references, todo, scope
const manifestParsed = ManifestSchema.safeParse(readYaml('manifest.yaml'));
if (!manifestParsed.success) errors.push(...zodErrors('manifest', manifestParsed.error));
const manifest = manifestParsed.success ? manifestParsed.data : undefined;
const TOPIC = manifest?.mode === 'topic';
if (manifest && !manifest.plain_abstract.trim()) W('manifest: plain_abstract empty');
const VOLUMES = manifest?.volumes ?? [];
const READY = VOLUMES.filter((v) => v.status === 'ready');

const glossaryParsed = GlossarySchema.safeParse(readYaml('glossary.yaml') ?? []);
if (!glossaryParsed.success) errors.push(...zodErrors('glossary', glossaryParsed.error));
const glossary: GlossaryEntry[] = glossaryParsed.success ? glossaryParsed.data : [];
const termIds = new Set(glossary.map((t) => t.id));
for (const [i, t] of glossary.entries()) if (glossary.findIndex((u) => u.id === t.id) !== i) E(`glossary/${t.id}`, 'duplicate id');
const ambiguous = findAmbiguousVariants(glossary);
for (const a of ambiguous) E('glossary', `variant collision ${JSON.stringify(a.variant)} between ${a.ids.join(' and ')}`);
for (const t of glossary) for (const s of t.see) if (!termIds.has(s)) E(`glossary/${t.id}`, `see -> unknown ${s}`);

const referencesParsed = ReferencesSchema.safeParse(readYaml('references.yaml') ?? []);
if (!referencesParsed.success) errors.push(...zodErrors('references', referencesParsed.error));
const references: Reference[] = referencesParsed.success ? referencesParsed.data : [];
const refByN = new Map<number, Reference>();
for (const r of references) { if (refByN.has(r.n)) E(`references/${r.n}`, 'duplicate n'); refByN.set(r.n, r); }

const todoParsed = TodoSchema.safeParse(fs.existsSync(path.join(PACK, 'todo.yaml')) ? readYaml('todo.yaml') ?? [] : []);
if (!todoParsed.success) errors.push(...zodErrors('todo', todoParsed.error));
const todo = todoParsed.success ? todoParsed.data : [];

let scope: Scope | undefined;
if (TOPIC) {
  const scopeParsed = ScopeSchema.safeParse(readYaml('scope.yaml'));
  if (!scopeParsed.success) errors.push(...zodErrors('scope', scopeParsed.error));
  else {
    scope = scopeParsed.data;
    if (scope.assumed) W('scope: assumed=true — the interview went unanswered; defaults must be shown on /methods');
    if (scope.depth === 'textbook' && !VOLUMES.length) E('scope', 'depth textbook is only allowed for volume packs');
    const sv = scope.volumes ?? {};
    for (const v of READY) {
      const vs = sv[v.id];
      if (!vs) { E('scope', `volumes.${v.id} missing for a ready volume`); continue; }
      if (!vs.outline_approved) (vs.depth === 'textbook' ? E : (_w: string, m: string) => W(m))('scope', `volumes.${v.id}.outline_approved not set — the outline must be approved before prose (TOPIC-WORKFLOW TV)`);
    }
    for (const vid of Object.keys(sv)) if (!VOLUMES.some((v) => v.id === vid)) E('scope', `volumes.${vid} is not a manifest volume`);
  }
}
if (TOPIC) for (const r of references) {
  const where = `references/${r.n}`;
  if (!r.tier) E(where, 'topic mode needs tier: seminal | classic | current | background');
  if (!r.year) E(where, 'topic mode needs year');
  if (r.tier === 'seminal' || r.tier === 'classic') {
    if (r.summary.trim().split(/\s+/).length < 30) E(where, `${r.tier} tier needs a full summary (3–6 sentences)`);
    if (r.tier === 'seminal' && !r.why_it_mattered.trim()) E(where, 'seminal tier needs why_it_mattered');
  }
  const from = scope?.time_window.current_from;
  if (r.tier === 'current' && from && r.year && r.year < from) W(`references/${r.n}: tier current but year ${r.year} predates scope current_from ${from}`);
}

// ───────────────────────── 2. every ready volume's review.md → sections, blocks, term links, citation tokens
if (VOLUMES.length && fs.existsSync(path.join(PACK, 'review.md'))) E('pack', 'review.md must not exist alongside volumes — each volume has its own file');
for (const v of VOLUMES) {
  const f = path.join(PACK, 'volumes', v.id, 'review.md');
  if (v.status === 'ready' && !fs.existsSync(f)) E(`volumes/${v.id}`, `status ready but volumes/${v.id}/review.md is missing`);
  if (v.status === 'planned' && fs.existsSync(f)) W(`volume ${v.id}: planned but volumes/${v.id}/review.md exists — it will not be rendered`);
}
const matcher = buildMatcher(glossary);
const everyOccurrence = manifest?.link_every_occurrence ?? false;

interface VolumeParse { id: string; title: string; file: string; parsed: ReturnType<typeof parseReview> }
const parsedVolumes: VolumeParse[] = [];
for (const v of READY) {
  const file = `volumes/${v.id}/review.md`;
  const p = path.join(PACK, file);
  if (!fs.existsSync(p)) continue;
  const md = fs.readFileSync(p, 'utf8');
  const parsed = parseReview(md, matcher, { everyOccurrence });
  for (const d of parsed.duplicateSections) E(file, `duplicate section id ${d}`);
  for (const s of parsed.sections) if (!s.id.startsWith(`${v.id}-`)) E(file, `section id ${JSON.stringify(s.id)} must start with '${v.id}-'`);
  // APP-SPEC §6.1 rule 5 — uncited prose is a content-build error and is never repaired by adding a citation.
  for (const u of parsed.uncited) E(`${file}/${u.section}`, `uncited block of ${u.words} words — cite it or mark it <!-- framing -->: ${JSON.stringify(u.excerpt)}`);
  for (const q of md.match(/[“"]([^”"\n]{4,})[”"]/g) ?? []) {
    const inner = q.slice(1, -1);
    if (inner.split(/\s+/).length > 25) E(file, `quotation longer than 25 words: ${JSON.stringify(inner.slice(0, 60))}`);
  }
  parsedVolumes.push({ id: v.id, title: v.title, file, parsed });
}
const allSections: (Section & { volume: string })[] = parsedVolumes.flatMap((pv) => pv.parsed.sections.map((s) => ({ ...s, volume: pv.id })));
const sectionIds = new Set(allSections.map((s) => s.id));
for (const [i, s] of allSections.entries()) if (allSections.findIndex((x) => x.id === s.id) !== i) E('volumes', `section id ${s.id} is used by more than one volume`);
const figureMarkers = parsedVolumes.flatMap((pv) => pv.parsed.figureMarkers);
const bodyCitations = new Set(parsedVolumes.flatMap((pv) => pv.parsed.citations));
const occurrences: Record<string, number> = {};
for (const pv of parsedVolumes) for (const [k, n] of Object.entries(pv.parsed.occurrences)) occurrences[k] = (occurrences[k] ?? 0) + n;

// ───────────────────────── 3. concepts (101s), split into levels
const conceptFiles = fs.existsSync(path.join(PACK, 'concepts')) ? fs.readdirSync(path.join(PACK, 'concepts')).filter((f) => f.endsWith('.md')).sort() : [];
type SectionKind = 'what' | 'level' | 'uses' | 'other';
interface ConceptSectionOut { title: string; kind: SectionKind; level: LevelId | null; hast: Root }
interface ConceptOut extends ConceptFrontmatter {
  sections: ConceptSectionOut[]; levels: LevelId[]; cites: number[]; has_math: boolean;
  used_by_terms: string[]; used_by_figures: string[]; used_by_concepts: string[];
}
const concepts: ConceptOut[] = [];
const conceptCites = new Set<number>();
for (const f of conceptFiles) {
  const src = fs.readFileSync(path.join(PACK, 'concepts', f), 'utf8');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) { E(`concepts/${f}`, 'no frontmatter'); continue; }
  let fm: unknown;
  try { fm = yaml.load(m[1], { schema: yaml.CORE_SCHEMA }); } catch (e) { E(`concepts/${f}`, `frontmatter YAML: ${(e as Error).message}`); continue; }
  const parsed = ConceptFrontmatterSchema.safeParse(fm);
  if (!parsed.success) { errors.push(...zodErrors(`concepts/${f}`, parsed.error)); continue; }
  const c = parsed.data;
  if (c.id !== f.replace(/\.md$/, '')) E(`concepts/${f}`, `id ${c.id} != filename`);
  const { preamble, sections } = splitConceptBody(m[2]);
  if (preamble) W(`concept ${c.id}: text before the first ## heading is rendered above the page sections`);
  const titles = sections.map((s) => s.title);
  if (!titles.includes('What it is')) W(`concept ${c.id}: missing section '## What it is'`);
  if (!titles.some((t) => t === 'How this volume uses it' || t === 'How this paper uses it')) W(`concept ${c.id}: missing section '## How this paper/volume uses it'`);
  const levels = LEVELS.filter((lv) => sections.some((s) => levelOf(s.title) === lv));
  if (manifest?.concept_levels) for (const lv of LEVELS) if (!levels.includes(lv)) E(`concepts/${c.id}`, `concept_levels is on but '## ${lv} …' is missing`);
  const cites = new Set<number>();
  const out: ConceptSectionOut[] = [];
  for (const s of [...(preamble ? [{ title: '', md: preamble }] : []), ...sections]) {
    const linked = linkConceptCitations(s.md);
    for (const n of linked.cites) { cites.add(n); conceptCites.add(n); }
    const { hast, katexErrors } = mdToHast(linked.text);
    for (const k of katexErrors) E(`concepts/${c.id}`, `maths does not typeset in "${s.title}": ${k}`);
    const level = levelOf(s.title);
    const kind: SectionKind = level ? 'level' : s.title === 'What it is' ? 'what' : /^How this (volume|paper) uses it$/.test(s.title) ? 'uses' : 'other';
    out.push({ title: s.title, kind, level, hast });
  }
  concepts.push({ ...c, sections: out, levels, cites: [...cites].sort((a, b) => a - b), has_math: /\$/.test(m[2]), used_by_terms: [], used_by_figures: [], used_by_concepts: [] });
}
const conceptIds = new Set(concepts.map((c) => c.id));
for (const c of concepts) {
  for (const p of c.prerequisites) if (!conceptIds.has(p)) E(`concepts/${c.id}`, `unknown prerequisite ${p}`);
  for (const t of c.terms) if (!termIds.has(t)) E(`concepts/${c.id}`, `unknown term ${t}`);
}
for (const t of glossary) if (t.concept && !conceptIds.has(t.concept)) E(`glossary/${t.id}`, `concept -> unknown ${t.concept}`);

// ───────────────────────── 4. figures + their data
const figuresParsed = FiguresSchema.safeParse(readYaml('figures.yaml') ?? []);
if (!figuresParsed.success) errors.push(...zodErrors('figures', figuresParsed.error));
const figures: FigureDef[] = figuresParsed.success ? figuresParsed.data : [];
const figureIds = new Set(figures.map((f) => f.id));
for (const [i, f] of figures.entries()) if (figures.findIndex((u) => u.id === f.id) !== i) E(`figures/${f.id}`, 'duplicate id');
for (const fm of figureMarkers) if (!figureIds.has(fm)) E('volumes', `figure marker ${fm} not in figures.yaml`);
for (const f of figures) if (!figureMarkers.includes(f.id)) W(`figure ${f.id} has no marker in any ready volume`);
const loaded = new Map<string, LoadedFigure>();
for (const f of figures) {
  const where = `figures/${f.id}`;
  if (TOPIC) {
    if (!f.synthesis) E(where, 'topic mode needs synthesis: data | conceptual');
    if (!f.refs.length) E(where, 'topic mode needs refs: [n, …] — a figure with no references does not ship');
    if (f.kind === 'image' && !/permission/i.test(manifest?.permissions.figures ?? '')) E(where, 'kind image in topic mode needs explicit permission in manifest.permissions.figures');
  }
  loaded.set(f.id, loadFigureData(f, PACK, termIds, errors, TOPIC));
  for (const ex of f.explain) {
    if (ex.term && !termIds.has(ex.term)) E(where, `explain term ${ex.term} unknown`);
    if (ex.concept && !conceptIds.has(ex.concept)) E(where, `explain concept ${ex.concept} unknown`);
  }
  for (const h of f.hotspots) if (h.term && !termIds.has(h.term)) E(where, `hotspot term ${h.term} unknown`);
  for (const c of f.concepts) if (!conceptIds.has(c)) E(where, `concept ${c} unknown`);
  for (const s of f.discussed_in) if (!sectionIds.has(s)) E(where, `discussed_in section ${s} unknown`);
  for (const n of f.refs) if (!refByN.has(n)) E(where, `refs -> [${n}] has no reference entry`);
}
for (const c of concepts) for (const fg of c.figures) if (!figureIds.has(fg)) E(`concepts/${c.id}`, `unknown figure ${fg}`);

// ───────────────────────── 5. citations → references
const cited = new Set<number>([...bodyCitations, ...conceptCites, ...figures.flatMap((f) => f.cites)]);
const unresolvedCitations = [...new Set([...cited, ...figures.flatMap((f) => f.refs)])].filter((n) => !refByN.has(n)).sort((a, b) => a - b);
for (const n of unresolvedCitations) E('volumes', `cites [${n}] with no reference entry`);
// APP-SPEC §6.1 rule 7 — no claim may rest on a verified: false reference.
const unverifiedButCited = references.filter((r) => !r.verified && cited.has(r.n)).map((r) => r.n);
for (const n of unverifiedButCited) E(`references/${n}`, 'cited but verified: false — no claim may rest on an unverified reference');
for (const r of references) for (const s of r.cited_in) if (!sectionIds.has(s) && !figureIds.has(s)) E(`references/${r.n}`, `cited_in ${s} unknown`);
const todoWhere = new Set(todo.map((t) => t.where));
for (const r of references) if (!r.verified && !todoWhere.has(`references/${r.n}`)) W(`references/${r.n} unverified but not in todo.yaml`);

// ───────────────────────── 6. claims.yaml
let claimsModel: ClaimsModel | null = null;
if (fs.existsSync(path.join(PACK, 'claims.yaml'))) {
  if (!TOPIC) E('claims.yaml', 'claims.yaml is only allowed in topic mode');
  const res = validateClaims(readYaml('claims.yaml'), {
    refs: new Map(references.map((r) => [r.n, { verified: r.verified }])),
    sections: sectionIds, termIds, readyVolumes: READY.map((v) => v.id),
  });
  errors.push(...res.errors);
  warnings.push(...res.warnings);
  claimsModel = res.model;
} else if (VOLUMES.length) E('claims.yaml', 'claims.yaml missing — required for volume packs (CONTENT-PACK v0.4)');
for (const r of references) {
  const inClaims = claimsModel?.claims.some((c) => c.refs.includes(r.n)) ?? false;
  if (!cited.has(r.n) && !inClaims) W(`reference ${r.n} never cited in text, captions or claims`);
}

// ───────────────────────── 7. the id ledger — nothing a previous build published may disappear (KICKOFF §4a)
const ledger = {
  sections: [...sectionIds].sort(),
  terms: [...termIds].sort(),
  concepts: [...conceptIds].sort(),
  figures: [...figureIds].sort(),
  claims: (claimsModel?.claims ?? []).map((c) => c.id),
  references: references.map((r) => r.n).sort((a, b) => a - b),
};
const ledgerPath = path.join(DATA, 'id-ledger.json');
if (fs.existsSync(ledgerPath) && !errors.length) {
  const prev = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) as Record<keyof typeof ledger, (string | number)[]>;
  for (const k of Object.keys(ledger) as (keyof typeof ledger)[]) {
    const now = new Set<string | number>(ledger[k]);
    const gone = (prev[k] ?? []).filter((id) => !now.has(id));
    if (gone.length) E('id-ledger', `${gone.length} ${k} id(s) published by the previous build are gone: ${gone.slice(0, 12).join(', ')}${gone.length > 12 ? ', …' : ''} — ids are never renamed or reused`);
  }
}

// ───────────────────────── 8. render: chunks → hast, subsection anchors, cross-links
const textOf = (n: Nodes): string => (n.type === 'text' ? n.value : 'children' in n ? (n.children as Nodes[]).map(textOf).join('') : '');
interface SectionOut {
  id: string; volume: string; title: string; depth: number; number: string | null;
  chunks: ({ kind: 'md'; hast: Root; marker: 'framing' | 'synthesis' | null; id: string | null } | { kind: 'figure'; id: string })[];
  subsections: { id: string; title: string }[];
  terms: string[]; cites: number[]; figures: string[]; words: number; blocks: number; cited_blocks: number; framing_blocks: number; synthesis_blocks: number; has_math: boolean;
}
const sectionsOut: SectionOut[] = allSections.map((s) => {
  const used = new Set<string>();
  const subsections: { id: string; title: string }[] = [];
  let hasMathAny = false;
  const chunks = s.chunks.map((c) => {
    if (c.kind === 'figure') return c;
    const { hast, katexErrors } = mdToHast(c.md);
    for (const k of katexErrors) E(`volumes/${s.volume}/${s.id}`, `maths does not typeset: ${k}`);
    if (c.hasMath) hasMathAny = true;
    for (const node of hast.children) {
      if (node.type === 'element' && /^h[3-6]$/.test(node.tagName)) {
        const title = textOf(node).trim();
        let id = `${s.id}--${slugify(title, 60)}`;
        for (let i = 2; used.has(id); i++) id = `${s.id}--${slugify(title, 60)}-${i}`;
        used.add(id);
        (node as Element).properties = { ...(node as Element).properties, id };
        if (node.tagName === 'h3') subsections.push({ id, title });
      }
    }
    return { kind: 'md' as const, hast, marker: c.marker, id: c.id };
  });
  return {
    id: s.id, volume: s.volume, title: s.title, depth: s.depth, number: s.number, chunks, subsections,
    terms: s.terms, cites: s.cites, figures: s.figures, words: s.words, blocks: s.blocks, cited_blocks: s.cited_blocks,
    framing_blocks: s.framing_blocks, synthesis_blocks: s.synthesis_blocks, has_math: hasMathAny,
  };
});

const appearsIn = new Map<string, string[]>();
for (const s of allSections) for (const t of s.terms) { if (!appearsIn.has(t)) appearsIn.set(t, []); appearsIn.get(t)!.push(s.id); }
const termFigures = new Map<string, Set<string>>();
const addTF = (t: string | null | undefined, fid: string) => { if (!t) return; if (!termFigures.has(t)) termFigures.set(t, new Set()); termFigures.get(t)!.add(fid); };
for (const f of figures) {
  for (const ex of f.explain) addTF(ex.term, f.id);
  for (const h of f.hotspots) addTF(h.term, f.id);
  for (const n of loaded.get(f.id)?.graph?.nodes ?? []) addTF(n.term, f.id);
}
const termConcepts = new Map<string, string[]>();
for (const c of concepts) for (const t of c.terms) { if (!termConcepts.has(t)) termConcepts.set(t, []); termConcepts.get(t)!.push(c.id); }
const termClaims = new Map<string, number>();
for (const c of claimsModel?.nodes ?? []) if (c.term) termClaims.set(c.term, (termClaims.get(c.term) ?? 0) + 1);
for (const c of concepts) {
  c.used_by_terms = glossary.filter((t) => t.concept === c.id).map((t) => t.id);
  c.used_by_figures = figures.filter((f) => f.concepts.includes(c.id) || f.explain.some((e) => e.concept === c.id)).map((f) => f.id);
  c.used_by_concepts = concepts.filter((o) => o.prerequisites.includes(c.id)).map((o) => o.id);
}
const refPlaces = new Map<number, string[]>();
const addPlace = (n: number, where: string) => { if (!refPlaces.has(n)) refPlaces.set(n, []); if (!refPlaces.get(n)!.includes(where)) refPlaces.get(n)!.push(where); };
for (const s of allSections) for (const n of s.cites) addPlace(n, s.id);
for (const f of figures) for (const n of [...f.cites, ...f.refs]) addPlace(n, f.id);
const refConcepts = new Map<number, string[]>();
for (const c of concepts) for (const n of c.cites) { if (!refConcepts.has(n)) refConcepts.set(n, []); refConcepts.get(n)!.push(c.id); }
const refClaims = new Map<number, string[]>();
for (const c of claimsModel?.claims ?? []) for (const n of c.refs) { if (!refClaims.has(n)) refClaims.set(n, []); refClaims.get(n)!.push(c.id); }

// ───────────────────────── 9. emit
const volumesOut = VOLUMES.map((v) => {
  const pv = parsedVolumes.find((x) => x.id === v.id);
  const vs = scope?.volumes?.[v.id];
  const secs = sectionsOut.filter((s) => s.volume === v.id);
  return {
    id: v.id, title: v.title, status: v.status, as_of: v.as_of ?? manifest?.as_of ?? null,
    depth: vs?.depth ?? null, outline_approved: vs?.outline_approved ?? null,
    sections: secs.length, words: secs.reduce((a, s) => a + s.words, 0),
    blocks: pv ? { ...pv.parsed.blocks, uncited: pv.parsed.uncited.length } : null,
    synthesis_passages: pv?.parsed.synthesis.length ?? 0,
    figures: [...new Set(secs.flatMap((s) => s.figures))],
    references_cited: [...new Set(secs.flatMap((s) => s.cites))].length,
    claims: claimsModel?.claims.filter((c) => c.volume === v.id).length ?? 0,
    has_math: secs.some((s) => s.has_math),
  };
});
const sectionMeta = (s: SectionOut) => ({
  id: s.id, volume: s.volume, title: s.title, depth: s.depth, number: s.number, words: s.words, figures: s.figures,
  subsections: s.subsections, blocks: s.blocks, synthesis_blocks: s.synthesis_blocks,
});
const synthesis = parsedVolumes.flatMap((pv) => pv.parsed.synthesis.map((x) => ({ ...x, volume: pv.id })));
const totalWords = sectionsOut.reduce((a, s) => a + s.words, 0);

if (manifest) emitData('manifest.json', { ...manifest, sections: sectionsOut.length, words: totalWords });
emitData('volumes.json', volumesOut);
emitData('sections.json', Object.fromEntries(READY.map((v) => [v.id, sectionsOut.filter((s) => s.volume === v.id).map(sectionMeta)])));
for (const v of READY) emitData(`volumes/${v.id}.json`, sectionsOut.filter((s) => s.volume === v.id), true);
emitData('glossary.json', glossary.map((t) => ({
  ...t, appears_in: appearsIn.get(t.id) ?? [], occurrences: occurrences[t.id] ?? 0, figures: [...(termFigures.get(t.id) ?? [])],
  concepts: termConcepts.get(t.id) ?? [], claim_nodes: termClaims.get(t.id) ?? 0,
})));
emitData('glossary-short.json', glossary.map((t) => ({ id: t.id, term: t.term, kind: t.kind, short: t.short, concept: t.concept ?? termConcepts.get(t.id)?.[0] ?? null })));
emitData('concepts-index.json', concepts.map((c) => ({ id: c.id, title: c.title, one_liner: c.one_liner, prerequisites: c.prerequisites, figures: c.figures, terms: c.terms, levels: c.levels })));
for (const c of concepts) emitData(`concepts/${c.id}.json`, c, true);

const figuresOut = figures.map((f) => {
  const d = loaded.get(f.id);
  return {
    ...f, table: d?.table, graph: d?.graph, chart: d?.chart,
    provenance: f.kind === 'image' ? 'original image' : f.synthesis === 'conceptual' ? 'synthesised: conceptual diagram' : 'synthesised from cited data',
  };
});
emitData('figures.json', figuresOut);
emitData('figures-index.json', figuresOut.map((f) => ({
  id: f.id, label: f.label, title: f.title, kind: f.kind, synthesis: f.synthesis ?? null, provenance: f.provenance, concepts: f.concepts,
  refs: f.refs, rows: f.table?.rows.length ?? null, fields: f.table?.fields.length ?? null, nodes: f.graph?.nodes.length ?? null,
  edges: f.graph?.edges.length ?? null, has_chart: !!f.chart, discussed_in: f.discussed_in,
})));
emitData('references.json', references.map((r) => {
  const places = refPlaces.get(r.n) ?? [];
  const sectionVolumes = places.filter((p) => sectionIds.has(p)).map((p) => allSections.find((s) => s.id === p)!.volume);
  const claimVolumes = (refClaims.get(r.n) ?? []).map((id) => claimsModel!.claims.find((c) => c.id === id)!.volume);
  return {
    ...r, cited_sections: places, cited_concepts: refConcepts.get(r.n) ?? [], claims: refClaims.get(r.n) ?? [],
    cited_volumes: [...new Set([...sectionVolumes, ...claimVolumes])].sort(),
  };
}));
emitData('todo.json', todo);
emitData('synthesis.json', synthesis);
if (scope) emitData('scope.json', scope);
if (claimsModel) emitData('claims.json', claimsModel);
// E1: the full atlas's canvas layout, computed once here so /graph runs no simulation for it (src/lib/graph-layout.ts).
if (claimsModel) emitData('graph-layout.json', computeLayout(claimsModel.nodes, claimsModel.claims), true);
emitData('search.json', [
  ...glossary.map((t) => ({ kind: 'term', id: t.id, title: t.term, subtitle: t.short, to: `/glossary#${t.id}`, hay: `${t.term} ${t.variants.join(' ')} ${t.short}`.toLowerCase() })),
  ...concepts.map((c) => ({ kind: 'concept', id: c.id, title: c.title, subtitle: c.one_liner, to: `/concepts/${c.id}`, hay: `${c.title} ${c.one_liner}`.toLowerCase() })),
  ...figures.map((f) => ({ kind: 'figure', id: f.id, title: `${f.label} · ${f.title}`, subtitle: f.kind, to: `/figures/${f.id}`, hay: `${f.label} ${f.title} ${f.kind}`.toLowerCase() })),
  ...sectionsOut.flatMap((s) => [
    { kind: 'section', id: s.id, title: s.title, subtitle: `Volume ${s.volume.slice(1)} · section · ${s.words.toLocaleString('en')} words`, to: `/read/${s.volume}#${s.id}`, hay: `${s.title} ${s.number ?? ''}`.toLowerCase() },
    ...s.subsections.map((x) => ({ kind: 'section', id: x.id, title: x.title, subtitle: `in ${s.title}`, to: `/read/${s.volume}#${x.id}`, hay: x.title.toLowerCase() })),
  ]),
]);

// graph exports — generated from claims.yaml only, deterministic
const graphFiles: { file: string; bytes: number }[] = [];
if (claimsModel) {
  const outputs: [string, string][] = [
    ['claims.cypher', toCypher(claimsModel)],
    ['nodes.csv', toNodesCsv(claimsModel)],
    ['edges.csv', toEdgesCsv(claimsModel.claims)],
    ['claims.graphml', toGraphml(claimsModel)],
    ['claims.json', toJson(claimsModel)],
  ];
  for (const [file, text] of outputs) { emit(path.join(PUBLIC, 'graph', file), text); graphFiles.push({ file: `graph/${file}`, bytes: Buffer.byteLength(text) }); }
}

// copy figure images → public/figures (this pack reproduces none, by design)
const imgDir = path.join(PACK, 'figures', 'images');
if (fs.existsSync(imgDir)) for (const f of fs.readdirSync(imgDir).sort()) emit(path.join(PUBLIC, 'figures', f), fs.readFileSync(path.join(imgDir, f)));

// ───────────────────────── provenance
// Two readings of "occurs": tools/validate_pack.py searches the whole body text (headings and maths included); the
// linker may not link inside headings, code, maths or links. Both are reported, so /methods can say which terms occur
// only where linking is not allowed, and the unmatched list agrees with the validator's.
const plainBodies = READY.map((v) => path.join(PACK, 'volumes', v.id, 'review.md')).filter((p) => fs.existsSync(p)).map((p) => fs.readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, ''));
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const occursAnywhere = (t: GlossaryEntry) => [t.term, ...t.variants].some((v) => plainBodies.some((b) => new RegExp(`(?<![\\w-])${escapeRe(v)}(?![\\w-])`, 'i').test(b)));
const occurring = glossary.filter(occursAnywhere);
const linkedTerms = glossary.filter((t) => (appearsIn.get(t.id) ?? []).length > 0);
const unmatched = glossary.filter((t) => !occursAnywhere(t)).map((t) => t.id);
const onlyInSkipZones = occurring.filter((t) => !(appearsIn.get(t.id) ?? []).length).map((t) => t.id);
const blocksAll = parsedVolumes.reduce((a, pv) => ({
  total: a.total + pv.parsed.blocks.total, cited: a.cited + pv.parsed.blocks.cited, framing: a.framing + pv.parsed.blocks.framing,
  synthesis: a.synthesis + pv.parsed.blocks.synthesis, uncited: a.uncited + pv.parsed.uncited.length,
}), { total: 0, cited: 0, framing: 0, synthesis: 0, uncited: 0 });
const queriesOf = (vid: string) => scope?.volumes?.[vid]?.search_strategy.queries ?? [];

/**
 * The pack hash names exactly which pack a build was made from, so a preview Daniel approves and the public deploy
 * can be matched byte for byte (H1). sha256 over every pack file in sorted path order, each as `path NUL bytes NUL`;
 * dotfiles and the build's own BUILD-ERRORS.md are left out, so the hash depends on the pack alone.
 */
function packHash(dir: string): string {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const abs = path.join(d, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.isFile()) files.push(path.relative(dir, abs).split(path.sep).join('/'));
    }
  };
  walk(dir);
  const h = crypto.createHash('sha256');
  for (const f of files.filter((f) => f !== 'BUILD-ERRORS.md').sort()) {
    h.update(f); h.update('\0'); h.update(fs.readFileSync(path.join(dir, f))); h.update('\0');
  }
  return h.digest('hex');
}

const provenance = {
  slug: manifest?.slug ?? null,
  pack_hash: packHash(PACK),
  mode: manifest?.mode ?? 'manuscript',
  as_of: manifest?.as_of ?? null,
  builder: manifest?.builder ?? null,
  volumes: volumesOut.map((v) => ({ id: v.id, title: v.title, status: v.status, as_of: v.as_of, sections: v.sections, words: v.words, blocks: v.blocks, synthesis_passages: v.synthesis_passages, claims: v.claims })),
  sections: sectionsOut.length,
  words: totalWords,
  blocks: blocksAll,
  synthesis_passages: synthesis.length,
  terms: {
    total: glossary.length,
    occurring: occurring.length,
    linked: linkedTerms.length,
    linked_pct_of_occurring: occurring.length ? Math.round((linkedTerms.length / occurring.length) * 1000) / 10 : 0,
    unmatched,
    only_in_skip_zones: onlyInSkipZones,
    link_every_occurrence: everyOccurrence,
    variants: matcher.variants,
    ambiguous_variants: ambiguous,
  },
  references: {
    total: references.length,
    by_tier: count(references, (r) => r.tier),
    anchors: references.filter((r) => r.anchor).map((r) => r.n),
    with_summary: references.filter((r) => r.summary.trim()).length,
    without_summary: references.filter((r) => !r.summary.trim()).map((r) => r.n),
    verified: references.filter((r) => r.verified).length,
    unverified: references.filter((r) => !r.verified).map((r) => r.n),
    unverified_but_cited: unverifiedButCited,
    cited_in_text: bodyCitations.size,
    cited_anywhere: references.filter((r) => cited.has(r.n) || (refClaims.get(r.n) ?? []).length > 0).length,
    unresolved_citations: unresolvedCitations,
  },
  figures: { total: figures.length, by_kind: count(figures, (f) => f.kind), by_synthesis: count(figures, (f) => f.synthesis), original_image: figures.filter((f) => f.kind === 'image').length },
  concepts: concepts.length,
  concept_levels: manifest?.concept_levels ?? false,
  claims: claimsModel ? {
    total: claimsModel.claims.length,
    by_status: count(claimsModel.claims, (c) => c.status),
    null_results: claimsModel.claims.filter(isNullResult).map((c) => c.id),
    species_not_stated: claimsModel.claims.filter((c) => c.species === null).length,
    nodes: claimsModel.nodes.length,
    hypothesis_groups: claimsModel.hypotheses.length,
    rivals: claimsModel.hypotheses.reduce((a, h) => a + h.rivals.length, 0),
    exports: graphFiles,
  } : null,
  scope: scope ? {
    volumes: Object.fromEntries(READY.map((v) => [v.id, { queries: queriesOf(v.id).length, hits: queriesOf(v.id).reduce((a, q) => a + q.hits, 0), kept: queriesOf(v.id).reduce((a, q) => a + (q.kept ?? 0), 0) }])),
  } : null,
  todo: { count: todo.length },
  build_errors: errors.length,
  warnings: warnings.length,
};
emit(path.join(PUBLIC, 'provenance.json'), JSON.stringify(provenance, null, 1) + '\n');
emitData('provenance.json', provenance);
emitData('warnings.json', warnings);
if (!errors.length) emitData('id-ledger.json', ledger);

// ───────────────────────── errors: BUILD-ERRORS.md + build-errors.json
const errFile = path.join(PACK, 'BUILD-ERRORS.md');
if (errors.length) {
  fs.writeFileSync(errFile, [
    '# BUILD-ERRORS', '',
    `\`scripts/build-content.ts\` found ${errors.length} error(s). The pack was not modified; fix these and re-run \`npm run build:content\`.`,
    'Uncited prose is never repaired by adding a citation — inventing provenance is worse than shipping the error (APP-SPEC §6.1).', '',
    ...errors.map((e) => `- **${e.where}** — ${e.message}`), '',
  ].join('\n'));
} else if (fs.existsSync(errFile)) fs.unlinkSync(errFile);
emitData('build-errors.json', errors);

// ───────────────────────── summary
console.log(`\ncontent build — ${manifest?.slug ?? '(no manifest)'} · mode ${manifest?.mode ?? '?'} · as of ${manifest?.as_of ?? '?'} · pack ${path.relative(ROOT, PACK)}`);
console.table([
  { item: 'pack hash', value: provenance.pack_hash.slice(0, 12) },
  { item: 'volumes (ready / planned)', value: `${READY.length} / ${VOLUMES.length - READY.length}` },
  { item: 'sections · words', value: `${sectionsOut.length} · ${totalWords}` },
  { item: 'blocks (cited/framing/synthesis)', value: `${blocksAll.total} (${blocksAll.cited}/${blocksAll.framing}/${blocksAll.synthesis})` },
  { item: 'uncited blocks', value: blocksAll.uncited },
  { item: 'glossary terms', value: glossary.length },
  { item: '  occurring / linked', value: `${occurring.length} / ${linkedTerms.length} (${provenance.terms.linked_pct_of_occurring}%)` },
  { item: '  unmatched', value: `${unmatched.length} ${unmatched.join(', ')}` },
  { item: 'concepts (levels)', value: `${concepts.length} (${manifest?.concept_levels ? 'L1–L4' : 'none'})` },
  { item: 'figures', value: `${figures.length} (${Object.entries(provenance.figures.by_kind).map(([k, v]) => `${k} ${v}`).join(', ')})` },
  { item: 'references', value: `${references.length} (${Object.entries(provenance.references.by_tier).map(([k, v]) => `${k} ${v}`).join(', ')})` },
  { item: 'claims', value: claimsModel ? `${claimsModel.claims.length} (${Object.entries(provenance.claims!.by_status).map(([k, v]) => `${k} ${v}`).join(', ')}), ${provenance.claims!.null_results.length} null results` : '—' },
  { item: 'graph nodes · groups · rivals', value: claimsModel ? `${claimsModel.nodes.length} · ${provenance.claims!.hypothesis_groups} · ${provenance.claims!.rivals}` : '—' },
  { item: 'todo items', value: todo.length },
  { item: 'warnings', value: warnings.length },
  { item: 'errors', value: errors.length },
]);
const changed = written.filter((w) => w.status === 'written');
console.log(`${written.length} outputs, ${changed.length} rewritten${changed.length ? ':' : ''}`);
for (const w of changed) console.log(`  ${w.file} (${Math.round(w.bytes / 102.4) / 10} kB)`);
if (process.env.VERBOSE_WARNINGS && warnings.length) console.log('warnings:\n' + warnings.map((w) => '  WARN ' + w).join('\n'));
else if (warnings.length) console.log(`${warnings.length} warnings (VERBOSE_WARNINGS=1 to list; also in ${path.relative(ROOT, DATA)}/warnings.json)`);
if (errors.length) {
  console.error(`\n${errors.length} error(s) — written to ${path.relative(ROOT, errFile)}:`);
  for (const e of errors) console.error(`  ERROR ${e.where}: ${e.message}`);
  process.exit(1);
}
console.log('\n0 errors.');
