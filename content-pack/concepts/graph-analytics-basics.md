---
id: graph-analytics-basics
title: Graph analytics basics
one_liner: "Degree, betweenness, PageRank, communities, paths and projections — what each measures on a knowledge graph, and why every score needs a null model."
why_here: "Section 15 proposes a graph whose point is to be queried and measured; this page supplies the analytics background, and the failure modes that matter when edges are claims from papers rather than observations of a system."
prerequisites: [property-graphs-and-ontologies]
terms: [property-graph, claim-path, predicate, rival-edge, hypothesis-group, evidence-level, single-laboratory-claim]
figures: []
further_reading:
  - { title: "Network Science (Barabási, free online textbook)", url: "https://networksciencebook.com/", kind: textbook }
  - { title: "Community detection in networks: a user guide (Fortunato & Hric, Physics Reports 2016)", url: "https://arxiv.org/abs/1608.00163", kind: review }
  - { title: "Resolution limit in community detection (Fortunato & Barthélemy, PNAS 2007)", url: "https://arxiv.org/abs/physics/0607100", kind: review }
  - { title: "From Louvain to Leiden: guaranteeing well-connected communities (Traag, Waltman & van Eck, Sci Rep 2019)", url: "https://www.nature.com/articles/s41598-019-41695-z", kind: review }
  - { title: "NetworkX reference: centrality algorithms", url: "https://networkx.org/documentation/stable/reference/algorithms/centrality.html", kind: textbook }
self_check:
  - q: "A node has high betweenness but low degree. What does that mean?"
    options: ["It has many neighbours but they are unimportant", "Few edges, but those edges lie on many shortest paths between other node pairs", "It belongs to no community", "Its PageRank must also be high"]
    answer: 1
    explanation: "Betweenness counts the fraction of shortest paths between all other pairs that run through the node, so a sparse bridge between dense regions scores high with few edges."
  - q: "What does the resolution parameter in modularity maximisation control?"
    options: ["How many iterations the algorithm runs", "The relative weight of the null-model term, and hence the typical size of detected communities", "Whether the graph is treated as directed", "The random seed"]
    answer: 1
    explanation: "Scaling the expected-edges term changes the size scale at which grouping pays off: higher resolution yields more, smaller communities and lower resolution fewer, larger ones."
  - q: "Why can modularity maximisation miss a small, genuinely separate module in a large graph?"
    options: ["Because small modules have low degree", "Because of the resolution limit: below a size that depends on total edge count, merging modules increases modularity", "Because Louvain is stochastic", "Because modularity requires weighted edges"]
    answer: 1
    explanation: "Fortunato and Barthelemy (2007) showed that modularity optimisation cannot resolve modules smaller than a scale set by the total number of edges, independent of how clearly separated they are."
  - q: "You project a paper-claim bipartite graph onto entities. Two entities co-occur in one review that cites 40 entities. What happens?"
    options: ["Nothing: projections are unweighted", "That single document creates a clique of 780 entity pairs, inflating degree and centrality", "The projection drops documents with more than 10 entities", "The two entities become disconnected"]
    answer: 1
    explanation: "A one-mode projection turns every document into a clique among its entities; with 40 entities that is 40x39/2 = 780 edges from one source, which is why projections need weighting by document size or by evidence."
  - q: "Why does a centrality score on a curated literature graph need a null model?"
    options: ["Because centrality is only defined for random graphs", "Because the observed score must be compared with what the same degree sequence would produce by chance, since curation effort and study volume set degree", "Because null models remove the need for evidence types", "Because PageRank is undefined on directed graphs"]
    answer: 1
    explanation: "High centrality may simply reflect how much a node has been studied or curated; comparing against a degree-preserving randomisation separates structure from degree and attention."
---

## What it is

Once knowledge is in a graph, the questions people ask of it are structural: which entities are central, which groups hang together, what routes connect a drive to an outcome, and which of those routes are surprising. Graph analytics is the standard toolkit for those questions — a small set of measures, each with an explicit definition, each answering something narrower than its name suggests.

Four families cover almost all use. **Centrality** scores nodes by position: degree counts neighbours, weighted degree sums edge weights, betweenness counts shortest paths passing through, PageRank measures the stationary probability of a random walker with restarts. **Community detection** partitions nodes into groups denser internally than expected, usually by maximising modularity with a resolution parameter. **Path analysis** enumerates shortest paths, all simple paths, or typed paths matching a template — the operation that matters most here, since the volume makes mechanism a path rather than an edge. **Projections** turn a two-mode (bipartite) graph, such as papers against entities, into a one-mode graph among entities.

