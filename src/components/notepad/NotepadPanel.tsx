import { useEffect, useRef, useState } from 'react';
import { useNotepad } from '@/lib/notepad-context';
import { exportFilename, exportMarkdown } from '@/lib/notepad';
import { manifest } from '@/lib/data';
import Markdown from '@/components/reader/Markdown';

const notesComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} className="underline">{children}</a>,
};

/** Markdown notepad: persists per slug in localStorage; export/import .md; preview. */
export default function NotepadPanel({ onClose, printNotes, setPrintNotes }: { onClose?: () => void; printNotes: boolean; setPrintNotes: (b: boolean) => void }) {
  const { state, dispatch } = useNotepad();
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!status) return; const t = setTimeout(() => setStatus(''), 2500); return () => clearTimeout(t); }, [status]);

  const download = () => {
    const blob = new Blob([exportMarkdown(state, manifest.title, manifest.slug)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = exportFilename(manifest.slug); a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Exported as Markdown.');
  };
  const onImport = async (file: File) => {
    const text = await file.text();
    const mode = state.text.trim() && !window.confirm('Replace your current notes? Cancel to append instead.') ? 'append' : 'replace';
    dispatch({ type: 'import', text, mode });
    setStatus(mode === 'replace' ? 'Notes replaced from file.' : 'Notes appended from file.');
  };
  const clear = () => { if (window.confirm('Delete all notes for this app?')) { dispatch({ type: 'clear' }); setStatus('Notes cleared.'); } };

  return (
    <section aria-label="Notepad" className="flex h-full flex-col" data-testid="notepad">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-lg">Notepad</h2>
        <span className="text-[11px] bx-muted">saved locally · {manifest.slug}</span>
        {onClose && <button type="button" className="bx-btn ml-auto !py-0.5" onClick={onClose} aria-label="Close notepad">×</button>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={`bx-btn !py-1 ${!preview ? 'bx-btn-on' : ''}`} aria-pressed={!preview} onClick={() => setPreview(false)}>Write</button>
        <button type="button" className={`bx-btn !py-1 ${preview ? 'bx-btn-on' : ''}`} aria-pressed={preview} onClick={() => setPreview(true)}>Preview</button>
        <button type="button" className="bx-btn !py-1" onClick={download} data-testid="notepad-export">Export .md</button>
        <button type="button" className="bx-btn !py-1" onClick={() => fileRef.current?.click()}>Import</button>
        <input ref={fileRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" className="sr-only" aria-label="Import a Markdown file" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }} />
        <button type="button" className="bx-btn !py-1" onClick={clear} disabled={!state.text}>Clear</button>
      </div>
      {preview ? (
        <div className="bx-notes-preview mt-2 flex-1 overflow-y-auto rounded-md border border-[color:var(--bx-line)] p-3 text-sm" data-testid="notepad-preview">
          {state.text.trim() ? <Markdown md={state.text} components={notesComponents} /> : <p className="bx-muted">Nothing yet. Select text in the reader and choose “Add note”, or write here.</p>}
        </div>
      ) : (
        <>
          <label htmlFor="notepad-text" className="sr-only">Your notes (Markdown)</label>
          <textarea id="notepad-text" className="bx-input mt-2 flex-1 min-h-[16rem] resize-y font-mono text-[13px] leading-5" value={state.text} onChange={(e) => dispatch({ type: 'set', text: e.target.value })} placeholder={'Markdown notes for this app…\n\nSelect text in the reader and press “Add note” to quote it with a link back to the section.'} spellCheck data-testid="notepad-textarea" />
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] bx-muted">
        <span>{state.text.length} chars{state.updated ? ` · saved ${new Date(state.updated).toLocaleTimeString()}` : ''}</span>
        <label className="inline-flex items-center gap-1"><input type="checkbox" checked={printNotes} onChange={(e) => setPrintNotes(e.target.checked)} /> append to print</label>
        <span role="status" aria-live="polite">{status}</span>
      </div>
    </section>
  );
}
