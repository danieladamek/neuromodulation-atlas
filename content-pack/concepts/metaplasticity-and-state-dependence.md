---
id: metaplasticity-and-state-dependence
title: Metaplasticity and state dependence
one_liner: "Why the same stimulation dose produces opposite outcomes depending on what the tissue was doing beforehand, and how a sliding threshold formalises it."
why_here: "Section 6.4 shows the same protocol reversing sign after preconditioning or with delivery phase, and section 8 makes state an interaction term in every circuit-level edge; this page gives the BCM rule and the gating vocabulary those arguments use."
prerequisites: [ltp-ltd-plasticity]
terms: [metaplasticity, bcm-rule, homeostatic-metaplasticity, homeostatic-synaptic-scaling, state-dependence, preconditioning, phase-triggered-stimulation, mu-rhythm, gating, third-factor, response-variability, motor-evoked-potential]
figures: []
further_reading:
  - { title: "Abraham WC. Metaplasticity: tuning synapses and networks for plasticity. Nat Rev Neurosci 2008", url: "https://www.nature.com/articles/nrn2356", kind: review }
  - { title: "Cooper LN, Bear MF. The BCM theory of synapse modification at 30: interaction of theory with experiment. Nat Rev Neurosci 2012", url: "https://www.nature.com/articles/nrn3353", kind: review }
self_check:
  - q: "In the BCM rule, what happens to a synapse whose postsynaptic activity is above zero but below the modification threshold?"
    options: ["It is potentiated, more weakly than above threshold", "It is depressed", "It is unchanged, because the threshold gates all change", "It is potentiated or depressed at random"]
    answer: 1
    explanation: "The BCM modification function is negative between zero and the threshold and positive above it, so sub-threshold postsynaptic activity paired with presynaptic drive depresses the synapse. The threshold sets the sign; the presynaptic rate sets which synapses are eligible."
  - q: "Why does the BCM threshold have to be a superlinear function of average activity, such as the mean square, rather than the mean?"
    options: ["To keep the units consistent", "To make the fixed point of the dynamics stable", "Because calcium concentration is squared in the NMDA receptor current", "To reproduce orientation tuning, which a linear threshold cannot"]
    answer: 1
    explanation: "With theta proportional to the mean, the fixed point is marginally stable and the weights can drift without bound. A superlinear dependence makes the threshold rise faster than activity, pulling the system back to its fixed point."
  - q: "Siebner and colleagues applied anodal tDCS and then 1 Hz rTMS over motor cortex. What did they find?"
    options: ["Excitability rose further, showing summation", "Excitability fell below baseline, reversing the usual direction of 1 Hz rTMS", "Nothing changed, because the two protocols cancel", "The effect depended on BDNF genotype only"]
    answer: 1
    explanation: "After anodal tDCS had raised excitability, the same 1 Hz rTMS pushed excitability below baseline, and after cathodal tDCS it raised it. The authors read the reversals as a homeostatic, BCM-like mechanism stabilising corticospinal excitability."
  - q: "In the phase-triggered TMS result, what determined whether an identical triple-pulse burst produced potentiation?"
    options: ["The stimulation intensity", "The number of bursts delivered", "The phase of the ongoing sensorimotor mu-rhythm at delivery", "The participant's BDNF genotype"]
    answer: 2
    explanation: "Bursts locked to the high-excitability negative peak produced LTP-like MEP potentiation while the identical protocol at the positive peak produced no change, so the endogenous state set the outcome rather than the stimulation parameters. The result is readout-dependent and replication is thin."
---

## What it is

Metaplasticity is the plasticity of plasticity. Abraham and Bear named the general case: earlier activity changes a synapse's capacity for later LTP or LTD without necessarily changing its present strength, and they suggested that changes in NMDA receptors could account for some instances while other mechanisms probably contribute [98]. The important structural point for this volume is that metaplasticity is a change in a *threshold*, which is a different kind of thing from a change in a weight [98]. A graph that stores only synaptic strengths cannot represent it.

