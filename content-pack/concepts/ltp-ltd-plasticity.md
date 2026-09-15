---
id: ltp-ltd-plasticity
title: LTP, LTD and what "plasticity" names
one_liner: "Long-lasting, input-dependent changes in synaptic strength: how they are induced, how they are measured, and what the word carries when it is borrowed for human stimulation studies."
why_here: "Section 6 borrows the cellular plasticity vocabulary wholesale and section 7 uses its molecular endpoints; this page gives the original preparations, the induction rules and the readouts that borrowing assumes."
prerequisites: []
terms: [long-term-potentiation, long-term-depression, ltp-like-plasticity, spike-timing-dependent-plasticity, homeostatic-synaptic-scaling, dendritic-spine, nmda-receptor, ampa-receptor, paired-associative-stimulation, theta-burst-stimulation, itbs600, motor-evoked-potential, bdnf, organotypic-slice-culture, preparation]
figures: []
further_reading:
  - { title: "Long-Term Synaptic Potentiation — Purves D, et al. Neuroscience, 2nd edition (NCBI Bookshelf)", url: "https://www.ncbi.nlm.nih.gov/books/NBK10878/", kind: textbook }
  - { title: "Nicoll RA. A brief history of long-term potentiation. Neuron 2017", url: "https://www.sciencedirect.com/science/article/pii/S0896627316309576", kind: review }
  - { title: "Malenka RC, Bear MF. LTP and LTD: an embarrassment of riches. Neuron 2004", url: "https://www.sciencedirect.com/science/article/pii/S0896627304006087", kind: review }
self_check:
  - q: "In the original 1973 experiment, what was the preparation and the readout?"
    options: ["Rat hippocampal slice, whole-cell EPSC amplitude", "Anaesthetized rabbit, dentate field potential after perforant-path stimulation", "Awake human, motor evoked potential", "Dissociated rat cortical culture, mEPSC amplitude"]
    answer: 1
    explanation: "Bliss and Lomo stimulated the perforant path in anaesthetized rabbits and recorded dentate field responses; brief tetanic stimulation enlarged the population EPSP for hours to days. Every later use of 'LTP-like' points back to this result."
  - q: "A human theta-burst study reports that intermittent TBS increased motor evoked potential amplitude for 30 minutes. What has been measured?"
    options: ["A change in synaptic strength at a cortical synapse", "A change in a corticospinal population response, separated from any synapse by a spinal segment and a muscle", "A change in dendritic spine density", "A change in NMDA receptor number"]
    answer: 1
    explanation: "The MEP is a corticospinal population measure. The volume's position is that 'LTP-like' claims a resemblance in three properties (follows patterned input, outlasts it, sign depends on pattern), not a measured synaptic change."
  - q: "Under a standard spike-timing-dependent plasticity rule with time constants of about 20 ms, what does a presynaptic spike 10 ms AFTER the postsynaptic spike produce?"
    options: ["Potentiation, of about 60% of the maximum", "No change, because the interval is outside the window", "Depression, of about 60% of the maximum magnitude", "Potentiation only if the pairing is repeated at 100 Hz"]
    answer: 2
    explanation: "Post-before-pre pairings fall on the depressing branch: the magnitude scales as exp(-|dt|/tau), so at 10 ms with tau = 20 ms it is exp(-0.5), about 61% of that branch's maximum."
  - q: "Turrigiano and colleagues found that blocking activity in cultured rat neocortical neurons increased mEPSC amplitude at all synapses multiplicatively. Why does that matter for stimulation studies?"
    options: ["It shows LTP requires NMDA receptors", "It shows plasticity is input-specific", "It is the cellular reference for claims that a stimulation effect is bounded or reversed by compensation", "It shows cultured neurons do not express LTP"]
    answer: 2
    explanation: "Multiplicative scaling stabilises firing rate while preserving relative weights. It is a mechanism separate from Hebbian plasticity, and it is what a homeostatic account of a stimulation after-effect appeals to."
---

## What it is

Long-term potentiation (LTP) and long-term depression (LTD) are lasting, input-dependent changes in the strength of synaptic transmission. LTP was described in anaesthetized rabbits: Bliss and Lømo stimulated the perforant path and recorded dentate field responses, and brief tetanic stimulation enlarged the population excitatory postsynaptic potential and shortened its latency, with the enhancement lasting from hours to days [96]. They proposed it as a candidate substrate for memory [96]. The narrow claim — the one this volume actually needs — is smaller than that: a patterned electrical input delivered for seconds left synaptic transmission changed long after the input stopped [96].

