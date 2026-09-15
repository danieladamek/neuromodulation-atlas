---
id: connectivity-based-targeting
title: Connectivity-based targeting
one_liner: "Choosing where to stimulate from what a site is connected to, rather than from the coordinates of the site itself."
why_here: "Section 8.4 turns on how much of an rTMS or DBS outcome connectivity predicts, and section 15 makes target definition a property of the node; this page supplies the imaging and inference background both assume."
prerequisites: [electric-field-modelling]
terms: [connectivity-based-targeting, target-definition, functional-connectivity, normative-connectome, subgenual-cingulate, dlpfc, rtms, deep-brain-stimulation, e-field]
figures: []
further_reading:
  - { title: "Opportunities of connectomic neuromodulation (Horn & Fox, NeuroImage 2020)", url: "https://pubmed.ncbi.nlm.nih.gov/32702488/", kind: review }
  - { title: "Causal mapping of human brain function (Siddiqi, Kording, Parvizi & Fox, Nat Rev Neurosci 2022)", url: "https://www.nature.com/articles/s41583-022-00583-8", kind: review }
  - { title: "Brain stimulation and brain lesions converge on common causal circuits in neuropsychiatric disease (Siddiqi et al., Nat Hum Behav 2021)", url: "https://www.nature.com/articles/s41562-021-01161-1", kind: review }
self_check:
  - q: "In the original rTMS depression targeting work, what was the reported relationship between a coil site and the subgenual cingulate?"
    options: ["Sites with better reported efficacy were more strongly positively correlated with it", "Sites with better reported efficacy were more strongly anticorrelated with it", "Efficacy was unrelated to subgenual connectivity", "Only structural connectivity, not functional, was examined"]
    answer: 1
    explanation: "Across resting-state data from 98 healthy subjects, coil sites used in published trials with better reported efficacy were more strongly anticorrelated with the subgenual cingulate, and that pattern was inverted into a targeting rule."
  - q: "In the 295-patient replication, the association between site–subgenual connectivity and outcome was detectable only when the target was defined how?"
    options: ["By the nominal coil position on the scalp", "By the patient's self-report of where stimulation felt strongest", "By electric-field modelling of the stimulated tissue", "By a standard MNI coordinate for BA46"]
    answer: 2
    explanation: "The association (about r = -0.16, roughly 3% of outcome variance) appeared only with targets defined by electric-field modelling rather than nominal coil position, which is why target definition is part of the claim."
  - q: "Why does the volume insist that anatomical, functional and connectivity-derived targets are different nodes rather than labels on one node?"
    options: ["Because they always disagree by more than 2 cm", "Because the same connectivity measure yields different predictive value depending on which definition is used", "Because only anatomical targets can be stored with an ontology identifier", "Because functional targets cannot be measured in patients"]
    answer: 1
    explanation: "The same measure supports a usable targeting rule under a literature-derived coordinate and explains about 3% of variance under an E-field-defined target, so the definition must travel with the node."
  - q: "What is a normative connectome used for in connectomic DBS work?"
    options: ["To replace the patient's electrode localisation", "To supply group-average connectivity of the stimulation volume when patient-specific imaging is unavailable", "To measure the delivered electric field", "To grade the certainty of the clinical evidence"]
    answer: 1
    explanation: "In the 51-patient subthalamic DBS study, connectivity of the stimulation volume computed from normative connectome data predicted motor improvement, and the profile predicted outcome in an independent cohort without patient-specific imaging."
---

## What it is

Connectivity-based targeting answers the question *where should the drive be delivered* by looking at what the candidate site is wired to, rather than at the site's own coordinates or its own activation. The premise is that a focal drive does not stay focal: it acts on a population whose axons leave the region, so the therapeutic object is a circuit and the accessible surface is whichever part of that circuit a coil, an electrode or a transducer can reach. If a deep structure is implicated in a disorder but cannot be reached non-invasively, a reachable site that is strongly connected to it becomes the proxy target.

In practice the connectivity is measured with imaging in people who are not the patient being treated, or in the patient before treatment. Resting-state functional MRI gives, for every pair of grey-matter locations, a correlation between their spontaneous signal fluctuations; diffusion imaging gives estimated white-matter routes. A candidate site therefore has a *connectivity fingerprint*: a vector of relationships to every other location. Targeting rules pick the site whose fingerprint best matches a criterion — most strongly anticorrelated with the subgenual cingulate, most strongly connected to supplementary motor area, closest to a circuit derived from lesions.

The paradigm has two distinct empirical legs, and the volume keeps them apart. One is retrospective and site-level: take coil positions used in published trials, look up their reported efficacy, and correlate efficacy across sites with each site's connectivity [129]. The other is prospective and patient-level: take individual patients, define the tissue their device actually stimulated, and ask whether that tissue's connectivity predicts their own outcome [130,132].

