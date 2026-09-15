---
id: evidence-grading-and-translation
title: Evidence grading and translation
one_liner: "What a graded recommendation actually asserts, and what survives when a result crosses from rodent to human or from slice to patient."
why_here: "Section 13 argues that a guideline letter is a statement about one edge and that fields do not scale with heads; this page supplies the grading and translation background that argument assumes."
prerequisites: [sham-and-confound-design]
terms: [evidence-level, evidence-and-conclusion-ontology, meta-analysis, species-translation, preparation, non-inferiority, statistical-power, reproducibility, hedges-g, standardised-mean-difference, bayes-factor, clinical-response]
figures: []
further_reading:
  - { title: "GRADE Handbook for grading quality of evidence and strength of recommendations", url: "https://gdt.gradepro.org/app/handbook/handbook.html", kind: textbook }
  - { title: "GRADE Working Group: methods, publications and training resources", url: "https://www.gradeworkinggroup.org/", kind: textbook }
  - { title: "Power failure: why small sample size undermines the reliability of neuroscience (Button et al., Nat Rev Neurosci 2013)", url: "https://www.nature.com/articles/nrn3475", kind: review }
self_check:
  - q: "What two things does GRADE rate separately?"
    options: ["Effect size and p-value", "Certainty of the evidence for an effect and strength of the recommendation that follows", "Internal and external validity", "Risk of bias and cost-effectiveness"]
    answer: 1
    explanation: "GRADE was introduced because guideline developers graded evidence inconsistently; it separates confidence in the effect estimate from the strength of the resulting recommendation, so high certainty can still yield a weak recommendation."
  - q: "On the volume's reading, what does a level A rating in the European rTMS guideline license?"
    options: ["A mechanistic account of why the outcome moved", "A claim about one drive-to-outcome edge in one indication against sham with the protocol fixed", "Confidence that the coupling step is understood", "Equivalence with pharmacological treatment"]
    answer: 1
    explanation: "A letter grade addresses efficacy against sham for one indication and protocol; it says nothing about coupling, cellular or molecular steps and does not license a mechanistic story."
  - q: "What did comparative head modelling find about transcranial electric field strength across mouse, monkey and human?"
    options: ["Fields scale linearly with head size", "Fields are equal once normalised to brain volume", "Fields differ by up to about 100-fold across the three species", "Fields cannot be modelled in rodents"]
    answer: 2
    explanation: "Finite-element models predict that TMS field strength first rises then falls with head size and that tES fields differ by up to about 100-fold across species, which is why the authors propose matching animal parameters to human fields rather than copying them."
  - q: "Why do the two ketamine-versus-ECT trials not settle the comparison?"
    options: ["Both were unblinded", "They used different settings and endpoints, so the answer is not a property of the two modalities alone", "Neither reported effect sizes", "One used esketamine and the other racemic ketamine only"]
    answer: 1
    explanation: "ELEKT-D in 403 outpatients met non-inferiority for ketamine (55.4% vs 41.2% response) while KetECT in hospitalised patients did not (63% vs 46% remission favouring ECT); setting and endpoint differ."
  - q: "Why does a stimulation claim about neuroinflammation graded on TSPO imaging inherit a translation problem?"
    options: ["TSPO cannot be imaged in humans", "TSPO rose in activated microglia in mouse models but not in non-human primates or human disease, so human TSPO-PET probably indexes inflammatory cell density rather than activation", "TSPO is only expressed in astrocytes", "TSPO-PET has no test-retest reliability"]
    answer: 1
    explanation: "The species gap was traced to a promoter AP1 site; the readout therefore does not mean the same thing in the species where the mechanism was established as in the species where the claim is made."
---

## What it is

Two different questions get answered with the same word, "evidence". The first is how confident we are that an intervention changes an outcome; the second is how strongly we should therefore recommend it. GRADE exists because guideline developers were conflating them, and it rates the two separately: the certainty of the evidence for an effect, and the strength of the recommendation that follows [208]. Certainty can be high and the recommendation still weak, if benefits and harms are finely balanced or values differ.

