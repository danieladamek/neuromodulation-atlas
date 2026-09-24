import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import todoJson from '@/data/todo.json';
import buildErrorsJson from '@/data/build-errors.json';
import synthesisJson from '@/data/synthesis.json';
import warningsJson from '@/data/warnings.json';
import type { BuildError, ScopeJson, SynthesisPassage, TodoItem, VolumeScope } from '@/types';
import { authorName, byline, AS_OF, asOfLong, assetUrl, getTerm, provenance, readerHref, readyVolumes, sectionTitle, volumes } from '@/lib/data';
import { loadScope, useAsync } from '@/lib/heavy';

const todo = todoJson as TodoItem[];
const buildErrors = buildErrorsJson as BuildError[];
const synthesis = synthesisJson as SynthesisPassage[];
const warnings = warningsJson as string[];

type Scope = ScopeJson;

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="bx-card p-3"><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">{label}</p><p className="text-lg font-display mt-0.5">{value}</p></div>;
}
function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="text-2xl mt-10 text-ink dark:text-night-ink scroll-mt-24">{children}</h2>;
}
function Box({ title, children, accent }: { title: string; children: ReactNode; accent?: boolean }) {
  return <div className={`bx-card mt-4 p-3 ${accent ? 'border-l-4 border-l-amber-600' : ''}`}><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">{title}</p>{children}</div>;
}
const pretty = (k: string) => k.replace(/_/g, ' ');
const joinCounts = (o: Record<string, number>) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(' · ');
const cellCls = 'border-b border-[color:var(--bx-line)] px-2 py-1';
const headCls = 'border-b-2 border-[color:var(--bx-line)] px-2 py-1 text-left font-semibold bg-paper-2/60 dark:bg-night-2/60';

function CountTable({ caption, data }: { caption: string; data: Record<string, number> }) {
  return (
    <table className="mt-1 w-full text-sm border-collapse">
      <caption className="sr-only">{caption}</caption>
      <tbody>{Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => <tr key={k}><th scope="row" className={`${cellCls} text-left font-normal`}>{k}</th><td className={`${cellCls} tabular-nums text-right`}>{v}</td></tr>)}</tbody>
    </table>
  );
}

function Interview({ interview }: { interview: Scope['interview'] }) {
  if (Array.isArray(interview)) {
    return <ol className="mt-3 grid gap-3">{interview.map((qa, i) => <li key={i} className="bx-card p-3 text-sm"><p className="font-semibold">Q. {qa.q}</p><p className="mt-1">A. “{qa.answer}”</p>{qa.asked && <p className="mt-1 text-xs bx-muted">asked {qa.asked}</p>}</li>)}</ol>;
  }
  return (
    <div className="mt-3 grid gap-3">
      {Object.entries(interview as Record<string, Record<string, string>>).map(([round, answers]) => (
        <div key={round} className="bx-card p-3 text-sm">
          <p className="font-semibold">Round {round.replace(/^round/, '')}</p>
          <dl className="mt-1 grid gap-1">
            {Object.entries(answers).map(([q, a]) => <div key={q} className="sm:flex sm:gap-2"><dt className="bx-muted sm:w-48 shrink-0">{pretty(q)}</dt><dd>“{a}”</dd></div>)}
          </dl>
        </div>
      ))}
    </div>
  );
}

