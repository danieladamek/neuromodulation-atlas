import { Link } from 'react-router-dom';
import { LATEST_AS_OF, asOfLong, manifest, provenance, readyVolumes } from '@/lib/data';

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 bx-prose text-ink dark:text-night-ink">
      <h1 className="text-3xl sm:text-4xl text-ink dark:text-night-ink">About</h1>
      <p className="mt-2 flex flex-wrap items-center gap-2">
        <span className="bx-chip border border-[color:var(--bx-line)] bx-muted">COMMISSIONED REVIEW — NOT PEER REVIEWED</span>
        <span className="bx-asof">Current as of {LATEST_AS_OF}</span>
      </p>
      <p className="mt-3">
        <strong>{manifest.short_title} Explorer</strong> is an interactive textbook-and-journal built around one commissioned review, <em>{manifest.title}</em>, which arrives in volumes.
        It is written for {manifest.audience}.
      </p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Who wrote this, and what it is not</h2>
      <p className="mt-2">
        The review, its glossary, the 101s, the figures, the reference summaries and every claim in the graph were written by <strong>{manifest.builder.name} v{manifest.builder.version}</strong>
        {' '}({manifest.builder.date}) — an AI research builder working from a scoped literature sweep — and reviewed by its commissioner. This app was rendered from that content pack by Claude Code.
      </p>
      <p className="mt-2"><strong>{manifest.venue}.</strong></p>
      <p className="mt-2">
        It is <strong>not</strong> a peer-reviewed publication, <strong>not</strong> a systematic review, and <strong>not</strong> a substitute for reading the primary papers it cites — its job is to get you
        to them faster. It is a snapshot: {readyVolumes.map((v) => `Volume ${v.id.slice(1)}'s sweep closed on ${asOfLong(v.as_of ?? undefined)}`).join('; ')}, and nothing published after that is in it.
        The scope, the search strategy and every known gap are published in full at <Link className="underline" to="/methods">Methods</Link>.
      </p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Figures and the graph</h2>
      <p className="mt-2">
        All {provenance.figures.total} figures are the builder’s own — {provenance.figures.by_synthesis.data ?? 0} synthesised from values published in the cited works and {provenance.figures.by_synthesis.conceptual ?? 0} drawn
        as conceptual diagrams. <strong>No published figure image is reproduced.</strong> The <Link className="underline" to="/graph">graph lab</Link> shows only what the pack’s claims.yaml states: every edge is one claim,
        with its references, and contested, inferred and null-result claims are marked as such. Connecting it to your own Neo4j happens entirely in your browser; this site stores nothing you type there.
      </p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Licence and permissions</h2>
      <p className="mt-2"><strong>Text:</strong> {manifest.permissions.text}.</p>
      {manifest.permissions.figures && <p className="mt-2"><strong>Figures:</strong> {manifest.permissions.figures}.</p>}
      <p className="mt-2">App code: MIT. Cited works belong to their authors and publishers; follow the DOI links to read them.</p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">How to report an error</h2>
      <p className="mt-2">
        Errors are worth reporting and easy to place, because everything is traceable to a file. If a claim looks wrong, open its citation from the reader and check the reference card; if a
        graph edge looks wrong, open its card on <Link className="underline" to="/graph">/graph</Link> — it names its claim id, its section and its references. Then report it to the commissioner,
        or open an issue on the app’s GitHub repository (<a className="underline" href={`https://github.com/${manifest.github_account}/${manifest.slug}/issues`} target="_blank" rel="noreferrer">{manifest.github_account}/{manifest.slug}</a>),
        with the route, the section or claim id or reference number, and what you think it should say. Content fixes belong in the content pack; rendering fixes belong in the app. Known gaps are
        already listed on <Link className="underline" to="/methods">Methods</Link>.
      </p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Built with</h2>
      <ul className="list-disc pl-5 mt-2">
        <li>Content pack: {manifest.builder.name} v{manifest.builder.version} ({manifest.builder.date}); app rendered by Claude Code from <code className="font-mono text-xs">KICKOFF.md</code>.</li>
        <li>Vite, React, TypeScript, Tailwind, unified/remark/rehype and KaTeX (at build time), Recharts, d3-force and d3-zoom, graphology for the in-browser analytics, floating-ui, and the official neo4j-driver for the optional connection panel.</li>
        <li>A static site on GitHub Pages: no backend, no tracking, no runtime content fetch. Notes, the L1–L4 choice and the theme live only in your browser.</li>
      </ul>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Not clinical guidance</h2>
      <p className="mt-2">
        This is teaching material and an evidence base for schema design. It is not clinical guidance, not a treatment protocol, and not advice about any device or drug. Practical clinical protocols are
        explicitly out of scope, and the review says at length where the human evidence is thinner than the mechanism stories built on it.
      </p>
    </div>
  );
}
