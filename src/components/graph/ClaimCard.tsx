import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AtlasClaim, AtlasNode, HypothesisGroup, Reference } from '@/types';
import { isNullResult } from '@/lib/claims-model';
import { getTerm, readerHref, sectionTitle } from '@/lib/data';
import { STATUS_NOTE, curieUrl, styleForType } from '@/lib/graph-style';
import ReferenceCard from '@/components/reader/ReferenceCard';

export function NullResultChip() {
  return <span className="bx-null" data-testid="null-result-chip"><span aria-hidden="true">∅</span> null result — not a positive finding</span>;
}

export function StatusChip({ status }: { status: AtlasClaim['status'] }) {
  return <span className="bx-status" title={STATUS_NOTE[status]} data-status={status}>{status}</span>;
}

export function NodeChip({ node, onSelect }: { node: AtlasNode; onSelect?: (id: string) => void }) {
  const st = styleForType(node.type);
  return (
    <button type="button" className="bx-chip border border-[color:var(--bx-line)] hover:bg-paper-2 dark:hover:bg-night-2 text-left" onClick={() => onSelect?.(node.id)} disabled={!onSelect}>
      <span aria-hidden="true" style={{ color: st.colour }}>{st.glyph}</span> <span className="font-normal bx-muted">{node.type}</span> {node.label}
    </button>
  );
}

function Refs({ ns, references }: { ns: number[]; references: Reference[] | undefined }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <p className="flex flex-wrap gap-1">
        {ns.map((n) => (
          <button key={n} type="button" className="bx-cite !text-xs !align-baseline bx-btn !py-0.5 !px-1.5" aria-expanded={open === n} onClick={() => setOpen(open === n ? null : n)} data-testid={`claim-ref-${n}`}>[{n}]</button>
        ))}
      </p>
      {open !== null && (
        <div className="bx-foldout" data-testid="claim-ref-foldout">
          {!references ? <p className="bx-muted" role="status">Loading reference…</p> : (() => {
            const r = references.find((x) => x.n === open);
            return r ? <ReferenceCard r={r} compact /> : <p><span className="bx-todo">reference [{open}] not in the content pack</span></p>;
          })()}
        </div>
      )}
    </div>
  );
}

