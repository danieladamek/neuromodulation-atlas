import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Reference } from '@/types';
import { doiUrl, provenance, readyVolumes } from '@/lib/data';
import { loadReferences, useAsync } from '@/lib/heavy';
import ReferenceCard from '@/components/reader/ReferenceCard';

const EMPTY: Reference[] = [];
const ROLES = ['all', 'support', 'contrast', 'prior-result', 'review', 'method', 'guideline', 'background', 'data-source', 'consensus'];

const TIERS: { id: NonNullable<Reference['tier']>; title: string; blurb: string; order: 'asc' | 'desc' }[] = [
  { id: 'seminal', title: 'Seminal', blurb: 'The cross-cutting canon this field is built on, at any age. Each carries a full summary and a note on what changed because of it. Oldest first, so the history reads forward.', order: 'asc' },
  { id: 'classic', title: 'Classic', blurb: 'Pre-window primary studies the later literature leans on without being founded on them — the second rank of the canon, often the founding paper of one technique. Full summaries. Oldest first.', order: 'asc' },
  { id: 'current', title: 'Current', blurb: 'Published since the scope window opened (2021). Newest first.', order: 'desc' },
  { id: 'background', title: 'Background', blurb: 'Textbooks, methods papers, guidelines, databases, ontologies and definitional sources. Newest first.', order: 'desc' },
];

