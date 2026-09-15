import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { Section, SectionMeta, VolumeMeta } from '@/types';
import { asOfLong, getSection, getVolume, manifest, provenance, sectionOfAnchor, sectionsByVolume, volumes } from '@/lib/data';
import { loadKatexCss, loadVolume, useAsync } from '@/lib/heavy';
import { useNotepad } from '@/lib/notepad-context';
import { anchoredQuote } from '@/lib/notepad';
import Hast from '@/components/reader/Hast';
import Markdown from '@/components/reader/Markdown';
import SectionRail from '@/components/reader/SectionRail';
import ReaderFigure from '@/components/reader/ReaderFigure';
import TermPopoverHost from '@/components/reader/TermPopoverHost';
import NotepadPanel from '@/components/notepad/NotepadPanel';
import NotFound from './NotFound';

const HEADINGS = { 2: 'h2', 3: 'h3', 4: 'h4' } as const;
const BANNER_KEY = `bx-banner-dismissed:${manifest.slug}`;

function SectionHeading({ depth, number, title, id }: { depth: number; number: string | null; title: string; id: string }) {
  const Tag = HEADINGS[(Math.min(Math.max(depth, 2), 4)) as 2 | 3 | 4];
  const cls = depth <= 2 ? 'text-2xl sm:text-3xl mt-10' : depth === 3 ? 'text-xl sm:text-2xl mt-8' : 'text-lg sm:text-xl mt-6';
  return (
    <Tag id={`h-${id}`} className={`${cls} scroll-mt-24 group`}>
      {title}{' '}
      <a href={`#${id}`} className="bx-muted text-sm font-body no-underline opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label={`Link to section ${number ?? title}`}>#</a>
    </Tag>
  );
}

/** The commissioned-review banner (DESIGN-SYSTEM §3.1). Dismissal is per slug; the as_of chip never hides. */
function Banner({ vol }: { vol: VolumeMeta }) {
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem(BANNER_KEY) === '1'; } catch { return false; } });
  if (dismissed) return null;
  return (
    <div className="bx-banner no-print" data-testid="review-banner">
      <div className="flex items-start gap-3">
        <p className="flex-1">
          Written by the {manifest.builder.name} from {provenance.references.total} sources, current as of {asOfLong(vol.as_of ?? undefined)}.
          Every claim is cited; passages marked <em>synthesis</em> draw conclusions the cited works do not individually state.
          This is a commissioned review and is <strong>not peer reviewed</strong>.
        </p>
        <button type="button" className="bx-btn !py-0.5 !px-2 text-xs" onClick={() => { setDismissed(true); try { localStorage.setItem(BANNER_KEY, '1'); } catch { /* ignore */ } }} aria-label="Dismiss the commissioned-review notice">Dismiss</button>
      </div>
    </div>
  );
}

function SectionBody({ s }: { s: Section }) {
  return (
    <section id={s.id} data-section={s.id} className="bx-reader-section scroll-mt-20" aria-labelledby={`h-${s.id}`}>
      <SectionHeading depth={s.depth} number={s.number} title={s.title} id={s.id} />
      {s.chunks.map((c, i) => {
        if (c.kind === 'figure') return <ReaderFigure key={i} id={c.id} />;
        if (c.marker === 'synthesis' && c.id) {
          return (
            <div key={i} id={c.id} className="bx-synthesis scroll-mt-24" data-testid="synthesis-block">
              <span className="bx-synthesis-label">synthesis — a conclusion the cited works do not individually state</span>
              <Hast tree={c.hast} />
            </div>
          );
        }
        return <Fragment key={i}><Hast tree={c.hast} /></Fragment>;
      })}
    </section>
  );
}

function PlannedVolume({ vol }: { vol: VolumeMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">VOLUME {vol.id.slice(1)} · COMING</p>
      <h1 className="text-3xl sm:text-4xl mt-1">{vol.title}</h1>
      <p className="bx-prose mt-3">This volume is planned but not yet written. When it is ready it will be added to this app, with its own sweep date, search strategy and approved outline.</p>
      <p className="mt-4"><Link className="bx-btn" to="/read">All volumes</Link></p>
    </div>
  );
}

export default function ReadVolume() {
  const { volume = '' } = useParams();
  const vol = getVolume(volume);
  if (!vol) return <NotFound />;
  if (vol.status !== 'ready') return <PlannedVolume vol={vol} />;
  return <VolumeReader key={vol.id} vol={vol} />;
}