/** Every rival of a contested claim's hypothesis group, side by side, each with its own references. */
export function HypothesisPanel({ group, claim, claims, references, onSelectClaim }: { group: HypothesisGroup; claim?: AtlasClaim; claims: AtlasClaim[]; references: Reference[] | undefined; onSelectClaim: (id: string) => void }) {
  return (
    <section className="mt-3 bx-card p-3" aria-labelledby={`hyp-${group.id}`} data-testid="hypothesis-group">
      <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">COMPETING HYPOTHESES · {group.id}</p>
      <h4 id={`hyp-${group.id}`} className="text-lg mt-1">{group.question}</h4>
      {group.section && <p className="mt-1 text-xs bx-muted">Argued in <Link className="underline" to={readerHref(group.section)}>{sectionTitle(group.section)}</Link></p>}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" data-testid="rivals">
        {group.rivals.map((r) => {
          const mine = claim?.hypothesis === r.id;
          const rivalClaims = claims.filter((c) => c.hypothesis === r.id);
          return (
            <li key={r.id} className={`rounded-lg border p-2 ${mine ? 'border-[color:var(--bx-accent)] bg-paper-2/60 dark:bg-night-2/60' : 'border-[color:var(--bx-line)]'}`}>
              <p className="text-sm font-semibold">{r.label}{mine && <span className="ml-2 bx-chip bg-paper-2 dark:bg-night-2">this claim’s position</span>}</p>
              <p className="mt-1 text-xs bx-muted">{r.id}</p>
              <div className="mt-1 text-xs"><Refs ns={r.refs} references={references} /></div>
              {rivalClaims.length > 0 && (
                <ul className="mt-1 text-xs grid gap-0.5">
                  {rivalClaims.map((c) => <li key={c.id}><button type="button" className="underline" onClick={() => onSelectClaim(c.id)}>{c.id}: {c.predicate}</button>{isNullResult(c) && <> <NullResultChip /></>}</li>)}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs bx-muted">Both positions are shown as the review states them; neither is adjudicated here.</p>
    </section>
  );
}

export default function ClaimCard({ claim, nodes, claims, group, references, onSelectNode, onSelectClaim, onRestingOn }: {
  claim: AtlasClaim;
  nodes: Map<string, AtlasNode>;
  claims: AtlasClaim[];
  group?: HypothesisGroup;
  references: Reference[] | undefined;
  onSelectNode: (id: string) => void;
  onSelectClaim: (id: string) => void;
  onRestingOn: (refs: number[]) => void;
}) {
  const s = nodes.get(claim.source);
  const o = nodes.get(claim.target);
  const params = Object.entries(claim.parameters);
  return (
    <div data-testid={`claim-card-${claim.id}`}>
      <p className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold tracking-[0.15em] bx-muted">CLAIM {claim.id}</span>
        <StatusChip status={claim.status} />
        {claim.synthesis && <span className="bx-status" title="The review’s own inference">synthesis</span>}
        {isNullResult(claim) && <NullResultChip />}
      </p>
      <div className="mt-2 grid gap-1 text-sm">
        {s && <NodeChip node={s} onSelect={onSelectNode} />}
        <p className="pl-2 font-mono text-xs bx-muted">— {claim.predicate} →</p>
        {o && <NodeChip node={o} onSelect={onSelectNode} />}
      </div>
      {isNullResult(claim) && (
        <p className="mt-2 text-sm border-l-4 border-[color:var(--bx-ink)] pl-2" data-testid="finding-note">
          <span className="font-semibold">What was not found: </span>{claim.finding_note}
        </p>
      )}
      {claim.synthesis && <p className="mt-2 text-xs bx-synthesis-label">synthesis — the review’s own inference, not a result any cited work states</p>}
      <dl className="mt-3 grid gap-1 text-sm">
        <div className="flex gap-2"><dt className="bx-muted w-24 shrink-0">level</dt><dd>{claim.level}</dd></div>
        <div className="flex gap-2"><dt className="bx-muted w-24 shrink-0">evidence</dt><dd>{claim.evidence}</dd></div>
        <div className="flex gap-2"><dt className="bx-muted w-24 shrink-0">species</dt><dd>{claim.species ? claim.species.join(', ') : <span className="bx-muted">not stated in the pack</span>}</dd></div>
        {[s, o].map((n) => n?.xref && (
          <div key={n.id} className="flex gap-2"><dt className="bx-muted w-24 shrink-0">xref</dt><dd>{curieUrl(n.xref) ? <a className="underline" href={curieUrl(n.xref)!} target="_blank" rel="noreferrer">{n.xref}</a> : n.xref} <span className="bx-muted">({n.label})</span></dd></div>
        ))}
        {[s, o].map((n) => n?.term && (
          <div key={`${n.id}-t`} className="flex gap-2"><dt className="bx-muted w-24 shrink-0">term</dt><dd><Link className="underline" to={`/glossary#${n.term}`}>{getTerm(n.term)?.term ?? n.term}</Link></dd></div>
        ))}
        <div className="flex gap-2"><dt className="bx-muted w-24 shrink-0">argued in</dt><dd><Link className="underline" to={readerHref(claim.section)}>{sectionTitle(claim.section)}</Link> <span className="bx-muted">(Volume {claim.volume.slice(1)})</span></dd></div>
      </dl>
      {params.length > 0 && (
        <details className="mt-3 text-sm" open>
          <summary className="cursor-pointer bx-muted">Parameters, as published ({params.length})</summary>
          <dl className="mt-1 grid gap-1">{params.map(([k, v]) => <div key={k} className="sm:flex sm:gap-2"><dt className="font-semibold sm:w-44 shrink-0">{k.replace(/_/g, ' ')}</dt><dd>{v}</dd></div>)}</dl>
        </details>
      )}
      <div className="mt-3">
        <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">REFERENCES ({claim.refs.length})</p>
        <Refs ns={claim.refs} references={references} />
        <p className="mt-1"><button type="button" className="bx-btn !py-0.5 text-xs" onClick={() => onRestingOn(claim.refs)}>What else rests on these references →</button></p>
      </div>
      {group && <HypothesisPanel group={group} claim={claim} claims={claims} references={references} onSelectClaim={onSelectClaim} />}
    </div>
  );
}