LTD is the same kind of phenomenon with the opposite sign, typically induced by low-frequency or poorly timed input, and the pair is usually described together because in most preparations they share machinery: the same receptors, the same second messenger, different amounts and time courses of postsynaptic calcium. A third family sits beside them. Homeostatic synaptic scaling came from dissociated culture, where Turrigiano and colleagues manipulated overall activity in rat neocortical neurons: blocking activity increased quantal (mEPSC) amplitude across all synapses, while blocking GABA-A receptors first raised firing and then let amplitudes shrink as firing returned toward baseline [99]. Because the adjustment was multiplicative, relative weights were preserved while firing rate was stabilised [99] — a mechanism separate from Hebbian plasticity.

For this volume, the important fact about all of this is where it came from. Four constructs, four preparations: in vivo rabbit hippocampus [96], a simulation fitted to visual development [97], a review-level abstraction [98], and rat cortical culture [99]. None was established in an intact awake human, and none with a non-invasive drive. The cellular vocabulary the stimulation field uses is therefore imported across both a species gap and a delivery gap before it reaches a human scalp [96–99].

The human protocols built on that vocabulary are real and reproducible as protocols. Paired associative stimulation pairs median-nerve stimulation with TMS over motor cortex at a fixed interval, and raised motor evoked potential amplitudes within 30 min, lasting 30–60 min, specific to the targeted representation [100]. Theta-burst stimulation compressed the exposure: 20–190 s of bursts repeated at a theta rhythm changed motor cortical excitability lastingly, with the direction depending on whether the pattern was continuous or intermittent [38]. What those protocols measure, though, is a muscle response.

## L1 — Intuition

A synapse is a connection whose strength can change. Drive it hard for a moment in the right pattern and it becomes reliably stronger, and stays stronger for hours after the driving stops. That is long-term potentiation. Drive it in a different pattern — slow, or badly timed — and it becomes weaker instead: long-term depression. The direction depends on the pattern, not on the total amount of stimulation, which is the single most useful thing to know about it.

The original demonstration was a rabbit under anaesthesia with a stimulating electrode on a bundle of fibres in its hippocampus. A few seconds of rapid stimulation, and the response recorded downstream grew and stayed grown for hours to days. That result is the ancestor of every claim in this field that a burst of stimulation "induced plasticity".

There is a third trick that cells have, and it is not the same trick. If you silence a cultured neuron for a day, it turns all of its synapses up together, by a common factor, until its firing rate returns to something normal. That is housekeeping rather than learning: the pattern of which input is strong relative to which is preserved, only the overall volume changes.

The catch, for everything in this volume, is that a human experiment cannot record from a synapse. What it records is a twitch in a hand muscle evoked by a magnetic pulse over the scalp. When such a study says "LTP-like", it is claiming a family resemblance — the effect followed a pattern, outlasted it, and changed sign with the pattern — not that anyone saw a synapse change.

## L2 — Undergraduate

**Induction rules.** Classical LTP in the hippocampal CA1 pathway is induced by high-frequency tetanus (for instance 100 Hz for 1 s) or by theta-burst patterns; LTD by prolonged low-frequency stimulation (around 1 Hz for several hundred pulses). In the canonical account, both require postsynaptic calcium entry through NMDA receptors, which are coincidence detectors: they pass current only when glutamate is bound *and* the membrane is sufficiently depolarised to relieve the magnesium block. A large, fast calcium transient favours potentiation; a smaller, slower one favours depression. Expression is largely a change in AMPA receptor number and function, often with structural change at the dendritic spine.

**Timing rules.** Spike-timing-dependent plasticity makes the requirement explicit: the sign depends on the order and interval of pre- and postsynaptic spikes, with pre-before-post potentiating and post-before-pre depressing over windows of a few tens of milliseconds.

**Readouts, and what each one licenses.** A field potential slope (mV ms⁻¹) measures a population's synaptic drive. A whole-cell EPSC amplitude (pA) measures one cell's synaptic current. A quantal amplitude distribution (mEPSC, pA) separates multiplicative scaling from input-specific change [99]. A spine count measures structure [114]. A human motor evoked potential (mV) measures a corticospinal population and is separated from any synapse by a spinal segment and a muscle [38,100].