Neuromodulation largely does not use GRADE. The European rTMS guideline grades each indication against sham on a letter scale, where level A means definite efficacy — high-frequency rTMS of M1 for neuropathic pain, high-frequency rTMS of left dorsolateral prefrontal cortex for depression, low-frequency rTMS for hand motor recovery after stroke — with level B covering Parkinson's disease, fibromyalgia, spasticity in multiple sclerosis and PTSD [209]. The tDCS guideline rates tDCS definitely effective for depression and neuropathic pain and probably or possibly effective elsewhere, with small to moderate effect sizes and benefits that often did not last [210].

The volume's reading of such a letter is deliberately narrow: it is a statement about one edge — drive to outcome, one indication, against sham, protocol fixed. It says nothing about the coupling, cellular or molecular steps, and does not license a mechanistic story about why the outcome moved [208–210].

Translation is the second half of the problem. Most mechanism evidence in this field is rodent, slice or simulation; most outcome evidence is human. What crosses that join is not obvious. Intracranial recordings during transcranial electric stimulation in non-human primates and human epilepsy patients measured peak fields of about 0.5 mV/mm in superficial cortex, changing little with frequency or region [211]; finite-element models of mouse, monkey and human heads predict TMS field strength rising then falling with head size and tES fields differing by up to about 100-fold across species, so the authors propose matching animal parameters to human fields rather than copying them [212]. The physics of the coupling step transfers; the number does not.

## L1 — Intuition

"The evidence says it works" hides two separate claims. One is: how sure are we that people who got this did better than people who did not? The other is: given that, should a clinician offer it? These come apart. You can be very sure of a tiny benefit and still not recommend it; you can be unsure of a large benefit and recommend it anyway for someone with no other option.

Formal grading systems exist to keep those apart, and the best known assigns a certainty level to the evidence and, separately, a strength to the recommendation. Neuromodulation guidelines mostly use simpler letter grades that mean "this definitely works for this condition compared with a fake version". That is genuinely useful — and it is much narrower than it sounds. A top grade for stimulating the front of the head for depression does not mean anyone has shown *how* it works. It means the outcome moved.

Translation is the other trap. Almost everything known about how these techniques act on cells comes from animals, slices and models; almost everything known about whether they help patients comes from people. Moving between the two is not a matter of scaling by body weight: a current producing a strong field in a mouse brain can produce a field a hundred times weaker in a human head, because heads differ in size, shape and composition. So an animal experiment can show that a mechanism exists without showing that the human protocol engages it.

## L2 — Undergraduate

GRADE starts each body of evidence at a level set by design — randomised trials high, observational studies low — then downgrades for risk of bias, inconsistency across studies, indirectness (of population, intervention, comparator or outcome), imprecision, and publication bias, and can upgrade observational evidence for very large effects or dose-response gradients. The output is one of four certainty levels, attached to an outcome, not to a technique. Recommendation strength is then a separate judgement incorporating the balance of benefits and harms, values and feasibility [208].

Two gaps sit inside "the evidence says". *Approval is not certainty*: a Cochrane review of neurosteroid GABA-A positive allosteric modulators for postnatal depression (five studies, 349 women) found only low-certainty benefit and insufficient evidence to recommend them over existing treatments [182]. And *a drug that works does not validate the disease mechanism it was designed around*: an umbrella review found no association between serotonin metabolite concentrations and depression, and no serotonin-transporter-genotype by stress interaction in studies of 115,257 and 43,165 people [188].

Effect sizes are also not properties of the modality alone. ELEKT-D, in 403 outpatients, found 55.4% response with ketamine against 41.2% with ECT and met non-inferiority [170]; KetECT, in hospitalised patients, found 63% remission with ECT against 46% with ketamine and did not [171]. Setting and endpoint differ, so the discrepancy is not a contradiction about two treatments but a demonstration that the edge needs indication, comparator, endpoint and setting attached [170,171]. Across modalities the maturity spread is wide: human transcranial temporal interference stimulation has 20 completed studies and 28 ongoing trials (820 participants), which a systematic review calls Phase 1 evidence with efficacy untested [47], while focused ultrasound thalamotomy for essential tremor beat a sham procedure, with hand-tremor scores falling from 18.1 to 9.6 at three months against 16.0 to 15.8 with sham [86].

