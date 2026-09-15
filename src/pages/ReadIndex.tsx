import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { asOfLong, manifest, provenance, readerHref, volumeOfAnchor, volumes } from '@/lib/data';

/**
 * /read — the volume index (APP-SPEC §1.2). Old `/read#section` and `/read?section=id` links redirect to the volume
 * that owns the section, so nothing published before volumes existed breaks.
 */
export default function ReadIndex() {
  const loc = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const id = new URLSearchParams(loc.search).get('section') ?? decodeURIComponent(loc.hash.slice(1));
    if (id && volumeOfAnchor(id)) navigate(readerHref(id), { replace: true });
  }, [loc.hash, loc.search, navigate]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="flex flex-wrap items-center gap-2">
        <span className="bx-chip border border-[color:var(--bx-line)] bx-muted">COMMISSIONED REVIEW — NOT PEER REVIEWED</span>
        {volumes.filter((v) => v.status === 'ready').map((v) => <span key={v.id} className="bx-asof">Volume {v.id.slice(1)} current as of {v.as_of}</span>)}
      </p>
      <h1 className="text-3xl sm:text-4xl mt-3 leading-tight">The review, in volumes</h1>
      <p className="bx-prose mt-2">
        <em>{manifest.title}</em> is one commissioned review that arrives in parts. Every volume shares one glossary, one set of 101s, one bibliography
        ({provenance.references.total} references, numbered once) and one claims graph; each has its own sweep date, search strategy and approved outline.
        Notes you take in any volume live in one notepad.
      </p>
      <ol className="mt-6 grid gap-4">
        {volumes.map((v) => (
          <li key={v.id} className={`bx-card p-5 ${v.status === 'planned' ? 'border-dashed' : ''}`} data-testid={`volume-card-${v.id}`}>
            <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.15em] bx-muted">
              VOLUME {v.id.slice(1)}
              <span className={`bx-chip ${v.status === 'ready' ? 'border border-[color:var(--bx-line)]' : 'bg-paper-2 dark:bg-night-2'}`}>{v.status === 'ready' ? 'ready' : 'coming'}</span>
              {v.status === 'ready' && v.as_of && <span className="bx-asof">current as of {v.as_of}</span>}
            </p>
            <h2 className="text-2xl mt-1">{v.status === 'ready' ? <Link className="underline decoration-dotted" to={`/read/${v.id}`}>{v.title}</Link> : v.title}</h2>
            {v.status === 'ready' ? (
              <>
                <p className="mt-2 text-sm bx-muted">
                  {v.sections} sections · {v.words.toLocaleString('en')} words · {v.blocks?.cited ?? 0} of {v.blocks?.total ?? 0} blocks cited · {v.synthesis_passages} synthesis passages ·
                  {' '}{v.figures.length} figures · {v.claims} graph claims · outline approved {v.outline_approved ?? 'not recorded'} · sweep closed {v.as_of ? asOfLong(v.as_of) : '—'}
                </p>
                <p className="mt-3"><Link className="bx-btn-primary" to={`/read/${v.id}`}>Read Volume {v.id.slice(1)} →</Link></p>
              </>
            ) : (
              <p className="mt-2 text-sm bx-muted">Coming. This volume is planned but not yet written; when it is ready it will be added here, into this same app, with its own sweep date.</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
