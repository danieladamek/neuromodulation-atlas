---
type: spec
project: manuscript-interrogator
version: 0.4
---

# KICKOFF-TEMPLATE — the single-shot prompt for Claude Code

**Version 0.4 · 2026-09-15.** Serves both intake modes — `manuscript` (a paper Daniel hands over) and `topic` (a commissioned review the builder wrote from a scoped sweep). The Cowork project copies everything between the `═══` rules into `KICKOFF.md` at the root of the new app repo, fills the `{{…}}` slots, and hands Daniel the one-line launch command. Text outside the rules is guidance for the Cowork project, not part of the prompt.

**Launch (Daniel, terminal, in the new empty repo folder):**

```bash
cd ~/Allofit/Projects/manuscript-interrogator/apps/{{slug}} && claude "Read KICKOFF.md and do exactly what it says."
```

(Equivalent: open `manuscript-interrogator/apps/{{slug}}` in the Claude desktop app's Code mode, local environment, and paste the same sentence.)

Prerequisites the Cowork project checks before handing over: `{{mode}}` is set from `manifest.mode` and the mode-conditional passages below are resolved (keep the matching one, delete the other); `apps/{{slug}}/content-pack/` is complete (CONTENT-PACK definition of done, including the topic-mode additions when `{{mode}}` is `topic`) and `python3 ../../tools/validate_pack.py content-pack` passes; `docs/APP-SPEC.md`, `docs/DESIGN-SYSTEM.md`, `docs/CONTENT-PACK.md` (plus `docs/TOPIC-WORKFLOW.md` when `{{mode}}` is `topic`) are copied into `apps/{{slug}}/docs/` (frozen at the builder version); the app hub `🚀 <Short title> Explorer.md` and `notes/Scrums/` exist in the app folder; `manifest.delivery` is set (`local` or `pages`) from Daniel's intake answer, and **only under `delivery: pages`**, `gh auth status` shows `{{github_account}}`. Instantiate §6 by keeping only the branch that matches `{{delivery}}` and deleting the other.

═══════════════════════════════════════════════════════════════

# KICKOFF — {{title}}

You are building **{{short_title}} Explorer**, a static web app that is an interactive textbook-and-journal deep dive on one body of scientific work. You are the build-and-delivery role; the scientific content has already been researched and sits in `content-pack/`.

**Content mode: `{{mode}}`.** Read `content-pack/manifest.yaml` first and confirm it matches.

- `manuscript` — the reader's body is `manuscript.md`, one published paper, **verbatim**.
- `topic` — the reader's body is `review.md`, a **commissioned review written by the builder** from a scoped literature sweep. `content-pack/scope.yaml` holds the scoping interview and the search strategy, and it is *published content*, not metadata: `/methods` renders it. The review's promise is traceability, so the citation rules in §1 are hard build gates, not warnings. This is a single-shot build: work through every section below, in order, without stopping for confirmation, and finish with the §6 ship step for this app's delivery mode and the scrum note.

## 0. Ground truth — read these first, in this order

1. `docs/APP-SPEC.md` — what the app must be. Normative. §6 (provenance) and §8 (acceptance) bind you.
2. `docs/DESIGN-SYSTEM.md` — stack, tokens, component classes, layout patterns, engineering bar. Copy the classes verbatim.
3. `docs/CONTENT-PACK.md` — the schema of what's in `content-pack/`.
4. `content-pack/manifest.yaml`, then skim the body (`manuscript.md`, or `review.md` + `scope.yaml` under `mode: topic`), `glossary.yaml`, `concepts/`, `figures.yaml`, `references.yaml`, `todo.yaml`.
   Under `mode: topic`, also read `docs/TOPIC-WORKFLOW.md` §T4 ("The rules that hold the review up") — it is what the pack was written against and what the app must not undermine.
5. The contracts: `../../../CLAUDE.md` (vault) and `../../CLAUDE.md` (this team — nested-app rules). Your work queue for this run is this file. **This app is nested inside the `manuscript-interrogator` team**: your scrum note goes in *this folder's* `notes/Scrums/YYMMDD.md` with frontmatter `project: manuscript-interrogator` and `app: {{slug}}` (not the folder name); backlog items for this app live in `../../notes/Backlog/` with an `app: {{slug}}` key — set the K0 item there to `inreview` when done.

Reference implementation you may mine for patterns (do **not** copy its data): `../../../CountChocula/` — Bioactive Explorer, same stack and design system. Its `Layout.tsx`, `index.css`, `tailwind.config.js`, `lib/theme.tsx`, `pages/Glossary.tsx`, `pages/Sources.tsx`, `components/InfographicFrame.tsx`, `components/CompoundDrawer.tsx`, `scripts/build-data.py`, `tests/` and `.github/workflows/deploy.yml` are the closest kin to what you're building.

## 1. Hard rules

- **Never invent scientific content.** Definitions, summaries, explanations, data — all come from `content-pack/`. If something is missing, render an amber `TODO(author)` marker (`.bx-todo`) and list it on `/methods`. Do not fill gaps from your own knowledge.
- **Body text is rendered as written.** Structure it, link it, render its maths — never rewrite or paraphrase it. In `manuscript` mode it is someone else's paper; in `topic` mode it is the builder's reviewed prose. Neither is yours to edit.
- **`mode: topic` only — uncited prose fails the build.** Any block of ≥ 25 words in `review.md` with no `[n]` and no `<!-- framing -->` marker immediately before it is a content-build error (APP-SPEC §6.1). List it in `BUILD-ERRORS.md` and surface it on `/methods`. **Do not fix it by adding a citation** — inventing provenance is worse than shipping the error.
- **`mode: topic` only — `<!-- synthesis -->` blocks stay visible.** Render them with a quiet left rule and a "synthesis" label, give each an id, and link every one from `/methods`. Never strip the marker.
- **`mode: topic` only — nothing implies peer review.** `manifest.venue` says what it is; `as_of` appears on `/`, `/read` and `/about`.
- **No runtime fetches** of content. Everything ships in `dist/`.
- **Fail loudly in the content build.** Schema violation, unresolved `[n]`, unknown term/concept id, missing data file, ambiguous term variant → non-zero exit with a clear list. Do not "fix" the pack silently; if the pack is wrong, stop the content build, write the exact errors to `content-pack/BUILD-ERRORS.md`, and continue building the app with whatever validated (the errors also surface on `/methods`).
- **Delivery mode is `{{delivery}}`** and it is not yours to change. Under `local`, nothing is pushed anywhere and no remote is created — see §6a. Under `pages`, the app ends up public — see §6b. If this slot is empty or ambiguous, treat it as `local`.
- **GitHub identity:** `{{github_account}}`. Verify with `gh auth status` before any push. Under `delivery: local` there is no push, so this check does not apply.
- Vault contract: don't touch anything outside this folder except the K0 item's `state` in `../../notes/Backlog/`; leave a scrum note at `notes/Scrums/YYMMDD.md` in the exact format from `../../../CLAUDE.md` (with the `app:` key above).

## 2. Scaffold

Vite + React 18 + TypeScript (strict) + Tailwind 3, `react-router-dom` 6, `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`, `katex`, `recharts`, `d3` (only the sub-packages you use), `@floating-ui/react`, `zod`, `js-yaml`, `papaparse`; dev: `vitest`, `jsdom`, `@playwright/test`. Repo layout per DESIGN-SYSTEM §7. `BASE_PATH` support and `404.html` fallback as in Bioactive Explorer. `README.md` with quick start, the content-pack editing loop, and provenance notes.

## 3. Content build — `scripts/build-content.ts` (`npm run build:content`)

1. Load and validate every pack file against zod schemas that mirror `docs/CONTENT-PACK.md`.
2. Parse the body — `manuscript.md`, or `review.md` under `mode: topic` — into `sections[]` (id, title, depth, markdown), resolving `<!-- figure: id -->` markers into figure slots and `[n]` into citation tokens. Under `mode: topic`, also parse `<!-- framing -->` and `<!-- synthesis -->` block markers, run the citation-coverage check (§1), and load `scope.yaml` for `/methods`.
3. **Term linking:** build a matcher from `glossary[].term` + `variants` (whole word, case-insensitive, longest match wins, skip headings/code/math/links/existing terms). Wrap the first occurrence per section (`manifest.link_every_occurrence: true` → all). Emit per-term `appears_in` and per-section `terms`.
4. Load figure data (CSV/JSON) and validate the declared fields exist.
5. Emit `src/data/{manifest,sections,glossary,concepts,figures,references}.json` (plus `scope.json` under `mode: topic`), `public/provenance.json` (counts: terms total/linked/unmatched, refs total/with-summary, figures by kind, todo count, ambiguous variants — and under `mode: topic`: blocks total/cited/framing/synthesis, refs by tier, unverified-but-cited, figures by `synthesis` kind, `as_of`), and copy `content-pack/figures/images/*` → `public/figures/`.
6. Idempotent: only rewrite outputs whose content changed; print a summary table at the end.

## 4. App — build every route in APP-SPEC §2

Implement, in this order so each step is testable: Layout + theme + header/footer → `/read` reader with section rail and `<Term>` popovers → citation fold-outs → notepad (localStorage keyed by `manifest.slug`, export/import `.md`, anchored quotes) → `/glossary` → `/concepts`, `/concepts/:id` (render `concepts/*.md`, KaTeX, self-check quiz component — reuse Bioactive Explorer's tour quiz pattern) → `/figures`, `/figures/:id` (one component per `kind`; charts via Recharts with value tooltips, legend toggles, PNG/CSV download; `network`/`pathway` via d3-force SVG; `image` with hotspots; `table` sortable/filterable; ⓘ popovers from `explain[]`) → `/references` (under `mode: topic`: grouped by tier, sorted by year within tier, filterable, `why_it_mattered` on seminal cards, anchors marked) → `/methods` (provenance + TODO list + BUILD-ERRORS if any; under `mode: topic` this route also publishes the scope in *and* out, the interview, every query with hit counts, the corpus profile, and a link to every synthesis passage — APP-SPEC §2) → `/about` → `NotFound`. Wire ⌘K search over terms, concepts, figures, sections.

Palette for the paper's categories: `manifest.palette` → Tailwind `cat.*`. Header wordmark: **{{short_title}}** *Explorer*. Under `mode: topic`, `/` and `/read` also carry the commissioned-review badge and the `as_of` date ({{as_of}}).

## 4a. Volume apps and the graph lab — only when the pack has `volumes:` and/or `claims.yaml`

This run is volume **{{volume}}** ({{volume_title}}). {{volume_run}}

- **Content build.** Read `manifest.volumes`; parse every `status: ready` volume's `volumes/<id>/review.md` with the same rules as `review.md` (section ids already carry the volume prefix — reject any that don't). Emit `sections.json` grouped by volume, `volumes.json` (id, title, status, word count, `as_of`), and per-volume topic provenance counts. Validate `claims.yaml` against its own `vocabulary` and against the references, glossary and sections (CONTENT-PACK v0.4 §claims). Emit `src/data/claims.json` and generate `public/graph/claims.cypher`, `nodes.csv`, `edges.csv`, `claims.graphml` and `claims.json` from it — deterministic output, so a rebuild with no pack change leaves them byte-identical.
- **Routes.** `/read` is the volume index and `/read/:volume` the reader (APP-SPEC §1.2). Keep the old `/read#section` links working by redirecting to the owning volume. `/concepts/:id` gets the L1–L4 switch when `manifest.concept_levels` is true. `/graph` implements APP-SPEC §4.1 exactly: claims-only canvas, filters and presets, contested/inferred styling, client-side analytics, exports, and the reader-opened Neo4j panel (`neo4j-driver`, in-memory credentials, test/load/read-only actions, download fallback). Code-split `/graph` and the driver so `/read` stays under the Lighthouse bar.
- **Tests (in addition to §5).** Volume index and every ready volume render; a note written in V0 survives a content rebuild that adds a fixture volume; claims schema fixture fails on each rule; analytics give known answers on a 10-node fixture (PageRank ordering, a shortest path, component count); the Cypher export parses (and loads, if `NEO4J_TEST_URL` is set); Playwright opens the Neo4j panel, confirms nothing is written to `localStorage`/`sessionStorage`/cookies, and that no write-query control exists.
- **Later volumes.** Do not rescaffold. Pull, add the volume's content, re-run the content build and the full test suite, check that no existing section id, term id, concept id, figure id, claim id or reference number changed (fail if one did), then ship per §6.

## 5. Tests

- Vitest: pack schemas (a fixture pack with one deliberate error per rule must fail with the right message), term matcher (variants, boundaries, skip zones, longest match), section/citation parser, figure data field validation, notepad reducer.
- Playwright (serves `dist/` on :4173): every route 200 and renders its h1; open a term popover by keyboard and close with Esc; open a citation fold-out; notepad write → reload → persists → export downloads `.md`; dark mode toggle persists; 375 px viewport for `/read` and one figure; one chart tooltip appears on hover.
- Lighthouse on `/read` and `/figures/{{first_figure_id}}`: Accessibility 100, Performance ≥ 90 (code-split KaTeX and chart libs per route if needed).

## 6. Ship — delivery mode: **{{delivery}}**

Both modes do these three first:

1. `git init` (if needed), `.gitignore` (node_modules, dist, test-results, `scripts/.cache`), first commit.
2. Exclude `notes/`, `source/` and the `🚀` hub note via `.git/info/exclude` (vault precedent), and say so in the scrum note.
3. `npm run build` with **no `BASE_PATH`** (base `/`), then `npm run preview` — confirm http://localhost:4173/ serves the root, one deep link, and one figure asset. Stop the server before moving on. This is the same production bundle in both modes; a local build is not a lesser build.

Then run **only the branch matching `{{delivery}}`**. The Cowork project normally leaves just that branch in this file; if both are here, run the one the slot names and say which in the scrum note.

### 6a. `delivery: local` — no remote, nothing public

- Do **not** run `gh repo create`, add a remote, push, or write `.github/workflows/deploy.yml`. The repo stays on Daniel's disk.
- Keep `BASE_PATH` support and the `404.html` fallback in the code (§2). They cost nothing here and are what makes promotion a one-liner later.
- `README.md` quick start is the local one: `npm install` → `npm run build:content` → `npm run dev` (http://localhost:5173) for editing, `npm run build && npm run preview` (http://localhost:4173) for the production bundle. Add the promotion recipe from §6b under a **"Publishing this later"** heading so no one has to re-derive it.
- If `permissions.text` is unknown, that is not a blocker here — but record it in the scrum note and on `/methods` as the thing that must be resolved before this app is ever published.
- The scrum note reports **no live URL**. It reports the commit SHA and the two local commands instead.

### 6b. `delivery: pages` — public repo and live site

1. `content-pack/manifest.yaml` must have a real, non-empty `permissions.text`. If it is empty or reads "unknown", **stop and say so** — a local build is fine without it, a public one is not. Under `mode: topic` it must also state the quotation rule (≤ 25 words, attributed); a topic app that reproduces long passages of someone else's text does not go public.
2. `gh auth status` must show `{{github_account}}`. If it doesn't, stop; never push to another account.
3. `gh repo create {{github_account}}/{{slug}} --public --source . --push`.
4. `.github/workflows/deploy.yml`: `npm ci → npm test → npm run build:content → npm run build` (with `BASE_PATH=/{{slug}}/`) → copy `dist/index.html` → `dist/404.html` → `actions/deploy-pages`. Enable Pages with `build_type: workflow` via `gh api`. Verify the live root, one deep link, and a figure asset.

**Promoting a local app to Pages later** — run steps 1–4 above in the app folder, nothing else. No source change is needed; `BASE_PATH` and `404.html` are already wired, and the git history is already there.

## 7. Report

Write `notes/Scrums/YYMMDD.md` (format from `../../../CLAUDE.md`, `project: manuscript-interrogator`, `app: {{slug}}`): what landed, the live URL, the provenance counts, every `TODO(author)` and build error, and what you'd pick up next. Then walk APP-SPEC §8 and append a checked/unchecked copy of it under **✅ Done**. Anything unchecked is a **▶️ Next** item, not a blocker, unless it needs Daniel.

═══════════════════════════════════════════════════════════════

## Slot reference

| Slot | Source |
|---|---|
| `{{title}}`, `{{short_title}}`, `{{slug}}`, `{{github_account}}` | `content-pack/manifest.yaml` |
| `{{first_figure_id}}` | first `chart`-kind id in `figures.yaml` (fallback: first figure) |
| `{{delivery}}` | `content-pack/manifest.yaml` → `delivery:` (`local` \| `pages`), from Daniel's Phase 0 answer. Empty ⇒ `local`. |
| `{{mode}}` | `content-pack/manifest.yaml` → `mode:` (`manuscript` \| `topic`). Empty ⇒ `manuscript`. Decides which mode-conditional passages survive instantiation. |
| `{{volume}}`, `{{volume_title}}` | the `manifest.volumes` entry this KICKOFF ships. Delete §4a entirely for a single-review pack with no `claims.yaml`. |
| `{{volume_run}}` | "This is the first volume: build the whole app." — or — "The app already exists: extend it (last bullet of this section)." |
| `{{as_of}}` | `content-pack/manifest.yaml` → `as_of:` (topic mode only — the date the sweep closed). |

## Versioning

The template version is stamped into `manifest.builder.version`. When a pilot review changes APP-SPEC, DESIGN-SYSTEM or this template, bump all three together (v0.2 …) and note the change in this file's history below.

## History

- v0.4 (2026-09-15) — **volume apps and the graph lab.** New §4a (volume content build, `/read/:volume`, L1–L4 switch, `/graph` with exports and the reader-opened Neo4j panel, extra tests, the extend-don't-rescaffold rule for later volumes) and `{{volume}}`/`{{volume_title}}`/`{{volume_run}}` slots. Pairs with APP-SPEC v0.3, CONTENT-PACK v0.4, TOPIC-WORKFLOW v0.2. Nothing changes for single-review packs.

- v0.1 (2026-09-14) — first draft, derived from the Bioactive Explorer kickoff pattern (data file → validating build script → static app → tests → Pages). **Pilot run (Thyroid Markers Explorer) succeeded single-shot: all §8 items checked, Lighthouse 100/92.**
- v0.1.1 (2026-09-14) — apps now live at `manuscript-interrogator/apps/<slug>/`; relative paths, scrum frontmatter (`project: manuscript-interrogator` + `app:`), single builder backlog. Launch line updated. No change to the build instructions.
- v0.3 (2026-09-14) — **topic mode.** New `{{mode}}` and `{{as_of}}` slots; §0 reads `review.md` + `scope.yaml`; §1 adds three hard gates (uncited prose fails the build, synthesis markers stay visible, nothing implies peer review); §3 parses block markers and emits `scope.json` + topic provenance counts; §4 gains tiered references and the expanded `/methods`; §6b adds the quotation rule to the public-build gate. Pairs with APP-SPEC v0.2, CONTENT-PACK v0.3, DESIGN-SYSTEM v0.2 (§3.1 topic components) and TOPIC-WORKFLOW v0.1. Manuscript-mode instructions unchanged.
- v0.2 (2026-09-14) — **delivery modes.** §6 branches on the new `{{delivery}}` slot: `local` (git init, no remote, no Pages workflow — the app is viewed with `npm run dev` / `npm run preview`) or `pages` (the v0.1 path). Both build and test the production bundle identically. Default is `local`; the question is asked at intake (BUILDER-WORKFLOW v0.2 Phase 0). `permissions.text` is a hard gate only under `pages`. APP-SPEC and DESIGN-SYSTEM unchanged at v0.1.
