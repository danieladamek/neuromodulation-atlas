---
type: proposal
project: neuromodulation-atlas
version: 0.3
workstream: G4
state: approved
author: cowork
date: 2026-09-23
---

# SCHEMA-PROPOSAL-G4-01 — n-ary claims (hyperedges) in `claims.yaml`

**Status. Approved by Daniel, 2026-09-23 — all three decisions in §12.** Adopted as CONTENT-PACK v0.8 (`mediator`, `threatens`, `threatens_note`, the mediator role vocabulary) with `tools/validate_pack.py` extended the same day; the pack still validates to 0 errors. `co_required_with` is held, per decision 2. The loader and export work is dispatched to Claude Code as item G4.2; the back-fill waits on B1, per §9. Owner: Cowork (model).

**Affects.** CONTENT-PACK (atlas fork) `claims.yaml` section · `tools/validate_pack.py` · the build's schemas · `/graph` and the exports (APP-SPEC §4.1) · the Neo4j loader and query library (G1–G3) · the convergence measurement (B) · the inter-rater check (B2).

**Depends on / interacts with.** B1 grounding (per-role anchors), B2 inter-rater check (arity is a new disagreement axis), A3 release and DOI (timing, §11), C Volume 1 (where any new arity would be applied from the start).

---

## 1. The ask, in one paragraph

Our claim record is already an *n*-ary relation wearing a binary costume: `subject`–`predicate`–`object` plus `level`, `evidence`, `species`, `parameters`, `status`, `hypothesis`, `refs` and `section`. The question is not whether to adopt hyperedges — we have them — but **which participants get promoted from metadata to first-class, addressable roles**. This proposal promotes exactly two, adds one optional grouping, and leaves everything else alone. It also fixes the analysis conventions that any such promotion silently changes, because those, not the YAML, are where the cost lands.

**Not proposed:** a hypergraph-native database, a change of graph store, any re-arity of existing claim ids, or any change to how the pack is authored and validated day to day.

## 2. Definitions, so the review is about the same thing

- **Edge** — joins exactly two nodes. What a property graph stores.
- **Hyperedge** — joins any number of nodes. A **hypergraph** is a node set plus hyperedges.
- **Hyperarc (directed hyperedge)** — an ordered pair of sets, tail → head: `{ACh, α7nAChR} → {TNF ↓}`. This is the shape mechanism claims want, because the antecedent is usually a conjunction.
- **Reification** — representing an *n*-ary relation as a node with *n* binary edges to its participants. Every mainstream store does this; it is what our `claims.yaml` already does.
- **Incidence representation** — the bipartite graph of participants and hyperedges; as a table, `(claim_id, role, node_id)`.
- **Star expansion** — reified form drawn as a graph: participants joined to a central claim node.
- **Clique expansion** — hyperedge flattened by joining every pair of its participants. Lossy: arity vanishes, and triangle counts inflate.

A binary edge with *k* qualifiers **is** a relation of arity 2 + *k*. The difference between "qualifier" and "role" is not expressiveness; it is whether the participant can be pointed at, counted, grounded and disagreed with.

## 3. What the current model loses, with counts from the pack

Four shapes, in rising order of cost. Counts are from the current `claims.yaml` (458 claims).

**3.1 Context as metadata — 426 claims carry `parameters`.** Species, preparation and dose are participants in the fact, not decoration: "tACS entrains" is not a proposition, "tACS entrains, in macaque, at these currents, through anaesthetised scalp" is. We already store these, so nothing is lost today. They are simply not addressable: a curator cannot ground them, and a query cannot count them. **Cost: low. Recommendation: leave as fields.**

**3.2 Mediated mechanism — 17 `couples_via`, 25 `gates`.** A source asserts drive → *via transducer* → effect as one claim. Split into two binary edges, the graph asserts two independent facts and cannot record that they came from one assertion, or that rejecting the transducer falsifies the pair. This is the shape our coupling result rests on: every physical drive class carries a named rival transducer, and "rival transducer" is a claim about the middle term. **Cost: high, and it touches a published finding. Addressed in §5.1.**

