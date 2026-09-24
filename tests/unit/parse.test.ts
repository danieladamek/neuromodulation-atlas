import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { buildMatcher, unlink } from '../../scripts/lib/linker';
import { claimWords, hasMath, headingOf, parseReview, splitBlocks, splitSections } from '../../scripts/lib/parse';
import { splitConceptBody, levelOf, linkConceptCitations } from '../../scripts/lib/concepts';

const PACK = path.resolve(__dirname, '../../content-pack');
const glossary = yaml.load(fs.readFileSync(path.join(PACK, 'glossary.yaml'), 'utf8'), { schema: yaml.CORE_SCHEMA }) as { id: string; term: string; variants: string[] }[];

const FIXTURE = `<!-- section: v0-abstract -->
# Abstract

<!-- framing -->
This opening block carries no claim of fact, so the citation gate lets it through unmarked by a reference, exactly as a section opener in the real review does.

The field is measured in volts per metre and the threshold is reported in the same unit [1]. A second sentence with \`code\` and a [link](https://example.org) that the linker must skip entirely [2].

<!-- section: v0-2-mechanism -->
## 2. Mechanism

### 2.1 A subsection

Applying the drive raises the measured quantity, and the effect is blocked in the cited experiment [1,2].

<!-- figure: fig1 -->

<!-- synthesis -->
Taken together, these two results suggest the pathway is necessary rather than merely sufficient, which neither cited work states on its own [1,2].
`;

describe('section and block parser', () => {
  const matcher = buildMatcher([{ id: 'drive', term: 'drive', variants: ['drives'] }, { id: 'threshold', term: 'threshold', variants: [] }]);
  const parsed = parseReview(FIXTURE, matcher);

  it('splits sections with ids, titles and depths', () => {
    expect(splitSections(FIXTURE).map((s) => s.id)).toEqual(['v0-abstract', 'v0-2-mechanism']);
    expect(parsed.sections.map((s) => [s.id, s.title, s.depth, s.number])).toEqual([['v0-abstract', 'Abstract', 1, null], ['v0-2-mechanism', '2. Mechanism', 2, '2']]);
    expect(headingOf('\n### 3.2.1. Signalling\nbody').number).toBe('3.2.1');
  });
  it('resolves figure markers into slots and citations into tokens', () => {
    const mech = parsed.sections[1];
    expect(mech.chunks.map((c) => c.kind)).toEqual(['md', 'md', 'figure', 'md']);
    expect(mech.figures).toEqual(['fig1']);
    expect(parsed.figureMarkers).toEqual(['fig1']);
    expect(parsed.citations).toEqual([1, 2]);
  });
  it('marks framing and synthesis blocks, and gives every synthesis block a stable id', () => {
    expect(parsed.sections[0].chunks[0]).toMatchObject({ kind: 'md', marker: 'framing', id: null });
    expect(parsed.sections[1].chunks.at(-1)).toMatchObject({ kind: 'md', marker: 'synthesis', id: 'syn-v0-2-mechanism-1' });
    expect(parsed.synthesis).toHaveLength(1);
    expect(parsed.blocks).toEqual({ total: 4, cited: 3, framing: 1, synthesis: 1 });
  });
  it('counts the words the citation gate counts — prose only, no headings or tables', () => {
    expect(claimWords('A short aside.')).toBe(2);
    expect(claimWords('comments are stripped <!-- like this one --> before counting')).toBe(5);
    expect(parsed.sections[0].words).toBeGreaterThan(30);
  });
  it('a long block with no citation and no framing marker is reported as uncited', () => {
    const p = parseReview(FIXTURE.replace('<!-- framing -->\n', ''), matcher);
    expect(p.uncited).toHaveLength(1);
    expect(p.uncited[0]).toMatchObject({ section: 'v0-abstract' });
    expect(p.uncited[0].excerpt).toMatch(/This opening block carries no claim of fact/);
  });
  it('splits blocks at blank lines and keeps fenced code together', () => {
    expect(splitBlocks('a\n\nb\n\n```\nx\n\ny\n```\n')).toEqual(['a', 'b', '```\nx\n\ny\n```']);
  });
  it('detects maths only when a $…$ pair is present, so a lone dollar amount is prose', () => {
    expect(hasMath('more than $100 million allocated')).toBe(false);
    expect(hasMath('the ratio $K_D$ here')).toBe(true);
    expect(hasMath('$$S(t) = P(T > t)$$')).toBe(true);
  });
});

