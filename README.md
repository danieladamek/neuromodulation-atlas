# Neuromodulation Explorer

An interactive **textbook-and-journal** built around one commissioned review — *Neuromodulation: an atlas of exogenous
drives, from coupling to outcome* — which arrives in **volumes**, plus a **graph lab** over every mechanism claim the
review makes.

> **Commissioned review — NOT PEER REVIEWED.** Written by the Manuscript Interrogator (an AI research builder) and
> reviewed by its commissioner; it has had no external scientific review of any kind. The literature sweep closed on
> **15 September 2026**, and the app says so on `/`, `/read` and `/about`.

Volume 0 (*Foundations*) is ready: 16 sections, 30,350 words, 263 references, 300 glossary terms, 18 levelled 101s,
nine synthesised figures and **458 claims** in a claims-only graph. Volume 1 (*Vagus and cranial nerve stimulation*)
is declared and shown as coming; when it is written it is **added to this app**, never forked into another one.

## Quick start

```bash
npm install
npm run build:content   # validate content-pack/ → src/data/*.json, public/provenance.json, public/graph/*
npm run dev             # http://localhost:5173
```

For the production bundle:

```bash
npm run build && npm run preview   # http://localhost:4173
```

| Command | What it does |
|---|---|
| `npm run build:content` | Validates the pack (zod), parses every ready volume, links terms, renders markdown and KaTeX to hast, validates `claims.yaml`, emits `src/data/*` and the graph exports; **fails loudly** |
| `npm run build` | `tsc -b && vite build` → static `dist/` (set `BASE_PATH=/neuromodulation-atlas/` for the Pages sub-path). Every route also gets its own `index.html` shell, so a shared deep link answers 200 on GitHub Pages rather than 404-with-a-body; `404.html` stays as the fallback |
| `npm test` | Vitest: pack schemas, claims rules, term matcher, parser, figure data, notepad, graph analytics, graph exports, the Cypher read-only guard |
| `npm run test:e2e` | Playwright against `dist/` on :4173 **and** a second build with an extra volume on :4174 |
| `npm run build:fixture-volume` | Builds that second app from a fixture pack in which `v1` is ready (used by the volume test) |
| `python3 ../../tools/validate_pack.py content-pack` | The pack-side validator (needs `pyyaml`); `build:content` enforces the same rules |

`npm test` parses every statement of the Cypher export with the official Neo4j parser. The *load* path has its own
test, gated on `NEO4J_TEST_URL` so it can never reach a default endpoint or your own database:

```bash
NEO4J_TEST_URL=bolt://localhost:7699 npx vitest run tests/unit/neo4j-load.test.ts
```

It was last run against a throwaway Neo4j 2025.08 (its own config and data dir, bolt on :7699, HTTP off, auth off):
880 nodes, 458 relationships, the nine null results round-tripping as `'null-result'` with their notes, and a second
run of the whole file changing nothing.

## Editing the content pack

`content-pack/` is the **only** source of scientific content (APP-SPEC §6). The app never adds facts, and gaps are
rendered in amber as `TODO(author)` rather than filled.

1. Edit `manifest.yaml`, `volumes/<id>/review.md`, `scope.yaml`, `glossary.yaml`, `concepts/*.md`, `figures.yaml`
   (+ `figures/data/`), `references.yaml`, `claims.yaml`, `todo.yaml`.
2. Run `npm run build:content`. It is idempotent (only changed outputs are rewritten, and nothing it writes carries a
   timestamp) and exits non-zero on: a schema violation, an unresolved `[n]`, an unknown term/concept/figure/section
   id, a missing data file or declared field, an ambiguous glossary variant, **an uncited block of ≥ 25 words**, a
   claim resting on a `verified: false` reference, a claim that breaks its own vocabulary, or an id that a previous
   build published and this one no longer has. Errors are listed in `content-pack/BUILD-ERRORS.md` and surfaced on
   `/methods`; whatever validated is still emitted, so the app keeps building.
