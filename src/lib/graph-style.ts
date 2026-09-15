/**
 * Presentation for the graph lab. Node type is carried by colour AND by a glyph and the type name in every card,
 * legend row and table cell, so nothing is encoded by colour alone. Status is never a colour: contested edges are
 * dashed, inferred edges carry the synthesis marker, and null results carry the ∅ mark and the words "null result".
 */
export const TYPE_STYLE: Record<string, { colour: string; glyph: string }> = {
  ExogenousDrive: { colour: '#2a5aa6', glyph: '▶' },
  StimulationProtocol: { colour: '#4b6b7a', glyph: '≡' },
  CouplingMechanism: { colour: '#7b2c5e', glyph: '⇄' },
  AnatomicalStructure: { colour: '#7a4a1f', glyph: '⬟' },
  NeuronPopulation: { colour: '#b8860b', glyph: '✳' },
  CellType: { colour: '#2f7a3e', glyph: '●' },
  SubcellularComponent: { colour: '#1f7a63', glyph: '◐' },
  Molecule: { colour: '#a83246', glyph: '◆' },
  GeneProduct: { colour: '#8a3b8f', glyph: '⬢' },
  Pathway: { colour: '#3f6f2a', glyph: '↝' },
  Circuit: { colour: '#2d6f8e', glyph: '⌘' },
  PhysiologicalSystem: { colour: '#6b5b95', glyph: '⬡' },
  Outcome: { colour: '#1f1b16', glyph: '★' },
  Confound: { colour: '#9a6a00', glyph: '⚠' },
  Measurement: { colour: '#5d5750', glyph: '▮' },
};

export const styleForType = (type: string) => TYPE_STYLE[type] ?? { colour: '#5d5750', glyph: '◇' };

export const STATUS_NOTE: Record<string, string> = {
  supported: 'supported — the cited work reports it',
  contested: 'contested — rival positions are named in a hypothesis group',
  inferred: 'inferred — the review’s own synthesis, not stated by any one cited work',
};

/** A CURIE such as UBERON:0000955 → a resolver link; unknown prefixes are shown as plain text. */
export function curieUrl(xref: string): string | null {
  const m = /^([A-Za-z][A-Za-z0-9_.-]*):(\S+)$/.exec(xref);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const known = ['UBERON', 'CL', 'GO', 'CHEBI', 'PR', 'NCBITAXON', 'ECO', 'ILX', 'NIFSTD', 'NPO', 'MESH', 'DOID', 'HP', 'SO', 'PATO', 'EFO', 'RXCUI', 'ATC', 'SNOMEDCT'];
  return known.includes(prefix) ? `https://identifiers.org/${m[1]}:${m[2]}` : null;
}