The formal ancestor is older. Bienenstock, Cooper and Munro proposed that the size and direction of a synaptic modification depend on current postsynaptic activity relative to a threshold that is itself set by the neuron's time-averaged activity, with input patterns competing rather than converging fibres simply summing [97]. The evidence offered was that simulations reproduced orientation tuning and ocular-dominance patterns matching data from cats and monkeys reared normally and in altered visual environments [97]. That provenance matters: the sliding threshold is a theoretical construct fitted to developmental data, not a quantity measured at a synapse [97].

State dependence is the same idea seen from the experimenter's side. Silvanto and colleagues state the principle for stimulation: the behavioural and perceptual effects of TMS depend on the activation state of the targeted neurons at the time of stimulation, and setting that state beforehand can bias which of two spatially overlapping populations is affected [104]. The strongest human demonstration that prior activity sets the *sign* is Siebner and colleagues' preconditioning experiment: after anodal tDCS had raised motor cortical excitability, 1 Hz rTMS pushed excitability below baseline, and after cathodal tDCS had lowered it, the same rTMS raised it [101]. The authors read the reversals as a homeostatic, BCM-like mechanism stabilising corticospinal excitability [101].

Two distinct uses of this were later separated. Ziemann and Siebner distinguished *gating*, which briefly raises excitability during practice by reducing intracortical inhibition, from *homeostatic metaplasticity*, which lowers the plasticity threshold by first reducing activity [102]; a consensus paper then set criteria for calling a human result homeostatic at all [103]. And a third factor sits alongside both: acetylcholine, dopamine, noradrenaline and serotonin gate spike-timing-dependent plasticity mechanistically in rodent and in vitro preparations [147].

## L1 — Intuition

Imagine a thermostat that also moves its own set point. If a room has been hot for a while, the thermostat raises the temperature it counts as "too hot", so the same warm draught that used to trigger the air conditioning now does nothing — or triggers the heater instead. Synapses do something like this. A synapse that has been busy becomes harder to strengthen and easier to weaken; one that has been quiet becomes easy to strengthen. The strength has not changed yet. What changed is the rule for changing it.

This is why the same stimulation can have opposite effects in the same person on two occasions. In one experiment, a sequence of gentle direct current that raised excitability was followed by a slow train of magnetic pulses. On its own that train usually reduces excitability a little. After the priming, it pushed excitability well below where it started. Reverse the priming and the train pushed excitability up. Nothing about the magnetic pulses changed; what changed was the state they arrived into.

The same conditionality exists on a millisecond timescale. Cortex has ongoing rhythms, and excitability rises and falls with them. Identical bursts of magnetic pulses delivered at the peak of the favourable phase of one such rhythm produced a lasting increase in the muscle response; delivered at the opposite phase, they produced nothing. And at a slower scale, whether plasticity happens at all can depend on whether neuromodulators like acetylcholine or dopamine are present — a permission signal from elsewhere in the brain.

## L2 — Undergraduate

**The sliding threshold.** In the BCM formulation, the change in a synaptic weight is the product of presynaptic activity and a function of postsynaptic activity that changes sign at a modification threshold $\theta_M$. Below $\theta_M$, pairing depresses; above, it potentiates. The threshold is not fixed: it tracks the neuron's own recent average activity, so a chronically active neuron becomes hard to potentiate and easy to depress, and a chronically quiet one the reverse. This is the mechanism by which competition between inputs arises without any explicit normalisation step.

**Homeostatic metaplasticity versus scaling.** Both stabilise activity, but at different places. Scaling changes weights multiplicatively to return firing rate to a set point [99]. Homeostatic metaplasticity changes the *threshold* so that subsequent induction produces a different amount or sign of change [98,101]. In a human stimulation experiment the two are distinguishable in principle by whether the priming protocol itself changed baseline excitability, which is one reason the consensus criteria for calling a human effect homeostatic are explicit about baseline measurement [103].

**Gating.** Gating is a shorter-lived permissive change. Ziemann and Siebner separate it from homeostatic metaplasticity by mechanism and timescale: gating briefly raises excitability during practice by reducing intracortical inhibition, while homeostatic metaplasticity lowers the plasticity threshold by first reducing activity [102]. The third-factor literature gives the neurochemical version: neuromodulators gate spike-timing-dependent plasticity, so the same pre-post pairing can potentiate, depress or do nothing depending on which transmitter is present [147].

