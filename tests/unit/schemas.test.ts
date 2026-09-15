import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import {
  ConceptFrontmatterSchema, FiguresSchema, GlossarySchema, ManifestSchema, ReferencesSchema, ScopeSchema, TodoSchema, zodErrors,
} from '../../scripts/lib/schemas';
import { loadFigureData, normaliseChart } from '../../scripts/lib/figures';
import { findAmbiguousVariants } from '../../scripts/lib/linker';

const PACK = path.resolve(__dirname, '../../content-pack');
const load = (f: string) => yaml.load(fs.readFileSync(path.join(PACK, f), 'utf8'), { schema: yaml.CORE_SCHEMA });
const conceptFm = (f: string) => yaml.load(fs.readFileSync(path.join(PACK, 'concepts', f), 'utf8').split('---')[1], { schema: yaml.CORE_SCHEMA });
const messages = (r: { success: boolean; error?: { issues: { message: string; path: (string | number)[] }[] } }) =>
  (r.success ? [] : zodErrors('x', r.error as never).map((e) => `${e.where}: ${e.message}`));
const clone = <T,>(x: T): T => structuredClone(x);

describe('the real pack passes every schema', () => {
  it('manifest, glossary, concepts, figures, references, scope and todo', () => {
    expect(messages(ManifestSchema.safeParse(load('manifest.yaml')))).toEqual([]);
    expect(messages(GlossarySchema.safeParse(load('glossary.yaml')))).toEqual([]);
    expect(messages(ConceptFrontmatterSchema.safeParse(conceptFm('receptor-theory-occupancy.md')))).toEqual([]);
    expect(messages(FiguresSchema.safeParse(load('figures.yaml')))).toEqual([]);
    expect(messages(ReferencesSchema.safeParse(load('references.yaml')))).toEqual([]);
    expect(messages(ScopeSchema.safeParse(load('scope.yaml')))).toEqual([]);
    expect(messages(TodoSchema.safeParse(load('todo.yaml')))).toEqual([]);
    expect(findAmbiguousVariants(load('glossary.yaml') as never)).toEqual([]);
  });
  it('every 101 carries all four levels, because the manifest turns concept_levels on', () => {
    const manifest = ManifestSchema.parse(load('manifest.yaml'));
    expect(manifest.concept_levels).toBe(true);
    for (const f of fs.readdirSync(path.join(PACK, 'concepts')).filter((x) => x.endsWith('.md'))) {
      const body = fs.readFileSync(path.join(PACK, 'concepts', f), 'utf8').split('---').slice(2).join('---');
      for (const lv of ['L1', 'L2', 'L3', 'L4']) expect(new RegExp(`^## ${lv}\\b`, 'm').test(body), `${f} ${lv}`).toBe(true);
    }
  });
});

