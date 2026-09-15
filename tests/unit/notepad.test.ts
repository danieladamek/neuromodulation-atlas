import { describe, expect, it } from 'vitest';
import { anchoredQuote, exportFilename, exportMarkdown, initialNotepad, loadNotepad, notepadReducer, storageKey } from '../../src/lib/notepad';

describe('notepad reducer', () => {
  it('set replaces text and stamps time; unchanged text is a no-op', () => {
    const s1 = notepadReducer(initialNotepad, { type: 'set', text: 'hello' }, 100);
    expect(s1).toEqual({ text: 'hello', updated: 100 });
    expect(notepadReducer(s1, { type: 'set', text: 'hello' }, 200)).toBe(s1);
  });
  it('append separates blocks with a blank line', () => {
    expect(notepadReducer({ text: 'a', updated: 1 }, { type: 'append', text: 'b' }, 2).text).toBe('a\n\nb');
    expect(notepadReducer({ text: 'a\n', updated: 1 }, { type: 'append', text: 'b' }, 2).text).toBe('a\n\nb');
    expect(notepadReducer({ text: 'a\n\n', updated: 1 }, { type: 'append', text: 'b' }, 2).text).toBe('a\n\nb');
    expect(notepadReducer(initialNotepad, { type: 'append', text: 'b' }, 2).text).toBe('b');
  });
  it('import replaces or appends; clear empties', () => {
    expect(notepadReducer({ text: 'a', updated: 1 }, { type: 'import', text: 'z', mode: 'replace' }, 3).text).toBe('z');
    expect(notepadReducer({ text: 'a', updated: 1 }, { type: 'import', text: 'z', mode: 'append' }, 3).text).toBe('a\n\nz');
    expect(notepadReducer({ text: 'a', updated: 1 }, { type: 'clear' }, 4)).toEqual({ text: '', updated: 4 });
  });
});

describe('notes survive volumes being added', () => {
  it('the storage key depends on the slug alone — not on the volume list', () => {
    expect(storageKey('neuromodulation-atlas')).toBe('mi-notes:neuromodulation-atlas');
  });
  it('an anchored quote links by the volume-prefixed section id', () => {
    expect(anchoredQuote('  some   text ', '3. Dose', 'v0-3-dose', '/'))
      .toBe('> some text\n> — [3. Dose](/read/v0#v0-3-dose)\n\n');
    // a section id with no volume prefix (manuscript-mode packs) still produces a valid link
    expect(anchoredQuote('x', 'Abstract', 'abstract', '/')).toBe('> x\n> — [Abstract](/read/#abstract)\n\n');
  });
  it('reading notes back never throws, even when storage is unavailable', () => {
    expect(loadNotepad('no-such-slug')).toEqual(initialNotepad);
  });
  it('export is a Markdown document with a title and provenance comment', () => {
    const md = exportMarkdown({ text: '# mine\n\n- a', updated: 0 }, 'Neuromodulation', 'neuromodulation-atlas');
    expect(md.startsWith('# Notes — Neuromodulation\n\n<!-- app: neuromodulation-atlas · exported ')).toBe(true);
    expect(md.endsWith('# mine\n\n- a\n')).toBe(true);
    expect(exportFilename('neuromodulation-atlas')).toBe('neuromodulation-atlas-notes.md');
  });
});
