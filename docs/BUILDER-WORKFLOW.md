---
type: spec
project: manuscript-interrogator
version: 0.3
---

# BUILDER-WORKFLOW — from manuscript to KICKOFF.md

**Version 0.3 · 2026-09-14.** This is what the 📚 Manuscript Interrogator Cowork project does each time Daniel hands it a paper. Phases are sequential; each ends with something Daniel can look at in Obsidian. Estimated wall-clock for a 30-page paper with ~40 references: one to two Cowork sessions.

## Which workflow — the mode fork

The builder has two intakes. Decide which before anything else, from what Daniel actually handed over:

| He gave you | Mode | Follow |
|---|---|---|
| A paper (PDF, DOI, link, "read this") | `manuscript` | **this file**, Phases 0–6 |
| A topic and a scope of interest ("I want to understand X", "deep research on Y") | `topic` | [[manuscript-interrogator/docs/TOPIC-WORKFLOW|TOPIC-WORKFLOW]] Phases T0–T5, then Phases 4–6 **here** |

If it is genuinely ambiguous — a topic named alongside one paper about it — ask, in one question: *is that paper the subject, or a starting point?* The answer is the mode. Everything from Phase 4 onward (review the pack, kickoff, review the app) is shared, and both modes produce the same pack shape and the same single-shot kickoff.

## Phase 0 — Intake (10 min) · `mode: manuscript`

**Ask first, research second.** When a manuscript lands in the chat window, ask Daniel these four before touching the paper — as an actual question in the chat, not an assumption:

1. **Delivery — local only, or GitHub Pages?** This is the one that changes what Claude Code does at the end of the build, so it is asked first and written into `manifest.yaml` as `delivery: local` or `delivery: pages`.
   - `local` (**default** when Daniel doesn't answer, or when the session is unattended) — the app is built, tested and viewable at `npm run dev` / `npm run preview` on his machine. Claude Code still runs `git init` and commits, but creates no remote, no `gh repo create`, no Pages workflow. Nothing about the paper goes public.
   - `pages` — the pilot path: public repo `{{github_account}}/<slug>` and a live Pages site at the end of the single-shot run.
   - Never infer this from the manuscript's licence. A CC BY paper still gets asked.
2. **Repo slug** (kebab-case) and **short title** (≤ 3 words, the header wordmark).
3. **Audience** — default: non-specialist upper-level student.
4. **Text and figure permissions.** Under `delivery: pages` this is a hard gate: unknown permissions stop intake, because nothing public is built from text Daniel may not republish. Under `delivery: local` an unknown answer is recorded in `todo.yaml` and the build proceeds — but it must be resolved before the app is ever promoted to Pages, and the KICKOFF says so.

A local build is not a lesser build. It is the same app, the same tests, the same production bundle — only the publishing step differs, and promoting later is one command (KICKOFF §6b). Prefer offering `local` when the paper is someone else's, the pack is still rough, or Daniel just wants to look at it.

`manifest.mode: manuscript` is written into the pack at this point (CONTENT-PACK v0.3). Inputs: the manuscript (PDF and, ideally, source — `.docx`/LaTeX/Markdown — plus figure files or supplementary data), plus the four answers above.
Output: `apps/<slug>/` created with `source/` (the PDF and any author files) and `content-pack/manifest.yaml` drafted; the app hub `apps/<slug>/🚀 <Short title> Explorer.md` (`type: app-hub`, `project: manuscript-interrogator`, `app: <slug>`) and `apps/<slug>/notes/Scrums/`; a line in the builder's scrum note. **Every manuscript app lives inside this folder at `apps/<slug>/` (Daniel, 2026-09-14) — it is not a separate registry team.**

## Phase 1 — Verbatim manuscript (30–60 min)

Convert to `manuscript.md`: sections with `<!-- section: id -->` markers, figures as `<!-- figure: id -->` where they sit, citations normalised to `[n]`, equations to KaTeX, tables to GFM. Check three random paragraphs against the PDF for fidelity. Record any OCR/extraction damage in `todo.yaml`.

## Phase 2 — Term harvest (30 min)

Read the manuscript as the target student. List every noun phrase that needs defining — science terms **and** methods/statistics/software/dataset/unit/abbreviation terms — into `glossary.yaml` with `id`, `term`, `kind`, `variants`. No definitions yet. Aim for completeness over polish; typical papers yield 60–150 terms. Group terms that share an explanatory core into candidate **concepts** (typically 6–15): these are the 101s.

## Phase 3 — Research (the long phase)

For each glossary term: `short` (≤ 200 chars) and `definition`, checked against at least one source (textbook, review, authoritative site); record `sources`. For each concept: write `concepts/<id>.md` per the CONTENT-PACK shape — what it is, why this paper needs it, the maths gently, how the paper uses it, further reading (verify links resolve), self-check. For each reference: resolve the DOI, read the abstract (full text when accessible), write `summary` and `role_here`/`role_note`, mark `verified`. For each figure: decide `kind`; obtain data (supplementary tables, author files, or digitise approximately — say so in `source`); write `how_to_read` and `explain[]`.

Use web search and the literature/bio-research MCP tools available to the Cowork project. Keep a running `todo.yaml` for anything unresolved. Never fill a gap with a guess — that rule protects the whole product.

## Phase 4 — Review pack (Daniel, 20–40 min) · both modes

Daniel reads the pack in Obsidian (it is plain YAML/MD). He fixes scientific errors directly or leaves `TODO(author)` comments. The Cowork project applies the CONTENT-PACK definition-of-done checklist and writes the result into the scrum note.

## Phase 5 — Kickoff (10 min) · both modes

Run `python3 tools/validate_pack.py apps/<slug>/content-pack` (0 errors required). Copy the frozen `docs/APP-SPEC.md`, `docs/DESIGN-SYSTEM.md`, `docs/CONTENT-PACK.md` into `apps/<slug>/docs/` and `tools/validate_pack.py` into `apps/<slug>/tools/`. Instantiate `KICKOFF-TEMPLATE.md` → `apps/<slug>/KICKOFF.md` (fill the slots — including `{{delivery}}` from `manifest.delivery` and `{{mode}}` from `manifest.mode`, keep only the matching §6 branch, resolve the mode-conditional passages — add a §8 of app-specific notes). Under `mode: topic`, `docs/TOPIC-WORKFLOW.md` is frozen into `apps/<slug>/docs/` alongside the other three. Under `delivery: pages`, confirm `gh auth status` shows the account first; under `delivery: local`, skip that check and confirm the delivery choice with Daniel one last time, since this is the last cheap moment to change it. Create the K0 item in `notes/Backlog/` (`app: <slug>`, `state: inwork`). Hand Daniel the launch line; he runs it in a terminal or the desktop app's Code mode (local environment).

## Phase 6 — Review app (after the Claude Code run) · both modes

Read Claude Code's scrum note; walk APP-SPEC §8 on the live site; file defects as backlog items in the app's folder (or this one if the defect is in the builder docs). Lessons that generalise go into APP-SPEC / DESIGN-SYSTEM / KICKOFF-TEMPLATE / CONTENT-PACK as a version bump — that is how the builder gets better.

## What the builder is *not*

It does not write code, run `npm`, or edit the generated repo (Claude Code's role). It does not decide scope changes to APP-SPEC without Daniel. Per-paper content lives only in `apps/<slug>/` (source, pack, and — after the run — the repo itself).

## History

- v0.1 (2026-09-14) — first draft, six phases.
- v0.3 (2026-09-14) — **the mode fork.** A topic intake now exists: [[manuscript-interrogator/docs/TOPIC-WORKFLOW|TOPIC-WORKFLOW]] replaces Phases 0–3 for `mode: topic`, Phases 4–6 stay shared. Pairs with CONTENT-PACK v0.3, APP-SPEC v0.2, DESIGN-SYSTEM v0.2, KICKOFF-TEMPLATE v0.3.
- v0.2 (2026-09-14) — Phase 0 asks the **delivery** question (local only vs GitHub Pages) the moment a manuscript is dropped, defaulting to `local`; permissions became a hard gate only under `pages`. Pairs with KICKOFF-TEMPLATE v0.2 and CONTENT-PACK v0.2 (`manifest.delivery`). APP-SPEC and DESIGN-SYSTEM unchanged at v0.1 — the app itself is identical either way.