**Worked example.** A rodent study shows that 1 mA transcranial current at 10 Hz entrains cortical firing. Can you conclude that 1 mA at 10 Hz in a human patient entrains cortex? No. The mouse field for that current can exceed the human field by up to roughly two orders of magnitude [212], and direct human and primate measurements put peak transcranial fields near 0.5 mV/mm [211]. What the rodent result establishes is that the coupling mechanism exists at some field strength. To carry it to humans you either match the field rather than the current [212], or you measure engagement in humans directly.

## L3 — Graduate

Certainty and effect size are different objects, and the arithmetic of each matters.

For continuous outcomes the standardised mean difference converts a between-arm difference into pooled standard-deviation units:

$$ d = \frac{\bar x_1 - \bar x_2}{s_p}, \qquad s_p = \sqrt{\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}}, \qquad g = d\left(1 - \frac{3}{4(n_1+n_2)-9}\right) $$

- $\bar x_1, \bar x_2$ — arm means in the outcome's own units;
- $s_1, s_2$ — arm standard deviations; $n_1, n_2$ — arm sizes;
- $s_p$ — pooled standard deviation;
- $d$ — Cohen's standardised mean difference, dimensionless;
- $g$ — Hedges' $g$, the small-sample-corrected version used in the meta-analyses this volume cites.

Non-inferiority is a different inferential structure from superiority. With $\delta > 0$ the pre-specified margin in outcome units and $\Delta = \mu_{\mathrm{test}} - \mu_{\mathrm{ref}}$ the true difference (positive favouring test), non-inferiority is declared when the confidence bound excludes $-\delta$:

$$ \mathrm{CI}_{\mathrm{lower}}(\hat\Delta) > -\delta $$

The conclusion is therefore a function of $\delta$, which is chosen, not measured — one reason two trials of the same comparison can disagree in direction of conclusion while agreeing in direction of estimate [170,171].

Bayesian evidence is reported as a ratio of marginal likelihoods, $\mathrm{BF}_{10} = p(\text{data} \mid H_1)/p(\text{data} \mid H_0)$, with $\mathrm{BF}_{01} = 1/\mathrm{BF}_{10}$. Unlike a p-value it can support the null: in the taVNS pupil meta-analysis (18 studies, N = 771), overall evidence was anecdotal ($g = 0.15$, $\mathrm{BF}_{01} = 1.0$), pulsed protocols gave $g = 0.36$ with $\mathrm{BF}_{10} = 50.8$, and continuous protocols gave $g = 0.002$ with $\mathrm{BF}_{01} = 21.9$ — strong evidence *for* the null in that subgroup [146].

Power links the two halves of this page. For a two-arm comparison with equal $n$ per arm at two-sided $\alpha$,

$$ n \approx \frac{2\left(z_{1-\alpha/2} + z_{1-\beta}\right)^2}{d^2} $$

- $z_{1-\alpha/2}$ — standard normal quantile for the significance level (1.96 at $\alpha = 0.05$);
- $z_{1-\beta}$ — quantile for the desired power (0.84 at 80%);
- $d$ — the standardised effect to be detected.

At $d = 0.3$, $n \approx 175$ per arm. Low power then does three things at once: it lowers the chance of detecting a true effect, lowers the probability that a significant result is true, and inflates published effect sizes [207]. Empirically the field shows exactly the signature: in 56 adults given paired associative stimulation, anodal tDCS and iTBS, only 39%, 45% and 43% responded in the expected direction, and response to one protocol did not predict response to another [204]; across 15 studies (291 participants) of motor-cortex rTMS after-effects, test-retest reliability was $r$ 0.10–0.55 and ICC 0.29–0.70 [205]; and only about 45–50% of surveyed electrical-stimulation researchers said they could routinely reproduce published results [206].