describe('one deliberate error per rule', () => {
  it('manifest: permissions.text is required, and delivery pages needs a real one', () => {
    const m = clone(load('manifest.yaml')) as { permissions: { text: string } };
    m.permissions.text = '';
    // an empty one fails twice over: the field is required at all, and this pack ships to Pages
    expect(messages(ManifestSchema.safeParse(m))).toContain('x/permissions/text: permissions.text is REQUIRED — no pack ships without it');
    m.permissions.text = 'unknown';
    expect(messages(ManifestSchema.safeParse(m))).toEqual(["x/permissions/text: delivery 'pages' requires a real permissions.text — nothing public ships from text of unknown provenance"]);
  });
  it('manifest: topic mode requires question, purpose and as_of, and a venue that says it is not peer reviewed', () => {
    const m = clone(load('manifest.yaml')) as Record<string, unknown>;
    delete m.question;
    expect(messages(ManifestSchema.safeParse(m))).toEqual(['x/question: question is REQUIRED in topic mode']);
    m.question = 'back';
    m.venue = 'Journal of Real Science';
    expect(messages(ManifestSchema.safeParse(m))).toEqual(['x/venue: topic mode: venue must make the non-peer-reviewed status unmissable']);
  });
  it('manifest: volume ids, statuses and duplicates', () => {
    const m = clone(load('manifest.yaml')) as { volumes: { id: string; status: string; title: string }[]; mode: string };
    m.volumes[1].id = 'vee-one';
    expect(messages(ManifestSchema.safeParse(m))).toEqual(['x/volumes/1/id: volume id must be v0, v1, …']);
    const n = clone(load('manifest.yaml')) as { volumes: { id: string; status: string }[] };
    n.volumes[1].id = 'v0';
    expect(messages(ManifestSchema.safeParse(n))).toEqual(['x/volumes: duplicate volume ids v0']);
    const o = clone(load('manifest.yaml')) as { volumes: { status: string }[] };
    for (const v of o.volumes) v.status = 'planned';
    expect(messages(ManifestSchema.safeParse(o))).toEqual(['x/volumes: volumes declared but none is ready']);
    const p = clone(load('manifest.yaml')) as Record<string, unknown>;
    p.mode = 'manuscript'; p.doi = '10.1000/x';
    expect(messages(ManifestSchema.safeParse(p))).toEqual(['x/volumes: volumes are only allowed in topic mode']);
  });
  it('glossary: short > 200 chars, an unknown kind, a variant claimed by two terms', () => {
    const g = clone(load('glossary.yaml')) as Record<string, unknown>[];
    g[0].short = 'x'.repeat(201);
    expect(messages(GlossarySchema.safeParse(g))).toEqual(['x/0/short: short > 200 chars']);
    g[0].short = 'ok'; g[1].kind = 'magic';
    expect(messages(GlossarySchema.safeParse(g))[0]).toMatch(/^x\/1\/kind: Invalid enum value/);
    expect(findAmbiguousVariants([{ id: 'a', term: 'Alpha', variants: ['tACS'] }, { id: 'b', term: 'Beta', variants: ['tacs'] }]))
      .toEqual([{ variant: 'tacs', ids: ['a', 'b'] }]);
  });
  it('concept: needs ≥1 self_check, ≥2 further_reading, an answer in range', () => {
    const c = clone(conceptFm('receptor-theory-occupancy.md')) as { self_check: { answer: number }[]; further_reading: unknown[] };
    c.self_check[0].answer = 9;
    expect(messages(ConceptFrontmatterSchema.safeParse(c))).toEqual(['x/self_check/0: self_check answer index out of range']);
    c.self_check = [];
    expect(messages(ConceptFrontmatterSchema.safeParse(c))).toEqual(['x/self_check: needs ≥1 self_check']);
    c.self_check = [{ answer: 0, ...{ q: 'q', options: ['a', 'b'], explanation: '' } } as never];
    c.further_reading = c.further_reading.slice(0, 1);
    expect(messages(ConceptFrontmatterSchema.safeParse(c))).toEqual(['x/further_reading: needs ≥2 further_reading']);
  });
  it('figures: an unknown kind or chart type, a missing source or how_to_read', () => {
    const f = clone(load('figures.yaml')) as Record<string, unknown>[];
    f[0].kind = 'movie';
    expect(messages(FiguresSchema.safeParse(f))[0]).toMatch(/^x\/0\/kind: Invalid enum value/);
    f[0].kind = 'chart'; f[0].chart = { type: 'pie' };
    expect(messages(FiguresSchema.safeParse(f))[0]).toMatch(/^x\/0\/chart\/type: Invalid enum value/);
    delete f[0].chart; delete f[0].source; delete f[0].how_to_read;
    expect(messages(FiguresSchema.safeParse(f))).toEqual(['x/0/how_to_read: Required', 'x/0/source: Required']);
  });
  it('references: doi or url required; a verified entry needs a summary', () => {
    const r = clone(load('references.yaml')) as Record<string, unknown>[];
    delete r[0].doi;
    expect(messages(ReferencesSchema.safeParse(r))).toEqual(['x/0: doi or url required']);
    r[0].doi = '10.1000/x'; r[1].summary = '';
    expect(messages(ReferencesSchema.safeParse(r))).toEqual(['x/1: no summary (a missing summary is allowed only with verified: false)']);
  });
  it('scope: the boundary must say what is out, the depth is an enum, and a ready volume needs its own strategy', () => {
    const s = clone(load('scope.yaml')) as { boundary: { out: string[] }; depth: string; volumes: Record<string, unknown> };
    s.boundary.out = [];
    expect(messages(ScopeSchema.safeParse(s))).toEqual(['x/boundary/out: boundary.out is empty — the scope must say what was deliberately left out']);
    s.boundary.out = ['x']; s.depth = 'exhaustive';
    expect(messages(ScopeSchema.safeParse(s))[0]).toMatch(/^x\/depth: Invalid enum value/);
    const t = clone(load('scope.yaml')) as { volumes: Record<string, { search_strategy?: unknown }> };
    delete t.volumes.v0.search_strategy;
    expect(messages(ScopeSchema.safeParse(t))).toEqual(['x/volumes/v0/search_strategy: Required']);
    const u = clone(load('scope.yaml')) as { volumes?: unknown; depth: string };
    delete u.volumes;
    expect(messages(ScopeSchema.safeParse(u))).toEqual(expect.arrayContaining(['x/depth: depth textbook is only allowed for volume packs']));
  });
  it('a query with no hit count is rejected — the log is the deliverable', () => {
    const s = clone(load('scope.yaml')) as { volumes: Record<string, { search_strategy: { queries: Record<string, unknown>[] } }> };
    delete s.volumes.v0.search_strategy.queries[0].hits;
    expect(messages(ScopeSchema.safeParse(s))[0]).toMatch(/hits: Required/);
  });
});

