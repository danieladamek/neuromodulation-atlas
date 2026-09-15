import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getConcept, getFigure, getTerm, readerHref, sectionTitle } from '@/lib/data';
import { loadGlossary, useAsync } from '@/lib/heavy';
import KindChip from './KindChip';

interface DrawerCtx { openTerm: (id: string) => void; close: () => void }
const Ctx = createContext<DrawerCtx>({ openTerm: () => {}, close: () => {} });
export const useTermDrawer = () => useContext(Ctx);

/** Slide-over (CompoundDrawer pattern) for glossary entries opened from figures and the graph, so they stay visible. */
export function TermDrawerProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const openTerm = useCallback((t: string) => { openerRef.current = document.activeElement as HTMLElement; setId(t); }, []);
  const close = useCallback(() => { setId(null); openerRef.current?.focus?.(); }, []);
  const value = useMemo(() => ({ openTerm, close }), [openTerm, close]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {id && <TermDrawer id={id} onClose={close} />}
    </Ctx.Provider>
  );
}

function TermDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const full = useAsync(loadGlossary);
  const t = full?.find((x) => x.id === id);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, t, onClose]);
  const concept = t ? getConcept(t.concept ?? t.concepts[0]) : undefined;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="flex-1 bg-black/30" aria-label="Close glossary panel" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-labelledby="term-drawer-title" className="h-full w-full max-w-md overflow-y-auto bg-paper dark:bg-night p-5 shadow-2xl" data-testid="term-drawer">
        <div className="flex items-start justify-between gap-3">
          <h2 id="term-drawer-title" className="text-2xl">{t?.term ?? getTerm(id)?.term ?? id}</h2>
          <button ref={closeRef} type="button" className="bx-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {!t ? <p className="mt-4 bx-muted" role="status">{full ? `Term ${id} not found` : 'Loading…'}</p> : (
          <>
            <p className="mt-2"><KindChip kind={t.kind} /></p>
            <p className="mt-3 font-semibold">{t.short}</p>
            <p className="bx-prose mt-2">{t.definition}</p>
            {concept && <p className="mt-3 text-sm"><Link className="underline" to={`/concepts/${concept.id}`} onClick={onClose}>Learn the concept → {concept.title}</Link></p>}
            {t.see.length > 0 && <p className="mt-3 text-sm">See also: {t.see.map((s) => <Link key={s} className="underline mr-2" to={`/glossary#${s}`} onClick={onClose}>{getTerm(s)?.term ?? s}</Link>)}</p>}
            {t.appears_in.length > 0 && <p className="mt-3 text-sm bx-muted">Appears in: {t.appears_in.map((s) => <Link key={s} className="underline mr-2" to={readerHref(s)} onClick={onClose}>{sectionTitle(s)}</Link>)}</p>}
            {t.figures.length > 0 && <p className="mt-2 text-sm bx-muted">In figures: {t.figures.map((f) => <Link key={f} className="underline mr-2" to={`/figures/${f}`} onClick={onClose}>{getFigure(f)?.label ?? f}</Link>)}</p>}
            <div className="mt-4"><Link to={`/glossary#${t.id}`} className="bx-btn-primary" onClick={onClose}>Open in glossary</Link></div>
          </>
        )}
      </aside>
    </div>
  );
}
