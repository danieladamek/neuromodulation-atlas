---
type: spec
project: manuscript-interrogator
version: 0.7
---

# CONTENT-PACK — the structured input Claude Code builds from

**Version 0.7 · 2026-09-15.** The content pack is authored by the Manuscript Interrogator Cowork project (research role) and is the **only** source of scientific content in a generated app (APP-SPEC §6). Claude Code validates it in `scripts/build-content.ts` and fails loudly on any violation below. Everything is UTF-8 YAML/Markdown so Daniel can review it in Obsidian before dispatch.

## Modes

A pack declares `mode:` in its manifest, and that is the only thing the two intakes disagree about:

| | `mode: manuscript` (default) | `mode: topic` |
|---|---|---|
| Input | One published paper Daniel hands over | A topic + scope of interest, pinned by a scoping interview |
| Workflow | [[manuscript-interrogator/docs/BUILDER-WORKFLOW|BUILDER-WORKFLOW]] Phases 0–3 | [[manuscript-interrogator/docs/TOPIC-WORKFLOW|TOPIC-WORKFLOW]] Phases T0–T5 |
| Reader body | `manuscript.md` — the paper, **verbatim** | `review.md` — a **commissioned review** written by the builder, every claim cited |
| Extra file | — | `scope.yaml` (the interview answers + search strategy) |
| References | The paper's own numbering, its own bibliography | Tiered `seminal` / `current` / `background`, the builder's numbering |
| Figures | The paper's figures, rebuilt or reproduced | **Synthesised** — built from the corpus, every figure carrying `refs:` |
| Provenance risk | Faithfulness of the extraction | Truthfulness of the synthesis — so the citation rules are *stricter*, see below |

Everything else — glossary, concepts, figure schema, term-linking, the app itself — is identical, and a reader cannot tell from the app's machinery which mode produced it (only from `/about` and `/methods`, which say so plainly).

## Layout

```
content-pack/
  manifest.yaml        # metadata, slug, palette, permissions, mode, builder version
  manuscript.md        # mode: manuscript — the paper, verbatim, with section markers and figure/citation anchors
  review.md            # mode: topic      — the commissioned review, same markers, every claim cited
  scope.yaml           # mode: topic      — interview answers, search strategy, corpus profile, exclusions
  glossary.yaml        # every technical term (science + methods)
  concepts/            # one Markdown file per 101, with frontmatter
    <concept-id>.md
  figures.yaml         # every figure/table: kind, data or image, explanations, hotspots
  figures/data/        # CSV/JSON series referenced by figures.yaml
  figures/images/      # original figure images (only when permitted)
  references.yaml      # every reference with summary + role_here
  todo.yaml            # optional: known gaps the builder could not resolve
```

## manifest.yaml

```yaml
mode: manuscript                          # manuscript | topic — default manuscript
slug: cortisol-inflammation-ptsd          # kebab-case; becomes repo name + localStorage key
title: "…full title…"
short_title: "Cortisol & Inflammation"    # header wordmark, ≤ 3 words
authors: ["A. Author", "B. Author"]
venue: "PLOS Computational Biology"
year: 2026
doi: "10.1371/…"                          # or url:
plain_abstract: >                         # 120–180 words, written by the builder, labelled as such in the app
  …
reading_minutes: 45
audience: "upper-level undergraduate / early graduate, non-specialist"
palette:                                  # 4–6 categorical hues for the paper's own categories
  groups: { control: "#2a5aa6", ptsd: "#7b2c5e" }
permissions:
  text: "author-owned, CC BY 4.0"         # REQUIRED for delivery: pages; may be "unknown" for delivery: local
  figures: "author-owned"                 # or "original images omitted; rebuilt from data only"
delivery: local                           # local | pages — Daniel's Phase 0 answer; default local.
                                          #   local = built and viewed on his machine, git repo but no remote
                                          #   pages = public repo + live GitHub Pages site at the end of the build
builder: { name: "Manuscript Interrogator", version: "0.3", date: "2026-09-14" }
github_account: danieladamek              # only used when delivery: pages
```

### manifest under `mode: topic`

`authors`, `venue`, `year`, `doi`/`url` describe a paper, so in topic mode they are replaced:

```yaml
mode: topic
slug: vagal-anti-inflammatory-signalling
title: "Vagal anti-inflammatory signalling in humans: what is established and what is contested"
short_title: "Vagal Inflammation"
question: >                               # the question behind the topic, in Daniel's words, from T0
  Where is the evidence actually strong that vagus-nerve activity modulates systemic inflammation
  in humans, and which methods can and cannot show it?
purpose: orientation                      # orientation | direction | teaching | grant-background (T0)
as_of: 2026-09-14                         # the date the sweep closed — stamped in the app, non-negotiable
authors: ["Manuscript Interrogator (commissioned review)"]
venue: "Commissioned review — not peer reviewed"
year: 2026
permissions:
  text: "builder-authored; no third-party text reproduced beyond quotations ≤ 25 words"
  figures: "synthesised by the builder from cited data; no published figure images reproduced"
```

Rules for topic mode: `question`, `purpose` and `as_of` are required; `doi`/`url` are not; `permissions.text` still must be non-empty, and under `delivery: pages` it must state the quotation rule. `venue` must make the non-peer-reviewed status unmissable — it is rendered on `/` and `/about`.

## manuscript.md

Verbatim text. Structure markers the build step relies on:

```markdown
<!-- section: abstract -->
# Abstract
…text with citations written as [12] or [3,7] exactly as in the paper…

<!-- section: 2-methods -->
## 2. Methods
…
<!-- figure: fig2 -->          ← placed where the figure appears; rendered as the interactive component
…
<!-- section: 3-results -->
```

Rules: section ids are kebab-case and unique; every `<!-- figure: id -->` matches `figures.yaml`; every `[n]` (or list/range: `[3,7]`, `[3–5]`) matches `references.yaml`; equations in `$…$` / `$$…$$` (KaTeX); tables in GFM. Nothing is paraphrased. Light normalisation only (ligatures, hyphenation, smart quotes).

## scope.yaml — topic mode only

The record of what was asked, what was decided, what was searched and what was left out. It is not decoration: `/methods` renders it, and it is the document the review is accountable to.

```yaml
topic: "vagus nerve and systemic inflammation"        # Daniel's words, verbatim
question: >                                           # T0 — the question behind the topic
  …
purpose: orientation                                  # orientation | direction | teaching | grant-background
boundary:
  in:  ["human studies", "VNS trials", "cholinergic anti-inflammatory pathway mechanism"]
  out: ["rodent-only mechanistic work", "device engineering", "non-inflammatory VNS indications"]
  rationale: "Daniel wants the human evidence base; the rodent literature is a separate review."
level: "organism and clinical"                        # the level/scale answer, in the field's terms
time_window: { current_from: 2021, seminal: "any age if load-bearing" }
stance: primer-with-controversies                     # primer | controversy-map | methods-manual
depth: standard                                       # brief | standard | deep | textbook (textbook requires volumes — see below)
anchors:                                              # T2 — what Daniel already trusts, seeds the snowball
  - { citation: "Tracey KJ. The inflammatory reflex. Nature 2002.", doi: "10.1038/nature01321", why: "Daniel named it" }
excluded:                                             # adjacent literatures deliberately left out
  - { what: "sepsis trials", why: "Daniel: out of scope for this pass" }
assumed: false                                        # true when the interview went unanswered and defaults were taken
interview:                                            # the Q&A as asked and answered — quoted, not paraphrased
  - { q: "…", answer: "…", asked: 2026-09-14 }
search_strategy:
  run_on: 2026-09-14
  sources: ["Europe PMC", "Crossref", "OpenAlex", "Semantic Scholar", "web search"]
  queries:
    - { q: "cholinergic anti-inflammatory pathway human", source: "Europe PMC", hits: 214, kept: 11 }
  snowball: ["backward from anchors", "forward citing works of refs 3, 7, 12"]
  inclusion: ["human subjects", "primary data or systematic review", "English"]
  exclusion: ["conference abstracts without data", "preprints not yet peer reviewed (noted separately)"]
  known_gaps: ["no access to two paywalled trials — abstract only, see todo.yaml"]
corpus_profile:                                       # the honesty check from TOPIC-WORKFLOW T3.5
  by_tier: { seminal: 9, current: 26, background: 5 }
  year_range: [1998, 2026]
  concentration: "7 of 26 current refs share a senior author — noted on /methods"
  dissent_represented: true
```

