---
id: property-graphs-and-ontologies
title: Property graphs and ontologies
one_liner: "How a graph stores a claim: nodes and edges with typed properties, identifiers borrowed from community ontologies, and a query language that asks about paths."
why_here: "Section 15 proposes a starter schema whose edges carry parameter sets, species and confound controls, and anchors each level to an ontology; this page supplies the data-modelling background that proposal assumes."
prerequisites: [evidence-grading-and-translation]
terms: [property-graph, predicate, curie, uberon, obo-foundry-ontology, evidence-and-conclusion-ontology, neuron-phenotype-ontology, sckan, drugmechdb, semmeddb, claim-path, rival-edge, protocol-module, evidence-level]
figures: []
further_reading:
  - { title: "Cypher Manual: introduction to Neo4j's property-graph query language", url: "https://neo4j.com/docs/cypher-manual/current/introduction/", kind: textbook }
  - { title: "RDF 1.1 Primer (W3C Working Group Note)", url: "https://www.w3.org/TR/rdf11-primer/", kind: textbook }
  - { title: "The OBO Foundry: registry and principles for interoperable biomedical ontologies", url: "https://obofoundry.org/", kind: textbook }
  - { title: "Systematic integration of biomedical knowledge prioritizes drugs for repurposing (Himmelstein et al., eLife 2017)", url: "https://elifesciences.org/articles/26726", kind: review }
self_check:
  - q: "What can a property graph express directly that a plain RDF triple cannot?"
    options: ["A relation between two entities", "Qualifiers attached to the relation itself, such as species, dose and preparation", "A globally unique identifier", "A class hierarchy"]
    answer: 1
    explanation: "A triple is subject-predicate-object; qualifying the statement itself requires reification, RDF-star or named graphs, whereas a property graph stores key-value properties on the edge."
  - q: "Why does the schema store a CURIE rather than a term's name?"
    options: ["Names are longer to type", "An identifier resolves to one agreed term across resources, while names drift and collide", "CURIEs are required by Cypher", "Names cannot be indexed"]
    answer: 1
    explanation: "Anchoring a node means storing its identifier, e.g. UBERON:0000955, so that an anatomical structure, cell type or chemical entity resolves to the same class across resources and species."
  - q: "What does an ontology give you that a node label does not?"
    options: ["Faster queries", "A definition, a place in a class hierarchy and a shared identifier, so subclass queries and cross-species comparison work", "Automatic evidence grading", "A guarantee the assertion is true"]
    answer: 1
    explanation: "A label is a local string; an ontology term carries a definition, axioms and superclasses, which lets a query over 'thalamus' also retrieve its subclasses and lets species-specific anatomies be compared."
  - q: "In the volume's starter schema, what must every claim edge carry regardless of its predicate?"
    options: ["A p-value", "Evidence type, certainty, species and preparation, plus a source link and the dose and state qualifying its sign", "A CURIE from Uberon", "A confidence interval and a figure reference"]
    answer: 1
    explanation: "The volume states that an edge lacking evidence type, certainty, species, preparation, source link and dose/state qualification is not importable."
  - q: "Why is the volume wary of automatically extracted subject-predicate-object predications?"
    options: ["They are too few to be useful", "A mined triple inherits the sentence's ambiguity rather than the study's design", "They cannot be stored in a property graph", "They lack CURIEs by construction"]
    answer: 1
    explanation: "Text mining scales, but an extracted predication carries what a sentence said, not the species, preparation, dose or controls of the experiment, which is the argument for hand curation."
---

## What it is

A graph is a set of nodes and a set of edges between them. Two conventions dominate biomedical practice. In the **property-graph** model, each node has one or more *labels* (its types) and a bag of key-value *properties*; each edge has exactly one relationship type, a direction, and its own bag of properties. In the **RDF** model, everything is a *triple* — subject, predicate, object — where subjects and predicates are global identifiers (IRIs) and objects are identifiers or literal values; a graph is a set of such triples, and standards exist for datasets of named graphs and for querying with SPARQL.

The difference matters for this volume because its unit of knowledge is not "A activates B" but "A activated B, in this species, in this preparation, at this dose, measured with this readout, with these controls, in this paper". A property graph stores those qualifiers on the edge. RDF must *reify* — make the statement itself an object with its own identifier, or use RDF-star or named graphs — which is expressive but adds a layer between the statement and its qualifiers.