3. Commit the regenerated `src/data/*.json`, `public/provenance.json` and `public/graph/*`.

**Uncited prose is never repaired by adding a citation.** Inventing provenance would be worse than shipping the error.

### The topic-mode rules the build enforces

- **Citation coverage.** Every block of ≥ 25 words needs an `[n]` unless it is preceded by `<!-- framing -->`.
  V0 ships at 413 blocks: 362 cited, 25 framing, 101 synthesis, **0 uncited**.
- **`<!-- synthesis -->` stays visible.** Each such block gets a stable id (`syn-<section>-<n>`), renders with a quiet
  left rule and the word *synthesis*, and is linked from `/methods`. There are 101.
- **No claim rests on an unverified reference.** Three references are unverified (7, 191, 224); none is cited in the
  review, a 101, a figure or a claim, and the build checks all four.
- **Figures declare what they are made of.** Every figure carries `synthesis: data | conceptual` and `refs:`, and
  every `synthesis: data` CSV carries a `ref` column. No published figure image is reproduced.
- **Nothing implies peer review**, and the sweep date appears on `/`, `/read` and `/about`.

## Volumes

- `/read` is the volume index; `/read/:volume` is one volume's reader. Section ids carry their volume prefix
  (`v0-3-dose`), so they stay unique as volumes are added, and old `/read#section` links redirect to the owning volume.
- The glossary, the 101s, the figures, the bibliography (one numbering, never reused) and the claims graph are shared.
- Notes are keyed by the app slug alone and anchored to prefixed section ids, so **a note written in V0 survives a
  rebuild that adds V1** — `npm run test:e2e` proves it by replaying a reader's stored notes against a second build.
- A rebuild that dropped a published id fails: `src/data/id-ledger.json` records every section, term, concept, figure,
  claim and reference id, and the content build compares against it.

## The graph lab (`/graph`)

`/graph` renders **`claims.yaml` and nothing else**: 458 claims as typed, cited edges between 880 nodes, where a node
is a distinct (type, label) pair some claim names. Nothing is derived from the prose, the glossary or the figures.

- **Contested** claims (119) are dashed and open their competing-hypothesis group with **all rivals side by side**,
  each with its own references. **Inferred** claims (65) carry the synthesis mark. The **nine `finding: 'null-result'`
  claims** are marked ∅ *and* labelled "null result — not a positive finding" on the canvas, in every card and in every
  table; the value is compared as the literal string it is, never coerced.
- **Filters** (volume, status, level, evidence, node type, predicate, species, finding, free text) and presets
  (contested only, null results only, drive → outcome) live in the URL, so any view is shareable.
- **Analytics run client-side** on the current view: degree, PageRank, betweenness, weakly connected components,
  Louvain with a resolution control, shortest and bounded all-simple paths, and "what else rests on these references".
- **Exports** are generated at build time into `public/graph/` — `claims.cypher`, `nodes.csv`, `edges.csv`,
  `claims.graphml`, `claims.json` — deterministically, so a rebuild with no pack change leaves them byte-identical.
  The current filtered view exports the same five ways, from the same code (`src/lib/graph-export.ts`).
- **Connect to my Neo4j** is closed by default. It connects from your browser to an endpoint you type, with the
  official driver. Credentials live in memory for that tab: never `localStorage`, `sessionStorage`, cookies, the URL or
  a log. There is **no write-query box** — the read box refuses write clauses before sending and runs in a READ
  transaction — and the only write is the confirmed *Load this atlas*, which runs the constraints first and then every
  `MERGE` in one transaction (Neo4j will not mix schema and data in a single transaction). The Cypher download is
  always offered as the fallback for browsers that block a public HTTPS page from reaching a local database.