**Worked example: preconditioning.** Take a protocol whose usual effect is a small reduction in MEP amplitude (1 Hz rTMS). Precondition with anodal tDCS, which raises excitability, so that the neuron's activity is above its threshold; the subsequent low-frequency train now produces a *larger* reduction, below baseline. Precondition with cathodal tDCS and the same train produces an increase [101]. Predicting the sign therefore requires two pieces of information the protocol does not contain: the direction of the priming and the state it produced.

**State on the timescale of a rhythm.** Zrenner and colleagues used millisecond-latency real-time EEG to trigger otherwise identical triple-pulse bursts at either the negative or the positive peak of the sensorimotor mu-rhythm. Bursts locked to the high-excitability negative peak produced LTP-like MEP potentiation; the same protocol at the positive peak produced no change [137]. The direction of the outcome was set by the endogenous state rather than by the stimulation parameters [137].

## L3 — Graduate

**The BCM rule.** For a neuron with inputs $x_i$ and output $y$,

$$\frac{dw_i}{dt} = \eta\,x_i\,\phi(y,\theta_M) - \epsilon w_i , \qquad \phi(y,\theta_M) = y\,(y-\theta_M)$$

Symbols and units: $w_i$ weight of synapse $i$ (dimensionless); $x_i$ presynaptic firing rate (s⁻¹); $y = \sum_j w_j x_j$ postsynaptic rate (s⁻¹); $\theta_M$ modification threshold (s⁻¹); $\phi$ the modification function (s⁻²); $\eta$ learning rate (s⁻¹ per unit $\phi$, chosen so that $dw/dt$ is per second); $\epsilon$ an optional uniform decay (s⁻¹). The two zeros of $\phi$ at $y=0$ and $y=\theta_M$ are what make the rule bidirectional: for $0 < y < \theta_M$, $\phi<0$ and active inputs are depressed; for $y > \theta_M$, $\phi>0$ and they are potentiated.

**Why the threshold must slide superlinearly.** Let $\theta_M$ track the time-averaged output. If $\theta_M = \langle y\rangle$, then the fixed point at $y = \theta_M$ is only marginally stable: any upward drift in $y$ raises the threshold by the same amount and the system does not return. The standard choice is

$$\theta_M = \frac{\langle y^{2}\rangle}{y_0}, \qquad \langle y^{2}\rangle(t) = \frac{1}{\tau}\int_{-\infty}^{t} y^{2}(s)\,e^{-(t-s)/\tau}\,ds$$

Symbols: $y_0$ a target rate (s⁻¹) that fixes the units of $\theta_M$ as s⁻¹; $\tau$ the averaging time constant (s, typically minutes to hours — the metaplastic timescale, and much slower than the induction timescale); $\langle\cdot\rangle$ an exponentially weighted running average. Because $\theta_M$ grows as the square of activity, a doubling of output quadruples the threshold, and the fixed point $y^\ast = y_0$ becomes stable. Selectivity follows: when several input patterns compete, the pattern that drives $y$ hardest is potentiated while the others are pushed below the rising threshold and depressed [97].

**Provenance and what it licenses.** The supporting evidence in the original paper was that simulations reproduced orientation tuning and ocular dominance matching cat and monkey rearing data [97]; Cooper and Bear's retrospective tracks the subsequent experimental interaction [see further reading]. $\theta_M$ has never been measured at a synapse [97]. So when Siebner and colleagues call their reversals "BCM-like" [101], the claim is a functional analogy at the level of a corticospinal population readout, with $y$ instantiated as MEP amplitude (mV) and $\theta_M$ unmeasured.

**Quantifying a state-dependent effect.** Two forms are used. For preconditioning, the effect is a difference of differences: $\Delta = (\mathrm{MEP}_{\text{post}} - \mathrm{MEP}_{\text{pre}})_{\text{primed}} - (\mathrm{MEP}_{\text{post}} - \mathrm{MEP}_{\text{pre}})_{\text{unprimed}}$, in mV or as a ratio, and the homeostatic prediction is a sign reversal rather than an attenuation — which is why the consensus criteria require baseline excitability to be measured after priming and before induction [103]. For phase-triggered delivery, the effect is a function of delivery phase $\varphi$ (radians): fitting $\Delta w(\varphi) = a + b\cos(\varphi - \varphi_0)$ gives a modulation depth $b$ and a preferred phase $\varphi_0$, which connects directly to the phase-response formalism on the *oscillations-and-entrainment* page. Zrenner and colleagues sampled only two phases, the negative and positive mu peaks, so their result establishes a sign difference rather than a full phase curve [137].

