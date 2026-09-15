import { describe, expect, it } from 'vitest';
import { buildMatcher, expandCitation, findAmbiguousVariants, isAllCaps, linkCitations, linkTerms, segment, unlink } from '../../scripts/lib/linker';

const TERMS = [
  { id: 'agonist', term: 'Agonist', variants: ['agonists'] },
  { id: 'partial-agonist', term: 'Partial agonist', variants: ['partial agonists'] },
  { id: 'lsd', term: 'LSD', variants: ['lysergic acid diethylamide'] },
  { id: 'doi-compound', term: 'DOI', variants: [] },
  { id: 'five-ht2a', term: '5-HT2A', variants: ['5-HT2A receptor', '5-HT2A receptors'] },
  { id: 'head-twitch-response', term: 'Head-twitch response', variants: ['HTR'] },
];
const m = buildMatcher(TERMS);

describe('term matcher', () => {
  it('links whole words, case-insensitively, first occurrence per section only', () => {
    const r = linkTerms('An agonist and another Agonist; agonists too.', m);
    expect(r.text).toBe('An [agonist](#term:agonist) and another Agonist; agonists too.');
    expect(r.linked).toEqual(['agonist']);
    expect(r.occurrences.agonist).toBe(3);
  });
  it('links every occurrence when asked', () => {
    expect(linkTerms('LSD and LSD.', m, { everyOccurrence: true }).text).toBe('[LSD](#term:lsd) and [LSD](#term:lsd).');
  });
  it('respects word boundaries — no match inside a word or across a hyphen', () => {
    expect(linkTerms('LSD-25 and LSDs and BLSD.', m).text).toBe('LSD-25 and LSDs and BLSD.');
    expect(linkTerms('The LSD.', m).text).toBe('The [LSD](#term:lsd).');
  });
  it('longest match wins, and the shorter term is not linked inside the longer one', () => {
    const r = linkTerms('A partial agonist is an agonist.', m);
    expect(r.text).toBe('A [partial agonist](#term:partial-agonist) is an [agonist](#term:agonist).');
  });
  it('matches multi-token receptor notation', () => {
    expect(linkTerms('Acting at the 5-HT2A receptor here.', m).text).toBe('Acting at the [5-HT2A receptor](#term:five-ht2a) here.');
  });
  it('skips headings, code, maths, links and HTML comments', () => {
    const md = '# LSD heading\n\nText LSD here. `LSD` code. $LSD$ maths. [LSD link](http://x) <!-- LSD --> and\n\n```\nLSD\n```\n';
    const r = linkTerms(md, m);
    expect(r.text).toContain('# LSD heading');
    expect(r.text).toContain('Text [LSD](#term:lsd) here.');
    expect(r.text).toContain('`LSD` code. $LSD$ maths. [LSD link](http://x) <!-- LSD -->');
    expect(r.text).toContain('```\nLSD\n```');
    expect(r.linked).toEqual(['lsd']);
  });
  it('all-caps variants are case-sensitive, so "doi" the identifier is not linked as DOI the compound', () => {
    expect(isAllCaps('DOI')).toBe(true);
    expect(isAllCaps('Agonist')).toBe(false);
    const r = linkTerms('See doi:10.1000/x for DOI, a substituted amphetamine.', m);
    expect(r.text).toBe('See doi:10.1000/x for [DOI](#term:doi-compound), a substituted amphetamine.');
  });
  it('matches notation across <sup> and keeps the link well-formed', () => {
    const sup = buildMatcher([{ id: 'x', term: 'HTR 50', variants: [] }]);
    expect(linkTerms('The HTR<sup>50</sup> value.', sup).text).toBe('The [HTR<sup>50</sup>](#term:x) value.');
  });
  it('a term that lists both a mixed-case and an all-caps spelling matches either', () => {
    // Piezo1 / PIEZO1: letting the all-caps variant win made "Piezo1" in running text unmatchable.
    const both = buildMatcher([{ id: 'piezo1', term: 'Piezo1', variants: ['PIEZO1'] }]);
    expect(linkTerms('The Piezo1 channel.', both).text).toBe('The [Piezo1](#term:piezo1) channel.');
    expect(linkTerms('The PIEZO1 gene.', both).text).toBe('The [PIEZO1](#term:piezo1) gene.');
    // a term spelled only in capitals stays case-sensitive
    const caps = buildMatcher([{ id: 'tus', term: 'TUS', variants: [] }]);
    expect(linkTerms('Applying TUS to the thalamus, not tus.', caps).text).toBe('Applying [TUS](#term:tus) to the thalamus, not tus.');
  });
  it('reports ambiguous variants across terms', () => {
    expect(findAmbiguousVariants(TERMS)).toEqual([]);
    expect(findAmbiguousVariants([...TERMS, { id: 'other', term: 'Other', variants: ['lsd'] }]))
      .toEqual([{ variant: 'lsd', ids: ['lsd', 'other'] }]);
  });
  it('segment keeps sup/sub inside text but skips other tags', () => {
    expect(segment('a<sup>b</sup> <em>c</em>').filter((s) => s.skip).map((s) => s.text)).toEqual(['<em>', '</em>']);
  });
});

describe('citations', () => {
  it('expands lists and ranges', () => {
    expect(expandCitation('1')).toEqual([1]);
    expect(expandCitation('91,81,95')).toEqual([91, 81, 95]);
    expect(expandCitation('3–5')).toEqual([3, 4, 5]);
    expect(expandCitation('15–17,80')).toEqual([15, 16, 17, 80]);
  });
  it('links tokens outside skip zones and leaves bracketed chemistry alone', () => {
    const r = linkCitations('Claim [1,2] and [3–5]. Not `[9]`. The radioligand [3H]ketanserin is not a citation.');
    expect(r.text).toBe('Claim [1,2](#cite:1,2) and [3–5](#cite:3,4,5). Not `[9]`. The radioligand [3H]ketanserin is not a citation.');
    expect(r.cites).toEqual([1, 2, 3, 4, 5]);
  });
  it('unlink restores the original text', () => {
    const src = 'LSD is an agonist at the 5-HT2A receptor [1,2].';
    expect(unlink(linkCitations(linkTerms(src, m).text).text)).toBe(src);
  });
});