**3.3 Claims about claims — 60 `confounds`, plus 57 rival positions over 119 contested claims.** `auditory pathway confounds transcranial ultrasound` is not what Guo 2018 showed. The auditory pathway confounds *the inference from the acoustic focus to the observed activation*, in that preparation. The target is an edge, not a node. Our hypothesis groups are the same shape approached from the other side — a position gathers a set of claims — and they work, which is the precedent for doing this by reification rather than by a new store. **Cost: high, and it touches the headline finding. Addressed in §5.2.**

**3.4 Conjunctive requirement — some of the 78 `required_for`.** Where three things are jointly necessary, three binary `required_for` edges say something weaker and different: that each independently supports the outcome. AND becomes a bag. The vagal–splenic vertical is exactly this (vagal efferent traffic, ChAT⁺ T cells, α7 nicotinic receptors). **Cost: moderate, concentrated in a few verticals. Addressed in §5.3 as optional.**

## 4. Options considered

| | What it is | Verdict |
|---|---|---|
| **A. Do nothing** | Keep binary + qualifiers | Cheapest, and defensible — but §3.2 and §3.3 misstate what sources asserted, in the two places our findings are strongest |
| **B. More qualifiers** | Add `mediator_note:`-style free text | No new machinery, no new power: unaddressable, ungroundable, uncountable. The problem we already have |
| **C. Reified roles in `claims.yaml` (proposed)** | Named role slots on a claim; star expansion on load; incidence table in the exports | Fits the existing store, the ledger and the validator; the cost lands in analytics conventions, which §7 fixes |
| **D. Hypergraph-native store** | TypeDB *n*-ary relations with roles, HypergraphDB, AtomSpace | Real expressiveness, wrong price: loses GDS, loses Neo4j Browser for Daniel, breaks the derived-database discipline and the reproducible-release story |

Precedent for C is broad: Biolink Model puts qualifier slots on associations rather than going *n*-ary; Wikidata uses statement-plus-qualifier; PROV-O has the qualified-influence pattern for exactly this; nanopublications bundle assertion, provenance and publication info; the W3C note on *n*-ary relations sets out the same three workarounds. DrugMechDB, our nearest neighbour, keeps binary edges and pays §3.2's cost. **Recommended: C.**

## 5. The proposal, as a schema diff

Three changes to the `claims.yaml` spec. All are **additive and optional**: a pack that uses none of them is a valid pack under the new version, so no existing claim changes and the id ledger is untouched.

### 5.1 `mediator:` — a first-class middle term

```yaml
  - id: C0601                      # illustrative: a NEW claim id, not a re-arity of an existing one
    subject: { label: "Low-intensity transcranial ultrasound", type: ExogenousDrive, term: tus }
    predicate: modulates
    object:  { label: "Cortical spiking", type: Measurement }
    mediator:                       # NEW — ordered list, 1–3 entries, each a node like subject/object
      - { label: "Piezo1 and other mechanosensitive channels", type: CouplingMechanism,
          term: piezo1, role: proposed_primary }
    level: cellular
    evidence: animal-interventional
    species: [mouse]
    status: contested
    hypothesis: H-tus-mechanism-p1
    refs: [68]
    section: v0-5-coupling-acoustic-optical-chemical
```

`role:` on a mediator takes a closed vocabulary: `proposed_primary | named_rival | required_relay | permissive_gate`. This is the same distinction `fig4-coupling-rivals.json` already draws by hand; promoting it means the figure is derived from the claims rather than maintained beside them.

**Validator:** `mediator` optional, ≤ 3 entries, each with `type` from `node_types` and `term`/`xref` resolving as for `subject`/`object`; `role` from the closed list; a claim with `predicate: couples_via` **should** carry a mediator (warning, not error, until the back-fill in §10 is done).

### 5.2 `threatens:` — a confound aimed at an inference

Rather than re-pointing the 60 existing `confounds` claims at claim ids (which changes what a permanent id asserts), add an optional list of claim ids that a confound claim threatens:

