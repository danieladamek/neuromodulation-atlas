import { Link, useNavigate } from 'react-router-dom';
import type { SectionMeta } from '@/types';
import { shortSectionTitle } from '@/lib/data';

/**
 * Section navigation for one volume: a sticky rail on ≥1280 px (the active section expands into its subsections), a
 * select box below. `active` is the section in view; `activeSub` the subsection.
 */
export default function SectionRail({ sections, active, activeSub, variant }: { sections: SectionMeta[]; active: string | null; activeSub: string | null; variant: 'rail' | 'select' }) {
  const navigate = useNavigate();
  if (variant === 'select') {
    return (
      <div className="no-print">
        <label htmlFor="section-select" className="sr-only">Jump to section</label>
        <select id="section-select" className="bx-input" value={activeSub ?? active ?? ''} onChange={(e) => { if (e.target.value) navigate({ hash: e.target.value }); }}>
          <option value="">Jump to section…</option>
          {sections.map((s) => [
            <option key={s.id} value={s.id}>{s.number ? `${s.number} ` : ''}{shortSectionTitle(s)}</option>,
            ...s.subsections.map((x) => <option key={x.id} value={x.id}>{' '}{x.title}</option>),
          ])}
        </select>
      </div>
    );
  }
  return (
    <nav aria-label="Sections in this volume" className="bx-rail text-sm">
      <ol className="grid gap-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <Link to={{ hash: s.id }} aria-current={active === s.id && !activeSub ? 'location' : undefined} className={`block rounded px-2 py-0.5 leading-5 hover:bg-paper-2 dark:hover:bg-night-2 ${active === s.id ? 'font-semibold bg-paper-2 dark:bg-night-2' : 'bx-muted'}`}>
              {s.number && <span className="tabular-nums mr-1">{s.number}</span>}{shortSectionTitle(s)}
            </Link>
            {active === s.id && s.subsections.length > 0 && (
              <ol className="mt-0.5 mb-1 ml-3 grid gap-0.5 border-l border-[color:var(--bx-line)] pl-2">
                {s.subsections.map((x) => (
                  <li key={x.id}>
                    <Link to={{ hash: x.id }} aria-current={activeSub === x.id ? 'location' : undefined} className={`block rounded px-1.5 py-0.5 text-[13px] leading-5 hover:bg-paper-2 dark:hover:bg-night-2 ${activeSub === x.id ? 'font-semibold' : 'bx-muted'}`}>{x.title}</Link>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
