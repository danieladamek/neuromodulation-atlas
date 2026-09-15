import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConcept, getFigure, getTerm, readerHref, sectionTitle, terms } from '@/lib/data';
import { loadGlossary, useAsync } from '@/lib/heavy';
import type { GlossaryEntry } from '@/types';
import KindChip from '@/components/ui/KindChip';

const EMPTY: GlossaryEntry[] = [];
const KINDS = ['all', 'science', 'methods', 'statistics', 'notation', 'drug'] as const;
const letterOf = (s: string) => { const c = s.replace(/^[^A-Za-z0-9]+/, '').charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };

export default function Glossary() {
  const loc = useLocation();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all');
  const glossary = useAsync<GlossaryEntry[]>(loadGlossary) ?? EMPTY;
  useEffect(() => { if (loc.hash && glossary.length) requestAnimationFrame(() => document.getElementById(decodeURIComponent(loc.hash.slice(1)))?.scrollIntoView()); }, [loc.hash, glossary.length]);
  const sorted = useMemo(() => [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' })), [glossary]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sorted.filter((t) => (kind === 'all' || t.kind === kind) && (!needle || `${t.term} ${t.variants.join(' ')} ${t.short} ${t.definition}`.toLowerCase().includes(needle)));
  }, [sorted, q, kind]);
  const letters = [...new Set(shown.map((t) => letterOf(t.term)))];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Glossary</h1>
      <p className="bx-prose mt-2">
        {terms.length} terms — scientific, methodological, statistical, notation and drug names. Every entry is linkable (<code className="font-mono text-xs">/glossary#term-id</code>) and links back to
        the review sections where it appears, the figures that use it, and the graph nodes that name it. Definitions were written by the content-pack builder; see <Link className="underline" to="/methods">Methods</Link>.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 no-print">
        <label className="sr-only" htmlFor="glossary-q">Search the glossary</label>
        <input id="glossary-q" className="bx-input max-w-xs" placeholder="Search terms…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div role="group" aria-label="Filter by kind" className="inline-flex flex-wrap gap-1">
          {KINDS.map((k) => <button key={k} type="button" className={`bx-btn !py-1 ${kind === k ? 'bx-btn-on' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
        </div>
      </div>
      <nav aria-label="Jump to letter" className="mt-3 flex flex-wrap gap-1 text-sm no-print">
        {letters.map((l) => <a key={l} href={`#letter-${l}`} className="bx-btn !px-2 !py-0.5">{l}</a>)}
      </nav>
      <p className="mt-2 text-xs bx-muted" role="status">{glossary.length ? `${shown.length} of ${glossary.length} terms` : 'Loading…'}</p>
      <dl className="mt-6 grid gap-6">
        {shown.map((t, i) => {
          const letter = letterOf(t.term);
          const first = i === 0 || letterOf(shown[i - 1].term) !== letter;
          const concept = getConcept(t.concept ?? t.concepts[0]);
          return (
            <div key={t.id}>
              {first && <h2 id={`letter-${letter}`} className="text-xl bx-muted border-b border-[color:var(--bx-line)] mb-3 scroll-mt-24">{letter}</h2>}
              <div id={t.id} className="scroll-mt-24 target:bg-paper-2 dark:target:bg-night-2 rounded-md -mx-2 px-2 py-1">
                <dt className="text-xl font-display flex flex-wrap items-baseline gap-2">{t.term} <KindChip kind={t.kind} /> <a href={`#${t.id}`} className="bx-muted text-sm font-body no-underline" aria-label={`Link to ${t.term}`}>#</a></dt>
                <dd>
                  <p className="mt-1 font-semibold text-[15px]">{t.short}</p>
                  <p className="bx-prose mt-1">{t.definition}</p>
                  {t.variants.length > 0 && <p className="mt-1 text-xs bx-muted">Also written: {t.variants.join(' · ')}</p>}
                  <p className="mt-2 text-sm flex flex-wrap gap-x-4 gap-y-1">
                    {concept && <Link className="underline" to={`/concepts/${concept.id}`}>Learn the concept → {concept.title}</Link>}
                    {t.see.length > 0 && <span>See also: {t.see.map((s) => <Link key={s} className="underline mr-2" to={`/glossary#${s}`}>{getTerm(s)?.term ?? s}</Link>)}</span>}
                  </p>
                  {t.appears_in.length > 0 ? (
                    <p className="mt-1 text-xs bx-muted">Appears in: {t.appears_in.map((s) => <Link key={s} className="underline mr-2" to={readerHref(s)}>{sectionTitle(s)}</Link>)}</p>
                  ) : (
                    <p className="mt-1 text-xs bx-muted">Not linked in the review text — it occurs only in a heading, or not at all, and is a support entry for the 101s, the figures and the graph.</p>
                  )}
                  {t.figures.length > 0 && <p className="mt-1 text-xs bx-muted">In figures: {t.figures.map((f) => <Link key={f} className="underline mr-2" to={`/figures/${f}`}>{getFigure(f)?.label ?? f}</Link>)}</p>}
                  {t.claim_nodes > 0 && <p className="mt-1 text-xs"><Link className="underline" to={`/graph?term=${t.id}`}>Names {t.claim_nodes} node{t.claim_nodes === 1 ? '' : 's'} in the claims graph →</Link></p>}
                  {t.sources.length > 0 && <p className="mt-1 text-xs bx-muted">Checked against: {t.sources.map((s) => <a key={s} className="underline mr-2 break-all" href={s.startsWith('http') ? s : `https://doi.org/${s}`} target="_blank" rel="noreferrer">{s}</a>)}</p>}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