```yaml
  - id: C0156
    subject: { label: "Auditory pathway activation by transcranial ultrasound", type: Confound,
               term: auditory-confound }
    predicate: confounds
    object:  { label: "Transcranial ultrasound stimulation", type: ExogenousDrive, term: tus }
    threatens: [C0058, C0059]      # NEW — the inferences this confound undermines
                                   # (the two human TUS outcome claims)
    threatens_note: "activation ascended through the auditory system rather than arising at the focus"
    level: circuit
    evidence: animal-interventional
    species: [guinea pig]
    status: contested
    hypothesis: H-tus-confound-p1
    refs: [74]
```

The existing `object` stays, so nothing an id already asserts changes; `threatens` adds the edge-to-edge relation we actually mean. This is what makes the identity-of-cause finding queryable rather than curated: "which claims are threatened by a confound whose evidence is human-interventional, and which of those are load-bearing for a clinical outcome?"

**Validator:** every id in `threatens` exists; a claim may not threaten itself; `threatens` is only permitted where `subject.type: Confound` or `predicate: confounds`.

### 5.3 `co_required_with:` — marking an AND-set (optional, lower priority)

```yaml
  - id: C0602
    subject: { label: "ChAT-expressing memory T cells in the spleen", type: CellType, term: chat-positive-t-cell }   # glossary id to be added with the claim
    predicate: required_for
    object:  { label: "Vagal suppression of splenic TNF", type: Outcome, term: inflammatory-reflex }
    co_required_with: AND-vagal-splenic      # NEW — a named conjunction id shared by its members
```

**Validator:** a conjunction id with fewer than two members is an error; all members must share the same `object.term`.

### 5.4 What stays exactly as it is

`species`, `parameters`, `preparation`-style keys, `evidence`, `level`, `status`, `hypothesis`, `refs`, `section`, `synthesis`, `finding: null-result`. Promoting context to roles would double the curation cost and the inter-rater surface for no query we have wanted to run.

## 6. How it lands in the graph and the exports

**Neo4j (star expansion, loader owned by Claude Code).** Claims are **not** nodes in the derived database today — see §6a, which establishes the current model and the migration it forces. Under this proposal a claim becomes a node carrying its own properties, with typed role relationships to its participants: `(:Claim)-[:SUBJECT]->(:Entity)`, `-[:OBJECT]->(:Entity)`, `-[:MEDIATED_BY {role}]->(:Entity)`, `-[:THREATENS]->(:Claim)`, and a `(:Conjunction)` node joining `co_required_with` members. The load discipline does not change: wipe-and-load, generated from the pack, never hand-edited.

**Exports (APP-SPEC §4.1).** Cypher and CSV carry the new relationships directly. GraphML nominally has a `<hyperedge>` element, but essentially no tool reads it — NetworkX will not, Gephi and yEd ignore it — so GraphML ships star-expanded, as now. **New export: `incidence.csv` (`claim_id, role, node_id, node_type, term`)**, which becomes the authoritative artefact for anyone doing hypergraph analysis off our data. Small file, large credibility.

**The app.** `/graph` gains the mediator and threatens relationships in its claim view. No new page.

## 6a. The current model, and the migration it forces

**Established 2026-09-23 by reading the repository** (`public/graph/claims.cypher`, `edges.csv`, `nodes.csv`, `scripts/build-content.ts`, `scripts/lib/claims.ts`).

**What is there now.** The export is **claim-as-relationship**: its own header says *880 nodes, 458 relationships (one per claim)*. Entities are `(:Entity)` plus a type label, keyed by a slug-and-hash id. Every claim is one relationship whose type is the upper-cased predicate, carrying `claim_id`, `predicate`, `refs`, `status`, `evidence`, `level`, `species`, `section`, `volume`, `synthesis`, `finding`, `hypothesis`, `hypothesis_group`, and `parameters` as a JSON string:

```cypher
MATCH (s:Entity {id: '…'}) MATCH (o:Entity {id: '…'})
MERGE (s)-[r:COUPLES_VIA {claim_id: 'C0001'}]->(o)
SET r.predicate = 'couples_via', r.refs = [30], r.status = 'supported', … ;
```

Hypothesis groups are relationship *properties*, not objects: `hypothesis` and `hypothesis_group` are strings on the claim relationship. There is no `(:Dispute)` or `(:Position)` node, and no way to attach anything to a claim.

