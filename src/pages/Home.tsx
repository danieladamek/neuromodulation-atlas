import { Link } from 'react-router-dom';
import { authorName, LATEST_AS_OF, asOfLong, conceptsIndex as concepts, figuresIndex as figures, manifest, provenance, readyVolumes, terms, volumes } from '@/lib/data';

export default function Home() {
  const first = readyVolumes[0];
  const firstConcepts = [...concepts].sort((a, b) => a.prerequisites.length - b.prerequisites.length || a.title.localeCompare(b.title)).slice(0, 6);
  const claims = provenance.claims;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="flex flex-wrap items-center gap-2">
        <span className="bx-chip border border-[color:var(--bx-line)] bx-muted">COMMISSIONED REVIEW — NOT PEER REVIEWED</span>
        <span className="bx-asof">Current as of {LATEST_AS_OF}</span>
      </p>
      <h1 className="text-3xl sm:text-4xl mt-3 leading-tight">{manifest.title}</h1>

      <section className="bx-card mt-5 p-4 border-l-4 border-l-[color:var(--bx-accent)]" aria-labelledby="question-h">
        <p id="question-h" className="text-[11px] font-semibold tracking-[0.15em] bx-muted">THE QUESTION THIS ANSWERS</p>
        <p className="mt-1 leading-7">{manifest.question}</p>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {first && <Link to={`/read/${first.id}`} className="bx-btn-primary !px-4 !py-2 !text-base">Start reading →</Link>}
        <Link to="/concepts" className="bx-btn !px-4 !py-2 !text-base">Concepts to know first</Link>
        <Link to="/graph" className="bx-btn !px-4 !py-2 !text-base">Explore the claims graph</Link>
      </div>
      <p className="mt-3 text-sm bx-muted">
        About {manifest.reading_minutes} min for Volume 0 · {provenance.words.toLocaleString('en')} words · {provenance.references.total} references · {terms.length} terms · {figures.length} figures · {claims?.total ?? 0} claims
      </p>

      <section className="bx-card mt-8 p-5" aria-labelledby="plain-h">
        <h2 id="plain-h" className="text-xl">In plain language</h2>
        <p className="bx-prose mt-2">{manifest.plain_abstract}</p>
        <p className="mt-2 text-xs bx-muted">
          Written by {authorName} with AI assistance, from a scoped literature sweep that closed on {asOfLong(LATEST_AS_OF)}.
          It is <strong>not</strong> peer reviewed and has had no external scientific review of any kind — see <Link className="underline" to="/about">About</Link> and <Link className="underline" to="/methods">Methods</Link>.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="vol-h">
        <h2 id="vol-h" className="text-2xl">The volumes</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {volumes.map((v) => (
            <li key={v.id} className="bx-card p-3 text-sm">
              <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">VOLUME {v.id.slice(1)} · {v.status === 'ready' ? 'READY' : 'COMING'}</p>
              {v.status === 'ready'
                ? <Link to={`/read/${v.id}`} className="mt-1 block font-semibold underline decoration-dotted">{v.title}</Link>
                : <p className="mt-1 font-semibold">{v.title}</p>}
              <p className="mt-1 bx-muted">{v.status === 'ready' ? `${v.sections} sections · ${v.words.toLocaleString('en')} words · current as of ${v.as_of}` : 'Planned — not yet written. It will be added to this app, not published as a separate one.'}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="101-h">
        <h2 id="101-h" className="text-2xl">Concepts to know first</h2>
        <p className="bx-prose mt-1">{concepts.length} 101s, each written at four levels — intuition, undergraduate, graduate and expert — and ending with a self-check.</p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {firstConcepts.map((c) => (
            <li key={c.id} className="bx-card p-3">
              <Link to={`/concepts/${c.id}`} className="font-semibold underline decoration-dotted">{c.title}</Link>
              <p className="text-sm bx-muted mt-1 leading-5">{c.one_liner}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm"><Link className="underline" to="/concepts">All {concepts.length} concepts →</Link></p>
      </section>

      {claims && (
        <section className="bx-card mt-8 p-5" aria-labelledby="graph-h">
          <h2 id="graph-h" className="text-xl">The graph lab</h2>
          <p className="bx-prose mt-2">
            Every mechanism claim in the review as a typed, cited edge: {claims.total} claims between {claims.nodes} nodes — {claims.by_status.supported ?? 0} supported,
            {' '}{claims.by_status.contested ?? 0} contested across {claims.hypothesis_groups} hypothesis groups, {claims.by_status.inferred ?? 0} inferred by the review itself,
            and {claims.null_results.length} null results marked as such. Filter it, run PageRank or shortest paths in your browser, download it as Cypher, CSV or GraphML,
            or load it into your own Neo4j.
          </p>
          <p className="mt-3"><Link className="bx-btn" to="/graph">Open the graph lab →</Link></p>
        </section>
      )}

      <section className="mt-8 grid gap-3 sm:grid-cols-3 text-sm">
        <Link to="/figures" className="bx-card p-3 hover:bg-paper-2 dark:hover:bg-night-2"><span className="font-semibold">Figures →</span><span className="block bx-muted mt-1">{figures.length} figures, all synthesised from the cited works. No published figure image is reproduced.</span></Link>
        <Link to="/references" className="bx-card p-3 hover:bg-paper-2 dark:hover:bg-night-2"><span className="font-semibold">References →</span><span className="block bx-muted mt-1">{provenance.references.total} works in four tiers, each with a summary of what it found and why it is cited.</span></Link>
        <Link to="/methods" className="bx-card p-3 hover:bg-paper-2 dark:hover:bg-night-2"><span className="font-semibold">Methods →</span><span className="block bx-muted mt-1">The scope, the interview, every search query, and every gap this app knows it has.</span></Link>
      </section>
    </div>
  );
}
