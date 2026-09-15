/**
 * Notepad state: a Markdown document persisted per slug. Pure reducer so it is unit-testable.
 * Notes are keyed by `manifest.slug` only — never by volume or section list — and anchored quotes link by the
 * volume-prefixed section id, so a note written in V0 survives a rebuild that adds V1 (APP-SPEC §1.2).
 */
export interface NotepadState { text: string; updated: number | null }
export type NotepadAction =
  | { type: 'set'; text: string }
  | { type: 'append'; text: string }
  | { type: 'import'; text: string; mode: 'replace' | 'append' }
  | { type: 'clear' };

export const initialNotepad: NotepadState = { text: '', updated: null };

export function notepadReducer(state: NotepadState, action: NotepadAction, now = Date.now()): NotepadState {
  switch (action.type) {
    case 'set':
      return state.text === action.text ? state : { text: action.text, updated: now };
    case 'append': {
      const sep = state.text.length === 0 ? '' : state.text.endsWith('\n\n') ? '' : state.text.endsWith('\n') ? '\n' : '\n\n';
      return { text: state.text + sep + action.text, updated: now };
    }
    case 'import':
      if (action.mode === 'replace') return { text: action.text, updated: now };
      return notepadReducer(state, { type: 'append', text: action.text }, now);
    case 'clear':
      return { text: '', updated: now };
  }
}

export const storageKey = (slug: string) => `mi-notes:${slug}`;

export function loadNotepad(slug: string): NotepadState {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return initialNotepad;
    const parsed = JSON.parse(raw) as Partial<NotepadState>;
    return { text: typeof parsed.text === 'string' ? parsed.text : '', updated: typeof parsed.updated === 'number' ? parsed.updated : null };
  } catch { return initialNotepad; }
}

export function saveNotepad(slug: string, state: NotepadState) {
  try { localStorage.setItem(storageKey(slug), JSON.stringify(state)); } catch { /* quota / private mode */ }
}

/** A quote anchored to a reader section, as Markdown. The link carries the volume and the prefixed section id. */
export function anchoredQuote(quote: string, sectionTitle: string, sectionId: string, basePath = ''): string {
  const q = quote.trim().replace(/\s+/g, ' ');
  const volume = /^(v\d+)-/.exec(sectionId)?.[1];
  return `> ${q}\n> — [${sectionTitle}](${basePath}read/${volume ? `${volume}#` : '#'}${sectionId})\n\n`;
}

/** Export document: a Markdown file with a small header. */
export function exportMarkdown(state: NotepadState, title: string, slug: string): string {
  const stamp = state.updated ? new Date(state.updated).toISOString() : new Date().toISOString();
  return `# Notes — ${title}\n\n<!-- app: ${slug} · exported ${stamp} -->\n\n${state.text.trimEnd()}\n`;
}

export const exportFilename = (slug: string) => `${slug}-notes.md`;