The fifth item is not a measure but a discipline: a **null model**. Nearly every score above is monotone in degree, and degree in a literature graph is largely a record of how much something has been studied and curated. Without a comparison against randomised graphs that preserve degree, a centrality ranking mostly recovers attention.

A knowledge graph of claims differs from a physical network in one further way that runs through everything below. An edge asserted once by a single small study and an edge asserted a hundred times look identical unless the graph records the evidence behind each — which is exactly what the volume's requirement of evidence type [218], certainty [208], species and preparation on every edge is for.

## L1 — Intuition

Think of a road map. Some towns have many roads leading into them; some have few roads but sit on the only bridge across a river. Both are important, in different ways. Counting roads tells you the first kind of importance; noticing that every route between north and south passes through the bridge town tells you the second.

Graph analytics is a small set of ways to say "important", plus ways to find clumps. Clumps matter because a map usually has neighbourhoods: places more connected to each other than to the rest. Software can find those automatically, but you have to tell it roughly how big a neighbourhood should be, and the answer changes when you change your mind about that.

Then the question a map cannot answer by itself: is any of this surprising? If the busiest town has the most roads, that is not news. To learn something, compare the real map with shuffled maps that keep each town's number of roads but reconnect them at random. What survives that comparison is structure rather than size.

For a graph built out of published claims there is one more catch, and it is the important one. A road either exists or it does not. A claim in this field might rest on one small experiment in mice or on fifty trials in patients, and once both are drawn as a line between two boxes, they look the same. So before believing any score computed on such a graph, ask what the lines were made of — because a well-studied topic will look central whether or not it is.

## L2 — Undergraduate

Represent a graph on $n$ nodes by its adjacency matrix $A$, with $A_{ij} = 1$ if there is an edge from $i$ to $j$ and 0 otherwise, or by a weight matrix $W$ for weighted graphs. The basic measures:

- **Degree** $k_i$: the number of edges at node $i$; for directed graphs, in-degree and out-degree separately. In a claim graph, in-degree of a molecular endpoint counts how many drives converge on it.
- **Weighted degree (strength)** $s_i$: the sum of incident weights. Which weight you choose — number of supporting papers, certainty grade, inverse of effect-size variance — changes the ranking, so the choice is a modelling decision, not a detail.
- **Betweenness** $b_v$: the share of shortest paths between other node pairs that run through $v$. High-betweenness nodes are brokers; in this volume's graph they are typically the convergence points where several modalities' paths meet, such as a molecular endpoint or a neuromodulator system.
- **PageRank** $x_i$: importance flowing along edges, with a damping factor so the walk restarts occasionally. It rewards being pointed at by nodes that are themselves pointed at.
- **Communities**: a partition into groups with more internal edges than a null model expects, scored by modularity $Q$ with a resolution parameter $\gamma$ that sets the typical group size.
- **Paths**: the shortest path gives a distance; *all simple paths* (no repeated nodes) up to a length bound enumerate alternative mechanisms; typed path templates ask for chains matching a schema.
- **Projections**: with papers on one side and entities on the other, the one-mode entity projection joins two entities whenever a paper mentions both.

**Worked example.** Build a small bipartite graph from this volume's own structure: documents on one side, claims-bearing entities on the other. A consensus paper citing 30 entities and a single-laboratory mouse study citing 4 both contribute edges. Project onto entities: the consensus paper alone produces $\binom{30}{2} = 435$ entity-entity pairs, the mouse study 6. Compute degree, and the entities in the consensus paper dominate — not because they are mechanistically central but because one document was broad. Weight each projected edge by $1/(m-1)$, where $m$ is the number of entities in the document, and the imbalance shrinks. Then recompute against a degree-preserving randomisation to see which pairs remain unusual. That sequence — measure, weight, randomise — is the whole method in miniature.

## L3 — Graduate

**Degree and strength.** For an undirected graph,

$$ k_i = \sum_{j=1}^{n} A_{ij}, \qquad s_i = \sum_{j=1}^{n} W_{ij}, \qquad m = \tfrac{1}{2}\sum_{i,j} A_{ij} $$

- $A_{ij}$ — adjacency entry, 1 if $i$ and $j$ are linked, else 0;
- $W_{ij}$ — edge weight, in whatever unit the modeller chose (papers, inverse variance, certainty score);
- $k_i$ — degree of node $i$ (count); $s_i$ — strength (weight units);
- $n$ — number of nodes; $m$ — number of edges.

**Betweenness.** With $\sigma_{st}$ the number of shortest $s$–$t$ paths and $\sigma_{st}(v)$ the number of those passing through $v$,

$$ b_v = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}} $$

- $b_v$ — betweenness of $v$, dimensionless; normalised by $(n-1)(n-2)$ (undirected: half that) to lie in $[0,1]$;
- $\sigma_{st}$ — count of shortest paths from $s$ to $t$; $\sigma_{st}(v)$ — those through $v$; pairs with $\sigma_{st} = 0$ contribute nothing.