export default function References() {
  const loc = useLocation();
  const references = useAsync(loadReferences) ?? EMPTY;
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('all');
  const [role, setRole] = useState('all');
  const [volume, setVolume] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [anchorsOnly, setAnchorsOnly] = useState(false);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const anchors = provenance.references.anchors.length;

  useEffect(() => {
    if (!loc.hash || !references.length) return;
    const n = Number(loc.hash.replace('#ref-', ''));
    if (Number.isInteger(n)) setOpen((o) => new Set(o).add(n));
    requestAnimationFrame(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView());
  }, [loc.hash, references.length]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const lo = from ? Number(from) : -Infinity;
    const hi = to ? Number(to) : Infinity;
    return references.filter((r) =>
      (tier === 'all' || r.tier === tier) &&
      (role === 'all' || r.role_here === role) &&
      (volume === 'all' || r.cited_volumes.includes(volume)) &&
      (r.year === undefined || (r.year >= lo && r.year <= hi)) &&
      (!anchorsOnly || r.anchor) &&
      (!needle || `${r.n} ${r.citation} ${r.summary} ${r.role_note} ${r.why_it_mattered}`.toLowerCase().includes(needle)));
  }, [references, q, tier, role, volume, from, to, anchorsOnly]);

  const toggle = (n: number) => setOpen((o) => { const s = new Set(o); if (s.has(n)) s.delete(n); else s.add(n); return s; });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">References</h1>
      <p className="bx-prose mt-2">
        {provenance.references.total} works in one bibliography shared by every volume, numbered once and never renumbered. Grouped by tier and sorted by year within each.
        {' '}{provenance.references.verified} were verified against a read abstract or full text; {provenance.references.unverified.length} were not, and none of those supports a claim anywhere in this app.
        {' '}{anchors ? `The ${anchors} marked anchor are the works named in the scoping interview.` : 'No reference is marked as an interview anchor in this pack; the scope records the landmarks named at the start in prose, on Methods.'}
        {' '}Summaries come from the content pack and are never invented.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-2 no-print">
        <label className="sr-only" htmlFor="ref-q">Search references</label>
        <input id="ref-q" className="bx-input max-w-xs" placeholder="Search citations and summaries…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="text-sm inline-flex items-center gap-1">Tier
          <select className="bx-input !w-auto" value={tier} onChange={(e) => setTier(e.target.value)}>{['all', ...TIERS.map((t) => t.id)].map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </label>
        <label className="text-sm inline-flex items-center gap-1">Role
          <select className="bx-input !w-auto" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        </label>
        <label className="text-sm inline-flex items-center gap-1">Cited in volume
          <select className="bx-input !w-auto" value={volume} onChange={(e) => setVolume(e.target.value)} data-testid="volume-filter">
            <option value="all">any</option>
            {readyVolumes.map((v) => <option key={v.id} value={v.id}>Volume {v.id.slice(1)}</option>)}
          </select>
        </label>
        <label className="text-sm inline-flex items-center gap-1">Years
          <input className="bx-input !w-20" inputMode="numeric" placeholder="from" aria-label="Year from" value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          <input className="bx-input !w-20" inputMode="numeric" placeholder="to" aria-label="Year to" value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </label>
        <button type="button" className={`bx-btn ${anchorsOnly ? 'bx-btn-on' : ''}`} aria-pressed={anchorsOnly} onClick={() => setAnchorsOnly((a) => !a)} disabled={!anchors}>Anchors only</button>
        <button type="button" className="bx-btn" onClick={() => setOpen(open.size ? new Set() : new Set(shown.map((r) => r.n)))}>{open.size ? 'Collapse all' : 'Expand all'}</button>
      </div>
      <p className="mt-2 text-xs bx-muted" role="status">{references.length ? `${shown.length} of ${references.length}` : 'Loading…'}</p>

      {TIERS.map((t) => {
        const group = shown.filter((r) => r.tier === t.id).sort((a, b) => (t.order === 'asc' ? (a.year ?? 0) - (b.year ?? 0) : (b.year ?? 0) - (a.year ?? 0)) || a.n - b.n);
        if (!group.length) return null;
        return (
          <section key={t.id} className="mt-8" aria-labelledby={`tier-${t.id}`}>
            <h2 id={`tier-${t.id}`} className="text-2xl flex flex-wrap items-baseline gap-2">{t.title} <span className="bx-tier">{group.length}</span></h2>
            <p className="bx-prose mt-1">{t.blurb}</p>
            <ol className="mt-3 grid gap-2 text-sm">
              {group.map((r) => {
                const href = r.doi ? doiUrl(r.doi) : r.url;
                const isOpen = open.has(r.n);
                return (
                  <li key={r.n} id={`ref-${r.n}`} className="scroll-mt-24 bx-card p-3">
                    <div className="flex gap-3">
                      <span className="tabular-nums bx-muted w-8 shrink-0 text-right">{r.n}.</span>
                      <div className="min-w-0 flex-1">
                        <p>{r.citation} {href && <a className="underline break-all" href={href} target="_blank" rel="noreferrer">{r.doi ? `doi:${r.doi}` : 'link'}</a>}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-2">
                          <button type="button" className="bx-btn !py-0.5 !px-2 text-xs" aria-expanded={isOpen} aria-controls={`ref-body-${r.n}`} onClick={() => toggle(r.n)}>{isOpen ? 'Hide summary' : 'Show summary'}</button>
                          <span className="bx-tier">{r.tier}</span>
                          <span className="bx-chip bg-paper-2 dark:bg-night-2">{r.role_here}</span>
                          {r.year && <span className="bx-chip bg-paper-2 dark:bg-night-2">{r.year}</span>}
                          {r.anchor && <span className="bx-chip border border-[color:var(--bx-line)]">anchor</span>}
                          {r.cited_volumes.map((v) => <span key={v} className="bx-chip bg-paper-2 dark:bg-night-2">Vol {v.slice(1)}</span>)}
                          {!r.verified && <span className="bx-todo">not verified — supports no claim</span>}
                        </p>
                        {(t.id === 'seminal' || t.id === 'classic') && !isOpen && r.why_it_mattered && (
                          <p className="mt-2 text-[13px] leading-6"><span className="font-semibold">Why it mattered: </span>{r.why_it_mattered}</p>
                        )}
                        {isOpen && <div id={`ref-body-${r.n}`} className="mt-2 border-t border-[color:var(--bx-line)] pt-2"><ReferenceCard r={r} /></div>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