Rules: `topic`, `question`, `boundary`, `time_window`, `depth`, `search_strategy` and `corpus_profile` are required. `search_strategy.queries` must be the queries actually run, with hit counts — including the ones that found nothing. `interview` quotes Daniel's answers; where an answer was assumed, `assumed: true` and the assumption is spelled out.

## review.md — topic mode only

Same file shape as `manuscript.md` — `<!-- section: id -->`, `<!-- figure: id -->`, `[n]` citations, KaTeX, GFM tables — so the reader, term-linker and citation fold-outs work unchanged. What differs is what is allowed in it:

```markdown
<!-- section: 2-foundations -->
## 2. Foundations

<!-- framing -->
Three results, none of them recent, do most of the work in this literature. They are worth
reading before anything published in the last five years.

The inflammatory reflex was described as a neural circuit in which efferent vagal activity
suppresses TNF release from macrophages [3]. In the original demonstration, stimulation reduced
serum TNF by 75 % in endotoxaemic rats [3]; the human evidence arrived much later and is weaker [11,14].

<!-- synthesis -->
Taken together, the human studies support a modulatory rather than a controlling role [11,14,19].
```

Rules the validator enforces:

- **Citation coverage.** Every block of ≥ 25 words contains at least one `[n]`, unless the block is immediately preceded by `<!-- framing -->`. Framing blocks carry no claims of fact — transitions, section openers, "the rest of this section…". Overusing `framing` to smuggle uncited claims is the one failure mode that would make this app untrustworthy; the count is reported on `/methods`.
- **`<!-- synthesis -->`** marks a block stating a conclusion the cited works do not individually state. Allowed, expected, and listed on `/methods` so a reader can find every one of them.
- **Quotation ≤ 25 words**, in quotation marks, with its `[n]`. There is no verbatim-reproduction path in this mode.
- Every `[n]` resolves to `references.yaml`; every `verified: false` reference is unusable as support for a claim.
- Section ids kebab-case and unique, as in manuscript mode.

## glossary.yaml

```yaml
- id: hazard-ratio
  term: Hazard ratio
  kind: methods                 # science | methods | statistics | notation
  variants: ["hazard ratios", "HR", "HRs"]   # whole-word, case-insensitive matches in the reader
  short: "The ratio of event rates in two groups at any instant; 1 = no difference."   # ≤ 200 chars → popover
  definition: >                 # 2–5 sentences → glossary page
    …
  concept: survival-analysis    # optional → "Learn the concept" link to concepts/survival-analysis.md
  see: [confidence-interval]
  sources: ["10.1000/…"]        # optional DOIs/URLs the definition was checked against
```

Rules: ids unique; `concept` must exist in `concepts/`; `see` ids must exist; `variants` must not collide across terms (the build fails on ambiguous matches and lists them). Coverage target: **every** technical noun phrase a non-specialist would stumble on, including statistical tests, software, datasets, instruments, units and abbreviations.

## concepts/<id>.md

```markdown
---
id: survival-analysis
title: Survival analysis
one_liner: "Modelling time-until-event when some subjects never have the event."
why_here: "The paper's primary outcome is time to relapse; Fig. 3 is a Kaplan–Meier plot."
prerequisites: [probability-basics]      # other concept ids (may be empty)
terms: [hazard-ratio, censoring, kaplan-meier]
figures: [fig3]
further_reading:
  - { title: "…", url: "…", kind: textbook|review|video }
self_check:
  - { q: "…", options: ["…","…","…","…"], answer: 1, explanation: "…" }
---

## What it is
2–4 paragraphs, intro-textbook level.

## The key idea in one picture
Describe the diagram Claude Code should draw (or supply an SVG in figures/images/). Optional.

## The maths, gently
$$ S(t) = P(T > t) $$
Each symbol explained in a list right after the equation.

## How this paper uses it
…
```

## figures.yaml