**The human protocols.** Paired associative stimulation was written directly on a Hebbian timing rule: pairing peripheral nerve input with a cortical TMS pulse at a fixed interval raised MEP amplitudes within 30 min, lasting at least 30–60 min, specific to the targeted representation [100]. Theta-burst stimulation delivers bursts of high-frequency pulses repeated at ~5 Hz; 20–190 s changes excitability lastingly, and the sign depends on continuous versus intermittent patterning [38]. For transcranial direct current stimulation the after-effect is read as polarity-specific: anodal raises, cathodal lowers motor cortical excitability [101].

**Where the slice work agrees, and where it does not.** In rat hippocampal slices, direct current applied *during* LTP or LTD induction changed the size of the resulting plasticity depending on polarity and dendritic compartment, and required concurrent synaptic activity and NMDA receptors; the authors concluded that direct current modulates plasticity rather than inducing it [106]. From the other direction, delivering the clinical iTBS600 protocol to mouse organotypic slice cultures produced LTP of excitatory synapses with spine remodelling persisting 24 h while network activity stayed stable [114].

## L3 — Graduate

**A Hebbian rule and its instability.** The minimal rate-based rule is $\dot{w}_i = \eta\,x_i\,y$, where $w_i$ is the weight of synapse $i$ (dimensionless), $x_i$ the presynaptic rate (s⁻¹), $y = \sum_j w_j x_j$ the postsynaptic rate (s⁻¹), and $\eta$ a learning rate (s). The rule is positive-feedback unstable and has no mechanism for depression, which is precisely the gap the BCM sliding threshold was written to fill (see *metaplasticity-and-state-dependence*).

**Timing dependence.** The standard empirical STDP window is a pair of exponentials,

$$\Delta w(\Delta t) = \begin{cases} A_{+}\,e^{-\Delta t/\tau_{+}}, & \Delta t > 0 \\[2pt] -A_{-}\,e^{\Delta t/\tau_{-}}, & \Delta t < 0 \end{cases}$$

Symbols: $\Delta t = t_{\text{post}} - t_{\text{pre}}$ (ms), so $\Delta t>0$ is pre-before-post; $A_{+}, A_{-}$ maximum fractional weight changes per pairing (dimensionless, typically a few per cent); $\tau_{+}, \tau_{-}$ time constants (ms, typically 10–30 ms). At $\Delta t = -10$ ms with $\tau_{-} = 20$ ms the depressing term is $-A_{-}e^{-0.5} = -0.61A_{-}$. The window is an empirical fit, and its parameters are preparation-specific; it is not a law.

**Calcium as the sign variable.** The mechanistic account replaces the timing window with a threshold on the postsynaptic calcium transient: with $[\mathrm{Ca}^{2+}]_i$ in µM, potentiation requires transients above roughly a micromolar for tens of milliseconds while depression is favoured by smaller, longer elevations. This is what makes the NMDA receptor's voltage- and ligand-dependence the coincidence detector, and it is why the same induction protocol changes sign when the postsynaptic membrane potential is shifted — the link to state dependence.

**Scaling, formally.** Multiplicative scaling is $w_i \to \alpha w_i$ for all $i$, with $\alpha$ dimensionless. The diagnostic is that the whole mEPSC amplitude distribution is rescaled rather than shifted, which is what Turrigiano and colleagues reported and is why relative weights survive while the summed drive returns toward a set point [99]. Any account of a stimulation after-effect as "bounded" or "reversed by compensation" is appealing to this mechanism and inherits its preparation: dissociated rat cortical culture, over hours to a day [99].

**What the human measurement can and cannot support.** The MEP is a population output. Writing it as $\mathrm{MEP} = g(\text{cortical excitability},\ \text{spinal excitability},\ \text{neuromuscular state})$ makes the identification problem explicit: a change in the product is not attributable to the first factor without further evidence. Receptor blockade narrows this only partly. In a placebo-controlled study with six participants, memantine abolished both the MEP suppression after continuous TBS and the facilitation after intermittent TBS, with motor thresholds unchanged [105]; that establishes that the after-effect needs NMDA receptors *somewhere in the measured pathway*, not where [38,105]. Molecular dependency measured in tissue is stronger: in mouse motor cortex, anodal direct current paired with low-frequency synaptic input produced long-lasting potentiation requiring BDNF secretion and TrkB activation, and mice with impaired activity-dependent BDNF release gained less from motor training, as did humans carrying Val66Met [110].