**Why that blocks §5.** A Neo4j relationship cannot be the endpoint of another relationship, and cannot own relationships of its own. So `mediator:` has nowhere to attach and `threatens:` has nothing to point at. **Adopting either role requires the loader to reify claims as nodes.** This is not a workaround forced on us by Neo4j's limits — it is the "richer model (reified claims, hypothesis groups and references as nodes)" that workstream G4 was set up to design, arriving on schedule and for a concrete reason.

**Target model.**

```cypher
(:Claim {id, predicate, level, evidence, species, status, refs, section, volume,
         synthesis, finding, parameters})
  -[:SUBJECT]->(:Entity)
  -[:OBJECT]->(:Entity)
  -[:MEDIATED_BY {role}]->(:Entity)        // §5.1
  -[:THREATENS]->(:Claim)                  // §5.2
  -[:TAKES_POSITION]->(:Position)-[:RIVAL_OF]->(:Dispute {id, question, section})
  -[:PART_OF]->(:Conjunction)              // §5.3, if adopted
```

**Migrate without breaking anything: emit both.** The loader keeps writing today's binary relationship beside the new claim node, from the same model object, marked `derived: true`. Then `/graph`, the Neo4j panel's atlas load, and every query already written keep working unchanged, and the query library migrates one file at a time rather than in a big bang. The derived edge is dropped only once nothing reads it. Cost: the load carries 458 extra nodes and about 1,400 extra relationships — trivial at this scale.

**What the queries gain.** Three examples, each currently impossible or hand-maintained:

```cypher
-- Rival transducers by drive class (today: readable only from fig4, maintained by hand)
MATCH (cl:Claim)-[m:MEDIATED_BY]->(x:Entity), (cl)-[:SUBJECT]->(d:Entity)
WHERE m.role = 'named_rival'
RETURN d.label AS drive, collect(DISTINCT x.label) AS rivals ORDER BY drive;

-- Identity of cause: which inferences does a confound threaten? (today: not expressible)
MATCH (cf:Claim {predicate:'confounds'})-[:THREATENS]->(t:Claim)
MATCH (t)-[:SUBJECT]->(d:Entity), (t)-[:OBJECT]->(o:Entity)
RETURN d.label AS nominal_cause, o.label AS effect, cf.refs AS rival_evidence,
       t.level AS level, t.status AS status;

-- Convergence, as a query rather than a script
MATCH (d:Entity)<-[:SUBJECT]-(cl:Claim)-[:OBJECT]->(e:Entity)
WHERE cl.level IN ['molecular','subcellular']
  AND d.type IN ['ExogenousDrive','StimulationProtocol']
WITH e, collect(DISTINCT coalesce(d.term, d.id)) AS drives
WHERE size(drives) > 1
RETURN e.label AS endpoint, size(drives) AS drive_classes, drives
ORDER BY drive_classes DESC;
```

The third is §8's point in executable form: once claims are nodes, the convergence audit stops being a one-off script over the YAML and becomes a stamped query anyone can re-run against the released database.

**GDS keeps working, through a declared projection.** Entity-level centrality and community detection run on a projection built with a Cypher aggregation, not on the raw star graph — which is what turns §7's convention into something enforceable:

```cypher
-- star expansion projected back to entity-to-entity (the default for centrality)
MATCH (a:Entity)<-[:SUBJECT]-(cl:Claim)-[:OBJECT]->(b:Entity)
RETURN gds.graph.project('entities-star', a, b, {relationshipType: 'ASSERTS'}) AS g;

-- clique expansion over all participants of each claim (report as such when used)
MATCH (cl:Claim)-[:SUBJECT|OBJECT|MEDIATED_BY]->(p:Entity)
WITH cl, collect(DISTINCT p) AS ps
UNWIND ps AS a UNWIND ps AS b
WITH a, b WHERE elementId(a) < elementId(b)
RETURN gds.graph.project('entities-clique', a, b, {relationshipType: 'CO_PARTICIPATES'}) AS g;
```

These are written in Neo4j 5 syntax (`elementId`, the un-colonised relationship-type alternation), and the projection procedure's exact signature moves between GDS versions, so Claude Code should check both against the pinned container from G1 rather than trusting the form above.