```yaml
- id: fig3
  label: "Figure 3"
  title: "Time to relapse by group"
  kind: chart                   # chart | table | network | pathway | image
  chart: { type: step, x: {field: t, label: "Months", unit: "mo"}, y: {field: S, label: "Survival probability"}, series: group, ci: [lo, hi] }
  data: figures/data/fig3.csv   # columns must match fields above
  caption: >                    # the paper's caption, verbatim
    …
  how_to_read: >                # builder-written, plain, second person
    …
  explain:                      # ⓘ popovers on the figure; each may link a concept/term
    - { on: "shaded band", text: "95 % confidence band…", concept: confidence-interval }
    - { on: "step drops", text: "Each drop is one relapse…", term: kaplan-meier }
  concepts: [survival-analysis]
  discussed_in: [3-results, 4-discussion]
  source: "rebuilt from Supplementary Table S2"   # or "digitised from the published figure (approximate)"

- id: fig1
  kind: image
  image: figures/images/fig1.png
  hotspots:
    - { x: 12, y: 40, w: 20, h: 15, text: "Blood draw at baseline", term: baseline }
  …
```

Rules: `data` files exist and parse; `chart.type` ∈ {line, bar, grouped-bar, stacked-bar, scatter, area, step, box, heatmap, forest}; `network`/`pathway` supply `nodes`/`edges` JSON; every `concept`/`term` reference resolves; `source` is mandatory and honest about approximation.

### figures under `mode: topic`

There is no published figure to rebuild, so every figure is the builder's own and has to declare what it is made of:

```yaml
- id: fig2
  label: "Figure 2"
  title: "Reported effect of vagal stimulation on circulating TNF, by study"
  kind: chart
  synthesis: data                # data | conceptual   (REQUIRED in topic mode)
  refs: [3, 11, 14, 19, 22]      # REQUIRED — what the figure is made of; each must exist
  chart: { type: forest, x: {field: effect, label: "Log ratio of means"}, y: {field: study} }
  data: figures/data/fig2.csv    # every row carries a `ref` column naming its source reference
  caption: "Effect estimates as reported by each study; not a meta-analysis."
  how_to_read: >
    …
  source: "Extracted by the builder from the reported values in refs 3, 11, 14, 19, 22. Values are
    as published, not re-analysed or pooled."
```

- `synthesis: data` — a chart or table assembled from values extracted from the corpus. The data file **must** carry a `ref` column so every point is traceable to a reference. `source` must state that the values are as published and say whether anything was converted.
- `synthesis: conceptual` — a mechanism, pathway or decision diagram drawn from the cited sources. `source` says plainly that the drawing is the builder's.
- `refs:` is required on every figure and every `n` must exist in `references.yaml`. A figure with no references does not ship.
- `kind: image` is allowed only with explicit permission in `manifest.permissions.figures`; the default in topic mode is that no published images are reproduced at all.
- Figures that no single paper contains — a timeline of results, a forest plot across studies, a methods comparison table — are the ones worth building. They are the main reason a topic app beats reading five reviews.

## references.yaml

```yaml
- n: 12                          # the paper's own numbering
  citation: "Author A, Author B. Title. Journal. 2021;12(3):456–78."
  doi: "10.1000/xyz"             # or url:
  summary: >                     # 3–6 sentences: what the cited work did and found
    …
  role_here: support             # support | method | contrast | prior-result | data-source | background
  role_note: "Provides the cortisol-assay protocol used in §2.3."
  cited_in: [2-methods, 4-discussion]
  verified: true                 # DOI resolved and abstract read by the builder
```

Rules: every `[n]` in the manuscript has an entry; `doi` or `url` required; a missing `summary` is allowed only with `verified: false` and an entry in `todo.yaml` — the app shows it amber, never blank, never invented.

### references under `mode: topic`

Two extra keys, because in topic mode the bibliography *is* the evidence base rather than a list inherited from a paper:

```yaml
- n: 3
  tier: seminal                  # seminal | classic | current | background   (REQUIRED in topic mode)
  anchor: true                   # optional — Daniel named this one in the interview
  citation: "Tracey KJ. The inflammatory reflex. Nature. 2002;420(6917):853–9."
  doi: "10.1038/nature01321"
  year: 2002                     # REQUIRED in topic mode — drives tier display and sorting
  summary: >                     # full 3–6 sentences for tier: seminal
    …
  why_it_mattered: >             # seminal only: what changed in the field because of this paper
    …
  role_here: prior-result
  role_note: "The circuit description every later human study is testing."
  cited_in: [2-foundations, 5-mechanism]
  verified: true
```

- `tier: seminal` — full `summary` **and** `why_it_mattered` required. 8–12 at standard depth.
- `tier: current` — `summary` may be one or two lines; full summary when it carries a claim in the review. 20–30 at standard depth.
- `tier: classic` — a pre-window primary study the later literature leans on but which did not found the field: the second rank of the canon. Full `summary` required (3–6 sentences, same bar as `seminal`); `why_it_mattered` optional. No count band. A paper that founds one modality or technique rather than the field is `classic` when it predates the window and `current` when it does not — `seminal` stays reserved for the cross-cutting canon, or a volume covering twenty techniques accumulates twenty founders.
  Added in v0.5 because forcing these into `background` mislabels primary experiments as reference material, while forcing them into `seminal` empties that tier of meaning.
- `tier: background` — textbooks, methods papers, guidelines, definitional sources; `summary` optional, `role_here` required.
- `year` is required in every tier. The references page groups by tier and sorts by year within it.

## Volumes and the textbook tier — topic mode (v0.4)

A topic that is too big for one review is built as **one app in volumes**: one commissioned review per volume, one shared glossary, one shared bibliography, one shared set of 101s, one shared `claims.yaml`. Volumes ship one at a time, each with its own outline gate and its own KICKOFF; the app grows in place.

```
content-pack/
  manifest.yaml        # + volumes: [...]
  scope.yaml           # shared scope + volumes: {<id>: per-volume depth, outline, search strategy, corpus profile}
  volumes/
    v0/review.md       # one review per volume — same markers and rules as review.md
    v1/review.md
  claims.yaml          # the graph seed — every mechanism claim as a typed, cited edge (below)
  glossary.yaml  concepts/  figures.yaml  figures/  references.yaml  todo.yaml   # shared across volumes
```

```yaml
# manifest.yaml
mode: topic
volumes:
  - { id: v0, title: "Foundations", status: ready }      # ready = has volumes/v0/review.md and is validated
  - { id: v1, title: "Vagus and cranial nerve", status: planned }   # planned = listed in the app as coming, no file yet
concept_levels: true           # optional; every 101 carries ## L1 … ## L4 sections (see concepts)
```

```yaml
# scope.yaml — shared keys as before (topic, question, boundary, time_window, stance, excluded, interview), plus:
depth: textbook                # the app-level tier; per-volume depth below
volumes:
  v0:
    depth: textbook
    outline_approved: 2026-09-16       # date Daniel approved the outline; null until then
    search_strategy: { … same shape as the single-review search_strategy … }
    corpus_profile:  { … same shape … }
```

Rules:

- A pack with `volumes:` has **no** top-level `review.md`; each `status: ready` volume has `volumes/<id>/review.md`. `planned` volumes have none. Volume ids are `v0`, `v1`, … and never renumbered.
- **Section ids are prefixed with their volume id** (`v0-3-coupling-physics`) so they stay unique across the app. `cited_in`, `discussed_in` and `claims[].section` use the prefixed ids.
- **One bibliography, one numbering.** `[n]` means the same reference in every volume. New volumes append; numbers are never reused or reassigned.
- Under `volumes:`, `search_strategy` and `corpus_profile` live per volume in `scope.yaml.volumes.<id>` (a top-level pair is still accepted for the app as a whole). A `ready` volume must have both, and `outline_approved` must be a date — or the scrum note says why not.
- All the `review.md` rules (citation coverage, framing, synthesis, quotation length, unverified references) apply to every volume file.

**The textbook tier**, per volume: `depth: textbook` = 18,000–40,000 words scaled to the corpus (200–250 references needs 25,000–40,000), 14–20 sections of which 25–40 `seminal`, written across several sessions with the outline approved first. `deep` stays ~12,000 words / 12+ sections / 60–80 references. Only volume packs may use `textbook`.

