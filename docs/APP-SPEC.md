---
type: spec
project: manuscript-interrogator
version: 0.3
---

# APP-SPEC — what every generated app must be

**Version 0.3 · 2026-09-15 · normative.** Every Manuscript Interrogator kickoff prompt inherits this spec by reference; a generated app is accepted only against the checklist at the bottom. Change this file, not the prompts.

## 1. Purpose

One manuscript → one static web app that works as an **interactive textbook and journal** for that paper: a reader can read it, annotate it, look up every term, learn the concepts it assumes, play with its figures, and see what each cited work actually contributed. Audience: an upper-level undergraduate or early graduate student who is *not* a specialist in the paper's field.

### 1.1 Modes

The pack's `manifest.mode` says where the reader's body text came from. **Everything in this spec applies to both modes unless a row or rule says otherwise.**

- **`mode: manuscript`** (default) — the body is one published paper, reproduced verbatim from `manuscript.md`. The app's promise is *faithfulness*: nothing added, nothing paraphrased.
- **`mode: topic`** — the body is a **commissioned review** written by the builder from a scoped literature sweep ([[manuscript-interrogator/docs/TOPIC-WORKFLOW|TOPIC-WORKFLOW]]). The app's promise is *traceability*: every claim carries a citation to a verified reference, every synthesis is marked as one, and the scope and search strategy are published alongside the text. A topic app is never presented as peer-reviewed literature, and it always shows the date its sweep closed.

The machinery — reader, notepad, term linking, popovers, citation fold-outs, 101s, figures, search — is identical in both modes. A topic app differs only in what `/read` contains and in what `/methods` and `/about` must disclose.

### 1.2 Volume apps (topic mode with `manifest.volumes`)

A volume app is one topic app whose review arrives in parts. The reader, glossary, 101s, references and graph are shared; only `/read` is split. It is built once and extended per volume: each later KICKOFF adds a volume's content and re-runs the whole content build, never forks the app.

- `/read` becomes a **volume index** (title, status, word count, `as_of` per volume, "coming" cards for `planned` volumes); `/read/:volume` is the reader for one volume, with the section rail scoped to it and previous/next-volume links at the end.
- Citation fold-outs, term popovers and the notepad behave identically in every volume. Notes are keyed by the prefixed section id, so they survive volumes being added.
- `/references` gains a "cited in volume" filter. `/methods` renders the shared scope once, and each volume's search strategy, corpus profile and outline-approval date in its own panel.
- `/concepts/:id` offers an L1–L4 level switch when `manifest.concept_levels` is true (default L1; the choice persists per reader).
- `as_of` is per volume; `/` shows the most recent and `/read` shows each.

## 2. Surfaces (routes)