**Library choice (APP-SPEC §4.1):** analytics use **graphology** (+ `graphology-metrics`, `-communities-louvain`,
`-shortest-path`, `-simple-path`, `-components`); the canvas is **d3-force + d3-zoom rendered to inline SVG** rather
than sigma.js or cytoscape.js. The reasons: the claim set is small enough (880 nodes / 458 edges) that SVG is fast;
dashed contested edges, the ∅ null-result mark and the ◆ synthesis mark are trivial in SVG and awkward in a WebGL
renderer; and SVG elements can carry `data-status` / `data-finding` attributes, which is how the tests assert that a
null result is never drawn as a positive finding. The keyboard-accessible equivalent of the canvas is the claims table
directly beneath it.

## How the reader stays fast

Markdown and KaTeX run **at build time**: `src/data/volumes/v0.json` holds hast trees, and each typeset formula is a
single pre-rendered string, so the browser parses no markdown and loads no KaTeX JavaScript for 30,000 words. Sections
mount progressively (a deep-linked target and everything above it at once, then one section per task), figures build
as you reach them, and terms share one delegated popover instead of one floating-ui instance per linked word.

## Layout

```
scripts/build-content.ts        validate + parse + link + render + emit (scripts/lib/{schemas,claims,linker,parse,figures,concepts,render}.ts)
scripts/build-volume-fixture.ts a second build with an extra volume, for the notes-survive-a-rebuild test
content-pack/                   the input — committed
src/data/*.json                 generated — committed (includes id-ledger.json)
public/provenance.json          generated — committed
public/graph/*                  generated — committed (Cypher, CSV, GraphML, JSON)
src/lib/{claims-model,graph-export,graph-analytics,neo4j-guard,graph-style}.ts   shared by the build, the app and the tests
src/components/{reader,figures,graph,concepts,notepad,ui}/
src/pages/{Home,ReadIndex,ReadVolume,Glossary,Concepts,Concept,Figures,Figure,Graph,References,Methods,About,NotFound}.tsx
tests/unit (Vitest) · tests/e2e (Playwright)
.github/workflows/ci.yml        push / PR: test, build, e2e, PREVIEW artifact; never deploys
.github/workflows/deploy.yml    public deploy: v* tag or manual dispatch only
scripts/preview.ts              npm run preview:local
```

## Preview before public

The public site is what the ISBS abstract and the DOI point at, so it changes only when Daniel approves.

1. A push to `main` runs **CI and preview** (`ci.yml`). It tests, builds, checks that the committed `src/data/*`,
   `public/provenance.json` and `public/graph/*` are exactly what the pack builds to, runs e2e, and uploads a PREVIEW
   build as an artifact. Nothing is deployed.
2. `npm run preview:local` builds that same bundle locally with `PREVIEW=1` and serves it at
   `http://localhost:4180/neuromodulation-atlas/`. Every page carries an amber **PREVIEW — not the public site**
   banner with the **pack hash** and commit, and is marked `noindex`. The script prints a click-through checklist.
   It is private and costs nothing. The trade-off is that the preview has to run on Daniel's machine: there is no
   link to send anyone else. A second Pages repo with a public but unlinked preview can be added later if that's
   ever needed.
3. Daniel approves a **pack hash**. The public deploy (`deploy.yml`) then runs on a `v*` release tag or a manual
   dispatch, and nothing else. Afterwards `pack_hash` in the live `/provenance.json` must match the approved one.

The pack hash is sha256 over every file in `content-pack/` in sorted path order (dotfiles and `BUILD-ERRORS.md` left
out). The footer shows its first 12 characters on every build.

## Provenance

Every number on `/methods` comes from `public/provenance.json`, written by the content build: block and citation
counts per volume, references by tier, terms occurring versus linked, figures by synthesis kind, claims by status,
the null-result ids, the hypothesis groups, and the byte sizes of the graph exports. `/methods` also publishes the
scope (in **and** out), the interview as asked and answered, all 400 logged queries with their hit counts, the corpus
profile, every synthesis passage, and every `TODO(author)` in the pack.

## Licence

App code: MIT. Review text, glossary, 101s, figures and claims: builder-authored teaching material — see
`manifest.permissions`. No third-party text is reproduced beyond quotations of 25 words or fewer, each attributed and
cited; cited works belong to their authors and publishers.
