import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Figure } from '@/types';
import { getFigure } from '@/lib/data';
import { loadFigures } from '@/lib/heavy';

const FigureBody = lazy(() => import('@/components/figures/FigureBody'));

/**
 * Inline figure slot in the reader: label, provenance and the link render immediately; the interactive figure (and
 * the figure data) load only once the slot is near the viewport, so the reader's first paint never waits on them.
 */
export default function ReaderFigure({ id }: { id: string }) {
  const meta = getFigure(id);
  const ref = useRef<HTMLDivElement>(null);
  const [figure, setFigure] = useState<Figure | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  useEffect(() => { if (near) loadFigures().then((fs) => setFigure(fs.find((f) => f.id === id) ?? null)); }, [near, id]);

  if (!meta) return <p><span className="bx-todo">figure {id} missing from the content pack</span></p>;

  return (
    <figure id={`fig-${meta.id}`} className="bx-card my-6 p-3 sm:p-4 scroll-mt-24 max-w-none" data-testid={`reader-figure-${meta.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm"><span className="font-semibold">{meta.label}.</span> <span className="bx-muted">{meta.title}</span></p>
        <span className="bx-chip bg-paper-2 dark:bg-night-2">{meta.provenance}</span>
      </div>
      <div ref={ref} className="mt-3" style={{ minHeight: figure ? undefined : 240 }}>
        {figure ? (
          <Suspense fallback={<div className="bx-muted text-sm min-h-[15rem]" role="status">Loading figure…</div>}>
            <FigureBody figure={figure} inline />
          </Suspense>
        ) : (
          <div className="min-h-[15rem] grid place-items-center rounded-md bg-paper-2/50 dark:bg-night-2/50 text-sm bx-muted" role="status">{meta.label} builds as you reach it</div>
        )}
      </div>
      {figure && <figcaption className="mt-3 text-sm leading-6 bx-muted">{figure.caption}</figcaption>}
      <p className="mt-2 text-sm"><Link className="underline font-semibold" to={`/figures/${meta.id}`}>Open the {meta.label} page — how to read it, what it is built from, downloads</Link></p>
    </figure>
  );
}