An **ontology** is not a graph database; it is an agreed vocabulary of classes with definitions, identifiers and logical relations, usually `is_a` and `part_of`. Uberon is a species-neutral anatomy ontology of more than 6,500 classes that links species-specific anatomy ontologies, so a target or an end organ can be named once and compared across humans and model organisms [214]; cell types take identifiers from the Cell Ontology [215], molecular and subcellular nodes from the Gene Ontology [216], chemical entities from ChEBI [217], evidence types from the Evidence and Conclusion Ontology [218], and neuron types are handled compositionally by the Neuron Phenotype Ontology, which decomposes a type into phenotypes carrying community identifiers [156].

Where nothing exists, the volume says so: no ontology in its corpus covers stimulation protocols or device parameters adequately, so the protocol module has to be authored, its nearest relatives being reporting standards such as RATES [193] and open parameter repositories [79]. The prior art for shape is DrugMechDB, whose unit of curation is a hand-assembled path from intervention to indication [223]; the engineering patterns come from the large integrative graphs, Hetionet [219], SPOKE [221] and PrimeKG [222]; the contrast case is SemMedDB, built by automatic extraction [220].

## L1 — Intuition

Imagine writing what you know on index cards. On one kind of card you write a thing: *subthalamic nucleus*, *ketamine*, *motor evoked potential*. On another kind you write a relationship between two things: *this drug binds that receptor*. A graph is just that pile of cards with the relationship cards pinned between the thing cards.

Now the important part. If all a relationship card says is "binds", the pile is nearly useless here, because the same sentence can be true in a mouse at a dose no human would receive and false in a person. So the relationship cards carry the details: species, preparation, dose, how it was measured, whether the control was any good, and which paper it came from. That is what a *property graph* is — the relationships themselves carry information, not just their endpoints.

The second idea is borrowed vocabulary. If one card says "thalamus", another "Thal." and a third "dorsal thalamus", nothing can be counted. So instead of names you write codes from public dictionaries — one for the anatomical structure, one for the cell type, one for the chemical. These dictionaries, called ontologies, also record which things are kinds or parts of which, so a question about the thalamus can include its parts. A label is a word you chose; an ontology term is one everyone else has agreed to use, with a definition and a place in a family tree.

Finally, you need a way to ask questions of the pile. Graph query languages let you ask for *chains*: show me every route from this drug to this outcome, and tell me where along the route the species changed.

## L2 — Undergraduate

**Property graph mechanics.** A node is `(n:Drive {drive_class: 'tus', device: 'single-element', free_field_isppa_w_cm2: 10.5})`. Labels (`Drive`) define type and are usually indexed; properties hold scalars, or lists of scalars, but not nested objects. An edge is written `(a)-[r:COUPLES_VIA {species: 'mouse', preparation: 'acute slice', measured: false}]->(b)`: exactly one type per edge, always directed, with its own properties. If you need a relation among three things — drive, transducer and blocking drug — you either promote it to a node or you lose information; property graphs are natively binary.

**RDF mechanics.** The same assertion is triples: `ex:drive42 rdf:type ex:Drive`, `ex:drive42 ex:couplesVia ex:transducer7`. To say *in what species*, you cannot hang a property on the middle triple; you reify it (`ex:stmt1 rdf:subject ex:drive42; rdf:predicate ex:couplesVia; rdf:object ex:transducer7; ex:species "mouse"`), or you put the triple in a named graph and annotate the graph, or you use RDF-star. In exchange RDF gives you global identifiers by construction, a standard query language and, with OWL, machine reasoning over class hierarchies.

**What the ontology adds.** Suppose a node is labelled `Circuit` with property `name: "subthalamic nucleus"`. Nothing in the graph knows that this is part of the basal ganglia, that the rodent structure is the counterpart of the human one, or that another curator's "STN" is the same thing. Give the node an Uberon identifier in an `anchor_curie` property instead of a bare name, and all three become available, because Uberon supplies the definition, the `part_of` chain and the cross-species bridge [214]. Evidence gets the same treatment: an ECO type distinguishes a curated anatomical projection from a sham-controlled trial [218], and a certainty grade from GRADE sits alongside it [208].

**CURIEs and identifier discipline.** A CURIE is `prefix:local-id` — a compact form of a full IRI, expanded through a prefix map. Discipline means: store the identifier, not the name; store the prefix map version; never mint a local identifier in someone else's namespace; record a label only as a cached convenience; and mark a slot explicitly unanchored where no ontology exists, as the volume does for protein-level identity and for protocols [193,215–217].

