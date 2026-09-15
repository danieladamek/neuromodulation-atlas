# KICKOFF — Neuromodulation: an atlas of exogenous drives, from coupling to outcome

You are building **Neuromodulation Explorer**, a static web app that is an interactive textbook-and-journal deep dive on one body of scientific work. You are the build-and-delivery role; the scientific content has already been researched and sits in `content-pack/`.

**Content mode: `topic`.** Read `content-pack/manifest.yaml` first and confirm it matches.

The reader's body is a **commissioned review written by the builder** from a scoped literature sweep. It arrives in volumes, and this run's body is `content-pack/volumes/v0/review.md`. `content-pack/scope.yaml` holds the scoping interview and the search strategy, and it is *published content*, not metadata: `/methods` renders it. The review's promise is traceability, so the citation rules in §1 are hard build gates, not warnings. This is a single-shot build: work through every section below, in order, without stopping for confirmation, and finish with the §6 ship step (delivery `pages`) and the scrum note.

## What is in this pack

These numbers describe the pack as handed over. If what you find differs, the pack has changed since this file was written. Say so in the scrum note, and do not edit the pack to match.

- **Volumes.** `manifest.volumes` declares `v0` (Foundations) as `ready` and `v1` (Vagus and cranial nerve stimulation) as `planned`. So `/read` must render a volume index with one ready volume and one volume marked as coming.
- **Body.** `volumes/v0/review.md` has 16 sections and about 30,350 words. Its section ids already carry the `v0-` prefix.
- **References.** `references.yaml` has 263 entries: 36 seminal, 38 classic, 117 current and 72 background. 260 are verified. The three unverified entries (7, 191, 224) are not cited today; if a citation ever resolves to one, APP-SPEC §6.1 rule 7 applies.
- **Glossary.** `glossary.yaml` has 300 terms.
- **Concepts.** `concepts/` has 18 pages. `manifest.concept_levels` is `true`, so every page carries four level sections, headed `## L1 — Intuition`, `## L2 — Undergraduate`, `## L3 — Graduate` and `## L4 — Expert`, next to `## What it is` and `## How this volume uses it`. The L1–L4 switch in §4a is built on those headings.
- **Figures.** `figures.yaml` has nine figures.
  - Five are conceptual networks or pathways (`synthesis: conceptual`): `fig1` (pathway), `fig4`, `fig5`, `fig7` and `fig9` (network).
  - Four are data figures (`synthesis: data`): `fig2` and `fig6` (table), `fig3` and `fig8` (chart).
  - Each figure's data file is in `figures/data/`.
- **Claims.** `claims.yaml` has three blocks:
  - `vocabulary`: node types, predicates, levels and evidence classes.
  - `hypotheses`: 25 hypothesis groups with 57 rival positions between them.
  - `claims`: 458 claims, of which 274 are `supported`, 65 `inferred` and 119 `contested`.
- **Palette.** `manifest.palette.groups` has two hues, `device` and `drug`.

**The pack validates today.** From this folder, `python3 ../../tools/validate_pack.py content-pack` reports **0 errors** (plus warnings, which are not errors). It also reports one glossary term, `curie`, as unmatched in the text; list that term on `/methods` as §8 requires. The build must keep the pack at 0 errors and must **fail loudly rather than repair the pack**. Never edit `content-pack/` to make a check pass. Re-run the validator before you ship, and record its summary line in the scrum note.

**The graph lab is the reason this app exists for its reader.** `/graph` (APP-SPEC §4.1, §4a below) is not an add-on to the reader. Get these right:

