import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Figure, Row } from '@/types';
import Popover from '@/components/ui/Popover';
import { downloadCsv } from './download';

const prettify = (f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Cell text as written, with every `[n]` citation turned into a link to its reference. */
function CellText({ field, value }: { field: string; value: Row[string] }) {
  if (value === null || value === '') return <span className="bx-muted" title="No source available to this section reports it">—<span className="sr-only">empty: not reported in this corpus</span></span>;
  const s = String(value);
  if (field === 'ref') {
    const ns = s.split(/[;,]\s*/).filter(Boolean);
    return <>{ns.map((n, i) => (/^\d+$/.test(n) ? <Fragment key={i}>{i > 0 && ' '}<Link className="underline" to={`/references#ref-${n}`}>[{n}]</Link></Fragment> : <span key={i}>{i > 0 && ' '}{n}</span>))}</>;
  }
  const parts = s.split(/(\[\d+(?:\s*[,–-]\s*\d+)*\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\[(\d+)/.exec(p);
        return m ? <Link key={i} className="text-[color:var(--bx-accent)] hover:underline" to={`/references#ref-${m[1]}`} aria-label={`Reference ${p.slice(1, -1)}`}>{p}</Link> : <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/** Sortable, filterable table with column-header popovers (from explain[] when an entry matches the header). */
export default function DataTable({ figure, rows, inline }: { figure: Figure; rows: Row[]; inline?: boolean }) {
  const cols: { field: string; label?: string }[] = figure.columns ?? (figure.table?.fields ?? []).map((f) => ({ field: f }));
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null);
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    let r = rows;
    if (q.trim()) { const needle = q.toLowerCase(); r = r.filter((row) => Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(needle))); }
    if (sort) {
      r = [...r].sort((a, b) => {
        const va = a[sort.field], vb = b[sort.field];
        if (va === null && vb !== null) return 1;
        if (vb === null && va !== null) return -1;
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''));
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, q, sort]);
  const explainFor = (label: string) => figure.explain.find((e) => label.toLowerCase().includes(e.on.toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <label className="sr-only" htmlFor={`filter-${figure.id}${inline ? '-inline' : ''}`}>Filter rows</label>
        <input id={`filter-${figure.id}${inline ? '-inline' : ''}`} className="bx-input max-w-xs" placeholder="Filter rows…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-xs bx-muted" role="status">{shown.length} of {rows.length} rows</span>
        {!inline && <button type="button" className="bx-btn ml-auto" onClick={() => downloadCsv(rows, cols.map((c) => c.field), `${figure.id}.csv`)}>CSV</button>}
      </div>
      {/* `relative` matters: sr-only text inside the cells is absolutely positioned, and without a positioned
          ancestor it escapes this scroller and stretches the page sideways on a phone. */}
      <div className="relative mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label={`${figure.label} table (scrolls sideways)`}>
        <table className="w-full text-sm border-collapse" data-testid={`table-${figure.id}`}>
          <caption className="sr-only">{figure.label}: {figure.title}</caption>
          <thead>
            <tr>
              {cols.map((c) => {
                const label = c.label ?? prettify(c.field);
                const ex = explainFor(label);
                const active = sort?.field === c.field;
                return (
                  <th key={c.field} scope="col" aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined} className="border-b-2 border-[color:var(--bx-line)] px-2 py-1.5 text-left align-bottom font-semibold bg-paper-2/60 dark:bg-night-2/60 min-w-[8rem]">
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      <button type="button" className="underline decoration-dotted underline-offset-2 text-left" onClick={() => setSort((s) => (s?.field === c.field ? { field: c.field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field: c.field, dir: 'asc' }))} aria-label={`Sort by ${label}`}>
                        {label} <span aria-hidden="true">{active ? (sort!.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </button>
                      {ex && <Popover className="bx-chip !px-1.5 border border-[color:var(--bx-line)]" ariaLabel={`About ${label}`} content={<div><p className="font-semibold">{ex.on}</p><p className="mt-1 leading-6">{ex.text}</p></div>}>ⓘ</Popover>}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="odd:bg-white/40 dark:odd:bg-night-2/40 align-top">
                {cols.map((c, j) => <td key={c.field} className={`border-b border-[color:var(--bx-line)] px-2 py-1.5 leading-6 ${j === 0 ? 'font-semibold' : ''}`}><CellText field={c.field} value={r[c.field]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