describe('figure data: declared fields must exist, and a synthesised data figure must be traceable', () => {
  const figs = FiguresSchema.parse(load('figures.yaml'));
  const terms = new Set((load('glossary.yaml') as { id: string }[]).map((t) => t.id));
  const fig3 = figs.find((f) => f.id === 'fig3')!;

  it('the real figures load cleanly', () => {
    for (const f of figs) {
      const errors: { where: string; message: string }[] = [];
      loadFigureData(f, PACK, terms, errors, true);
      expect(errors, f.id).toEqual([]);
    }
  });
  it('a missing data file is an error', () => {
    const errors: { where: string; message: string }[] = [];
    loadFigureData({ ...fig3, data: 'figures/data/nope.csv' }, PACK, terms, errors, true);
    expect(errors.map((e) => e.message)).toContain('data file missing figures/data/nope.csv');
  });
  it('a declared column or chart field that is not in the csv is an error', () => {
    let errors: { where: string; message: string }[] = [];
    loadFigureData({ ...fig3, columns: [{ field: 'nope' }] }, PACK, terms, errors, true);
    expect(errors.map((e) => e.message)).toContain('column field nope not in csv');
    errors = [];
    loadFigureData({ ...fig3, chart: { ...fig3.chart!, x: 'missing' } }, PACK, terms, errors, true);
    expect(errors.map((e) => e.message)).toContain('chart field missing not in figures/data/fig3-field-strengths.csv');
  });
  it('in topic mode a synthesis: data csv must carry a ref column so every row is traceable', () => {
    const errors: { where: string; message: string }[] = [];
    const noRef = path.join(PACK, 'figures/data/tmp-noref.csv');
    fs.writeFileSync(noRef, 'entry,value_low,value_high\nA,1,2\n');
    try {
      loadFigureData({ ...fig3, data: 'figures/data/tmp-noref.csv', columns: [], chart: undefined }, PACK, terms, errors, true);
      expect(errors.map((e) => e.message)).toEqual(["synthesis: data csv needs a 'ref' column so every row is traceable (cols: entry, value_low, value_high)"]);
    } finally { fs.unlinkSync(noRef); }
  });
  it('a graph figure with an unknown endpoint or term is an error', () => {
    const fig4 = figs.find((f) => f.id === 'fig4')!;
    const errors: { where: string; message: string }[] = [];
    loadFigureData(fig4, PACK, new Set(), errors, true);
    expect(errors.some((e) => /node term .* unknown/.test(e.message))).toBe(true);
  });
  it('normalises both spellings of a chart spec into one shape', () => {
    const c = normaliseChart(fig3)!;
    expect(c).toMatchObject({ type: 'bar', orientation: 'horizontal', y_high: 'value_high', group_by: 'provenance' });
    expect(c.x.field).toBe('entry');
    expect(c.y).toMatchObject({ field: 'value_low', unit: 'V/m', scale: 'log' });
    const fig8 = figs.find((f) => f.id === 'fig8')!;
    expect(normaliseChart(fig8)).toMatchObject({ facet_by: 'dimension', x: { field: 'category' }, y: { field: 'count', scale: 'linear' } });
  });
});
