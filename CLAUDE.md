# neuromodulation-atlas — Claude Code contract for this folder

This folder is the **Neuromodulation Atlas** team: a volumed textbook-and-journal web app plus a claims graph, live at https://danieladamek.github.io/neuromodulation-atlas/ (repo `danieladamek/neuromodulation-atlas`). The vault-root `../CLAUDE.md` contract applies (backlog → build → scrum note). The Cowork project **Deconvolver** is Product Owner and owns the science; you own build and delivery; Daniel decides.

The app was built by the Manuscript Interrogator builder and promoted to its own team on 2026-09-19. The nested-app rules in `manuscript-interrogator/CLAUDE.md`, and the `../../` paths in `KICKOFF.md`, no longer apply. `KICKOFF.md` is a historical record of the V0 build — don't follow it as a work order.

## What you may and may not touch

- **Yours:** `src/`, `scripts/`, `tests/`, `public/`, `index.html`, configs, `package*.json`, `.github/`, `README.md`, the Neo4j workbench infrastructure in `graph/` (compose file, loaders, query runner, `graph/results/`), and the generated outputs of the content build (`src/data/*`, `public/provenance.json`, `public/graph/*`).
- **Read-only — never edit:** `content-pack/` (the only source of scientific content), `docs/` (the atlas's normative schema), `tools/` (the pack validator), `notes/` (except as below), `🚀 Neuromodulation Atlas.md`.
  - **`graph/queries/` is Deconvolver's:** each query encodes a research question. You may fix a query's syntax, and must say so in your scrum note, but never change what it asks.
- **Exception — `notes/`:** you may set the `state` of your own item to `inreview` in `notes/Backlog/`, and write your scrum note in `notes/Scrums/`.
- If a task seems to need a pack, schema or validator change, **stop and say so** in your scrum note under Next or Blockers. Don't make the change yourself, even when it is a one-line fix and even when an item describes the fix. When an item splits work between Cowork and you, do only your half, and check the Cowork half has landed first. If it hasn't, the item is blocked.
- The README's "Editing the content pack" section is for the pack's authors, not for you.
- Nothing scientific is invented at build time. Restructure, link, render — never add facts. Gaps are `TODO(author)` markers surfaced on `/methods`. **Uncited prose is never repaired by adding a citation.**

## Work queue and scrum notes

- **Queue:** every item in `notes/Backlog/` with `state: inwork`. On completion set it to `inreview`. `approved` and `new` items are not yours unless you're asked. Closing is Daniel's call.
- **Scrum note:** `notes/Scrums/YYMMDD.md`, exact format from `../CLAUDE.md`, with frontmatter `type: scrum` · `project: neuromodulation-atlas` · `date: YYYY-MM-DD` · `author: claude-code`. No `app:` key. Append if today's note exists.
- The programme's workstreams and priorities are in `notes/Programme coordination.md`; the end-to-end research loop is `notes/Workflow.md`. Read both for context; don't edit them.
- `notes/inbox/` is Deconvolver's triage queue (exported app notes, intake). Not yours.

## Commands

```bash
npm ci
python3 tools/validate_pack.py content-pack   # pack gate: must report 0 errors (warnings are not errors)
npm run build:content    # validate pack (zod) → src/data/*, public/provenance.json, public/graph/*; fails loudly
npm test                 # Vitest
npm run build            # tsc -b && vite build → dist/ ; for the Pages sub-path set BASE_PATH=/neuromodulation-atlas/
npm run build:fixture-volume && npm run test:e2e   # Playwright on :4173 (this app) and :4174 (fixture with v1 ready)
```

- Run the validator and `build:content` before and after any change that touches the build. After a rebuild, commit the regenerated `src/data/*.json`, `public/provenance.json` and `public/graph/*`.
- **Port hygiene:** before `test:e2e`, confirm nothing else is serving :4173/:4174 (`lsof -i :4173`). A stray `vite preview` from another app once made Playwright test the wrong app silently. Check that the served page is *this* app before trusting a green run.
- Neo4j load test only when `NEO4J_TEST_URL` is set to a throwaway instance — never a default endpoint or Daniel's own database.

## Invariants the build and tests protect — don't weaken them

- **Id stability:** `src/data/id-ledger.json` records every published id; a rebuild that drops one must fail. Never edit the ledger to make a build pass.
- **Graph lab renders `claims.yaml` only.** Contested claims dashed and open their hypothesis group with all rivals; inferred claims carry the synthesis mark; the nine `finding: 'null-result'` claims are marked ∅ and labelled as null results everywhere (canvas, cards, tables).
- **Neo4j panel:** closed by default, credentials in memory only (never storage, cookies, URL or logs), no write-query box, read queries in a READ transaction, the only write is the confirmed atlas load. The Cypher download is always offered.
- **Exports are deterministic:** no pack change means byte-identical `public/graph/*`.
- **Nothing implies peer review**; the sweep date shows on `/`, `/read`, `/about`.
- **Volumes extend, never fork:** a new volume is added to this app, and notes written in V0 must survive it. The same holds for notes on claims, nodes and hypothesis groups (H2): anchor them to permanent ids.
- **Notes stay in the reader's browser.** The only way out is the reader's own Export (H4); never sync them anywhere.

## Neo4j workbench (`graph/`)

The atlas publishes a graph *and* keeps a local development graph for model work and research queries (Daniel, 2026-09-19). The rule: **the database is derived.** It is wiped and rebuilt from the pack's exports and is never edited by hand. Nothing flows from Neo4j back into `content-pack/`.

- **Instances and ports:**
  - **Dev workbench:** pinned Neo4j + APOC + GDS in Docker, bolt `7688`, HTTP `7475` (item G1).
  - **Throwaway test instance:** `7699`; also the CI service container (G2).
  - **Off limits:** `7687` is the PTSD-inflammation KG in Neo4j Desktop. Never connect to it, load into it or wipe it. The same goes for any database you didn't start.
- **Loads:** only via the scripted loader, which runs the constraints first, then the MERGEs, then asserts the counts against `public/provenance.json`. Wipe-and-reload is allowed only on the atlas's own workbench database.
- **Queries:** run the library with the runner (G3). Every result carries the pack hash, Neo4j version and date. Numbers used in the poster, abstract or grant come from stamped results, never from an ad-hoc session.
- **Model changes:** a new model (G4) ships as an *additional* export loaded into a *second* database. The published `claims.cypher`, its ids and the `/graph` panel's "Load this atlas" stay unchanged until Daniel adopts the new model.
- **External layers** (ontology terms, SCKAN anatomy, the PTSD KG for bridge queries) are scripted, version-pinned imports into the workbench. They are rebuilt with everything else and never merged into the pack. `../ptsd-inflammation/` remains read-only.
- Credentials: the dev password lives in the ignored `graph/.env` (commit `.env.example`). Never commit credentials, and never ship them to the browser.

## Git and delivery

- Account `danieladamek` (GrandsTech). Default branch `main`.
- **Nothing reaches the public site without Daniel's approval** (the research loop, `notes/Workflow.md`).
  - **Until H1 lands:** a push to `main` still deploys publicly via `.github/workflows/deploy.yml`, so push only when the item you're working says to, or Daniel says so.
  - **After H1:** pushes produce a preview; the public deploy runs only on a release tag or a manual dispatch. Verify the live site after every public deploy.
- `notes/`, `source/` and `🚀 *.md` are kept out of the repo via `.git/info/exclude`. Don't commit them.
- `tools/` is currently untracked (vendored at promotion); whether to commit it is item E4.
- Release work (tags, `CITATION.cff`, Zenodo) happens only through its backlog item (A3).

## Reference material (read-only)

`../manuscript-interrogator/apps/psychedelic-pharmacology/` and `…/thyroid-molecular-markers/` are sibling apps with the same stack. `../CountChocula/` is Bioactive Explorer, the design ancestor. `../ptsd-inflammation/` is the program's other knowledge graph (Neo4j). Mine them for patterns; never edit them.
