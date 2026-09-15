/**
 * The graph lab's data model: claims.yaml, as the build emits it to src/data/claims.json and public/graph/claims.json.
 * Shared by the content build (scripts/), the exports (./graph-export.ts), the analytics and the /graph route, so
 * there is exactly one definition of what a node and an edge are.
 *
 * Nothing here adds a node or an edge. A node is a distinct (type, label) pair that some claim names as its subject
 * or object; an edge is one claim. Two claims between the same two nodes stay two edges.
 */

export type ClaimStatus = 'supported' | 'contested' | 'inferred';

/** `finding` is the literal string 'null-result' or absent. It is never coerced to a boolean. */
export type Finding = 'null-result';

export interface AtlasNode {
  id: string;
  label: string;
  type: string;
  term: string | null;
  xref: string | null;
}

export interface AtlasClaim {
  id: string;
  source: string; // node id of the subject
  target: string; // node id of the object
  predicate: string;
  level: string;
  evidence: string;
  /** null = the pack does not state a species (86 claims today); [] never occurs. */
  species: string[] | null;
  parameters: Record<string, string>;
  status: ClaimStatus;
  hypothesis: string | null;       // rival id
  hypothesis_group: string | null; // the group that rival belongs to
  refs: number[];
  section: string;
  volume: string;
  synthesis: boolean;
  finding: Finding | null;
  finding_note: string | null;
}

export interface Rival { id: string; label: string; refs: number[] }
export interface HypothesisGroup { id: string; question: string; section: string | null; rivals: Rival[] }

export interface Vocabulary { node_types: string[]; predicates: string[]; levels: string[]; evidence: string[] }

export interface ClaimsModel {
  vocabulary: Vocabulary;
  hypotheses: HypothesisGroup[];
  nodes: AtlasNode[];
  claims: AtlasClaim[];
}

/** Literal comparison — the only way the app decides a claim is a null result. */
export const isNullResult = (c: Pick<AtlasClaim, 'finding'>): boolean => c.finding === 'null-result';

/** FNV-1a 32-bit, base36 — a stable, order-independent disambiguator for node ids. */
export function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, '0');
}

export function slugify(s: string, max = 48): string {
  const slug = s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, max).replace(/-+$/g, '') || 'node';
}

/**
 * Node id: readable slug of the label plus a hash of (type, label). Deterministic and independent of claim order,
 * so appending a volume's claims never renames an existing node.
 */
export const nodeId = (type: string, label: string): string => `${slugify(label)}-${fnv1a(`${type}|${label}`)}`;

export const volumeOfSection = (sectionId: string): string => /^(v\d+)-/.exec(sectionId)?.[1] ?? '';