Brandes' algorithm computes all $b_v$ in $O(nm)$ time for unweighted graphs, so exact betweenness is feasible at the scale of a curated volume graph but not at the scale of SPOKE's roughly 27 million nodes and 53 million edges [221], where sampling is used.

**PageRank.** The recursion, for damping factor $d$,

$$ x_i = \frac{1-d}{n} + d \sum_{j \in \mathrm{In}(i)} \frac{x_j}{k_j^{\mathrm{out}}}, \qquad \mathbf{x} = \frac{1-d}{n}\mathbf{1} + d\,\mathbf{M}\mathbf{x} $$

- $x_i$ — PageRank of node $i$, a probability: $\sum_i x_i = 1$;
- $d$ — damping factor, conventionally 0.85, the probability the walker follows an edge rather than restarting;
- $\mathrm{In}(i)$ — nodes with an edge into $i$; $k_j^{\mathrm{out}}$ — out-degree of $j$ (dangling nodes, $k_j^{\mathrm{out}} = 0$, are handled by redistributing their mass uniformly);
- $\mathbf{M}$ — column-stochastic matrix with $M_{ij} = 1/k_j^{\mathrm{out}}$ where $j \to i$;
- $\mathbf{1}$ — the all-ones vector.

The solution is the dominant eigenvector of the Google matrix $d\mathbf{M} + \frac{1-d}{n}\mathbf{1}\mathbf{1}^{\top}$; power iteration converges geometrically at rate $d$, so about 50 iterations give four-digit accuracy at $d = 0.85$. A *personalised* PageRank replaces the uniform restart with a distribution concentrated on seed nodes, which is the natural query form here: restart on one drive class and rank what that drive's claims flow into.

**Modularity and resolution.** For a partition assigning node $i$ to community $c_i$,

$$ Q = \frac{1}{2m} \sum_{i,j} \left( A_{ij} - \gamma \frac{k_i k_j}{2m} \right) \delta(c_i, c_j) $$

- $Q$ — modularity, dimensionless, bounded above by 1; positive means more internal edges than the null model predicts;
- $\gamma$ — resolution parameter; $\gamma = 1$ is the classical Newman–Girvan form, larger $\gamma$ yields smaller communities;
- $k_i k_j / 2m$ — expected number of edges between $i$ and $j$ under the configuration null model, which preserves the degree sequence and rewires at random;
- $\delta(c_i, c_j)$ — 1 if $i$ and $j$ share a community, else 0;
- $m$ — total edges (or total weight, with $W$ in place of $A$).

Maximising $Q$ is NP-hard; Louvain and Leiden are greedy multilevel heuristics, and the Leiden algorithm of Traag, Waltman and van Eck (2019) additionally guarantees that every detected community is internally connected.

**Paths.** Shortest paths come from breadth-first search ($O(n+m)$ unweighted) or Dijkstra ($O(m + n\log n)$ with non-negative weights, using distance $= 1/w$ or $-\log w$ depending on whether weights mean cost or probability). Enumerating *all simple paths* is exponential in the worst case, so it is run with a length bound — which suits this volume, whose claim paths are short by construction: drive → delivered quantity → transducer → cell population → circuit → outcome is five steps. Typed path counting is the operation Hetionet's authors used, weighting paths by node degree so that hub-heavy routes do not dominate the score [219].

**Bipartite projection.** Let $B$ be the $n_e \times n_d$ incidence matrix of entities against documents, $B_{ip} = 1$ if entity $i$ appears in document $p$. Then

$$ P = BB^{\top}, \qquad P_{ij} = \sum_{p=1}^{n_d} B_{ip}B_{jp}, \qquad \tilde P = B\,\Lambda\,B^{\top}, \quad \Lambda_{pp} = \frac{1}{m_p - 1} $$

