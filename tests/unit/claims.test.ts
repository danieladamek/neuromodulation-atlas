import { describe, expect, it } from 'vitest';
import { validateClaims } from '../../scripts/lib/claims';
import { nodeId } from '../../src/lib/claims-model';

const ctx = {
  refs: new Map([[1, { verified: true }], [2, { verified: true }], [3, { verified: false }]]),
  sections: new Set(['v0-1-a', 'v0-2-b']),
  termIds: new Set(['tacs']),
  readyVolumes: ['v0'],
};

const base = () => ({
  vocabulary: {
    node_types: ['ExogenousDrive', 'Outcome', 'Measurement'],
    predicates: ['modulates', 'required_for'],
    levels: ['cellular', 'clinical'],
    evidence: ['human-interventional', 'inferred'],
  },
  hypotheses: [{
    id: 'H-x',
    question: 'Does it?',
    section: 'v0-2-b',
    rivals: [{ id: 'H-x-p1', label: 'Yes', refs: [1] }, { id: 'H-x-p2', label: 'No', refs: [2] }],
  }],
  claims: [
    { id: 'C0001', subject: { label: 'A drive', type: 'ExogenousDrive', term: 'tacs' }, predicate: 'modulates', object: { label: 'An outcome', type: 'Outcome', xref: 'UBERON:0000955' }, level: 'cellular', evidence: 'human-interventional', species: ['human'], parameters: { dose: '2 mA' }, status: 'supported', refs: [1], section: 'v0-1-a', synthesis: false },
    { id: 'C0002', subject: { label: 'A drive', type: 'ExogenousDrive' }, predicate: 'required_for', object: { label: 'Another outcome', type: 'Outcome' }, level: 'clinical', evidence: 'human-interventional', species: ['human'], status: 'contested', hypothesis: 'H-x-p1', refs: [2], section: 'v0-2-b', synthesis: false },
    { id: 'C0003', subject: { label: 'A drive', type: 'ExogenousDrive' }, predicate: 'modulates', object: { label: 'A measure', type: 'Measurement' }, level: 'clinical', evidence: 'human-interventional', species: ['human'], status: 'supported', refs: [1], section: 'v0-1-a', synthesis: false, finding: 'null-result', finding_note: 'the primary endpoint was not met' },
    { id: 'C0004', subject: { label: 'A drive', type: 'ExogenousDrive' }, predicate: 'modulates', object: { label: 'An outcome', type: 'Outcome' }, level: 'clinical', evidence: 'inferred', species: ['human'], status: 'inferred', refs: [1], section: 'v0-1-a', synthesis: true },
  ] as Record<string, unknown>[],
});

const messages = (raw: unknown) => validateClaims(raw, ctx).errors.map((e) => `${e.where}: ${e.message}`);

describe('claims.yaml validation', () => {
  it('accepts the fixture and builds one node per (type, label) pair', () => {
    const res = validateClaims(base(), ctx);
    expect(res.errors).toEqual([]);
    expect(res.model!.claims).toHaveLength(4);
    // "A drive" is named by four claims but is one node; the three objects are three more
    expect(res.model!.nodes).toHaveLength(4);
    const drive = res.model!.nodes.find((n) => n.label === 'A drive')!;
    expect(drive.term).toBe('tacs');                       // merged from the claim that states it
    expect(res.model!.claims[0].volume).toBe('v0');
    expect(res.model!.claims[2].finding).toBe('null-result');
    expect(res.model!.claims[1].hypothesis_group).toBe('H-x');
  });

  it('keeps species as null when the pack does not state it, and warns', () => {
    const c = base();
    delete c.claims[0].species;
    const res = validateClaims(c, ctx);
    expect(res.errors).toEqual([]);
    expect(res.model!.claims.find((x) => x.id === 'C0001')!.species).toBeNull();
    expect(res.warnings).toContain('claims/C0001: species not stated');
  });

  it('node ids are stable and independent of order or of the label alone', () => {
    expect(nodeId('ExogenousDrive', 'A drive')).toBe(nodeId('ExogenousDrive', 'A drive'));
    expect(nodeId('ExogenousDrive', 'A drive')).not.toBe(nodeId('Outcome', 'A drive'));
  });
});