**Levelled 101s** (`manifest.concept_levels: true`): each `concepts/<id>.md` carries `## L1 — Intuition`, `## L2 — Undergraduate`, `## L3 — Graduate` and `## L4 — Expert` sections, authored per level (never generated from each other). L3 carries the full derivations; L4 carries assumptions, failure modes, live debates and the key papers, cited `[n]` from the shared bibliography. The app offers an L1–L4 switch. A levelled concept still needs `## What it is` for the popover summary.

## claims.yaml — the graph seed (topic mode, optional; required under `volumes:`)

The review is prose for readers; `claims.yaml` is the same science as **typed, cited edges** a graph database can load. Every mechanism statement in a review that a schema designer would want as an edge appears here once, linked to the section that argues it. Nothing may appear here that the review does not state or synthesise.

```yaml
vocabulary:                    # declared once; the validator checks every claim against it
  node_types: [ExogenousDrive, StimulationProtocol, CouplingMechanism, AnatomicalStructure, NeuronPopulation,
               CellType, SubcellularComponent, Molecule, GeneProduct, Pathway, Circuit, PhysiologicalSystem,
               Outcome, Confound, Measurement]
  predicates: [delivered_by, couples_via, polarizes, activates, inhibits, gates, binds, releases, increases,
               decreases, projects_to, part_of, located_in, modulates, required_for, correlates_with,
               confounds, measured_by]
  levels: [biophysical, cellular, subcellular, molecular, circuit, systemic, behavioural, clinical]
  evidence: [human-interventional, human-observational, animal-interventional, animal-observational,
             in-vitro, computational, consensus, inferred]
hypotheses:                    # competing-hypothesis groups: one question, ≥ 2 rival answers
  - id: H-tes-entrainment
    question: "Do weak transcranial alternating fields entrain cortical neurons directly?"
    rivals:
      - { id: H-tes-entrainment-direct, label: "direct neuronal entrainment", refs: [41] }
      - { id: H-tes-entrainment-peripheral, label: "transcutaneous peripheral-nerve co-stimulation", refs: [42] }
    section: v0-9-open-questions
claims:
  - id: C0001                  # stable, never reused
    subject: { label: "Transcranial alternating current stimulation", type: ExogenousDrive, term: tacs }
    predicate: modulates
    object:  { label: "Spike timing of cortical neurons", type: Measurement, xref: "NIFSTD:…" }
    level: cellular
    evidence: animal-interventional
    species: [macaque]         # as studied; "human" only when humans were studied
    parameters: { frequency: "10 Hz", field_in_tissue: "≈1 V/m" }   # as published, units kept, never converted silently
    status: contested          # supported | contested | inferred
    hypothesis: H-tes-entrainment-direct    # required when status is contested
    refs: [41]
    section: v0-9-open-questions
    synthesis: false           # true when the edge is the review's own inference (then status: inferred)
```

Optional on a claim: `finding: null-result` plus `finding_note`, for an edge whose asserted result is a null or a failed replication. Without it a reader of the predicate alone misreads a negative result as a positive one, since the vocabulary has no negation. `finding` defaults to `positive` when absent. The value is spelled `null-result`, not `null`, because bare `null` is YAML for nothing.

Rules the validator enforces: ids unique; `type`, `predicate`, `level` and `evidence` come from `vocabulary`; `refs` non-empty, every `n` exists and is `verified: true`; `section` exists; `term` (when given) resolves to the glossary; `status: contested` names a `hypothesis` rival id that exists; every hypothesis group has ≥ 2 rivals and every rival is used by at least one claim (warning); `status: inferred` requires `synthesis: true` or `evidence: inferred`, and vice versa; `xref` is a CURIE (`PREFIX:local`) when given. Ontology prefixes the builder should prefer: `UBERON`, `CL`, `GO`, `CHEBI`, `PR`, `NCBITaxon`, `ECO`, `ILX`/`NIFSTD`, `NPO`, SCKAN population ids.

The app turns `claims.yaml` into the `/graph` lab and into downloadable Cypher, CSV and GraphML (APP-SPEC §4.1). The vocabulary is a starting schema, not a final one — the point of publishing it is that Daniel can redesign it.