**Direction needs a distribution.** In 56 healthy people tested with paired associative stimulation, anodal tDCS and intermittent TBS, only 39%, 45% and 43% respectively moved in the expected direction, responses were bimodal, and response to one protocol did not predict response to another [204]. Across individual data from 430 participants in 22 studies, between-person variability in TBS response was large, with iTBS response predicted by lower baseline MEP amplitude, older age, target muscle and time of day [107]. A single signed edge from protocol to "LTP-like plasticity" asserts more than these data support [107,204].

## L4 — Expert

The fragile joint is not whether LTP exists but whether the human protocols induce it. Bliss and Lømo (1973) is secure within its preparation [96]; Stefan and colleagues (2000) and Huang and colleagues (2005) established that human protocols produce lasting, pattern-dependent excitability change [38,100]. The inference from the second to the first is what is contested, and three separate results press on it.

First, the direct-current case. Kronberg and colleagues (2017) found in rat hippocampal slices that direct current changed the *size* of concurrently induced LTP or LTD in a polarity- and compartment-dependent way and required ongoing synaptic activity and NMDA receptors, concluding that direct current modulates rather than induces plasticity [106]. That is a weaker claim than the human literature's usual reading of tDCS after-effects [101].

Second, the level at which the human effect arises. Majdi, Asamoah and Mc Laughlin (2023) re-examined six published tDCS studies and argued that co-stimulation of scalp cranial and cervical nerves could explain them (group H-tdcs-plasticity) [109]. The precedent is from alternating current: Asamoah and colleagues showed in rats and humans that skin anaesthesia reduced tACS-induced tremor entrainment and that peripheral nerve stimulation alone reproduced the motor effects [54]. That peripheral account is itself contested, since Krause and colleagues (2019) found macaque hippocampal and visual-cortical neurons still entrained after topical anaesthesia [55]. The design the reinterpretation asks for — transcranial and transcutaneous routes manipulated independently in the same participants — has not been run [109].

Third, the reliability of the sign. López-Alonso and colleagues (2014) reported bimodal, protocol-non-transferable responses [204], and Corp and colleagues (2020) attributed much of the pooled TBS variability to measurement method [107]. At the behavioural level a quantitative review of 59 studies found no significant effect of single-session tDCS on any cognitive outcome in healthy adults, and that review's own pooling choices were then contested [108].

Two results push the other way and should be weighed. Lu and colleagues (2025) delivered the clinical iTBS600 protocol to mouse organotypic slice cultures and found LTP with spine remodelling persisting 24 h [114] — the closest thing available to the human protocol acting on a measured synapse. And Cole and colleagues (2022) found that adding D-cycloserine, an NMDA receptor partial agonist, to four weeks of iTBS produced a 6.15-point greater MADRS reduction (Hedges $g = 0.99$) in 50 patients [190], which is a pharmacological composition at the receptor the plasticity account names. What would settle the core question is a human measurement of synaptic or dendritic change after a clinical protocol; no such measurement exists in this volume's corpus [115,116,165].

## How this volume uses it

Section 6.1 supplies the four founding preparations and the species-and-delivery gap they create [96–99]; section 6.2 states precisely what "LTP-like" claims in human work — pattern dependence, persistence, sign reversal — and what it does not claim, namely a measured synaptic change [38,100,106,114]. Section 6.3 uses pharmacological blockade as the field's tool for assigning a molecular identity to a human after-effect, and marks its structural limit [105,110,189]. Section 6.5 supplies the variability that prevents a signed edge [107,204], and section 6.7 turns this into a schema requirement: an edge is interpretable only if it carries the induction protocol with its parameters, the readout, the preparation and species, and the direction, with a responder fraction rather than a sign [38,96,99,107,114]. Section 7 then treats the molecular endpoints — BDNF/TrkB, mTOR, immediate-early genes — as the level at which these effects are claimed to converge with drug effects [110,115,116].