| Route | Surface | Must have |
|---|---|---|
| `/` | Home | Title, authors, venue/year, one-paragraph plain-language abstract, "Start reading", "Concepts to know first" (the 101s), reading-time estimate. **Topic mode:** instead of authors/venue, show the scope question (`manifest.question`), a "Commissioned review — not peer reviewed" badge, and "Current as of `as_of`". |
| `/read` | **Reader** | (Topic mode: the commissioned review from `review.md`, with a dismissible banner at the top of the first section — "Written by the Manuscript Interrogator from N sources, current as of `as_of`. Every claim is cited; passages marked *synthesis* draw conclusions the cited works do not individually state.") The full manuscript as structured sections (abstract → conclusions, plus supplement if supplied). Every glossary term is a clickable, visually quiet link (dotted underline) that opens a **popover** with the short definition and a "Full entry →" link. Figures and tables are embedded inline as interactive components (§4). Citations `[n]` are clickable and expand a **fold-out** under the paragraph (§5). Section nav rail on wide screens; progress indicator. |
| `/read` sidebar | **Notepad** | A Markdown notepad docked right (drawer on mobile). Notes persist in `localStorage` per manuscript slug; export as `.md`; import; "note anchored to section" — selecting text offers *Add note* which inserts a quote + anchor link to the section. No account, no backend. |
| `/glossary` | Glossary | Every technical term — scientific **and** methodological/statistical. Alphabetical with letter jump-bar, search, `#term-id` anchors, "see also", and "appears in" links back to reader sections. |
| `/concepts` and `/concepts/:id` | 101s | One page per *major concept* the paper presumes (from the content pack). Each 101: what it is (2–4 paragraphs at intro-textbook level), why this paper needs it, key equation(s) if any (rendered with KaTeX, each symbol explained), one illustrative interactive or static diagram, 2–4 further-reading links, a 3-question self-check. |
| `/figures` and `/figures/:id` | Figures | Every figure/table of the paper rebuilt interactively where the content pack supplies data (§4); otherwise the original image with hotspot annotations. Caption, "How to read this figure", the maths/concepts behind it as popovers or links to 101s. |
| `/references` | References | Numbered list matching the paper; each entry expandable to the same summary card used in the reader fold-outs (§5). DOI links. **Topic mode:** grouped by `tier` (Seminal · Classic · Current · Background) with the tier explained, sorted by year within each group, filterable by tier/year/role, `why_it_mattered` shown on seminal cards, and anchors (Daniel's own picks) marked. |
| `/graph` | **Graph lab** (packs with `claims.yaml`) | See §4.1. |
| `/methods` | Methods & provenance | How the app was built: which content came verbatim from the manuscript, which was written by the builder, what was verified how, known gaps (`TODO(author)` markers surfaced here in amber). **Topic mode — this route carries the app's honesty and is not optional:** the scope (in *and* out, with reasons), the interview as asked and answered, the full search strategy (every query, source, hit count, date, inclusion/exclusion rules, known gaps), the corpus profile (tier/year counts, author concentration, whether dissent is represented), the citation-coverage counts, a link to **every** `synthesis` passage in the review, and the sentence "This is a scope-bounded commissioned review, not a systematic review." |
| `/about` | About | Licence/permission statement for the manuscript text and figures; links to the original paper; version of the builder that generated the app. **Topic mode:** who wrote the review (the builder, named, with its version), that it is not peer reviewed, the `as_of` date, that figures are synthesised rather than reproduced, and how to report an error in it. |

## 3. Cross-cutting behaviour

- **Term linking is automatic and total.** At build time, a script walks the reader text and wraps the first occurrence of each glossary term *per section* (configurable: every occurrence) in a `<Term id>` component. Matching is case-insensitive, whole-word, and respects a `variants:` list in the glossary (plurals, abbreviations, symbols). Terms inside headings, code, equations and existing links are skipped.
- **Popovers, not page jumps**, for the first look at anything (term, symbol, citation); the full page is one more click. Popovers are keyboard-reachable (Enter/Space open, Esc closes, focus returns).
- **Concept links inside popovers**: a term whose glossary entry has `concept:` shows "Learn the concept → 101".
- **URL-addressable state**: reader section, open figure, glossary anchor and figure controls live in the URL so any view can be shared.
- **Dark mode** (class strategy, respects system, persisted), **reduced-motion** respected, **375 px** layout works, **Lighthouse Accessibility 100** on the reader and one figure page.
- **No runtime fetches** of scientific content. Everything is in the built bundle or `public/`. External links open in new tabs.
- **Print stylesheet** for the reader (notes optionally appended).

## 4. Figures

For each figure in the content pack:

- `kind: chart` with `data:` → rebuilt as an interactive chart (Recharts or D3 — see DESIGN-SYSTEM): hover tooltips with exact values, legend toggles, axis units, optional log/linear switch, download PNG/CSV. Any derived quantity shown (error bar meaning, normalisation, statistical test) has a ⓘ popover written from the content pack's `explain:` block; each maths concept links to its 101.
- `kind: network` / `kind: pathway` → force-directed or fixed-layout SVG with node/edge hover cards and highlight-on-select.
- `kind: image` → the original figure image with **hotspots** (`hotspots:` in the pack: x/y/w/h % + text) and a caption; used when no data is available.
- `kind: table` → sortable, filterable table with column header popovers.
- Every figure page also lists "Concepts in this figure" (links to 101s/glossary) and "Where it is discussed" (links to reader sections).

### 4.1 The graph lab — `/graph` (packs with `claims.yaml`)

The lab makes the review's mechanism claims explorable as a graph and hands them to the reader's own database. It renders **only** `claims.yaml`; it never adds nodes or edges.

- **Explore.** Clickable, Neo4j-Browser-style canvas. Filters: volume, level, node type, predicate, evidence, species, status. Presets: "drive → outcome" (every path from a chosen `ExogenousDrive` to a chosen `Outcome`), "one level", "contested only". Node and edge cards show label, type, xref (linked), the claim's references as fold-out cards, the section that argues it (link into `/read/:volume`) and parameters as published. Contested edges are dashed and open their hypothesis group with the rivals side by side; inferred edges carry the synthesis marker.
- **Analyse in the browser.** Degree, PageRank, betweenness, connected components, Louvain communities with a resolution control, shortest and bounded all-simple paths between two nodes, and "what else rests on these references". Results appear as a sortable table and can highlight the canvas. The library (graphology + sigma.js, cytoscape.js or similar) is the build's call, recorded in the README, and must run client-side on the full claim set.
- **Export.** Generated at build time into `public/graph/`: `claims.cypher` (uniqueness constraints plus idempotent `MERGE`; every relationship carries `claim_id`, `refs`, `status`, `evidence`, `level`, `species`, `section`), `nodes.csv` + `edges.csv` with `neo4j-admin import` headers, `claims.graphml`, `claims.json`. The current filtered view exports the same ways.
- **Connect to my Neo4j — optional, closed by default.** A panel the reader opens deliberately. It connects *from the reader's browser* to an endpoint the reader types (default `neo4j://localhost:7687`) with the official JavaScript driver. Credentials live in memory for that tab only — never stored, logged or sent elsewhere; nothing is committed. Three actions only: *Test connection*; *Load this atlas* (shows node/edge counts, asks for confirmation, runs `claims.cypher` in one transaction); *Run a read query* (read-access session; results as a table and on the canvas). There is no write-query box. The panel says plainly that some browsers block a public HTTPS page from reaching a local database and always offers the Cypher download as the fallback. A `pages` build contacts no database on its own.

## 5. References

Each reference in the pack carries: full citation, DOI/URL, `summary:` (3–6 sentences of what the cited work found), `role_here:` (why *this* paper cites it — support, method source, contrast, prior result), and `cited_in:` (section ids). In the reader, clicking `[n]` folds out a card directly under the paragraph with summary + role; the card links to `/references#ref-n`. Missing summaries render as an amber "summary pending" — never invented.

## 6. Provenance rules (bind Claude Code)

1. The **content pack is the only source of scientific content**. Claude Code may restructure, link and render it; it may not add facts, definitions, or reference summaries. Gaps become `TODO(author)` markers surfaced on `/methods`.
2. Manuscript text is reproduced **verbatim** from `manuscript.md` (light typographic normalisation allowed). No paraphrase in the reader. In `mode: topic` the same rule applies to `review.md`: the builder's text is rendered as written, never rephrased at build time.
3. Every figure states whether it is *rebuilt from data* or the *original image* — and in `mode: topic`, whether it is *synthesised from data across cited works* or a *conceptual diagram*, with the contributing reference numbers shown on the figure page.
4. A `provenance.json` is written at build time listing counts: terms linked, terms unmatched, references with/without summaries, figures by kind, `TODO(author)` count.

### 6.1 Additional rules under `mode: topic`

5. **The content build fails on uncited prose.** Any block of ≥ 25 words in `review.md` with no `[n]` and no preceding `<!-- framing -->` marker is a build error, listed in `BUILD-ERRORS.md` and surfaced on `/methods`. Claude Code does not repair it by adding a citation — that would be inventing provenance.
6. **`<!-- synthesis -->` blocks are rendered with a visible, quiet marker** in the reader (a left rule and a "synthesis" label, not an alarm), each linked from `/methods`. A reader must always be able to tell the builder's inference from a cited result.
7. **No claim may rest on a `verified: false` reference.** If a citation resolves to an unverified entry, the build flags it on `/methods` in amber and the reference card says "not verified — summary from abstract/metadata only".
8. `provenance.json` gains, in topic mode: total blocks, cited blocks, framing blocks, synthesis blocks, references by tier, unverified-but-cited count, figures by `synthesis` kind, and the `as_of` date.
9. **The `as_of` date is shown on `/`, `/read` and `/about`.** An app that does not say how old its sweep is may not ship.

## 7. Engineering bar (inherited from Bioactive Explorer)

Vite + React 18 + TypeScript strict + Tailwind; static `dist/`; `BASE_PATH` for GitHub Pages; Vitest unit tests for the term-linker, pack schema and figure data; Playwright smoke over every route + dark mode + 375 px; GitHub Actions deploy workflow; README with quick start and "editing the content pack". Details in [[manuscript-interrogator/docs/DESIGN-SYSTEM|DESIGN-SYSTEM]].

## 8. Acceptance checklist

- [ ] Every route in §2 exists and is linked from the header nav.
- [ ] Reader reproduces the manuscript verbatim; sections match the pack's `sections[]`.
- [ ] ≥ 95 % of glossary terms that occur in the text are linked (`provenance.json`); the rest are listed on `/methods`.
- [ ] Every glossary entry is reachable from the reader; every 101 is reachable from at least one term or figure.
- [ ] Every citation `[n]` opens a fold-out; every reference with a summary shows it; none are invented.
- [ ] Every figure in the pack has a page; `chart`/`table` kinds are interactive with value tooltips; maths popovers present where `explain:` was supplied.
- [ ] Notepad: write → reload → note persists; export produces valid Markdown; works on mobile drawer.
- [ ] Dark mode, reduced motion, 375 px, keyboard-only navigation of a popover and the notepad.
- [ ] Lighthouse Accessibility 100 on `/read` and one `/figures/:id`; Performance ≥ 90.
- [ ] `npm test` and `npm run test:e2e` green in CI; site live on GitHub Pages under `danieladamek`.
- [ ] `/methods` shows the provenance counts and all `TODO(author)` markers.
- [ ] Scrum note written per the vault `CLAUDE.md` contract.

### Additional, under `mode: topic`

- [ ] `/read` carries the commissioned-review banner; `as_of` appears on `/`, `/read` and `/about`.
- [ ] Zero uncited blocks in the build output; framing and synthesis counts reported on `/methods`.
- [ ] Every `synthesis` passage is visibly marked in the reader and linked from `/methods`.
- [ ] `/references` groups by tier (including Classic), sorts by year, shows `why_it_mattered` on seminal entries, marks anchors.
- [ ] `/methods` publishes the scope (in and out), the interview, every query with its hit count, and the corpus profile.
- [ ] Every figure page names the references it was synthesised from and whether it is data or conceptual.
- [ ] Nowhere does the app imply peer review.

### Additional, for volume apps and packs with `claims.yaml`

- [ ] `/read` lists every volume with status and `as_of`; `/read/:volume` works for every `ready` volume; planned volumes show as coming.
- [ ] Notes keyed to prefixed section ids survive a rebuild that adds a volume (Playwright).
- [ ] With `concept_levels`, every 101 switches L1–L4 and the choice persists.
- [ ] `/graph` renders every claim; filters, the drive → outcome preset, contested and inferred styling work; the analytics are unit-tested on a fixture graph with known PageRank and path answers.
- [ ] `public/graph/` holds `claims.cypher`, `nodes.csv`, `edges.csv`, `claims.graphml`, `claims.json`; a test loads `claims.cypher` into a throwaway Neo4j when one is available, and otherwise parses it.
- [ ] The Neo4j panel is closed by default, stores no credentials (test inspects storage), offers no write query, and shows the download fallback.

## History

- v0.1 (2026-09-14) — first draft: routes, cross-cutting behaviour, figures, references, provenance, engineering bar, acceptance checklist. Pilot (Thyroid Markers Explorer) accepted against it.
- v0.2 (2026-09-14) — **topic mode** (§1.1): `/read` may be a commissioned review; `/`, `/references`, `/methods` and `/about` gain mode-conditional duties; §6.1 adds the citation-coverage build failure, synthesis marking, unverified-reference handling and the `as_of` requirement; §8 gains seven topic-mode acceptance items. Manuscript-mode behaviour is untouched.
- v0.3 (2026-09-15) — **volume apps and the graph lab.** §1.2 volume apps (`/read` index, `/read/:volume`, per-volume `as_of`, L1–L4 concept switch); `/graph` route and §4.1 (claims-only graph, in-browser analytics, Cypher/CSV/GraphML/JSON exports, reader-opened Neo4j panel that stores nothing and cannot write except the confirmed atlas load); acceptance items. Single-review apps are untouched.
