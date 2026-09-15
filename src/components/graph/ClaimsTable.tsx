import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AtlasClaim, AtlasNode } from '@/types';
import { isNullResult } from '@/lib/claims-model';
import { readerHref, sectionTitle } from '@/lib/data';
import { styleForType } from '@/lib/graph-style';
import { NullResultChip, StatusChip } from './ClaimCard';

const PAGE = 50;
type SortKey = 'id' | 'subject' | 'predicate' | 'object' | 'status' | 'level' | 'evidence';

/**
 * The claims of the current view as a table — the keyboard-accessible equivalent of the canvas, and the place a
 * reader can read every claim without pointing at anything. Null results are marked here too: a row can never read
 * as a positive finding.
 */
export default function ClaimsTable({ claims, nodes, selected, onSelect }: { claims: AtlasClaim[]; nodes: Map<string, AtlasNode>; selected: string | null; onSelect: (id: string) => void }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'id', dir: 'asc' });
  const [page, setPage] = useState(0);
  const label = (id: string) => nodes.get(id)?.label ?? id;
  const sorted = useMemo(() => {
    const value = (c: AtlasClaim): string => {
      switch (sort.key) {
        case 'subject': return label(c.source);
        case 'object': return label(c.target);
        case 'predicate': return c.predicate;
        case 'status': return c.status;
        case 'level': return c.level;
        case 'evidence': return c.evidence;
        default: return c.id;
      }
    };
    return [...claims].sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * value(a).localeCompare(value(b)));
  }, [claims, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = sorted.slice(current * PAGE, current * PAGE + PAGE);
  const th = (key: SortKey, text: string) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined} className="border-b-2 border-[color:var(--bx-line)] px-2 py-1.5 text-left font-semibold bg-paper-2/60 dark:bg-night-2/60">
      <button type="button" className="underline decoration-dotted underline-offset-2" onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))} aria-label={`Sort by ${text}`}>
        {text} <span aria-hidden="true">{sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <p className="bx-muted" role="status">{claims.length} claims in this view{pages > 1 ? ` · page ${current + 1} of ${pages}` : ''}</p>
        {pages > 1 && (
          <span className="ml-auto inline-flex gap-1">
            <button type="button" className="bx-btn !py-0.5" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={current === 0}>← Previous</button>
            <button type="button" className="bx-btn !py-0.5" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={current >= pages - 1}>Next →</button>
          </span>
        )}
      </div>
      <div className="relative mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Claims table (scrolls sideways)">
        <table className="w-full text-sm border-collapse" data-testid="claims-table">
          <caption className="sr-only">Every claim in the current view, with its status, level, evidence, species, references and the section that argues it</caption>
          <thead><tr>{th('id', 'Claim')}{th('subject', 'Subject')}{th('predicate', 'Predicate')}{th('object', 'Object')}{th('status', 'Status')}{th('level', 'Level')}{th('evidence', 'Evidence')}<th scope="col" className="border-b-2 border-[color:var(--bx-line)] px-2 py-1.5 text-left font-semibold bg-paper-2/60 dark:bg-night-2/60">Species</th><th scope="col" className="border-b-2 border-[color:var(--bx-line)] px-2 py-1.5 text-left font-semibold bg-paper-2/60 dark:bg-night-2/60">Refs</th><th scope="col" className="border-b-2 border-[color:var(--bx-line)] px-2 py-1.5 text-left font-semibold bg-paper-2/60 dark:bg-night-2/60">Argued in</th></tr></thead>
          <tbody>
            {rows.map((c) => {
              const s = nodes.get(c.source); const o = nodes.get(c.target);
              return (
                <tr key={c.id} className={`align-top odd:bg-white/40 dark:odd:bg-night-2/40 ${selected === c.id ? 'outline outline-2 outline-[color:var(--bx-accent)]' : ''}`} data-claim-row={c.id} data-finding={c.finding ?? 'positive'}>
                  <th scope="row" className="border-b border-[color:var(--bx-line)] px-2 py-1.5 text-left font-normal whitespace-nowrap">
                    <button type="button" className="underline font-mono text-xs" onClick={() => onSelect(c.id)}>{c.id}</button>
                  </th>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5">{s && <><span aria-hidden="true" style={{ color: styleForType(s.type).colour }}>{styleForType(s.type).glyph}</span> </>}{s?.label}<span className="block text-[11px] bx-muted">{s?.type}</span></td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5 font-mono text-xs">{c.predicate}</td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5">{o && <><span aria-hidden="true" style={{ color: styleForType(o.type).colour }}>{styleForType(o.type).glyph}</span> </>}{o?.label}<span className="block text-[11px] bx-muted">{o?.type}</span></td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5"><StatusChip status={c.status} />{isNullResult(c) && <span className="block mt-1"><NullResultChip /></span>}</td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5">{c.level}</td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5">{c.evidence}</td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5">{c.species ? c.species.join(', ') : <span className="bx-muted">not stated</span>}</td>
                  {/* inline-block with real height and spacing: a row of bare [n] links is below the 24 px tap-target floor */}
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5">{c.refs.map((n) => <Link key={n} className="underline inline-block min-h-[24px] min-w-[24px] text-center px-1 py-0.5 mr-1" to={`/references#ref-${n}`}>[{n}]</Link>)}</td>
                  <td className="border-b border-[color:var(--bx-line)] px-2 py-1.5"><Link className="underline" to={readerHref(c.section)}>{sectionTitle(c.section)}</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