**Asking a path question.** Cypher is the property-graph query language; a pattern in brackets and arrows is matched against the graph. `MATCH (d:Drive)-[:DELIVERS]->(:DeliveredQuantity)-[:COUPLES_VIA]->(t:Transducer) RETURN d.drive_class, t.name` returns every drive class with the transducers something says it couples through. The same question in SPARQL is a conjunction of triple patterns; the same question in SQL is a chain of joins whose length you must know in advance.

## L3 — Graduate

Take the starter schema of section 15.5 literally: node types `Drive` (nominal), `DeliveredQuantity` (effective), `DrugDrive`, `Transducer`, `CellPopulation`, `MolecularEndpoint`, `Circuit`, `BodySystem`, `Outcome`, `Confound`, `HypothesisGroup` and `Path`, with main predicates `DELIVERS`, `COUPLES_VIA`, `ACTIVATES`, `UNDERGOES`, `CONVERGES_ON`, `MODULATES`, `PROJECTS_TO`, `DRIVES`, `RESULTS_IN`, `THREATENS`, `REBUTS` and `RIVAL_OF`. Every claim edge carries the same four properties — evidence type [218], certainty [208], species and preparation — plus a source link and the dose and state that qualify its sign; an edge without these is not importable [155,218].

A path query over that schema, asking for complete mechanism chains for one drive class while enforcing the importability rule:

```cypher
// Complete ultrasound mechanism paths into a named target,
// keeping only chains whose every step declares species and evidence type.
MATCH p = (d:Drive {drive_class: 'ultrasound'})
          -[:DELIVERS]->(q:DeliveredQuantity)
          -[:COUPLES_VIA]->(t:Transducer)
          -[:ACTIVATES]->(c:CellPopulation)
          -[:MODULATES]->(z:Circuit)
          -[:RESULTS_IN]->(o:Outcome)
WHERE z.anchor_curie = $target_curie                // e.g. 'UBERON:0000955'
  AND q.in_situ_estimated IN ['measured', 'modelled']
  AND all(r IN relationships(p)
          WHERE r.species IS NOT NULL
            AND r.evidence_type IS NOT NULL
            AND r.certainty IS NOT NULL)
RETURN t.name                                   AS transducer,
       o.name                                   AS outcome,
       [r IN relationships(p) | r.species]      AS species_chain,
       [r IN relationships(p) | r.evidence_type] AS evidence_chain,
       q.free_field_isppa_w_cm2                 AS free_field,
       q.in_situ_isppa_w_cm2                    AS in_situ,
       length(p)                                AS steps
ORDER BY steps ASC, transducer
```

Three features of the language are doing real work. `p = (...)` binds the whole path so `relationships(p)` can be tested as a list — this is how "mechanism is a path, not an edge" becomes a query rather than a comment. `all(... WHERE ...)` enforces a schema rule at read time, which is how an under-annotated import is kept out of an answer even if it was let into the store. And `$target_curie` is a parameter, so the anchor identifier is data, never string-concatenated into the query.

Rival edges are a second pattern. Two transducer accounts of the same delivered quantity are two `COUPLES_VIA` edges from one `DeliveredQuantity` node, each with its own preparation and discriminating test:

```cypher
MATCH (q:DeliveredQuantity)-[r:COUPLES_VIA]->(t:Transducer)
WITH q, collect({transducer: t.name,
                 preparation: r.preparation,
                 species: r.species,
                 test: r.discriminating_test}) AS accounts
WHERE size(accounts) > 1
MATCH (h:HypothesisGroup)-[:RIVAL_OF]->(q)
RETURN q.name AS delivered_quantity, h.id AS hypothesis_group, accounts
```

Variable-length matching is what makes the graph worth building rather than a spreadsheet: `MATCH p = (d:Drive)-[*1..6]->(o:Outcome)` enumerates candidate chains of unknown length, and DrugMechDB's contribution is the demonstration that a *curated* path, not an inferred one, is the right unit for mechanism — 4,583 drug-indication pairs, 32,249 relationships, hand-assembled [223]. Hetionet supplies the counterpart engineering result, that path patterns through a typed heterogeneous graph carry mechanistic signal usable for prediction across 47,031 nodes and 2,250,197 relationships of 24 types [219].

