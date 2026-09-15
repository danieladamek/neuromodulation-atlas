import type { Root } from 'hast';

export type { AtlasClaim, AtlasNode, ClaimsModel, ClaimStatus, HypothesisGroup, Rival, Vocabulary } from '@/lib/claims-model';

export type BlockMarker = 'framing' | 'synthesis' | null;

export type Chunk =
  | { kind: 'md'; hast: Root; marker: BlockMarker; id: string | null }
  | { kind: 'figure'; id: string };

export interface Subsection { id: string; title: string }

export interface Section {
  id: string; volume: string; title: string; depth: number; number: string | null;
  chunks: Chunk[]; subsections: Subsection[]; terms: string[]; cites: number[]; figures: string[]; words: number;
  blocks: number; cited_blocks: number; framing_blocks: number; synthesis_blocks: number; has_math: boolean;
}

export interface SectionMeta {
  id: string; volume: string; title: string; depth: number; number: string | null; words: number; figures: string[];
  subsections: Subsection[]; blocks: number; synthesis_blocks: number;
}

export interface BlockCounts { total: number; cited: number; framing: number; synthesis: number; uncited: number }

export interface VolumeMeta {
  id: string; title: string; status: 'ready' | 'planned'; as_of: string | null; depth: string | null; outline_approved: string | null;
  sections: number; words: number; blocks: BlockCounts | null; synthesis_passages: number; figures: string[];
  references_cited: number; claims: number; has_math: boolean;
}

export interface GlossaryEntry {
  id: string; term: string; kind: 'science' | 'methods' | 'statistics' | 'notation' | 'drug';
  variants: string[]; short: string; definition: string; concept?: string; see: string[]; sources: string[];
  appears_in: string[]; occurrences: number; figures: string[]; concepts: string[]; claim_nodes: number;
}

export interface SelfCheck { q: string; options: string[]; answer: number; explanation: string }
export type LevelId = 'L1' | 'L2' | 'L3' | 'L4';
export interface ConceptSection { title: string; kind: 'what' | 'level' | 'uses' | 'other'; level: LevelId | null; hast: Root }
export interface Concept {
  id: string; title: string; one_liner: string; why_here: string; prerequisites: string[]; terms: string[]; figures: string[];
  further_reading: { title: string; url: string; kind?: string }[]; self_check: SelfCheck[];
  sections: ConceptSection[]; levels: LevelId[]; cites: number[]; has_math: boolean;
  used_by_terms: string[]; used_by_figures: string[]; used_by_concepts: string[];
}

export type Row = Record<string, string | number | null>;
export interface GraphNode { id: string; label: string; term?: string | null; x?: number; y?: number; [k: string]: unknown }
export interface GraphEdge { from: string; to: string; label?: string; via?: string; [k: string]: unknown }
export interface FigureGraph { layout: 'layered' | 'fixed'; nodes: GraphNode[]; edges: GraphEdge[] }
export interface Explain { on: string; text: string; term?: string; concept?: string }
export interface ChartAxis { field: string; label: string; unit?: string; scale: 'linear' | 'log' }
export interface NormalChart {
  type: string; orientation: 'horizontal' | 'vertical'; x: ChartAxis; y: ChartAxis;
  y_high?: string; group_by?: string; facet_by?: string; series?: string;
}
export interface Figure {
  id: string; label: string; title: string; kind: 'chart' | 'table' | 'network' | 'pathway' | 'image';
  synthesis?: 'data' | 'conceptual'; refs: number[];
  columns?: { field: string; label?: string }[];
  caption: string; how_to_read: string; explain: Explain[]; concepts: string[]; discussed_in: string[]; cites: number[]; source: string;
  table?: { rows: Row[]; fields: string[] }; graph?: FigureGraph; chart?: NormalChart;
  provenance: string;
}

export interface Reference {
  n: number; tier?: 'seminal' | 'classic' | 'current' | 'background'; anchor: boolean; citation: string; year?: number;
  doi?: string; url?: string; summary: string; why_it_mattered: string; role_here: string; role_note: string;
  cited_in: string[]; verified: boolean; verified_how?: string; species: string[]; evidence_kind?: string; contested?: string | null;
  cited_sections: string[]; cited_concepts: string[]; claims: string[]; cited_volumes: string[];
}

export interface TodoItem { where: string; what: string }
export interface BuildError { where: string; message: string }
export interface SynthesisPassage { id: string; section: string; volume: string; excerpt: string; words: number }

/* ── scope.yaml, as /methods publishes it */

export interface SearchQuery { q: string; source?: string; hits: number; kept?: number; date?: string; lane?: string }
export interface SearchStrategy {
  run_on: string; sources: string[]; queries: SearchQuery[]; snowball: string[]; inclusion: string[]; exclusion: string[]; known_gaps: string[];
}
export type CorpusProfile = Record<string, unknown>;
export interface VolumeScope { depth: string; outline_approved: string | null; search_strategy: SearchStrategy; corpus_profile: CorpusProfile }
export interface ScopeJson {
  topic: string; question: string; purpose?: string; lineage?: string; graph_edges?: Record<string, string>;
  boundary: { in: string[]; out: string[]; rationale: string };
  level?: string; time_window: { current_from?: number; seminal?: string }; stance?: string; depth: string;
  anchors_note?: string; anchors: { citation: string; doi?: string; url?: string; why: string }[];
  excluded: { what: string; why: string }[]; assumed: boolean;
  interview: { q: string; answer: string; asked?: string }[] | Record<string, Record<string, string>>;
  volumes_plan?: { form: string; volumes: { id: string; title: string; depth?: string }[] };
  search_strategy?: SearchStrategy; corpus_profile?: CorpusProfile;
  volumes?: Record<string, VolumeScope>;
}

/* ── slim indexes */

export interface TermShort { id: string; term: string; kind: GlossaryEntry['kind']; short: string; concept: string | null }
export interface ConceptMeta { id: string; title: string; one_liner: string; prerequisites: string[]; figures: string[]; terms: string[]; levels: LevelId[] }
export interface FigureMeta {
  id: string; label: string; title: string; kind: Figure['kind']; synthesis: 'data' | 'conceptual' | null;
  provenance: string; concepts: string[]; refs: number[]; rows: number | null; fields: number | null; nodes: number | null; edges: number | null;
  has_chart: boolean; discussed_in: string[];
}