**Where Neo4j genuinely stops.** Hypergraph-native analysis — hypergraph modularity, hypergraph Laplacians, edge-dependent random walks — has no GDS equivalent and runs in Python (HyperNetX, XGI) over `incidence.csv`. That is a second path for a specific class of question, not a second database.

**Work this adds, for Claude Code.** Reify claims in `scripts/lib/claims.ts` and the Cypher, CSV, GraphML and JSON emitters; promote disputes and positions to nodes; emit the derived binary edge alongside, flagged; add `incidence.csv`; keep the export deterministic and the load idempotent; extend the load test to assert 458 `(:Claim)` nodes, one `SUBJECT` and one `OBJECT` each, and one derived edge per claim. Per the G4 rule this is prototyped as a second export into a second database; the published export changes only after Daniel approves §12.

## 7. Analytics ramifications — where the real cost is

Promoting arity changes numbers that are already in print and in the query library. These conventions must be adopted with the schema, not after it.

1. **Path length.** Every traversal through a claim gains a hop; a three-step mechanism path becomes six. **Convention: path lengths in the query library are stated in *claim hops*, not relationship hops, and every query header declares which it uses.**
2. **Centrality.** Claim nodes become hubs by construction, so PageRank and degree begin ranking assertions rather than entities. **Convention: centrality is computed on a declared projection, never on the raw star graph, and the projection is named in the stamped result.**
3. **Projection choice is a method, not an implementation detail.** Clique expansion inflates triangles and distorts clustering; star expansion biases community detection toward claims. **Convention: entity-level analytics use star expansion with claim nodes excluded from the ranking, and any clique expansion is reported as such.**
4. **Comparability breaks at the version bump.** Betweenness and community assignments are not comparable across the change. **Convention: re-run and re-stamp the whole query library at adoption; keep the pre-bump results in `graph/results/` rather than overwriting them.**
5. **Genuine hypergraph analysis lives off-graph.** GDS has no hypergraph algorithms. Hypergraph modularity, hypergraph Laplacians and edge-dependent random walks are Python work (HyperNetX, XGI) over `incidence.csv`, as a second path, not a replacement for the workbench.

## 8. What it does to the findings in print

**Strengthens: identity of cause.** With `threatens`, "in six disputes the rival says the intervention was not the cause" stops being a curated table and becomes a query over claim-to-claim threat edges. That is the difference between a result we assert and one a reader can re-derive. Good for the poster, and better for the grant.

**Changes: the convergence audit.** The 94 → 87 → 6 → 2 funnel is a degree count on a projection: how many claims name the same endpoint label. Under explicit arity the question sharpens to *how many claims place endpoint E in the consequent, with antecedents in different drive classes and compatible context* — a better definition that will produce a **different number**. It must not change silently between the abstract and the poster.

**Unchanged:** the dispute counts (119 / 25 / 57), the 12 / 7 / 6 split, corpus profile, and the field-strength material.

## 9. Grounding (B1) interaction

Anchors attach **per role**, not per node type: a mediator is anchored in GO or PR, a confound in no ontology we have (it is a claim about a study design), an outcome in whatever B1 settles for outcomes. Settling B1 first and then adding roles means grounding every role once; doing it in the other order means grounding mediators twice. **Sequence: B1 method first, this schema second, both applied to Volume 1 from the start.**

Relevant here: joined on free-text labels the claim graph has 873 distinct nodes in 419 components, the largest holding 6; joined on glossary terms, 452 nodes in 66 components, the largest holding 290. Vocabulary, not arity, is still the dominant term in how much of the graph connects. Arity is the second-order fix, and should not be sold as the first.

## 10. Migration and id stability

1. **No claim is ever re-aritied under its id.** Adding an optional field to an existing claim is permitted where it does not change what the claim asserts (`threatens`, `co_required_with`). Splitting or merging claims is not.
2. **New arity applies to Volume 1 and to new claims from adoption**, exactly like the grounding rule.
3. **Back-fill is explicit and bounded**: the 17 `couples_via` claims get mediators, and the 60 `confounds` claims get `threatens` lists, as a single reviewed pass recorded in a scrum note. Everything else is left alone.
4. **Reification does not touch claim ids.** The derived database gains `(:Claim)` nodes keyed by the same permanent `claim_id`; the pack is unchanged by the loader switch.
5. **The id ledger is unaffected** — no ids appear or disappear — so the build's ledger check passes through the migration untouched.