function VolumeStrategy({ vid, vs }: { vid: string; vs: VolumeScope }) {
  const [filter, setFilter] = useState('');
  const [all, setAll] = useState(false);
  const queries = vs.search_strategy.queries;
  const shown = useMemo(() => { const n = filter.trim().toLowerCase(); return n ? queries.filter((q) => `${q.q} ${q.source ?? ''}`.toLowerCase().includes(n)) : queries; }, [queries, filter]);
  const visible = all || filter ? shown : shown.slice(0, 25);
  const bySource = useMemo(() => {
    const m = new Map<string, { n: number; hits: number; kept: number }>();
    for (const q of queries) { const k = q.source ?? '—'; const e = m.get(k) ?? { n: 0, hits: 0, kept: 0 }; e.n++; e.hits += q.hits; e.kept += q.kept ?? 0; m.set(k, e); }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, [queries]);
  const cp = vs.corpus_profile as Record<string, unknown>;
  const vol = volumes.find((v) => v.id === vid);
  return (
    <section className="bx-card mt-4 p-4" aria-labelledby={`vol-${vid}-h`} data-testid={`volume-panel-${vid}`}>
      <h3 id={`vol-${vid}-h`} className="text-xl">Volume {vid.slice(1)} — {vol?.title}</h3>
      <p className="mt-1 text-sm bx-muted">Depth: {vs.depth} · outline approved {vs.outline_approved ?? 'not recorded'} · search run on {vs.search_strategy.run_on} · current as of {vol?.as_of}</p>

      <h4 id={`search-${vid}`} className="text-lg mt-4">Search strategy — every query, with its hit count</h4>
      <p className="mt-1 text-sm">
        {queries.length} queries across {vs.search_strategy.sources.length} source families ({vs.search_strategy.sources.join(' · ')}), returning {queries.reduce((a, q) => a + q.hits, 0).toLocaleString('en')} hits
        and keeping {queries.reduce((a, q) => a + (q.kept ?? 0), 0)} — including the queries that found nothing, because a query that returned nothing is evidence too.
      </p>
      <div className="relative mt-2 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Queries per source, with total hits and items kept</caption>
          <thead><tr>{['Source', 'Queries', 'Hits', 'Kept'].map((h) => <th key={h} scope="col" className={headCls}>{h}</th>)}</tr></thead>
          <tbody>{bySource.map(([s, e]) => <tr key={s}><th scope="row" className={`${cellCls} text-left font-normal`}>{s}</th><td className={cellCls}>{e.n}</td><td className={cellCls}>{e.hits}</td><td className={cellCls}>{e.kept}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 no-print">
        <label className="sr-only" htmlFor={`qf-${vid}`}>Filter the query log</label>
        <input id={`qf-${vid}`} className="bx-input max-w-xs" placeholder="Filter the query log…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <span className="text-xs bx-muted">{shown.length} of {queries.length} queries</span>
        {!filter && <button type="button" className="bx-btn" onClick={() => setAll((s) => !s)}>{all ? 'Show first 25' : `Show all ${queries.length}`}</button>}
      </div>
      <div className="relative mt-2 overflow-x-auto">
        <table className="w-full text-sm border-collapse" data-testid={`query-log-${vid}`}>
          <caption className="sr-only">Every logged search query with its source, date, hit count and how many items were kept</caption>
          <thead><tr>{['#', 'Query', 'Source', 'Date', 'Hits', 'Kept'].map((h) => <th key={h} scope="col" className={headCls}>{h}</th>)}</tr></thead>
          <tbody>
            {visible.map((q) => (
              <tr key={queries.indexOf(q)} className="align-top odd:bg-white/40 dark:odd:bg-night-2/40">
                <td className={`${cellCls} tabular-nums bx-muted`}>{queries.indexOf(q) + 1}</td><td className={cellCls}>{q.q}</td><td className={`${cellCls} whitespace-nowrap`}>{q.source}</td>
                <td className={`${cellCls} whitespace-nowrap bx-muted`}>{q.date}</td><td className={`${cellCls} tabular-nums`}>{q.hits}</td><td className={`${cellCls} tabular-nums`}>{q.kept ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Box title="INCLUSION"><ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{vs.search_strategy.inclusion.map((x, i) => <li key={i}>{x}</li>)}</ul></Box>
        <Box title="EXCLUSION"><ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{vs.search_strategy.exclusion.map((x, i) => <li key={i}>{x}</li>)}</ul></Box>
      </div>
      <Box title={`SNOWBALLING (${vs.search_strategy.snowball.length})`}><ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{vs.search_strategy.snowball.map((x, i) => <li key={i}>{x}</li>)}</ul></Box>
      <Box title="KNOWN GAPS IN THE SWEEP ITSELF" accent><ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{vs.search_strategy.known_gaps.map((x, i) => <li key={i}>{x}</li>)}</ul></Box>

      <h4 id={`corpus-${vid}`} className="text-lg mt-5">Corpus profile — the honesty check</h4>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {Object.entries(cp).filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v)).map(([k, v]) => (
          <div key={k} className="bx-card p-2"><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">{pretty(k).toUpperCase()}</p><CountTable caption={pretty(k)} data={v as Record<string, number>} /></div>
        ))}
      </div>
      <dl className="mt-3 grid gap-1 text-sm">
        {Object.entries(cp).filter(([, v]) => !(v && typeof v === 'object' && !Array.isArray(v))).map(([k, v]) => (
          <div key={k} className="sm:flex sm:gap-2"><dt className="font-semibold sm:w-48 shrink-0">{pretty(k)}</dt><dd>{Array.isArray(v) ? v.join('–') : typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v)}</dd></div>
        ))}
      </dl>
      <p className="mt-2 text-xs bx-muted">Counts as recorded in scope.yaml. Figure 8 recomputes them from references.yaml and notes where the prose and the file disagree.</p>
    </section>
  );
}

export default function Methods() {
  const scope: Scope | undefined = useAsync(loadScope);
  const groups = todo.reduce<Record<string, TodoItem[]>>((acc, t) => { const k = t.where.split('/')[0]; (acc[k] ??= []).push(t); return acc; }, {});
  const claims = provenance.claims;
  const T = provenance.terms;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 bx-prose text-ink dark:text-night-ink">
      <h1 className="text-3xl sm:text-4xl text-ink dark:text-night-ink">Methods &amp; provenance</h1>
      <p className="mt-2 flex flex-wrap items-center gap-2">
        <span className="bx-chip border border-[color:var(--bx-line)] bx-muted">COMMISSIONED REVIEW — NOT PEER REVIEWED</span>
        <span className="bx-asof">Sweep closed {AS_OF}</span>
      </p>
      <p className="mt-3 text-[17px] leading-8 font-semibold">This is a scope-bounded commissioned review, not a systematic review.</p>
      <p className="mt-2">
        It does not claim exhaustiveness, it is not PRISMA, and it has had no external scientific review of any kind. What it offers instead is traceability: every claim carries a
        citation to a verified reference, every inference is marked as one, and the scope, the interview and the full search strategy are published below so you can see what was
        looked for and what was deliberately left out. Rendered by Claude Code from a content pack drafted with AI assistance under {authorName}’s direction. It is not peer reviewed.
      </p>
      <p className="mt-2 text-sm">
        On this page: <a className="underline" href="#counts">counts</a> · <a className="underline" href="#volumes">volumes</a> · <a className="underline" href="#scope">scope</a> · <a className="underline" href="#interview">interview</a> ·
        {' '}<a className="underline" href="#strategy">search strategy &amp; corpus</a> · <a className="underline" href="#citation">citation coverage</a> · <a className="underline" href="#synthesis">every synthesis passage</a> ·
        {' '}<a className="underline" href="#graph">the graph</a> · <a className="underline" href="#terms">term linking</a> · <a className="underline" href="#gaps">known gaps</a>
      </p>

      {buildErrors.length > 0 && (
        <section className="mt-6 bx-card p-4 border-l-4 border-l-amber-600" aria-labelledby="errors-h" data-testid="build-errors">
          <h2 id="errors-h" className="text-2xl text-ink dark:text-night-ink">Content-build errors ({buildErrors.length})</h2>
          <p className="mt-1 text-sm">The content build found problems in the pack. The app was built with whatever validated; these are also in <code className="font-mono text-xs">content-pack/BUILD-ERRORS.md</code>. Uncited prose is never repaired by adding a citation.</p>
          <ul className="mt-2 grid gap-1 text-sm">{buildErrors.map((e, i) => <li key={i}><span className="bx-todo">{e.where}</span> {e.message}</li>)}</ul>
        </section>
      )}

      <H2 id="counts">Provenance counts</H2>
      <p className="mt-1 text-sm">Written at build time to <a className="underline" href={assetUrl('provenance.json')} target="_blank" rel="noreferrer">provenance.json</a>. Content-build errors: <strong>{provenance.build_errors}</strong>.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
        <Stat label="SECTIONS · WORDS" value={`${provenance.sections} · ${provenance.words.toLocaleString('en')}`} />
        <Stat label="BLOCKS · CITED" value={`${provenance.blocks.total} · ${provenance.blocks.cited}`} />
        <Stat label="UNCITED BLOCKS" value={provenance.blocks.uncited} />
        <Stat label="FRAMING BLOCKS" value={provenance.blocks.framing} />
        <Stat label="SYNTHESIS PASSAGES" value={provenance.synthesis_passages} />
        <Stat label="REFERENCES" value={`${provenance.references.total}`} />
        <Stat label="BY TIER" value={joinCounts(provenance.references.by_tier)} />
        <Stat label="VERIFIED · UNVERIFIED BUT CITED" value={`${provenance.references.verified} · ${provenance.references.unverified_but_cited.length}`} />
        <Stat label="WITH SUMMARY" value={`${provenance.references.with_summary} of ${provenance.references.total}`} />
        <Stat label="TERMS OCCURRING → LINKED" value={`${T.occurring} → ${T.linked} (${T.linked_pct_of_occurring}%)`} />
        <Stat label="TERMS UNMATCHED" value={T.unmatched.length} />
        <Stat label="FIGURES" value={`${provenance.figures.total}: ${joinCounts(provenance.figures.by_synthesis)}`} />
        <Stat label="FIGURES BY KIND" value={joinCounts(provenance.figures.by_kind)} />
        <Stat label="CONCEPTS (101s)" value={`${provenance.concepts}${provenance.concept_levels ? ' · L1–L4' : ''}`} />
        <Stat label="TODO(author) ITEMS" value={provenance.todo.count} />
        {claims && <Stat label="CLAIMS" value={`${claims.total}: ${joinCounts(claims.by_status)}`} />}
        {claims && <Stat label="NULL RESULTS · NODES" value={`${claims.null_results.length} · ${claims.nodes}`} />}
        {claims && <Stat label="HYPOTHESIS GROUPS · RIVALS" value={`${claims.hypothesis_groups} · ${claims.rivals}`} />}
      </div>

      <H2 id="volumes">Volumes</H2>
      <div className="relative mt-2 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Per-volume provenance counts</caption>
          <thead><tr>{['Volume', 'Status', 'As of', 'Sections', 'Words', 'Blocks (cited · framing · synthesis · uncited)', 'Claims'].map((h) => <th key={h} scope="col" className={headCls}>{h}</th>)}</tr></thead>
          <tbody>
            {provenance.volumes.map((v) => (
              <tr key={v.id} className="align-top"><th scope="row" className={`${cellCls} text-left font-normal`}>{v.id} — {v.title}</th><td className={cellCls}>{v.status === 'ready' ? 'ready' : 'coming'}</td><td className={cellCls}>{v.status === 'ready' ? v.as_of : '—'}</td>
                <td className={cellCls}>{v.sections}</td><td className={cellCls}>{v.words.toLocaleString('en')}</td><td className={cellCls}>{v.blocks ? `${v.blocks.total} (${v.blocks.cited} · ${v.blocks.framing} · ${v.blocks.synthesis} · ${v.blocks.uncited})` : '—'}</td><td className={cellCls}>{v.claims}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {!scope ? <p className="mt-6 bx-muted" role="status">Loading the scope…</p> : (
        <>
          <H2 id="scope">Scope — what is in, and what is deliberately out</H2>
          <p className="mt-2 text-sm bx-muted">Shared by every volume.</p>
          <p className="mt-2"><span className="font-semibold">Topic, in the commissioner’s words: </span>{scope.topic}</p>
          <p className="mt-2"><span className="font-semibold">Question: </span>{scope.question}</p>
          <dl className="mt-2 grid gap-1 text-sm">
            {([['purpose', scope.purpose], ['lineage', scope.lineage], ['stance', scope.stance], ['depth (app)', scope.depth], ['current from', scope.time_window.current_from], ['seminal tier', scope.time_window.seminal], ['assumed defaults', scope.assumed ? 'yes — the interview went unanswered' : 'no — the interview was answered']] as [string, unknown][])
              .filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => <div key={k} className="sm:flex sm:gap-2"><dt className="font-semibold sm:w-40 shrink-0">{k}</dt><dd>{String(v)}</dd></div>)}
          </dl>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="bx-card p-3"><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">IN SCOPE ({scope.boundary.in.length})</p><ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{scope.boundary.in.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="bx-card p-3 border-l-4 border-l-[color:var(--bx-accent)]"><p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">OUT OF SCOPE ({scope.boundary.out.length})</p><ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{scope.boundary.out.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          </div>
          {scope.boundary.rationale && <p className="mt-3"><span className="font-semibold">Why this boundary: </span>{scope.boundary.rationale}</p>}
          {scope.graph_edges && (
            <Box title="WHAT THE GRAPH EDGES MUST CARRY"><dl className="mt-1 grid gap-1 text-sm">{Object.entries(scope.graph_edges).map(([k, v]) => <div key={k}><dt className="font-semibold inline">{k}: </dt><dd className="inline">{v}</dd></div>)}</dl></Box>
          )}
          {scope.anchors_note && <Box title="ANCHORS — WHAT SEEDED THE SWEEP"><p className="mt-1 text-sm">{scope.anchors_note}</p></Box>}
          {scope.excluded.length > 0 && <Box title="ADJACENT LITERATURES LEFT OUT, AND WHY"><ul className="mt-1 grid gap-2 text-sm">{scope.excluded.map((x, i) => <li key={i}><span className="font-semibold">{x.what}</span> — {x.why}</li>)}</ul></Box>}
          {scope.volumes_plan && (
            <Box title="THE VOLUME PLAN">
              <p className="mt-1 text-sm">{scope.volumes_plan.form}</p>
              <ul className="mt-1 list-disc pl-5 text-sm grid gap-1">{scope.volumes_plan.volumes.map((v) => <li key={v.id}><span className="font-semibold">{v.id}</span> — {v.title}{v.depth ? ` (${v.depth})` : ''}</li>)}</ul>
            </Box>
          )}

          <H2 id="interview">The scoping interview, as asked and answered</H2>
          <p className="mt-2">The answers are quoted as recorded in <code className="font-mono text-xs">scope.yaml</code>, not paraphrased.</p>
          <Interview interview={scope.interview} />

          <H2 id="strategy">Search strategy and corpus profile, per volume</H2>
          {readyVolumes.map((v) => scope.volumes?.[v.id] ? <VolumeStrategy key={v.id} vid={v.id} vs={scope.volumes[v.id]} /> : <p key={v.id}><span className="bx-todo">TODO(author): no search strategy recorded for {v.id}</span></p>)}
        </>
      )}

      <H2 id="citation">Citation coverage</H2>
      <p className="mt-2">
        The content build fails on uncited prose: any block of 25 words or more with no <code className="font-mono text-xs">[n]</code> and no <code className="font-mono text-xs">&lt;!-- framing --&gt;</code>
        {' '}marker is a build error. Of {provenance.blocks.total} blocks, <strong>{provenance.blocks.cited} carry a citation</strong>, {provenance.blocks.framing} are marked <em>framing</em> (transitions and
        section openers, which carry no claims of fact), {provenance.blocks.synthesis} are marked <em>synthesis</em>, and <strong>{provenance.blocks.uncited} are uncited</strong>.
      </p>
      <p className="mt-2">
        No claim may rest on an unverified reference. {provenance.references.unverified.length} references were not verified
        {' '}({provenance.references.unverified.map((n) => <Link key={n} className="underline mr-1" to={`/references#ref-${n}`}>[{n}]</Link>)}), and
        {' '}{provenance.references.unverified_but_cited.length === 0 ? 'none of them is cited anywhere — in the review, a 101, a figure or a graph claim. The build checks all four.' : <span className="bx-todo">the build flagged {provenance.references.unverified_but_cited.join(', ')} as cited</span>}
      </p>
      <p className="mt-2 text-sm bx-muted">Quotations are capped at 25 words, in quotation marks, each with its citation; the build checks the cap.</p>

      <H2 id="synthesis">Every synthesis passage ({synthesis.length})</H2>
      <p className="mt-2">
        A <em>synthesis</em> passage states a conclusion the cited works do not individually state. They are marked in the reader with a quiet left rule and the word <em>synthesis</em> —
        not as a defect, but visibly, so you can always tell the review’s own inference from a cited result.
      </p>
      <ol className="mt-3 grid gap-2 text-sm">
        {synthesis.map((s) => (
          <li key={s.id} className="bx-card p-3">
            <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">VOL {s.volume.slice(1)} · {sectionTitle(s.section).toUpperCase()}</p>
            <p className="mt-1 leading-6">{s.excerpt}…</p>
            <p className="mt-1"><Link className="underline text-xs font-semibold" to={readerHref(s.id)}>Read it in context →</Link></p>
          </li>
        ))}
      </ol>

      {claims && (
        <>
          <H2 id="graph">The claims graph</H2>
          <p className="mt-2">
            <Link className="underline" to="/graph">/graph</Link> renders <code className="font-mono text-xs">claims.yaml</code> and nothing else: {claims.total} claims (one edge each) between {claims.nodes} nodes, where a
            node is a distinct type-and-label pair some claim names. No node or edge is derived from the prose, the glossary or the figures. {claims.species_not_stated} claims state no species and
            are shown as “species not stated”, never as human.
          </p>
          <p className="mt-2">
            <strong>{claims.null_results.length} claims record a null result</strong> — the predicate says what was tested, and the claim’s <code className="font-mono text-xs">finding_note</code> says what was not
            found. They are marked as null results on the canvas, in every card and in every table: {claims.null_results.map((id) => <Link key={id} className="underline mr-1.5" to={`/graph?claim=${id}`}>{id}</Link>)}
          </p>
          <p className="mt-2">Exports, generated at build time from claims.yaml and byte-identical on a rebuild with no pack change:</p>
          <ul className="mt-1 list-disc pl-5 text-sm">{claims.exports.map((f) => <li key={f.file}><a className="underline" href={assetUrl(f.file)} download>{f.file}</a> <span className="bx-muted">({Math.round(f.bytes / 1024)} kB)</span></li>)}</ul>
        </>
      )}

      <H2 id="terms">How terms were linked</H2>
      <p className="mt-2">
        A matcher built from every glossary term and its variants ({T.variants} spellings) walks each volume: whole word, longest match wins, first occurrence per section, skipping headings, code,
        maths, links and HTML. Variants written entirely in capitals match case-sensitively, unless the same term also lists a mixed-case spelling. {T.ambiguous_variants.length} variants were ambiguous
        across terms; the build fails on any. {T.occurring} of {T.total} terms occur in the review; {T.linked} of them are linked ({T.linked_pct_of_occurring}%).
      </p>
      <p className="mt-2">
        <strong>Unmatched in the text ({T.unmatched.length}):</strong> {T.unmatched.map((id) => <Link key={id} className="underline mr-2" to={`/glossary#${id}`}>{getTerm(id)?.term ?? id}</Link>)}
        {' '}— a support entry that the review never uses.
      </p>
      {T.only_in_skip_zones.length > 0 && (
        <p className="mt-2"><strong>Occurring only where linking is not allowed ({T.only_in_skip_zones.length}):</strong> {T.only_in_skip_zones.map((id) => <Link key={id} className="underline mr-2" to={`/glossary#${id}`}>{getTerm(id)?.term ?? id}</Link>)} — each appears only inside a heading, so it is reachable from the glossary, the 101s and the graph but not linked in the reader.</p>
      )}

      <H2 id="written">What was written by whom</H2>
      <ul className="list-disc pl-5 mt-2">
        <li><strong>Drafted with AI assistance under {authorName}’s direction</strong> ({byline}): the review, the plain-language abstract, the glossary, the {provenance.concepts} levelled 101s, the figures and their data, the reference summaries, the scope and search log, and every claim in claims.yaml. It is the only source of scientific content in this app.</li>
        <li><strong>Rendered as written by this build</strong> (Claude Code): the review’s prose is structured, linked and rendered, never rephrased. No fact, definition, summary, number, node or edge was added, and no gap was filled.</li>
        <li><strong>Done by this build:</strong> parsing, the citation-coverage gate, term linking, citation fold-outs, figure components, the L1–L4 switch, claims validation, the graph canvas and in-browser analytics, the Cypher/CSV/GraphML/JSON exports, and this provenance record.</li>
      </ul>

      <H2 id="gaps">Known gaps — TODO(author)</H2>
      <p className="mt-2">{todo.length} entries from the pack’s <code className="font-mono text-xs">todo.yaml</code>, shown as written. A field left empty with a reason is more useful than a field filled without a source.</p>
      {Object.entries(groups).map(([g, items]) => (
        <details key={g} className="mt-3 bx-card p-3" open={items.length < 8}>
          <summary className="cursor-pointer font-semibold">{g} <span className="bx-muted font-normal">({items.length})</span></summary>
          <ul className="mt-2 grid gap-2 text-sm">{items.map((t, i) => <li key={i}><span className="bx-todo">TODO(author) · {t.where}</span> <span className="ml-1">{t.what}</span></li>)}</ul>
        </details>
      ))}
      <details className="mt-3 bx-card p-3">
        <summary className="cursor-pointer font-semibold">Content-build warnings <span className="bx-muted font-normal">({warnings.length}) — not errors; mostly claims with no species stated</span></summary>
        <ul className="mt-2 grid gap-1 text-xs font-mono">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
      </details>

      <H2 id="verified">How this was checked</H2>
      <ul className="list-disc pl-5 mt-2">
        <li>The pack passes <code className="font-mono text-xs">tools/validate_pack.py</code> with 0 errors, and the same rules are re-implemented as zod schemas in <code className="font-mono text-xs">scripts/build-content.ts</code>, which also fails if any id a previous build published disappears.</li>
        <li>Unit tests cover the pack schemas and claims rules (a fixture with one deliberate error per rule), the term matcher, the section/block parser, figure data, the notepad reducer, graph analytics on a fixture with known PageRank, path and component answers, and the Cypher export (parsed by the Neo4j Cypher parser; loaded into Neo4j when a test database is available).</li>
        <li>Playwright covers every route, term popovers by keyboard, citation fold-outs, notepad persistence across a rebuild that adds a volume, dark mode, 375 px, a chart tooltip, the L1–L4 switch, the graph lab’s contested and null-result marking, and the Neo4j panel’s storage and controls.</li>
      </ul>
      <p className="mt-6 text-sm">Sweep closed {asOfLong()}. <Link className="underline" to="/about">Licence, attribution and how to report an error →</Link></p>
    </div>
  );
}
