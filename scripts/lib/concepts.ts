/**
 * Concept pages (101s). A levelled pack (manifest.concept_levels) carries `## L1 — Intuition` … `## L4 — Expert`
 * beside `## What it is` and `## How this volume uses it`; the body is split on its `## ` headings so the app can
 * offer the L1–L4 switch without rewriting a word. Citations `[n]` become fold-out tokens; a bracketed interval that
 * contains 0 (e.g. [0,1]) is prose, not a citation, exactly as tools/validate_pack.py reads it.
 */
import { CITE_RE, expandCitation, segment } from './linker';

export const LEVELS = ['L1', 'L2', 'L3', 'L4'] as const;
export type LevelId = (typeof LEVELS)[number];

export interface BodySection { title: string; md: string }

export function splitConceptBody(body: string): { preamble: string; sections: BodySection[] } {
  const parts = body.split(/^## +/m);
  const preamble = parts.shift()?.trim() ?? '';
  const sections = parts.map((p) => {
    const nl = p.indexOf('\n');
    return { title: (nl < 0 ? p : p.slice(0, nl)).trim(), md: (nl < 0 ? '' : p.slice(nl + 1)).trim() };
  });
  return { preamble, sections };
}

export const levelOf = (title: string): LevelId | null => {
  const m = /^(L[1-4])\b/.exec(title);
  return m ? (m[1] as LevelId) : null;
};

/** `[n]` → `[n](#cite:n)` outside skip zones; returns the numbers linked. Intervals containing 0 are left alone. */
export function linkConceptCitations(md: string): { text: string; cites: number[] } {
  const cites: number[] = [];
  const text = segment(md).map((seg) => {
    if (seg.skip) return seg.text;
    return seg.text.replace(CITE_RE, (all, inner: string) => {
      const ns = expandCitation(inner);
      if (ns.includes(0)) return all;
      cites.push(...ns);
      return `[${inner}](#cite:${ns.join(',')})`;
    });
  }).join('');
  return { text, cites };
}