function VolumeReader({ vol }: { vol: VolumeMeta }) {
  const metas: SectionMeta[] = sectionsByVolume[vol.id] ?? [];
  const loc = useLocation();
  const notepad = useNotepad();
  const sections = useAsync(useCallback(() => loadVolume(vol.id), [vol.id]));
  const [count, setCount] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [printNotes, setPrintNotes] = useState(false);
  const [sel, setSel] = useState<{ x: number; y: number; text: string; section: string } | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const userScrolled = useRef(false);
  const total = sections?.length ?? 0;

  useEffect(() => { if (vol.has_math) loadKatexCss(); }, [vol.has_math]);

  // Sections mount progressively — everything up to a deep-linked target at once, then one section per task —
  // so ~30,000 words never become one long main-thread block.
  useEffect(() => {
    if (!sections) return;
    const target = loc.hash ? sectionOfAnchor(decodeURIComponent(loc.hash.slice(1))) : undefined;
    const idx = target ? sections.findIndex((s) => s.id === target.id) : -1;
    setCount((c) => Math.max(c, idx + 1, Math.min(2, sections.length)));
  }, [sections, loc.hash]);
  useEffect(() => {
    if (!sections || count === 0 || count >= sections.length) return;
    const h = window.setTimeout(() => setCount((c) => Math.min(sections.length, c + 1)), 30);
    return () => window.clearTimeout(h);
  }, [sections, count]);

  // A reader who starts scrolling owns the viewport: no deep-link alignment after that.
  useEffect(() => {
    const seen = () => { userScrolled.current = true; };
    for (const e of ['wheel', 'touchmove', 'keydown'] as const) window.addEventListener(e, seen, { passive: true });
    return () => { for (const e of ['wheel', 'touchmove', 'keydown'] as const) window.removeEventListener(e, seen); };
  }, []);

  useEffect(() => { userScrolled.current = false; }, [loc.key]);

  /*
   * Deep link: align on arrival, then keep re-aligning while the article is still settling. Sections mount
   * progressively and figures expand as they build, so a single scrollIntoView lands on a position that then moves
   * out from under the reader. A ResizeObserver on the article catches every one of those height changes; it stops
   * after 2.5 s, and the moment the reader scrolls the viewport is theirs.
   */
  useEffect(() => {
    if (!loc.hash || !sections) return;
    const id = decodeURIComponent(loc.hash.slice(1));
    const align = () => { if (!userScrolled.current) document.getElementById(id)?.scrollIntoView(); };
    align();
    const ro = new ResizeObserver(align);
    if (articleRef.current) ro.observe(articleRef.current);
    const stop = window.setTimeout(() => ro.disconnect(), 2500);
    return () => { ro.disconnect(); window.clearTimeout(stop); };
  }, [loc.hash, loc.key, count, sections]);

  // active section / subsection + progress
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>('section[data-section], h3[id]')];
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const top = visible[0]?.target as HTMLElement | undefined;
      if (!top) return;
      if (top.tagName === 'SECTION') { setActive(top.id); setActiveSub(null); }
      else { const s = sectionOfAnchor(top.id); if (s) setActive(s.id); setActiveSub(top.id); }
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    els.forEach((e) => io.observe(e));
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [count]);

  // text selection → "Add note"
  const onSelect = useCallback(() => {
    const s = window.getSelection();
    const text = s?.toString().trim();
    if (!s || !text || s.rangeCount === 0 || !articleRef.current) { setSel(null); return; }
    const range = s.getRangeAt(0);
    if (!articleRef.current.contains(range.commonAncestorContainer)) { setSel(null); return; }
    const node = range.commonAncestorContainer;
    const sec = (node instanceof Element ? node : node.parentElement)?.closest('section[data-section]');
    const rect = range.getBoundingClientRect();
    setSel({ x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + window.scrollY - 8, text, section: sec?.getAttribute('data-section') ?? metas[0].id });
  }, [metas]);
  const addNote = () => {
    if (!sel) return;
    const s = getSection(sel.section);
    notepad.dispatch({ type: 'append', text: anchoredQuote(sel.text, s?.title ?? sel.section, sel.section, import.meta.env.BASE_URL) });
    notepad.setOpen(true);
    setSel(null);
    window.getSelection()?.removeAllRanges();
  };

  const idx = volumes.findIndex((v) => v.id === vol.id);
  const prev = volumes[idx - 1];
  const next = volumes[idx + 1];

  return (
    <div className="relative">
      <div className="bx-progress fixed left-0 top-0 z-50 h-0.5 bg-[color:var(--bx-accent)]" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-8 xl:grid xl:gap-8" style={{ gridTemplateColumns: notepad.open ? '240px minmax(0,1fr) 360px' : '240px minmax(0,1fr)' }}>
        <aside className="hidden xl:block"><div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2"><SectionRail sections={metas} active={active} activeSub={activeSub} variant="rail" /></div></aside>
        <div className="min-w-0">
          <div className="xl:hidden mb-4"><SectionRail sections={metas} active={active} activeSub={activeSub} variant="select" /></div>
          <article ref={articleRef} className="bx-reader mx-auto" onMouseUp={onSelect} onKeyUp={(e) => { if (e.shiftKey) onSelect(); }} aria-label={`Volume ${vol.id.slice(1)}: ${vol.title}`}>
            <header>
              <p className="flex flex-wrap items-center gap-2 no-print">
                <span className="bx-chip border border-[color:var(--bx-line)] bx-muted">COMMISSIONED REVIEW — NOT PEER REVIEWED</span>
                <span className="bx-asof">Current as of {vol.as_of}</span>
              </p>
              <p className="mt-3 text-sm bx-muted"><Link className="underline" to="/read">{manifest.title}</Link></p>
              <h1 className="text-3xl sm:text-4xl leading-tight mt-1">Volume {vol.id.slice(1)} — {vol.title}</h1>
              <p className="mt-2 text-sm bx-muted no-print">
                {manifest.authors.join(', ')} · {vol.words.toLocaleString('en')} words · about {manifest.reading_minutes} minutes. Dotted terms open the glossary; bracketed numbers open the reference that supports the claim.
              </p>
            </header>
            {/* the placeholder is as tall as a screen so the footer never starts in view and then jumps down */}
            {!sections && <p className="mt-8 min-h-[80vh] bx-muted" role="status">Loading Volume {vol.id.slice(1)}…</p>}
            {sections?.slice(0, count).map((s, i) => (
              <Fragment key={s.id}>
                {i === 0 && <div className="mt-6"><Banner vol={vol} /></div>}
                <SectionBody s={s} />
              </Fragment>
            ))}
            {sections && count < total && <p className="mt-8 text-sm bx-muted" role="status">Setting the remaining {total - count} sections…</p>}
            {sections && count >= total && (
              <nav aria-label="Volumes" className="mt-12 border-t border-[color:var(--bx-line)] pt-4 text-sm no-print flex flex-wrap gap-3 justify-between">
                {prev ? <Link className="bx-btn" to={prev.status === 'ready' ? `/read/${prev.id}` : '/read'}>← Volume {prev.id.slice(1)}: {prev.title}</Link> : <span />}
                {next && (next.status === 'ready'
                  ? <Link className="bx-btn" to={`/read/${next.id}`}>Volume {next.id.slice(1)}: {next.title} →</Link>
                  : <Link className="bx-btn" to="/read">Next: Volume {next.id.slice(1)} — {next.title} (coming)</Link>)}
                <span className="w-full bx-muted">
                  End of Volume {vol.id.slice(1)}. <Link className="underline" to="/references">All {provenance.references.total} references →</Link> · <Link className="underline" to="/graph">The claims graph →</Link> · <Link className="underline" to="/methods">How this was built and what it does not cover →</Link>
                </span>
              </nav>
            )}
          </article>
          <TermPopoverHost container={articleRef} />
          {printNotes && notepad.state.text.trim() && (
            <section className="bx-print-notes bx-notes-preview mt-10" aria-label="Notes"><h2 className="text-2xl">Notes</h2><Markdown md={notepad.state.text} /></section>
          )}
        </div>
        {notepad.open && (
          <>
            <aside className="hidden xl:block bx-notepad-dock"><div className="sticky top-20 h-[calc(100vh-6rem)] bx-card p-3"><NotepadPanel printNotes={printNotes} setPrintNotes={setPrintNotes} /></div></aside>
            <div className="xl:hidden fixed inset-0 z-50 flex justify-end bx-notepad-dock" role="presentation">
              <button type="button" className="flex-1 bg-black/30" aria-label="Close notepad" onClick={() => notepad.setOpen(false)} />
              <div role="dialog" aria-modal="true" aria-label="Notepad" className="h-full w-full max-w-md bg-paper dark:bg-night p-4 shadow-2xl overflow-y-auto"><NotepadPanel onClose={() => notepad.setOpen(false)} printNotes={printNotes} setPrintNotes={setPrintNotes} /></div>
            </div>
          </>
        )}
      </div>
      {/* the visible word is the accessible name: an aria-label that omits it fails label-content-name-mismatch */}
      {!notepad.open && (
        <button type="button" className="bx-btn-primary fixed bottom-4 right-4 z-40 shadow-lg xl:hidden no-print" onClick={() => notepad.setOpen(true)} data-testid="notepad-fab"><span aria-hidden="true">✎</span> Notes</button>
      )}
      {sel && (
        <button type="button" className="bx-btn-primary absolute z-40 -translate-x-1/2 -translate-y-full shadow-lg no-print" style={{ left: sel.x, top: sel.y }} onMouseDown={(e) => e.preventDefault()} onClick={addNote} data-testid="add-note">Add note</button>
      )}
    </div>
  );
}