## todo.yaml

```yaml
- where: references/27
  what: "Could not access full text; summary from abstract only."
- where: figures/fig5
  what: "No underlying data; digitised approximately from the PDF."
```

## Definition of done for a content pack (Cowork side)

- [ ] `manifest.permissions.text` filled in — no pack ships without it.
- [ ] Glossary coverage: a non-specialist read-through finds no unlinked jargon; methods/statistics terms are as complete as science terms.
- [ ] Each 101 has why_here, ≥ 1 self-check, ≥ 2 further-reading links that resolve.
- [ ] Every figure has `how_to_read` and `source`; charts have data files; images have ≥ 1 hotspot.
- [ ] Every reference `verified: true` or listed in `todo.yaml`.
- [ ] Pack validated with `tools/validate_pack.py <pack-dir>` (0 errors) — the same rules Claude Code's `build-content.ts` must enforce.

### Additional, under `mode: topic`

- [ ] `scope.yaml` complete: boundary (in **and** out), time window, depth, the interview as asked and answered, the search strategy with real hit counts, the corpus profile.
- [ ] `manifest.as_of`, `question` and `purpose` set; `venue` makes the non-peer-reviewed status unmissable.
- [ ] Citation coverage: no uncited block of ≥ 25 words; `framing` blocks genuinely carry no claims; every `synthesis` block is one.
- [ ] Every reference has a `tier` and a `year`; every `seminal` has a full summary and `why_it_mattered`; no claim rests on a `verified: false` reference.
- [ ] Every figure has `synthesis` and `refs`; `synthesis: data` files carry a `ref` column.
- [ ] The outline was shown to Daniel before the prose was written (or the scrum note says it was not, and why).

### Additional, under `volumes:`

- [ ] Every `ready` volume has its review file, a per-volume search strategy and corpus profile, and an `outline_approved` date.
- [ ] Section ids carry the volume prefix; references keep one numbering across volumes.
- [ ] `claims.yaml` covers every mechanism statement in the ready volumes, validates against its vocabulary, and every contested claim sits in a hypothesis group.
- [ ] With `concept_levels: true`, every 101 has all four level sections.

## History

- v0.1 (2026-09-14) — first draft: manifest, manuscript, glossary, concepts, figures, references, todo.
- v0.2 (2026-09-14) — `manifest.delivery` (`local` | `pages`); popover `short` ≤ 200 chars; citation lists and ranges.
- v0.3 (2026-09-14) — **topic mode.** `manifest.mode`, `scope.yaml`, `review.md` with enforced citation coverage and `framing`/`synthesis` markers, reference `tier`/`year`/`why_it_mattered`/`anchor`, figure `synthesis`/`refs`. Manuscript mode is unchanged: a v0.2 pack is a valid v0.3 pack.
- v0.4 (2026-09-15) — **volumes and the textbook tier** (topic mode): `manifest.volumes`, `volumes/<id>/review.md`, volume-prefixed section ids, one shared bibliography, per-volume `search_strategy`/`corpus_profile`/`outline_approved` in `scope.yaml`, `depth: textbook`, levelled 101s (`concept_levels`), and `claims.yaml` — the typed, cited graph seed with a declared vocabulary and competing-hypothesis groups. A v0.3 pack is a valid v0.4 pack.
- v0.5 (2026-09-15) — **`tier: classic`** for pre-window primaries the field leans on without being founded on them, and the textbook band raised to 200–250 references (25–40 seminal). Daniel's ruling on the V0 sweep (223 refs, 74 candidate seminals): the missing thing was an honest label, not a smaller corpus.
- v0.6 (2026-09-15) — textbook word band scaled to the corpus (18,000–40,000; 200–250 references needs 25,000–40,000). Set after V0 came in at 29,577 words with 220 references cited: the old 25,000 ceiling predated the corpus and would have meant cutting cited material.
- v0.7 (2026-09-15) — optional `finding: null-result` + `finding_note` on a claim, after V0 extraction produced nine edges whose asserted result was a null that the predicate alone would have read as positive. Spelled `null-result` because bare `null` is YAML for nothing.