## 11. Timing against the release

The convergence re-measurement (§8) is the constraint. Three options:

- **Adopt now, re-measure now.** New convergence number before the DOI. Risk: the number moves under the Lyon abstract, which is already submitted.
- **Adopt now, re-measure after the DOI release (recommended).** Schema lands for Volume 1 and the back-fill; the poster carries the current funnel with its method named and "upper bound" framing intact; the re-measurement becomes a V1-era result.
- **Defer entirely to post-Lyon.** Safest for the numbers, but Volume 1 then gets curated under the old model and needs retrofitting — the exact mistake B1 exists to avoid.

## 12. Decisions requested — all three approved 2026-09-23

1. **Adopt option C** (reified roles), with `mediator` and `threatens`, for Volume 1 and new claims. **Approved 2026-09-23.**
2. **`co_required_with`** held until a vertical needs it. **Approved 2026-09-23** — documented in §5.3, not implemented, not in the validator.
3. **Timing** — adopt now, re-measure convergence after the DOI release. **Approved 2026-09-23.** The poster carries the current 94 → 87 → 6 → 2 funnel with its method named and the upper-bound framing intact; the re-measurement is a V1-era result.

## 13. Definition of done, if adopted

- [ ] CONTENT-PACK bumped, the `claims.yaml` section carrying the three fields, their validator rules and the role vocabulary; change logged.
- [ ] `tools/validate_pack.py` enforces §5's rules; pack still validates to 0 errors.
- [ ] Claude Code mirrors the schema in the build (zod), reifies claims as nodes in all four emitters with the derived binary edge alongside, promotes disputes and positions to nodes, updates `/graph`, and adds `incidence.csv` to the exports (§6a).
- [ ] Load test asserts 458 `(:Claim)` nodes, one `SUBJECT` and one `OBJECT` each, one derived edge per claim, and an idempotent second run.
- [ ] The reified model is prototyped as a second export into a second database before the published export changes (G4 rule).
- [ ] Back-fill pass done and recorded (17 mediators, 60 `threatens` lists).
- [ ] Query library headers carry the path-length and projection conventions; the library is re-run and re-stamped, with pre-bump results kept.
- [ ] `fig4` regenerated from claims rather than maintained beside them.
- [ ] B2 inter-rater sheet extended with an arity/role column, so the kappa measures reading disagreement rather than schema confusion.

## 14. Risks, and what would make me wrong

- **Curation cost.** Every new role is a decision a curator can get wrong. Mitigated by closed vocabularies and by keeping context as fields.
- **Arity becomes a disagreement axis.** If the B2 kappa comes back low *on roles specifically*, that is evidence the model is too expressive for one curator to apply consistently, and §5.1 should be narrowed to `couples_via` only.
- **Expressiveness without a question.** If, after the back-fill, no query in the library needs `mediator` to answer a question we actually asked, the honest read is that qualifiers were enough and this was ceremony.
- **Scope creep toward a native store.** Option D will look attractive once roles exist. It should not be revisited before the DOI'd release ships.

## 15. Changelog

- v0.2 (2026-09-23) — added §6a: the current export is claim-as-relationship (880 nodes, 458 relationships), confirmed by reading the repository, so adopting either role requires reifying claims as nodes. Target model, before/after Cypher, GDS projections, the emit-both migration and the loader work items.
- v0.1 (2026-09-23) — first draft, for Daniel's decision. Counts from `claims.yaml` as of the current pack: 458 claims; 17 `couples_via`, 25 `gates`, 60 `confounds`, 78 `required_for`, 18 `measured_by`; 426 with `parameters`; 119 contested in 25 disputes over 57 positions.
- v0.3 (2026-09-23) — **approved.** Decisions 1–3 taken by Daniel. CONTENT-PACK v0.8 and the validator landed the same day; loader work dispatched as G4.2; back-fill sequenced behind B1.