- **Claims only.** It renders `claims.yaml` and nothing else. It never adds a node or an edge, and never derives one from the prose, the glossary or the figures.
- **Contested edges.** Every contested edge is dashed. Opening one opens its hypothesis group (the claim's `hypothesis` names a rival id, and the rival names its group). The card shows the group's question and **all of its rivals side by side**, each with its references.
- **Inferred edges.** These carry the synthesis marker.
- **Null results.** Nine claims record a null result: `finding` is the quoted string `'null-result'`, and a `finding_note` says what was not found. These edges must be **visibly marked as null results** on the canvas and in every card and table that shows the claim. They must never read as positive findings. Handle the value as a literal: do not coerce it, drop it, or let it fall through as truthy.
- **Neo4j panel.** It stores **no credentials**: they live in memory for the tab only and are never written to `localStorage`, `sessionStorage`, cookies or logs. It offers **no write query**. The only write it can make is the confirmed *Load this atlas* action, which runs `claims.cypher` in one transaction after showing counts and asking for confirmation.
- **Exports.** `public/graph/claims.cypher`, `nodes.csv`, `edges.csv`, `claims.graphml` and `claims.json` are **generated at build time** from `claims.yaml`, deterministically. They are never written by hand.

## 0. Ground truth — read these first, in this order

1. `docs/APP-SPEC.md` — what the app must be. Normative. §6 (provenance) and §8 (acceptance) bind you.
2. `docs/DESIGN-SYSTEM.md` — stack, tokens, component classes, layout patterns, engineering bar. Copy the classes verbatim.
3. `docs/CONTENT-PACK.md` — the schema of what's in `content-pack/`.
4. `content-pack/manifest.yaml`, then skim the body (`volumes/v0/review.md` + `scope.yaml`), `glossary.yaml`, `concepts/`, `figures.yaml`, `claims.yaml`, `references.yaml`, `todo.yaml`.
   Also read `docs/TOPIC-WORKFLOW.md` §T4 ("The rules that hold the review up"). It is what the pack was written against and what the app must not undermine.
5. The contracts: `../../../CLAUDE.md` (vault) and `../../CLAUDE.md` (this team — nested-app rules). Your work queue for this run is this file. **This app is nested inside the `manuscript-interrogator` team**: your scrum note goes in *this folder's* `notes/Scrums/YYMMDD.md` with frontmatter `project: manuscript-interrogator` and `app: neuromodulation-atlas` (not the folder name); backlog items for this app live in `../../notes/Backlog/` with an `app: neuromodulation-atlas` key — set the K0 item there to `inreview` when done.

Reference implementation you may mine for patterns (do **not** copy its data): `../../../CountChocula/` — Bioactive Explorer, same stack and design system. Its `Layout.tsx`, `index.css`, `tailwind.config.js`, `lib/theme.tsx`, `pages/Glossary.tsx`, `pages/Sources.tsx`, `components/InfographicFrame.tsx`, `components/CompoundDrawer.tsx`, `scripts/build-data.py`, `tests/` and `.github/workflows/deploy.yml` are the closest kin to what you're building.

## 1. Hard rules

- **Never invent scientific content.** Definitions, summaries, explanations, data — all come from `content-pack/`. If something is missing, render an amber `TODO(author)` marker (`.bx-todo`) and list it on `/methods`. Do not fill gaps from your own knowledge.
- **Body text is rendered as written.** Structure it, link it, render its maths — never rewrite or paraphrase it. It is the builder's reviewed prose, and it is not yours to edit.
- **Uncited prose fails the build.** Any block of ≥ 25 words in a volume's `review.md` with no `[n]` and no `<!-- framing -->` marker immediately before it is a content-build error (APP-SPEC §6.1). List it in `BUILD-ERRORS.md` and surface it on `/methods`. **Do not fix it by adding a citation** — inventing provenance is worse than shipping the error.
- **`<!-- synthesis -->` blocks stay visible.** Render them with a quiet left rule and a "synthesis" label, give each an id, and link every one from `/methods`. Never strip the marker.
- **Nothing implies peer review.** `manifest.venue` says what it is ("Commissioned review — not peer reviewed"); `as_of` appears on `/`, `/read` and `/about`.
- **No runtime fetches** of content. Everything ships in `dist/`. The reader-opened Neo4j panel (§4a) is not a content fetch. A `pages` build contacts no database on its own.
- **Fail loudly in the content build.** Schema violation, unresolved `[n]`, unknown term/concept id, missing data file, ambiguous term variant → non-zero exit with a clear list. Do not "fix" the pack silently; if the pack is wrong, stop the content build, write the exact errors to `content-pack/BUILD-ERRORS.md`, and continue building the app with whatever validated (the errors also surface on `/methods`). The pack enters this run at 0 validator errors; keep it there.
- **Delivery mode is `pages`** and it is not yours to change. The app ends up public — see §6.
- **GitHub identity:** `danieladamek`. Verify with `gh auth status` before any push.
- Vault contract: don't touch anything outside this folder except the K0 item's `state` in `../../notes/Backlog/`; leave a scrum note at `notes/Scrums/YYMMDD.md` in the exact format from `../../../CLAUDE.md` (with the `app:` key above).

## 2. Scaffold

Vite + React 18 + TypeScript (strict) + Tailwind 3, `react-router-dom` 6, `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`, `katex`, `recharts`, `d3` (only the sub-packages you use), `@floating-ui/react`, `zod`, `js-yaml`, `papaparse`, plus `neo4j-driver` and the graph library you choose for §4a; dev: `vitest`, `jsdom`, `@playwright/test`. Repo layout per DESIGN-SYSTEM §7. `BASE_PATH` support and `404.html` fallback as in Bioactive Explorer. `README.md` with quick start, the content-pack editing loop, provenance notes, and the graph library choice (APP-SPEC §4.1).

## 3. Content build — `scripts/build-content.ts` (`npm run build:content`)

1. Load and validate every pack file against zod schemas that mirror `docs/CONTENT-PACK.md`, including `claims.yaml` (§4a).
2. Parse the body of every `status: ready` volume — here, `volumes/v0/review.md` — into `sections[]` (id, title, depth, markdown), resolving `<!-- figure: id -->` markers into figure slots and `[n]` into citation tokens. Also parse `<!-- framing -->` and `<!-- synthesis -->` block markers, run the citation-coverage check (§1), and load `scope.yaml` for `/methods`.
3. **Term linking:** build a matcher from `glossary[].term` + `variants` (whole word, case-insensitive, longest match wins, skip headings/code/math/links/existing terms). Wrap the first occurrence per section (`manifest.link_every_occurrence: true` → all). Emit per-term `appears_in` and per-section `terms`.
4. Load figure data (CSV/JSON) from `figures/data/` and validate the declared fields exist.
5. Emit `src/data/{manifest,sections,glossary,concepts,figures,references}.json` plus `scope.json`, `public/provenance.json` (counts: terms total/linked/unmatched, refs total/with-summary, figures by kind, todo count, ambiguous variants, blocks total/cited/framing/synthesis, refs by tier, unverified-but-cited, figures by `synthesis` kind, `as_of`), and copy `content-pack/figures/images/*` → `public/figures/` if the pack has any. The volume and claims outputs are in §4a.
6. Idempotent: only rewrite outputs whose content changed; print a summary table at the end.

## 4. App — build every route in APP-SPEC §2

Implement, in this order so each step is testable: Layout + theme + header/footer → `/read` volume index and `/read/:volume` reader with section rail and `<Term>` popovers → citation fold-outs → notepad (localStorage keyed by `manifest.slug`, export/import `.md`, anchored quotes) → `/glossary` → `/concepts`, `/concepts/:id` (render `concepts/*.md`, KaTeX, the L1–L4 switch, self-check quiz component — reuse Bioactive Explorer's tour quiz pattern) → `/figures`, `/figures/:id` (one component per `kind`; charts via Recharts with value tooltips, legend toggles, PNG/CSV download; `network`/`pathway` via d3-force SVG; `table` sortable/filterable; ⓘ popovers from `explain[]`; each page says whether the figure is synthesised from data or conceptual and names its references) → `/references` (grouped by tier, sorted by year within tier, filterable, "cited in volume" filter, `why_it_mattered` on seminal cards, anchors marked) → `/graph` (§4a) → `/methods` (provenance + TODO list + BUILD-ERRORS if any; this route also publishes the scope in *and* out, the interview, every query with hit counts, the corpus profile, and a link to every synthesis passage — APP-SPEC §2 and §1.2) → `/about` → `NotFound`. Wire ⌘K search over terms, concepts, figures, sections.

Palette for the pack's categories: `manifest.palette` (`device`, `drug`) → Tailwind `cat.*`. Header wordmark: **Neuromodulation** *Explorer*. `/` and `/read` also carry the commissioned-review badge and the `as_of` date (2026-09-15).

## 4a. Volume apps and the graph lab

This run is volume **v0** (Foundations). This is the first volume: build the whole app.

- **Content build.** Read `manifest.volumes`; parse every `status: ready` volume's `volumes/<id>/review.md` with the same rules as `review.md` (section ids already carry the volume prefix — reject any that don't). Emit `sections.json` grouped by volume, `volumes.json` (id, title, status, word count, `as_of`), and per-volume topic provenance counts. Validate `claims.yaml` against its own `vocabulary` and against the references, glossary and sections (CONTENT-PACK v0.4 §claims). Emit `src/data/claims.json` and generate `public/graph/claims.cypher`, `nodes.csv`, `edges.csv`, `claims.graphml` and `claims.json` from it — deterministic output, so a rebuild with no pack change leaves them byte-identical.
- **Routes.** `/read` is the volume index and `/read/:volume` the reader (APP-SPEC §1.2). Here that index shows `v0` as ready and `v1` as coming. Keep the old `/read#section` links working by redirecting to the owning volume. `/concepts/:id` gets the L1–L4 switch, because `manifest.concept_levels` is true. `/graph` implements APP-SPEC §4.1 exactly: claims-only canvas, filters and presets, contested/inferred styling, client-side analytics, exports, and the reader-opened Neo4j panel (`neo4j-driver`, in-memory credentials, test/load/read-only actions, download fallback). Code-split `/graph` and the driver so `/read` stays under the Lighthouse bar.
- **The graph lab, restated.** Everything under "What is in this pack" about `/graph` binds here. The canvas holds the 458 claims and nothing else. A contested edge opens its hypothesis group with the rivals side by side. The nine `finding: 'null-result'` claims are marked as null results. The Neo4j panel stores no credentials and has no write-query control; its only write is the confirmed atlas load.
- **Tests (in addition to §5).** Volume index and every ready volume render; a note written in V0 survives a content rebuild that adds a fixture volume; claims schema fixture fails on each rule; analytics give known answers on a 10-node fixture (PageRank ordering, a shortest path, component count); the Cypher export parses (and loads, if `NEO4J_TEST_URL` is set); Playwright opens the Neo4j panel, confirms nothing is written to `localStorage`/`sessionStorage`/cookies, and that no write-query control exists.
- **Later volumes.** Not this run — this is for when `v1` becomes `ready`. Do not rescaffold. Pull, add the volume's content, re-run the content build and the full test suite, check that no existing section id, term id, concept id, figure id, claim id or reference number changed (fail if one did), then ship per §6.

## 5. Tests

- Vitest: pack schemas (a fixture pack with one deliberate error per rule must fail with the right message), term matcher (variants, boundaries, skip zones, longest match), section/citation parser, figure data field validation, notepad reducer.
- Playwright (serves `dist/` on :4173): every route 200 and renders its h1; open a term popover by keyboard and close with Esc; open a citation fold-out; notepad write → reload → persists → export downloads `.md`; dark mode toggle persists; 375 px viewport for `/read` and one figure; one chart tooltip appears on hover.
- Lighthouse on `/read` and `/figures/fig3`: Accessibility 100, Performance ≥ 90 (code-split KaTeX and chart libs per route if needed).
- Before shipping, `python3 ../../tools/validate_pack.py content-pack` still reports 0 errors.

## 6. Ship — delivery mode: **pages**

Do these three first:

1. `git init` (if needed), `.gitignore` (node_modules, dist, test-results, `scripts/.cache`), first commit.
2. Exclude `notes/`, `source/` and the `🚀` hub note via `.git/info/exclude` (vault precedent), and say so in the scrum note.
3. `npm run build` with **no `BASE_PATH`** (base `/`), then `npm run preview` — confirm http://localhost:4173/ serves the root, one deep link, and one figure asset. Stop the server before moving on. This is the same production bundle that goes public.

Then publish:

1. `content-pack/manifest.yaml` must have a real, non-empty `permissions.text`. If it is empty or reads "unknown", **stop and say so**. It must also state the quotation rule (≤ 25 words, attributed); a topic app that reproduces long passages of someone else's text does not go public. (As handed over, it does.)
2. `gh auth status` must show `danieladamek`. If it doesn't, stop; never push to another account.
3. `gh repo create danieladamek/neuromodulation-atlas --public --source . --push`.
4. `.github/workflows/deploy.yml`: `npm ci → npm test → npm run build:content → npm run build` (with `BASE_PATH=/neuromodulation-atlas/`) → copy `dist/index.html` → `dist/404.html` → `actions/deploy-pages`. Enable Pages with `build_type: workflow` via `gh api`. Verify the live root, one deep link, a figure asset, and one file under `graph/`.

## 7. Report

Write `notes/Scrums/YYMMDD.md` (format from `../../../CLAUDE.md`, `project: manuscript-interrogator`, `app: neuromodulation-atlas`): what landed, the live URL, the provenance counts, the validator summary line, every `TODO(author)` and build error, and what you'd pick up next. Then walk APP-SPEC §8, including the topic-mode and volume/`claims.yaml` blocks, and append a checked/unchecked copy of it under **✅ Done**. Anything unchecked is a **▶️ Next** item, not a blocker, unless it needs Daniel.