The RDF comparison can now be stated precisely. Everything above is expressible in RDF, but each edge with $k$ qualifier properties becomes one reified statement plus $k$ triples about it — so a 6-step path with 6 qualifiers per step goes from 6 edges to roughly 6 × (1 + 3 + 6) triples, and every query must traverse the reification layer. What RDF buys in return is inference: given an ontology axiom that the subthalamic nucleus is `part_of` the basal ganglia, a query about the basal ganglia retrieves subthalamic claims without the query author enumerating parts. The practical arrangement the volume's anchors imply is the hybrid one: identifiers and hierarchies from OBO ontologies [214–218], instance data and qualifiers in a property graph, with ontology closure imported as `IS_A`/`PART_OF` edges so that a property-graph query can still walk a hierarchy.

## L4 — Expert

The fragile parts are not the graph model but the joins to reality.

*No protocol ontology exists.* The volume states it plainly: nothing in its corpus covers stimulation protocols or device parameters adequately, and the nearest artefacts — the RATES Delphi consensus with 66 items in five groups and a 26-item essential subset [193], and the Iowa–Newcastle ultrasound repository whose own authors name incomplete parameter reporting as a limit [79] — say what to write down without supplying identifiers or a class hierarchy. So the most load-bearing module in the schema is the one with no community anchor, and every builder will author it differently. Until a shared protocol vocabulary exists, cross-graph comparison of dose is manual.

*Property graphs have no standard semantics.* Labels and property keys are conventions inside one database; there is no subsumption, so `:CellPopulation` and `:Cell_population` are unrelated, and nothing checks that `species: 'mouse'` and `species: 'Mus musculus'` are the same. RDF/OWL has the semantics and loses on qualifier ergonomics and, at scale, on reasoning cost. Neither side of this is settled practice in biomedical knowledge graphs, and the volume takes the pragmatic route by naming anchors per level rather than committing to a formalism [214–218].

*Identifiers rot and prefixes collide.* Ontology classes are deprecated, merged and replaced; a stored CURIE without a version is a dated assertion. Prefix maps are not universal, so a bare prefix such as `CL:` is unambiguous only relative to a registry. Any serious import therefore needs the prefix map and ontology release recorded next to the identifier — the same provenance discipline the volume demands for dose parameters.

*Curation cost versus extraction noise.* SemMedDB shows the alternative acquisition route, subject-predicate-object predications extracted automatically by SemRep from all of PubMed [220]; the volume lists an automatically extracted assertion used as a fact among the four kinds of result deserving scepticism, because a mined triple inherits the sentence's ambiguity rather than the study's design [220]. Hand curation, as practised by SCKAN [155] and DrugMechDB [223], produces edges with the qualifiers this volume needs and produces them slowly. No result in this corpus quantifies the trade-off, which makes "curate or mine" a resourcing decision, not an evidence-based one.

*Structural statements read as physiological ones.* SCKAN holds population-level structural connectivity, not physiology: it says a population projects by a route, not what a stimulation train does to its firing [155]. Importing such statements next to stimulation-response claims is exactly the situation an evidence type on every edge is meant to survive [155,218], and the volume's own warning is that the documentation does not license the physiological reading [155].

*Naming neurons is unsolved by labels.* The Neuron Phenotype Ontology's demonstration — reconciling three published cortical classifications with each other and with informal names by decomposing types into phenotypes [156] — is an argument that for some node classes the right representation is compositional rather than a single identifier. Whether the same applies to protocols, which are also bundles of properties, is an open design question this volume raises but does not answer.

## How this volume uses it

Section 2 argues that prose can leave much unstated while a graph edge cannot, and names the four choices writing the chain as edges forces: direction, sign, species and evidence. Section 15.1 lists fourteen schema requirements drawn from earlier sections — separate nominal and effective nodes, dose as a named parameter set, rival transducers as rival edges, target definition on circuit edges, confounds as nodes, evidence type and certainty everywhere, and mechanism as a path. Section 15.2 assigns the anchors this page describes: Uberon for anatomy [214], the Cell Ontology for cell types [215], the Gene Ontology for molecular nodes [216], ChEBI for chemicals [217], ECO for evidence [218], GRADE for certainty [208], the Neuron Phenotype Ontology for neuron types [156] and SCKAN for autonomic connectivity [155], while leaving the protein slot named but unanchored.

Section 15.3 explains why the protocol module must be authored [79,193]; 15.4 reviews prior art and states what an edge typed only by predicate and endpoints cannot hold [219–223]; and 15.5 gives the node-type table this page's Cypher examples query, together with the rule that an edge without evidence type, certainty, species, preparation and source is not importable.