Those two legs give very different numbers, and the difference is the live dispute rather than a technical footnote (section 14.9). Both also depend on a prior question this volume treats as part of dose: what *was* the target — the coil position, the modelled field, or the anatomical label the operator wrote down.

## L1 — Intuition

The room where you flip the switch is not the room that lights up. If you want to change what happens in a deep, unreachable part of a building's wiring, you find an accessible junction box that the wire runs through, and you work there.

Brain stimulation faces exactly this. Some of the structures most consistently implicated in depression sit deep under the cortex, far beyond the reach of a magnetic coil held over the scalp. But the cortex is wired to them. So instead of asking "which patch of cortex is the depression in", the targeting question becomes "which patch of reachable cortex is most tightly coupled to the deep structure I care about".

Coupling is estimated from imaging. Put someone in a scanner doing nothing, and different regions' signals rise and fall together in characteristic ways; regions that fluctuate together are treated as functionally connected, and regions that fluctuate in opposition are anticorrelated. A map of these relationships is a wiring sketch — not of individual axons, but of which places behave as if they talk to each other.

The clinically attractive claim is that this sketch predicts who gets better. The awkward finding is that it predicts a little, not a lot: when tested prospectively in a few hundred patients, connectivity explained only a small slice of who responded. That gap between a clean group-level pattern and a weak individual prediction is the whole argument, and it is not settled.

## L2 — Undergraduate

Resting-state functional connectivity between two locations is usually the Pearson correlation of their blood-oxygen-level-dependent (BOLD) time series over a scan. A *seed map* fixes one location — the seed — and computes that correlation for every other voxel, producing a whole-brain image of relationships to the seed. Two locations whose correlation is reliably negative are called anticorrelated.

The founding study of the targeting paradigm worked backwards from trials. Using resting-state fMRI from 98 healthy subjects, Fox and colleagues computed seed maps for the left dorsolateral prefrontal coil positions used in published rTMS depression trials and compared them with each trial's reported efficacy: sites with better reported efficacy were more strongly anticorrelated with the subgenual cingulate [129]. Inverting the relationship gave coordinates in BA46 as an "optimal" target, and the same pattern appeared in an independent sample of 13 depressed patients [129]. The efficacy numbers came from the literature, not from these subjects, so the design is retrospective and correlational [129].

Two extensions moved the unit of analysis from the coil to the stimulated tissue. In 51 patients with subthalamic DBS for Parkinson's disease, electrode localisation combined with normative connectome data showed structural and functional connectivity of the stimulation volume to be independent predictors of motor improvement — supplementary-motor-area connectivity and anticorrelation with M1 prominent — and the profile predicted outcome in an independent cohort without patient-specific imaging [132]. Pooling 14 datasets of lesions (n = 461), TMS sites (n = 151) and DBS sites (n = 101), circuits derived from damage and from therapeutic stimulation converged on a single distributed network independent of diagnosis, and connectivity to it predicted antidepressant efficacy of held-out sites [131].

**Worked example.** To derive a prefrontal rTMS target, seed the subgenual cingulate, compute its correlation map in a normative dataset, mask to scalp-reachable dorsolateral prefrontal cortex, and take the most negative coordinate. Then check that a modelled field from a realistic coil placement peaks in that tissue — otherwise the target is a coil position, not a piece of cortex.

The replication result is what tempers the procedure. In 295 patients treated with rTMS for depression, connectivity between the actual stimulation site and the subgenual ACC was associated with outcome only weakly, r about −0.16, and only when targets were defined by electric-field modelling rather than nominal coil position; much of the association tracked respiration-driven artefact in the global signal, and the authors put sgACC connectivity at roughly 3% of outcome variance [130].

## L3 — Graduate

Let $b_i(t)$ be the preprocessed BOLD time series at location $i$, sampled at $t = 1 \dots T$. Functional connectivity is

$$ r_{ij} = \frac{\sum_{t=1}^{T}\left(b_i(t)-\bar b_i\right)\left(b_j(t)-\bar b_j\right)}{\sqrt{\sum_t\left(b_i(t)-\bar b_i\right)^2}\sqrt{\sum_t\left(b_j(t)-\bar b_j\right)^2}} $$

- $r_{ij}$ — Pearson correlation between locations $i$ and $j$, dimensionless, $-1 \le r_{ij} \le 1$;
- $b_i(t)$ — BOLD signal at location $i$ and time $t$, in arbitrary scanner units after conversion to percent signal change;
- $\bar b_i$ — temporal mean of $b_i$;
- $T$ — number of volumes (frames), typically several hundred at a repetition time of 0.7–3 s.

For group statistics $r$ is Fisher-transformed, $z = \operatorname{artanh} r$, which is approximately normal with variance $1/(T_{\mathrm{eff}}-3)$, where $T_{\mathrm{eff}}$ is the effective number of independent frames after accounting for temporal autocorrelation. Ignoring autocorrelation inflates significance; this matters because connectivity maps are then thresholded to define targets.