describe('one deliberate error per rule', () => {
  it('a type, predicate, level or evidence outside the vocabulary', () => {
    const c = base(); (c.claims[0].subject as Record<string, unknown>).type = 'Sandwich';
    expect(messages(c)).toEqual(['claims/C0001: subject.type "Sandwich" not in vocabulary']);
    const d = base(); d.claims[0].predicate = 'flavours';
    expect(messages(d)).toEqual(['claims/C0001: predicate "flavours" not in vocabulary.predicates']);
    const e = base(); e.claims[0].level = 'spiritual';
    expect(messages(e)).toEqual(['claims/C0001: level "spiritual" not in vocabulary.levels']);
    const f = base(); f.claims[0].evidence = 'vibes';
    expect(messages(f)).toEqual(['claims/C0001: evidence "vibes" not in vocabulary.evidence']);
  });
  it('refs are required, must exist, and may not be unverified', () => {
    const a = base(); a.claims[0].refs = [];
    expect(messages(a)[0]).toMatch(/refs required/);
    const b = base(); b.claims[0].refs = [99];
    expect(messages(b)).toEqual(['claims/C0001: refs [99] has no reference entry']);
    const c = base(); c.claims[0].refs = [3];
    expect(messages(c)).toEqual(['claims/C0001: refs [3] is verified: false — no claim may rest on it']);
  });
  it('an unknown section, term or malformed xref', () => {
    const a = base(); a.claims[0].section = 'v9-nowhere';
    expect(messages(a)).toEqual(['claims/C0001: section "v9-nowhere" unknown']);
    const b = base(); (b.claims[0].subject as Record<string, unknown>).term = 'not-a-term';
    expect(messages(b)).toEqual(['claims/C0001: subject.term not-a-term unknown']);
    const c = base(); (c.claims[0].object as Record<string, unknown>).xref = 'not a curie';
    expect(messages(c)).toEqual(['claims/C0001: object.xref "not a curie" is not a CURIE']);
  });
  it('duplicate claim, hypothesis and rival ids', () => {
    const a = base(); a.claims.push({ ...a.claims[0] });
    expect(messages(a)).toEqual(['claims: duplicate id C0001']);
    const b = base(); b.hypotheses.push({ ...b.hypotheses[0] });
    expect(messages(b)).toEqual(expect.arrayContaining(['claims: duplicate hypothesis id H-x', 'claims: duplicate rival id H-x-p1']));
  });
  it('a contested claim needs an existing rival, and a group needs two rivals', () => {
    const a = base(); delete a.claims[1].hypothesis;
    expect(messages(a)).toEqual(['claims/C0002: contested claims need hypothesis = an existing rival id (got null)']);
    const b = base(); b.claims[1].hypothesis = 'H-x-p9';
    expect(messages(b)).toEqual(['claims/C0002: contested claims need hypothesis = an existing rival id (got "H-x-p9")']);
    const c = base(); c.hypotheses[0].rivals = [c.hypotheses[0].rivals[0]];
    expect(messages(c)[0]).toMatch(/needs ≥ 2 rivals/);
    const d = base(); d.hypotheses[0].question = '';
    expect(messages(d)[0]).toMatch(/needs a question/);
  });
  it('status inferred ⇔ synthesis: true or evidence: inferred', () => {
    const a = base(); a.claims[3].synthesis = false; a.claims[3].evidence = 'human-interventional';
    expect(messages(a)).toEqual(['claims/C0004: status inferred ⇔ synthesis: true or evidence: inferred']);
    const b = base(); b.claims[0].synthesis = true;
    expect(messages(b)).toEqual(['claims/C0001: status inferred ⇔ synthesis: true or evidence: inferred']);
  });
  it("finding must be the literal 'null-result', with a note", () => {
    const a = base(); a.claims[2].finding = null;
    expect(messages(a)[0]).toMatch(/finding must be the literal string 'null-result' when present/);
    const b = base(); b.claims[2].finding = true;
    expect(messages(b)[0]).toMatch(/finding must be the literal string 'null-result' when present/);
    const c = base(); delete c.claims[2].finding_note;
    expect(messages(c)).toEqual(["claims/C0003: finding 'null-result' needs a finding_note saying what was not found"]);
    const d = base(); delete d.claims[2].finding;
    expect(messages(d)).toEqual(["claims/C0003: finding_note without finding: 'null-result'"]);
  });
  it('an unknown key in a claim is a loud failure, not a silently dropped field', () => {
    const a = base(); a.claims[0].findng = 'null-result';
    expect(messages(a)[0]).toMatch(/Unrecognized key/);
  });
  it('an empty vocabulary list', () => {
    const a = base(); a.vocabulary.predicates = [];
    expect(messages(a)[0]).toMatch(/vocabulary.predicates missing or empty/);
  });
  it('a rival nobody uses is a warning, not an error', () => {
    const res = validateClaims(base(), ctx);
    expect(res.errors).toEqual([]);
    expect(res.warnings).toContain('claims: rival H-x-p2 is used by no claim');
  });
});