**Interaction, not addition.** The consequence the volume draws is that efficacy is a function of the applied drive and the ongoing state jointly [37,44,53]. In macaque recordings, tACS entrained neurons weakly locked to an ongoing oscillation and often *reduced* phase locking in neurons already strongly locked, which the authors propose as a source of inconsistent human tACS outcomes [44]. State dependence is therefore not noise around a mean effect; it can invert the effect within a single dataset [44,101,137].

## L4 — Expert

Three things are fragile here, in ascending order of consequence.

First, the formal object. Bienenstock, Cooper and Munro (1982) offered $\theta_M$ as a theoretical construct fitted to visual development data, not as a measured quantity [97]; Abraham and Bear (1996) named the general phenomenon and were explicit that NMDA receptor changes could account for *some* instances while other mechanisms probably contribute [98]. The volume's position is that the sliding threshold is a construct, and the human results labelled "BCM-like" are analogies at the population level [97,101]. What would make it a measurement is a threshold estimated from the same preparation in which the reversal is demonstrated — which the human literature cannot do, because the readout is a muscle response.

Second, the reliability of the phase result. Zrenner and colleagues (2018) reported that identical bursts potentiated MEPs at the mu negative peak and did nothing at the positive peak [137]. Desideri and colleagues (2019), from the same group, found that phase-triggered burst rTMS produced no detectable change in resting EEG or TMS-EEG measures and concluded that EEG excitability measures do not track corticospinal excitability [213]. So the effect is readout-dependent, and cross-laboratory replication is thin [137,213]. This is not a marginal methodological caveat: if the EEG measure used to define the state does not index the excitability that the outcome measure reports, the mechanism attributed to the trigger is unsupported even where the MEP effect is real.

Third, the level at which the state lives. Siebner and colleagues' preconditioning result is a cortical account [101], but Majdi, Asamoah and Mc Laughlin (2023) argue that scalp cranial and cervical nerve co-stimulation could explain published tDCS effects (group H-tdcs-plasticity) [109], with Asamoah and colleagues' rat and human tACS work as precedent [54] and Krause and colleagues' anaesthesia-resistant macaque entrainment against it [55]. If the priming stimulus acts peripherally, "homeostatic metaplasticity in motor cortex" is the wrong description of the interaction even if the reversal is robust.

Set against these, the gating literature is in better shape but has its own split. Hulsey and colleagues (2016) abolished VNS-driven cortical map expansion in rats by selective cholinergic lesion of nucleus basalis, with motor performance equivalent across groups [141]; Morrison and colleagues (2022) found that oxybutynin, prazosin and duloxetine at clinically relevant doses did *not* block the same VNS-dependent map plasticity [142]. Receptor-level blockade and source-nucleus lesion are not interchangeable evidence for the same edge [141,142]. The measurement that would tighten the human side is a within-participant design that manipulates priming direction and delivery phase factorially, with the state variable measured by something validated against corticospinal excitability [103,137,213].

## How this volume uses it

Section 6.4 is built on this page: it uses the state-dependence principle [104], the preconditioning reversal [101], the gating/homeostatic distinction and its consensus criteria [102,103], the phase-triggered result and its null companion [137,213], and the third-factor account of neuromodulatory gating [147]. Section 6.1 supplies the provenance of the BCM rule and of metaplasticity as constructs [97,98], and section 6.5 supplies the variability that state dependence partly explains [107,204]. Section 8.1 generalises state dependence into an interaction term at the circuit level, where tACS entrains weakly locked neurons and desynchronises strongly locked ones [44], and section 8.7 requires every circuit-level edge to carry the state the brain was in [44,137]. Sections 6.7 and 8.7 together make the schema demand: a threshold is a different node type from a weight, and a gating relation is held separately from the drive [98,147].