Target definition enters as a weighting. A coil position defines a field distribution $E(\mathbf{x})$ from a head model, and the connectivity attributed to "the target" is properly a field-weighted average over voxels:

$$ z^{\mathrm{tgt}}_{s} = \frac{\sum_{v} w_v \, z_{v s}}{\sum_{v} w_v}, \qquad w_v = f\!\left(\lVert E(\mathbf{x}_v)\rVert\right) $$

- $z^{\mathrm{tgt}}_{s}$ — connectivity of the stimulated tissue to seed $s$ (Fisher-$z$ units);
- $z_{vs}$ — connectivity of voxel $v$ to seed $s$;
- $w_v$ — weight on voxel $v$, a function $f$ of the field magnitude there, in V/m — commonly a binary mask above a threshold, or the magnitude itself;
- $\lVert E(\mathbf{x}_v)\rVert$ — modelled field magnitude at the voxel centre, V/m.

Setting $w_v$ to a delta function at the scalp-projected coil centre recovers "nominal coil position" targeting; the 295-patient study found the outcome association only under a field-based $w_v$ [130]. The same construction with $w_v$ from a volume of tissue activated gives the connectomic DBS predictor [132].

Predictive strength is then an ordinary regression quantity. With $\hat y = \beta_0 + \beta_1 z^{\mathrm{tgt}}_{s}$ predicting symptom change $y$, the shared variance is $R^2 = r^2$; at $r = -0.16$, $R^2 \approx 0.026$, i.e. about 3% [130]. Two consequences follow arithmetically. First, detecting such an effect at 80% power needs roughly $n \approx 300$, so smaller cohorts are uninformative about it in either direction. Second, a predictor with $R^2 \approx 0.03$ has an individual-level error band that spans most of the observed outcome range, which is why the authors argue it cannot support individualised targeting on its own [130].

Units and provenance must be carried through. $r$ and $z$ are dimensionless but their *meaning* depends on preprocessing: global-signal regression, censoring of motion frames, and physiological-noise removal each change the value, and respiration-driven variance in the global signal accounted for much of the reported association in the largest cohort [130]. A connectivity value with no preprocessing provenance is not comparable across studies, which is the imaging analogue of the volume's rule that every dose parameter carries its unit and its pipeline.

## L4 — Expert

The dispute is not whether connectivity carries information about outcome but how much, and under which definition of the target (section 14.9). Fox and colleagues (2012) established a site-level gradient using literature efficacy values [129]; Elbau and colleagues (2023) measured a patient-level association of about 3% of variance, contingent on E-field-defined targets and partly attributable to respiration artefact [130]. These are compatible: a group gradient across sites can coexist with a predictor that is useless for an individual. What would settle the clinical question is a randomised comparison of connectivity-derived against anatomical targets, which this corpus does not contain [129,130].

Three assumptions bear most of the load. The first is that a normative connectome substitutes for the patient's own. It worked well enough to predict outcome in an independent DBS cohort without patient-specific imaging (Horn and colleagues, 2017) [132], but a normative map cannot represent individual variation in the very topography being targeted, and single-session individual resting-state maps are themselves noisy at the spatial precision a coil demands. The second is that the target is the tissue the field reached. Since the association appears only under field-based target definition [130], every earlier result indexed to nominal coil position is a measurement of something else. The third is that circuits derived by different means are the same object: Siddiqi and colleagues (2021) report convergence of lesion-derived and stimulation-derived circuits across 14 datasets [131], but convergence at the group level does not license treating a lesion network and a stimulation network as one node, which is why the volume requires the target definition to travel with the node.

What is fragile rather than contested is the inferential chain. Connectivity is a correlational, indirect measure standing several levels away from the coupling step; an outcome association can arise because connectivity indexes anatomy, or head geometry, or arousal and breathing, without the circuit interpretation being correct [130]. Measurements that would discriminate: prospective randomisation of target rule; individual connectomes acquired with enough data for stable single-subject maps, compared against normative maps in the same patients; and target engagement measured directly at the derived target — evoked responses for DBS [134], or TMS-evoked responses under a multisensory sham — so that a null can be attributed to the target rather than to the chain.

## How this volume uses it

Section 8.4 is this page's home: it presents the paradigm's founding correlation [129], its connectomic extensions [131,132] and the large replication that shrinks the effect [130], and concludes that target definition is part of the claim rather than a detail behind it. Section 12.1 reuses the same result to argue that "was the target defined by where the field went or by where the coil sat" belongs on the checklist for reading any stimulation paper. Section 14.9 states the dispute formally as H-connectivity-targeting and names the randomised comparison that would settle it.

Section 15 converts the argument into schema: requirement 8 makes anatomical, functional and connectivity-derived targets *different nodes*, and the starter schema's circuit/target node — anchored in Uberon — carries target definition, brain state and biomarker as required edge properties. That is why this page is prerequisite reading for anyone modelling a `modulates` edge.
