import manifestJson from '@/data/manifest.json';
import provenanceJson from '@/data/provenance.json';
import termsJson from '@/data/glossary-short.json';
import conceptsIndexJson from '@/data/concepts-index.json';
import figuresIndexJson from '@/data/figures-index.json';
import sectionsJson from '@/data/sections.json';
import volumesJson from '@/data/volumes.json';
import type { ConceptMeta, FigureMeta, SectionMeta, TermShort, VolumeMeta } from '@/types';

/*
 * Only slim indexes are imported here (they ride in the first chunk). The full files — a volume's sections, the
 * glossary, each 101, figures, references, the scope and the claims — are imported by the routes that need them
 * (src/lib/heavy.ts), so /read does not pay for the graph and /graph does not pay for 30,000 words of review.
 */
export const manifest = manifestJson;
export const provenance = provenanceJson;
export const terms = termsJson as unknown as TermShort[];
export const conceptsIndex = conceptsIndexJson as unknown as ConceptMeta[];
export const figuresIndex = figuresIndexJson as unknown as FigureMeta[];
export const volumes = volumesJson as unknown as VolumeMeta[];
export const sectionsByVolume = sectionsJson as unknown as Record<string, SectionMeta[]>;
export const readyVolumes = volumes.filter((v) => v.status === 'ready');
export const allSections: SectionMeta[] = readyVolumes.flatMap((v) => sectionsByVolume[v.id] ?? []);

const termById = new Map(terms.map((t) => [t.id, t]));
const conceptById = new Map(conceptsIndex.map((c) => [c.id, c]));
const figureById = new Map(figuresIndex.map((f) => [f.id, f]));
const sectionById = new Map(allSections.map((s) => [s.id, s]));
const subsectionById = new Map(allSections.flatMap((s) => s.subsections.map((x) => [x.id, { ...x, section: s }] as const)));
const volumeById = new Map(volumes.map((v) => [v.id, v]));

export const getTerm = (id?: string | null) => (id ? termById.get(id) : undefined);
export const getConcept = (id?: string | null) => (id ? conceptById.get(id) : undefined);
export const getFigure = (id?: string | null) => (id ? figureById.get(id) : undefined);
export const getSection = (id?: string | null) => (id ? sectionById.get(id) : undefined);
export const getVolume = (id?: string | null) => (id ? volumeById.get(id) : undefined);

/**
 * The owning volume of any reader anchor: a section (`v0-3-dose`), a subsection (`v0-3-dose--3-2-…`) or a synthesis
 * passage (`syn-v0-3-dose-2`). Every id in a volume pack carries its volume prefix, so this never needs a lookup.
 */
export function volumeOfAnchor(id: string): string | null {
  const m = /^(?:syn-)?(v\d+)-/.exec(id);
  return m ? m[1] : null;
}

/** Link into the reader for any anchor; old `/read#id` links resolve through this. */
export function readerHref(id: string): string {
  const v = volumeOfAnchor(id);
  return v ? `/read/${v}#${id}` : '/read';
}

/** The section that contains an anchor (section, subsection or synthesis id). */
export function sectionOfAnchor(id: string): SectionMeta | undefined {
  if (sectionById.has(id)) return sectionById.get(id);
  if (subsectionById.has(id)) return subsectionById.get(id)!.section;
  const syn = /^syn-(.+)-\d+$/.exec(id);
  return syn ? sectionById.get(syn[1]) : undefined;
}

export const shortSectionTitle = (s: { title: string }) => s.title.replace(/^\d+(\.\d+)*\.?\s+/, '');
export const sectionTitle = (id: string) => getSection(id)?.title ?? subsectionById.get(id)?.title ?? getFigure(id)?.label ?? id;

export function assetUrl(rel: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  return base + rel.replace(/^\//, '');
}

export const doiUrl = (doi: string) => (/^https?:/.test(doi) ? doi : `https://doi.org/${doi}`);

/** Categorical palette: manifest.palette.groups (device, drug) first, then neutral hues. */
export const PALETTE: Record<string, string> = manifest.palette.groups;
export const CAT = [...Object.values(PALETTE), '#2f7a3e', '#7a4a1f', '#b8860b', '#4b6b7a'];

/** The sweep date, shown on /, /read and /about (APP-SPEC §6.1 rule 9). Per volume where a volume states one. */
export const AS_OF: string = manifest.as_of ?? '';
export const asOfLong = (date: string = AS_OF): string => {
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};
/** The most recent volume sweep date (what / shows). */
export const LATEST_AS_OF = readyVolumes.map((v) => v.as_of ?? AS_OF).sort().at(-1) ?? AS_OF;
