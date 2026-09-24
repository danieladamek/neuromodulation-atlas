import { Link } from 'react-router-dom';
import { authorName, conceptsIndex, getFigure, getTerm } from '@/lib/data';

export default function Concepts() {
  const ordered = [...conceptsIndex].sort((a, b) => a.prerequisites.length - b.prerequisites.length || a.title.localeCompare(b.title));
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Concepts (101s)</h1>
      <p className="bx-prose mt-2">
        {conceptsIndex.length} introductions to what this review presumes you know, drafted with AI assistance under {authorName}’s direction, at four levels —
        L1 intuition, L2 undergraduate, L3 graduate, L4 expert — each authored separately rather than generated from the others. Pick a level on
        any 101 and the choice follows you to the next. Each ends with a self-check. Start with the ones that have no prerequisites.
      </p>
      <ol className="mt-6 grid gap-3">
        {ordered.map((c) => (
          <li key={c.id} className="bx-card p-4">
            <h2 className="text-xl flex flex-wrap items-baseline gap-2"><Link className="underline decoration-dotted" to={`/concepts/${c.id}`}>{c.title}</Link>{c.levels.length === 4 && <span className="bx-chip border border-[color:var(--bx-line)] bx-muted">L1–L4</span>}</h2>
            <p className="bx-prose mt-1">{c.one_liner}</p>
            <p className="mt-2 text-xs bx-muted flex flex-wrap gap-x-4 gap-y-1">
              {c.prerequisites.length > 0
                ? <span>After: {c.prerequisites.map((p) => <Link key={p} className="underline mr-1.5" to={`/concepts/${p}`}>{conceptsIndex.find((x) => x.id === p)?.title ?? p}</Link>)}</span>
                : <span>No prerequisites</span>}
              {c.figures.length > 0 && <span>Figures: {c.figures.map((f) => <Link key={f} className="underline mr-1.5" to={`/figures/${f}`}>{getFigure(f)?.label ?? f}</Link>)}</span>}
              <span>{c.terms.length} terms · e.g. {c.terms.slice(0, 3).map((t) => getTerm(t)?.term ?? t).join(', ')}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
