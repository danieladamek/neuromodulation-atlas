import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Concept as ConceptT, ConceptSection, LevelId } from '@/types';
import { conceptsIndex, getConcept, getFigure, getTerm, manifest } from '@/lib/data';
import { loadConcept, loadKatexCss, useAsync } from '@/lib/heavy';
import Hast from '@/components/reader/Hast';
import Quiz from '@/components/concepts/Quiz';
import NotFound from './NotFound';

const LEVELS: LevelId[] = ['L1', 'L2', 'L3', 'L4'];
const LEVEL_KEY = `mi-concept-level:${manifest.slug}`;
const isLevel = (v: unknown): v is LevelId => typeof v === 'string' && (LEVELS as string[]).includes(v);

/**
 * The L1–L4 choice (APP-SPEC §1.2): default L1, persisted per reader in localStorage, and shareable as ?level=L3.
 * A level in the URL wins for that view; choosing a level stores it for every 101.
 */
function useLevel(): [LevelId, (l: LevelId) => void] {
  const [params, setParams] = useSearchParams();
  const [stored, setStored] = useState<LevelId>(() => { try { const v = localStorage.getItem(LEVEL_KEY); return isLevel(v) ? v : 'L1'; } catch { return 'L1'; } });
  const fromUrl = params.get('level');
  const level = isLevel(fromUrl) ? fromUrl : stored;
  const set = (l: LevelId) => {
    setStored(l);
    try { localStorage.setItem(LEVEL_KEY, l); } catch { /* private mode */ }
    const next = new URLSearchParams(params);
    next.set('level', l);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  return [level, set];
}

function LevelSwitch({ sections, level, onChange }: { sections: ConceptSection[]; level: LevelId; onChange: (l: LevelId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelOf = (l: LevelId) => sections.find((s) => s.level === l)?.title.replace(/^L[1-4]\s*[—–-]\s*/, '') ?? l;
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const j = (i + dir + LEVELS.length) % LEVELS.length;
    onChange(LEVELS[j]);
    refs.current[j]?.focus();
  };
  return (
    <div className="mt-8 no-print">
      <p id="level-label" className="text-[11px] font-semibold tracking-[0.15em] bx-muted">READ THIS 101 AT LEVEL</p>
      <div role="tablist" aria-labelledby="level-label" className="mt-1 inline-flex flex-wrap gap-1 rounded-lg border border-[color:var(--bx-line)] p-1" data-testid="level-switch">
        {LEVELS.map((l, i) => (
          <button
            key={l} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" id={`level-tab-${l}`} aria-selected={level === l} aria-controls="level-panel"
            tabIndex={level === l ? 0 : -1} onClick={() => onChange(l)} onKeyDown={(e) => onKey(e, i)}
            className={`rounded-md px-3 py-1.5 text-sm ${level === l ? 'bx-btn-on font-semibold' : 'hover:bg-paper-2 dark:hover:bg-night-2'}`}
          >
            <span className="font-mono text-xs mr-1">{l}</span>{labelOf(l)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Concept() {
  const { id = '' } = useParams();
  const meta = getConcept(id);
  const c = useAsync(useCallback(() => loadConcept(id), [id]));
  const [level, setLevel] = useLevel();
  useEffect(() => { if (c?.has_math) loadKatexCss(); }, [c]);
  if (!meta) return <NotFound />;
  const idx = conceptsIndex.findIndex((x) => x.id === meta.id);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
      <article className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.2em] bx-muted">101 · {idx + 1} OF {conceptsIndex.length}</p>
        <h1 className="text-3xl sm:text-4xl mt-1 leading-tight">{meta.title}</h1>
        <p className="bx-prose mt-3 text-[16px]">{meta.one_liner}</p>
        {!c ? <p className="mt-6 bx-muted" role="status">Loading…</p> : <ConceptBody c={c} level={level} setLevel={setLevel} />}
        <p className="mt-8 flex flex-wrap gap-2 text-sm">
          {idx > 0 && <Link className="bx-btn" to={`/concepts/${conceptsIndex[idx - 1].id}`}>← {conceptsIndex[idx - 1].title}</Link>}
          {idx < conceptsIndex.length - 1 && <Link className="bx-btn" to={`/concepts/${conceptsIndex[idx + 1].id}`}>{conceptsIndex[idx + 1].title} →</Link>}
          <Link className="bx-btn ml-auto" to="/concepts">All 101s</Link>
        </p>
      </article>
      <aside className="mt-8 lg:mt-0 text-sm">
        <div className="lg:sticky lg:top-20 grid gap-5">
          {meta.prerequisites.length > 0 && <div><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">READ FIRST</p><ul className="mt-1 grid gap-1">{meta.prerequisites.map((p) => <li key={p}><Link className="underline" to={`/concepts/${p}`}>{getConcept(p)?.title ?? p}</Link></li>)}</ul></div>}
          <div><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">TERMS</p><ul className="mt-1 flex flex-wrap gap-1">{meta.terms.map((t) => <li key={t}><Link className="bx-chip border border-[color:var(--bx-line)] hover:bg-paper-2 dark:hover:bg-night-2" to={`/glossary#${t}`}>{getTerm(t)?.term ?? t}</Link></li>)}</ul></div>
          {meta.figures.length > 0 && <div><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">FIGURES</p><ul className="mt-1 grid gap-1">{meta.figures.map((f) => <li key={f}><Link className="underline" to={`/figures/${f}`}>{getFigure(f)?.label ?? f} · {getFigure(f)?.title}</Link></li>)}</ul></div>}
          {c && c.used_by_concepts.length > 0 && <div><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">LEADS TO</p><ul className="mt-1 grid gap-1">{c.used_by_concepts.map((p) => <li key={p}><Link className="underline" to={`/concepts/${p}`}>{getConcept(p)?.title ?? p}</Link></li>)}</ul></div>}
        </div>
      </aside>
    </div>
  );
}

function ConceptBody({ c, level, setLevel }: { c: ConceptT; level: LevelId; setLevel: (l: LevelId) => void }) {
  const firstLevel = c.sections.findIndex((s) => s.kind === 'level');
  const selected = c.sections.find((s) => s.level === level) ?? c.sections.find((s) => s.kind === 'level');
  return (
    <>
      <div className="bx-card mt-4 p-4 border-l-4 border-l-[color:var(--bx-accent)]">
        <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">WHY THIS REVIEW NEEDS IT</p>
        <p className="mt-1 text-sm leading-6">{c.why_here}</p>
      </div>
      {c.sections.map((s, i) => {
        if (s.kind === 'level') {
          if (i !== firstLevel || !selected) return null;
          return (
            <div key="levels">
              <LevelSwitch sections={c.sections} level={level} onChange={setLevel} />
              <section id="level-panel" role="tabpanel" aria-labelledby={`level-tab-${selected.level}`} className="bx-101 bx-prose text-ink dark:text-night-ink mt-2" data-testid="level-panel">
                <h2 className="text-2xl mt-4">{selected.title}</h2>
                <Hast tree={selected.hast} />
              </section>
            </div>
          );
        }
        return (
          <section key={i} className="bx-101 bx-prose text-ink dark:text-night-ink mt-6">
            {s.title && <h2 className="text-2xl">{s.title}</h2>}
            <Hast tree={s.hast} />
          </section>
        );
      })}
      <section className="mt-8" aria-labelledby="fr-h">
        <h2 id="fr-h" className="text-2xl">Further reading</h2>
        <ul className="mt-2 grid gap-1.5 text-sm">
          {c.further_reading.map((r) => <li key={r.url}><a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.title}</a>{r.kind && <span className="bx-chip bg-paper-2 dark:bg-night-2 ml-2">{r.kind}</span>}</li>)}
        </ul>
      </section>
      <Quiz questions={c.self_check} />
    </>
  );
}