Species translation is a units problem before it is a biology problem. If a coupling mechanism has a field threshold $E_{\mathrm{th}}$ in V/m, the transferable statement is "the mechanism operates above $E_{\mathrm{th}}$", and the non-transferable statement is "1 mA produces it", because the map from device setting to in-situ field depends on head geometry and tissue conductivity: modelled tES fields differ by up to about 100-fold between mouse and human [212], while measured human and primate peak fields sit near 0.5 mV/mm (equivalently 0.5 V/m) [211]. Matching the *field* rather than the *current* is the correction [212]. The same logic applies to drugs, where the analogue of a field model is a target-site exposure model, because plasma concentration is not concentration at the receptor [164], and where the rodent-to-human step can fail at the delivery interface: of roughly 100 mostly animal studies of direct nose-to-brain transport, twelve were adequately designed to test it and two, in rats, supported it, with no human pharmacokinetic evidence and a proportionally far smaller human olfactory area [162].

## L4 — Expert

What is contested is not the value of grading but what a grade can be carried into. The volume's position is that a letter or certainty level attaches to one drive-to-outcome edge and cannot be read as confidence in a mechanism [208–210]. Sitting behind that are two unresolved empirical matters.

The first is the direction and size of translational bias. Where this corpus supports a direction, effects shrink as controls tighten and samples grow: low power inflates published effect sizes (Button and colleagues, 2013) [207], only about 45–50% of surveyed researchers could routinely reproduce published results (Héroux and colleagues, 2017) [206], and unmeasured unblinding is argued to inflate drug-trial effects (Muthukumaraswamy and colleagues, 2021) [178]. But no study here measures an animal-to-human effect-size ratio directly, so the direction is an inference, not a measurement [178,206,207]. Preparation translation is not even uniformly pessimistic: acoustic barrier opening climbed from a mean peak pressure of 0.28 ± 0.05 MPa in 27 rats (O'Reilly and Hynynen, 2012) [81] to safe, reversible, repeatable opening in five patients with Alzheimer's disease (Lipsman and colleagues, 2018) — while the therapeutic claim did not climb, since amyloid PET showed no group-level change [82].

The second is whether the readout means the same thing in the two species. Translocator protein rose in activated microglia in mouse models but not in non-human primates or human neurodegenerative disease, a gap traced to a promoter AP1 site, so human TSPO-PET probably reflects the density of inflammatory cells rather than their activation (Nutma and colleagues) [127]. A neuroinflammation claim graded on TSPO imaging inherits that mismatch. The same structure appears within humans across readouts: mu-phase-triggered burst rTMS moved an MEP measure in one study and no EEG measure in another, with the authors concluding EEG excitability measures do not track corticospinal excitability [213].

Fragile assumptions worth naming: that guideline letter scales are commensurable with GRADE certainty levels (they are not constructed the same way) [208,209]; that a non-inferiority conclusion is a property of the treatments rather than of the margin and setting [170,171]; that "clinical response" is one endpoint when response and remission rates diverge between trials [170,171]; and that a graded body of evidence for a technique transfers across protocols, when responder fractions below 50% and low test-retest reliability suggest protocol- and person-specific effects [204,205]. Measurements that would help: head-to-head trials with pre-registered margins in matched settings; field-matched rather than current-matched animal replications [211,212]; and species-validated markers reported with their own certainty, rather than assumed transferable [127,213].

## How this volume uses it

Section 13 is this page's home. 13.1 distinguishes a recommendation from a mechanism and reads the rTMS and tDCS guideline grades as single-edge claims [208–210], with approval-versus-certainty [182] and drug-versus-disease-mechanism [188] as the two internal gaps. 13.2 gives the species-translation results — measured peak fields [211] and up-to-100-fold modelled differences [212] — plus the TSPO readout gap [127] and the nose-to-brain delivery case [162]. 13.3 shows preparation translation bending both ways [81–84,151–153] and states the inferred direction of bias [178,206,207]. Section 12.6 supplies the variability and reproducibility numbers this page's power arithmetic explains [204–207].

Section 15 makes the consequences schema-level: every edge carries an evidence tier in two fields — a GRADE-style certainty [208] and an evidence type from a vocabulary such as ECO [218] — species and preparation are required on every mechanism edge, with the measured or modelled field for field-based drives [211,212], and clinical-efficacy edges are a separate type from mechanism edges, requiring indication, comparator, endpoint and setting [170,171].