describe('the real volume', () => {
  const md = fs.readFileSync(path.join(PACK, 'volumes/v0/review.md'), 'utf8');
  const parsed = parseReview(md, buildMatcher(glossary));

  it('parses 16 sections, every id prefixed with its volume, no duplicates', () => {
    expect(parsed.sections).toHaveLength(16);
    expect(parsed.duplicateSections).toEqual([]);
    for (const s of parsed.sections) expect(s.id.startsWith('v0-')).toBe(true);
  });
  it('holds the citation gate at zero uncited blocks, with the counts tools/validate_pack.py reports', () => {
    expect(parsed.uncited).toEqual([]);
    expect(parsed.blocks).toEqual({ total: 413, cited: 362, framing: 25, synthesis: 101 });
    expect(parsed.sections.reduce((a, s) => a + s.words, 0)).toBe(30352);
  });
  it('gives all 101 synthesis passages an id that deep-links into the reader', () => {
    expect(parsed.synthesis).toHaveLength(101);
    expect(new Set(parsed.synthesis.map((s) => s.id)).size).toBe(101);
    for (const s of parsed.synthesis) {
      expect(s.id).toMatch(/^syn-v\d+-[a-z0-9-]+-\d+$/);
      expect(parsed.sections.some((sec) => sec.id === s.section)).toBe(true);
    }
  });
  it('renders the builder’s prose as written — stripping the links returns the original text', () => {
    // everything but each section's own title heading: subsection headings stay in the body, and carry the anchors
    const raw = splitSections(md).map((s) => headingOf(s.body).rest).join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
    const rebuilt = parsed.sections
      .flatMap((s) => s.chunks.filter((c) => c.kind === 'md').map((c) => (c as { md: string }).md))
      .map(unlink).join(' ').replace(/\s+/g, ' ').trim();
    expect(rebuilt).toBe(raw);
  });
  it('every figure marker names a figure in the pack', () => {
    const figures = yaml.load(fs.readFileSync(path.join(PACK, 'figures.yaml'), 'utf8'), { schema: yaml.CORE_SCHEMA }) as { id: string }[];
    const ids = new Set(figures.map((f) => f.id));
    expect(parsed.figureMarkers).toHaveLength(9);
    for (const id of parsed.figureMarkers) expect(ids.has(id)).toBe(true);
  });
});

describe('levelled 101s', () => {
  it('splits a concept body on its ## headings and recognises the levels', () => {
    const body = fs.readFileSync(path.join(PACK, 'concepts/receptor-theory-occupancy.md'), 'utf8').split('---').slice(2).join('---');
    const { preamble, sections } = splitConceptBody(body);
    expect(preamble).toBe('');
    expect(sections.map((s) => s.title)).toEqual(['What it is', 'L1 — Intuition', 'L2 — Undergraduate', 'L3 — Graduate', 'L4 — Expert', 'How this volume uses it']);
    expect(sections.map((s) => levelOf(s.title))).toEqual([null, 'L1', 'L2', 'L3', 'L4', null]);
    expect(sections[1].md).toMatch(/^Think of a receptor population/);
  });
  it('links citations in a 101 but leaves a bracketed interval alone', () => {
    expect(linkConceptCitations('the binding curve [26,27] holds').text).toBe('the binding curve [26,27](#cite:26,27) holds');
    expect(linkConceptCitations('on the interval [0,1] the value').text).toBe('on the interval [0,1] the value');
    expect(linkConceptCitations('in $\\rho \\in [0,1]$ maths').cites).toEqual([]);
  });
});
