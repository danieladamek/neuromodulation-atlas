import { Link } from 'react-router-dom';
import type { Reference } from '@/types';
import { doiUrl, getConcept, readerHref, sectionTitle } from '@/lib/data';
import Todo from '@/components/ui/Todo';

const ROLE: Record<string, string> = {
  support: 'Supports a claim', method: 'Method source', contrast: 'Contrast / disagreement', 'prior-result': 'Prior result',
  'data-source': 'Data source', background: 'Background', guideline: 'Guideline', review: 'Review', consensus: 'Consensus statement',
};

export const TIER_NOTE: Record<string, string> = {
  seminal: 'Seminal — the cross-cutting canon the field is built on',
  classic: 'Classic — a pre-window primary study the later literature leans on',
  current: 'Current — published since the scope window opened (2021)',
  background: 'Background — textbook, method, guideline, database or definitional source',
};

/** Summary card used by the reader fold-outs, /references and the graph lab. Summaries come only from the pack. */
export default function ReferenceCard({ r, compact = false }: { r: Reference; compact?: boolean }) {
  const href = r.doi ? doiUrl(r.doi) : r.url;
  return (
    <div data-testid={`ref-card-${r.n}`}>
      <p className="text-sm"><span className="font-semibold">[{r.n}]</span> {r.citation} {href && <a className="underline break-all" href={href} target="_blank" rel="noreferrer">{r.doi ? `doi:${r.doi}` : 'link'}</a>}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {r.tier && <span className="bx-tier" title={TIER_NOTE[r.tier]}>{r.tier}</span>}
        {r.year && <span className="bx-chip bg-paper-2 dark:bg-night-2">{r.year}</span>}
        <span className="bx-chip bg-paper-2 dark:bg-night-2">{ROLE[r.role_here] ?? r.role_here}</span>
        {r.evidence_kind && <span className="bx-chip bg-paper-2 dark:bg-night-2">{r.evidence_kind}</span>}
        {r.species.length > 0 && <span className="bx-chip bg-paper-2 dark:bg-night-2">species: {r.species.join(', ')}</span>}
        {r.anchor && <span className="bx-chip border border-[color:var(--bx-line)]">anchor — named in the interview</span>}
        {!r.verified && <span className="bx-todo">not verified — summary from abstract/metadata only</span>}
      </p>
      {r.summary.trim() ? <p className={`mt-2 ${compact ? 'text-sm leading-6' : 'bx-prose'}`}>{r.summary}</p> : <p className="mt-2"><Todo>summary pending</Todo></p>}
      {r.why_it_mattered && <p className="mt-2 text-sm"><span className="font-semibold">Why it mattered: </span>{r.why_it_mattered}</p>}
      {r.role_note && <p className="mt-2 text-sm"><span className="font-semibold">Why this review cites it:</span> {r.role_note}</p>}
      {r.contested && <p className="mt-2 text-sm"><span className="font-semibold">Disputed: </span>{r.contested}</p>}
      {!compact && r.verified_how && <p className="mt-2 text-xs bx-muted">Verified against: {r.verified_how}</p>}
      {r.cited_sections.length > 0 && (
        <p className="mt-2 text-xs bx-muted">Cited in: {r.cited_sections.map((s) => <Link key={s} className="underline mr-2" to={/^fig/.test(s) ? `/figures/${s}` : readerHref(s)}>{sectionTitle(s)}</Link>)}</p>
      )}
      {!compact && r.cited_concepts.length > 0 && (
        <p className="mt-1 text-xs bx-muted">Cited by the 101s: {r.cited_concepts.map((c) => <Link key={c} className="underline mr-2" to={`/concepts/${c}`}>{getConcept(c)?.title ?? c}</Link>)}</p>
      )}
      {r.claims.length > 0 && (
        <p className="mt-1 text-xs"><Link className="underline" to={`/graph?refs=${r.n}`}>{r.claims.length} graph claim{r.claims.length === 1 ? ' rests' : 's rest'} on this reference →</Link></p>
      )}
      {compact && <p className="mt-2 text-xs"><Link className="underline font-semibold" to={`/references#ref-${r.n}`}>Open in references →</Link></p>}
    </div>
  );
}