- $P_{ij}$ — number of documents mentioning both entities; the diagonal $P_{ii}$ is entity $i$'s document count and is normally discarded;
- $\tilde P$ — the size-corrected projection; $\Lambda$ — diagonal matrix of document weights;
- $m_p = \sum_i B_{ip}$ — number of entities in document $p$; a document of $m_p$ entities contributes $\binom{m_p}{2}$ pairs, hence the $1/(m_p-1)$ correction (Newman's collaboration weighting).

**Null models and significance.** For any score $f$ (centrality, projected weight, motif count), compare the observed value with an ensemble of graphs preserving chosen features:

$$ z_i = \frac{f_i^{\mathrm{obs}} - \left\langle f_i^{\mathrm{null}} \right\rangle}{\sigma\!\left(f_i^{\mathrm{null}}\right)} $$

- $f_i^{\mathrm{obs}}$ — observed score at node $i$;
- $\langle f_i^{\mathrm{null}} \rangle, \sigma(f_i^{\mathrm{null}})$ — mean and standard deviation over the null ensemble, usually 1,000+ degree-preserving double-edge-swap randomisations, type-constrained so that a `Drive` node is only rewired to nodes it could legally link to;
- $z_i$ — standardised deviation; on a heavy-tailed null, report an empirical percentile instead, since $z$ assumes near-normality.

Because expected degree enters $Q$, centrality rankings and projected weights alike, the null model is not an optional robustness check: it is the definition of what the number means.

## L4 — Expert

**Modularity's resolution limit and degeneracy.** Fortunato and Barthélemy (2007) proved that modularity maximisation cannot resolve communities below a scale set by $\sqrt{2m}$: below it, merging two clearly separate modules *increases* $Q$, so small modules are invisible however distinct they are. Good, de Montjoye and Clauset (2010) showed the complementary problem, an exponentially large plateau of near-optimal partitions with very different structures, so a single reported partition is arbitrary among many equally good ones. Multi-resolution sweeps over $\gamma$, consensus clustering across runs, and Leiden's connectivity guarantee (Traag, Waltman and van Eck, 2019) are mitigations, not solutions. For a knowledge graph this matters concretely: a genuine but small cluster — one modality's transducer dispute, say — can be absorbed into a large "plasticity" community at $\gamma = 1$ and only appear at higher resolution.

**Degree bias and attention bias.** Betweenness, closeness and PageRank all correlate strongly with degree in sparse graphs, and in a literature graph degree is produced by curation effort and publication volume. A well-studied entity therefore scores high by construction. Hetionet's degree-weighted path count is the explicit correction in this space, down-weighting paths through high-degree nodes so that predictions are not artefacts of hub connectivity [219]. Without such a correction, the "most central" node in a neuromodulation graph will be whatever the field has written most about, which is a bibliometric fact rather than a mechanistic one.

**Edges from one paper and from a hundred are identical.** This is the failure mode with the most consequence for this volume, and it is a property of the graph rather than of the algorithms. Unless each edge records evidence type [218], certainty [208], species, preparation and source, a single-laboratory mouse result contributes the same 1 to a degree count as a multi-centre trial, and an automatically extracted predication — which inherits the sentence's ambiguity rather than the study's design [220] — contributes the same 1 again. Text-mined and curated edges mixed in one graph produce degree distributions dominated by extraction volume. Three partial fixes: weight edges by evidence, so $s_i$ rather than $k_i$ carries the analysis; run every analysis at several evidence thresholds and report the sensitivity; and keep rival edges as rival edges, since a `RIVAL_OF` grouping that is silently collapsed turns a dispute into a doubly supported claim.

**Projections manufacture cliques.** Every document becomes a complete subgraph among its entities, so co-occurrence graphs have inflated clustering coefficients and betweenness structure that is an artefact of document breadth, not of biology; Newman's $1/(m_p-1)$ weighting and hypergraph-native analyses are the standard responses, and neither restores the information the projection discarded. Directional and causal questions in particular should not be asked of a projection: co-occurrence is symmetric and the volume's claims are not.

**What would settle the methodological questions.** For this field specifically: publish the same graph with and without text-mined edges and compare centrality rankings and predictive performance; report community structure across a $\gamma$ sweep with consensus partitions rather than a single run; and benchmark path-based predictions against curated mechanism paths, as DrugMechDB was explicitly built to allow [223]. None of these require new biology, and all three are cheap relative to the curation itself.

## How this volume uses it

The volume does not run analytics itself; it specifies the graph so that analytics is possible and not misleading. Section 15.1's requirements are what make the measures on this page interpretable: dose- and state-qualified edges (so an edge means one thing), confounds as nodes with `threatens` and `rebuts` edges (so a contested claim is visibly contested rather than silently aggregated), rival edges between the same endpoints (so competing accounts are not merged into a stronger consensus than exists), and mechanism as a first-class path (so path enumeration returns curated chains rather than accidental routes).

Section 15.4 supplies the precedents whose analytics lessons are quoted here: Hetionet's demonstration that typed path patterns carry mechanistic signal across 47,031 nodes and 2,250,197 relationships [219], SPOKE's scale of roughly 27 million nodes and 53 million edges [221], PrimeKG's multiscale merge [222], DrugMechDB's curated paths as the right unit and as a benchmark [223], and SemMedDB as the cautionary contrast [220]. Section 15.5's requirement that every claim edge carry evidence type, certainty, species, preparation and source is, read from this page, the precondition for any weighted-degree or centrality statement being about mechanism rather than about attention.
