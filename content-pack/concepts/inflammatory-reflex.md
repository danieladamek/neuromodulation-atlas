---
id: inflammatory-reflex
title: The inflammatory reflex
one_liner: "The proposed neural circuit by which vagal activity suppresses macrophage cytokine release, step by step and with the species each step was shown in."
why_here: "Section 9 follows this pathway from an electrical drive to a molecule and an outcome as the volume's one complete chain, then takes up the argument about whether it is a reflex; this page assembles the anatomy and signalling that argument is about."
prerequisites: [receptor-theory-occupancy]
terms: [inflammatory-reflex, vagus-nerve, vagus-nerve-stimulation, tavns, splenic-nerve, alpha7-nicotinic-receptor, acetylcholine, noradrenaline, tnf, nf-kb, neuropod-cell, interoception, hpa-axis, cortisol, pupillometry, proxy, sckan]
figures: []
further_reading:
  - { title: "Tracey KJ. The inflammatory reflex. Nature 2002", url: "https://www.nature.com/articles/nature01321", kind: review }
  - { title: "Pavlov VA, Tracey KJ. Neural regulation of immunity: molecular mechanisms and clinical translation. Nat Neurosci 2017", url: "https://www.nature.com/articles/nn.4477", kind: review }
  - { title: "Martelli D, McKinley MJ, McAllen RM. The cholinergic anti-inflammatory pathway: a critical review. Auton Neurosci 2014", url: "https://www.sciencedirect.com/science/article/pii/S1566070213007777", kind: review }
self_check:
  - q: "In the founding 2000 paper, which two preparations were used, and for which step?"
    options: ["Mouse spleen for the T-cell relay and rat liver for TNF", "Human macrophages in vitro for the acetylcholine step, and endotoxaemic rats for vagal stimulation", "Human volunteers for cytokine measurement and mice for stimulation", "Rabbit hippocampus and rat cortical culture"]
    answer: 1
    explanation: "Borovikova and colleagues showed that acetylcholine suppressed LPS-induced TNF, IL-1beta, IL-6 and IL-18 but not IL-10 in human macrophages in vitro, and that vagal stimulation in endotoxaemic rats inhibited hepatic TNF synthesis, blunted the serum TNF peak and prevented shock."
  - q: "Why did the efferent account need a non-neuronal cell added to it?"
    options: ["Because macrophages do not express nicotinic receptors", "Because vagal fibres do not innervate the spleen and lack the machinery to synthesise acetylcholine there", "Because the spleen has no noradrenergic innervation", "Because TNF is produced only in the liver"]
    answer: 1
    explanation: "Rosas-Ballina and colleagues identified a memory-phenotype population of choline acetyltransferase-expressing T cells in the mouse spleen, required for vagus nerve stimulation to inhibit TNF. The transmitter-making cell in the efferent arc is a lymphocyte."
  - q: "What specifically did the critical review reject, while accepting most of the pathway?"
    options: ["That alpha7 nicotinic receptors are involved", "That splenic noradrenergic terminals are required", "The proposed disynaptic vagus-to-splenic-nerve connection, since vagal stimulation drives no splenic nerve action potentials", "That stimulating the cut peripheral vagus suppresses inflammation"]
    answer: 2
    explanation: "Martelli, McKinley and McAllen accepted the suppression, the splenic locus, the noradrenergic requirement, the ChAT-positive T cells and the alpha7 requirement, and rejected the wiring claim. Their conclusion separates a pathway that is activatable from a physiological reflex to endotoxaemia."
  - q: "In the RESET-RA implant trial, what was the sham-controlled ACR20 difference at three months?"
    options: ["35.2% versus 24.2%, about eleven percentage points", "50.0% versus 24.2%, about twenty-six points", "73.9% versus 29.3%", "No difference was observed"]
    answer: 0
    explanation: "242 patients with refractory rheumatoid arthritis were randomised; ACR20 response was 35.2% with active stimulation against 24.2% with sham at three months (p = 0.02), rising among completers to 50.0% at six and 52.8% at twelve months in open-label follow-up. A difference of that size is compatible with both framings of the mechanism."
---

## What it is

The inflammatory reflex is the proposal that the nervous system senses and regulates inflammatory state in real time, as it regulates heart rate, so that cytokine concentration is a controlled variable and therefore a target for a device [149]. It is the one chain in this volume that runs end to end in a single preparation: an electrical drive on a nerve that can be reached surgically and stimulated with known current, a molecular readout assayable in serum, and a named set of organs and projections in between [148].

The founding paper reported two experiments. In human macrophages stimulated with lipopolysaccharide *in vitro*, acetylcholine strongly suppressed release of TNF, IL-1β, IL-6 and IL-18, but not IL-10 [148]. In rats made endotoxaemic, direct electrical stimulation of the peripheral vagus nerve inhibited hepatic TNF synthesis, blunted the peak of serum TNF and prevented shock [148]. The authors read this as an efferent, parasympathetic anti-inflammatory pathway, distinct from the already-described afferent vagal route that acts through the hypothalamic–pituitary–adrenal axis [148].

That account had an anatomical hole. Vagal suppression of splenic TNF requires acetylcholine acting on α7 nicotinic receptors on the cytokine-producing macrophages, but vagal fibres do not innervate the spleen and lack the machinery to synthesise acetylcholine there [150]. Rosas-Ballina and colleagues closed the gap in mice with a non-neural cell: a memory-phenotype population of choline acetyltransferase-expressing T cells in the spleen, required for vagus nerve stimulation to inhibit TNF [150]. The efferent arc therefore passes through a lymphocyte that makes the transmitter and terminates on a receptor expressed by a macrophage [150].

Whether the assembled pathway is a *reflex* is where agreement stops, and the volume keeps the dispute open (group H-inflammatory-reflex). Martelli, McKinley and McAllen audited the evidence point by point, accepted most of it, and rejected the proposed disynaptic connection from vagus to splenic nerve on the ground that vagal stimulation does not drive action potentials in the splenic nerve [151]. Their conclusion separates two claims the reflex language fuses: the pathway is activatable, electrically and pharmacologically, but it is not the efferent arm of a physiological reflex to endotoxaemia [151].

## L1 — Intuition

The immune system was long treated as a chemical system that the brain watched from a distance. The inflammatory reflex says the connection is much tighter than that: the brain monitors inflammation through nerves and can turn it down through nerves, the way it turns heart rate down.

The evidence that started it is striking in its simplicity. Put acetylcholine — the transmitter the vagus nerve uses — onto human immune cells that have been provoked with bacterial toxin, and they make much less of the inflammatory signal TNF. Then take a rat with a body-wide inflammatory response, put an electrode on its vagus nerve, and the same suppression appears in the living animal: less TNF made in the liver, a blunted peak in the blood, and no shock.

Filling in the middle produced a surprise. The spleen is where the relevant TNF is made, and the vagus does not reach the spleen. What bridges the gap is a type of T cell living in the spleen that can manufacture acetylcholine itself. Remove that cell population in mice and stimulating the vagus no longer suppresses TNF. So one link in a nerve-to-molecule chain is an immune cell, not a neuron.

The argument now is about the word "reflex". A reflex needs wiring: a sensor, a decision, and an output line. The output line here has been looked for and not found — stimulating the vagus does not produce spikes in the nerve going to the spleen. So the pathway may be something you can drive with a device without it being a loop the body itself runs. Either way, an implant that stimulates the vagus produced a modest but real benefit in refractory rheumatoid arthritis.

## L2 — Undergraduate

**The claim, in order.** (1) The vagus carries afferents that can report inflammatory state. (2) Central processing links that report to autonomic outflow. (3) An efferent limb ends, by some route, at the spleen. (4) In the spleen, noradrenergic nerve terminals act on ChAT-positive T lymphocytes, which release acetylcholine. (5) Acetylcholine acts on α7 nicotinic receptors on macrophages. (6) Those macrophages reduce synthesis and release of TNF and other pro-inflammatory cytokines, with IL-10 spared. (7) The systemic consequence is less circulating TNF and, in rodent endotoxaemia, prevention of shock.

**What is agreed, and where each step was shown.** Steps 4, 5 and 6 are accepted by both sides of the dispute: the critical review explicitly accepts that the spleen is where systemic TNF is produced and suppressed, that the effect requires noradrenergic nerve terminals in the spleen and ChAT-positive T lymphocytes, and that α7 nicotinic receptors are essential [151]. Step 6's cytokine specificity comes from human macrophages [148]; the T-cell relay from mouse [150]; the in vivo suppression and survival benefit from rat [148]. Step 3's wiring is what is rejected [151].

**Dose is a parameter set here too.** The record this volume works from does not carry the current, frequency, pulse width or train duration of the founding rat stimulation, so that experiment cannot be replicated from what is cited [148]. The parametric work came later and for a different readout: in rat locus coeruleus, half-second trains drove phasic firing from 0.1 mA upward, higher current and longer pulse widths raised firing rate, and pulse frequency changed the timing of the burst without changing total activity [140]. Pulse-locked trigeminal activity, a control for non-specific recruitment, appeared only above 1.2 mA — so the same cuff at two amplitudes is two different drives [140].

**The afferent side is the larger side.** Most vagal fibres are sensory. Prescott and Liberles organise vagal sensory neurons by molecularly defined cell type across respiratory, cardiovascular and digestive systems, and stress how little is established about transduction in vagal afferents compared with the external senses [157]. The practical consequence is that "the vagus" is a heterogeneous bundle of genetically distinct afferent classes, so a cuff or an ear electrode engages a mixture of labelled lines rather than a channel [157].

## L3 — Graduate

The pathway, step by step, with the preparation for each. Nothing below is asserted beyond the species it was shown in.

**1. Sensing (mouse; largely uncharacterised).** Vagal afferents are the candidate sensor. Their molecular cell types have been catalogued across organ systems in mouse, and transduction in vagal afferents and their upstream sentinel cells is poorly established relative to the external senses [157]. A second, faster sensory route sits at the gut wall: in mice, enteroendocrine "neuropod" cells form glutamatergic synapses with vagal afferents and transduce luminal stimuli in milliseconds, where the signalling had been assumed hormonal and slow [158].

**2. Central integration (proposed; review level).** Tracey's formalisation treats inflammatory state as sensed and regulated in real time, with cytokine concentration as a controlled variable [149]; Pavlov and Tracey set out which neural, endocrine and immune nodes connect to which, and which connections have been addressed experimentally [154]. A separate, earlier-described afferent vagal route acts through the HPA axis, and the 2000 paper is explicit that the efferent cholinergic pathway is distinct from it [148]. The endocrine limb is measurable in humans from the other direction: across 16 randomised trials of prefrontal TMS or tDCS in healthy adults, stimulation reduced the acute cortisol response to a laboratory stressor (SMD = −0.72), more for TMS than tDCS and when delivered before or after rather than during the stressor [159].

**3. Efferent routing to the spleen (disputed; rat).** This is the contested link. The reflex account posits a disynaptic connection from vagus to splenic nerve [149,150]. The audit rejects it because vagal stimulation drives no action potentials in the splenic nerve [151].

**4. Splenic noradrenergic terminals (accepted; rodent).** Noradrenergic nerve terminals in the spleen are required for the effect, a requirement the critical review accepts [151].

**5. The acetylcholine-making relay (mouse).** A memory-phenotype ChAT-expressing T-cell population in the spleen is required for vagus nerve stimulation to inhibit TNF [150]. This is the section's most consequential result for schema design: an edge in a drive-to-outcome chain can have a non-neuronal cell at one end [150].

**6. α7 nicotinic receptors on macrophages (accepted; rodent, with human in vitro pharmacology).** α7 nicotinic receptors are essential [151]. The ligand step was characterised in human macrophages: acetylcholine strongly suppressed LPS-induced TNF, IL-1β, IL-6 and IL-18, but not IL-10 — a pattern rather than a global shutdown of cytokine synthesis [148].

**7. Systemic output (rat).** Vagal stimulation in endotoxaemic rats inhibited hepatic TNF synthesis, blunted the serum TNF peak and prevented shock [148].

**8. Human evidence (human).** Alen's review finds a large correlational body of work — mostly associations between heart-rate-variability indices and cytokine concentrations — against a much smaller set of experimental studies with weak designs and limited target-engagement evidence [152]. The pivotal test is an implant trial: RESET-RA randomised 242 patients with rheumatoid arthritis refractory to or intolerant of biologic or targeted synthetic DMARDs to active or sham stimulation for three months, then to open-label stimulation to twelve; ACR20 response at three months was 35.2% against 24.2% with sham (p = 0.02), rising among completers to 50.0% at six and 52.8% at twelve months [153].

**9. Non-invasive delivery, and its target-engagement gap (human; mouse for the proxy).** In 66 healthy participants, continuous cymba conchae transcutaneous auricular VNS just below pain threshold left pupil dilation, resting pupil size, cortisol, salivary alpha-amylase, cardiac vagal activity and respiration unchanged against earlobe sham, while the task itself produced the expected pupil effects [145]. A living Bayesian meta-analysis of 18 taVNS studies (N = 771) found only anecdotal evidence overall (g = 0.15, BF₀₁ = 1.0), splitting by protocol: pulsed delivery gave strong evidence for an effect (g = 0.36, BF₁₀ = 50.8) and continuous delivery strong evidence for the null (g = 0.002, BF₀₁ = 21.9) [146]. That split maps onto the phasic–tonic distinction of the adaptive-gain account [138] and onto the parameter dependence measured in rat locus coeruleus [140], making waveform rather than intensity decisive [146]. The proxy is weak: simultaneous locus coeruleus recording and pupillometry in mice gave a monotonic but highly variable relationship [144].

**Anatomy a graph can stand on.** SCKAN is a curated, ontology-backed record of the origins, terminations and routing of autonomic projections between the CNS and end organs [155]. It holds population-level structural connectivity only: it does not say what a 0.1 mA half-second train does to locus coeruleus firing [140], whether vagal stimulation drives splenic nerve spikes [151], or how large an ACR20 difference an implant produces [153].

## L4 — Expert

The dispute is not about whether a device works but about what the device is doing to what (group H-inflammatory-reflex). Tracey (2002) and Rosas-Ballina and colleagues (2011) hold that stimulation engages a hard-wired homeostatic loop that already regulates cytokines [149,150]. Martelli, McKinley and McAllen (2014) hold that stimulation drives a pathway which exists but is not recruited by endotoxaemia itself, in which case the intervention is closer to a pharmacological trick played on splenic innervation than to closing a natural loop [151]. The molecular chain — noradrenergic terminals, ChAT-positive T cells, α7 nicotinic receptors, macrophage TNF — is not what is disputed; the wiring diagram and the word "reflex" are [149,151].

Crucially, the settling evidence is electrophysiological rather than clinical. What is needed is splenic nerve recording during physiological endotoxaemia with and without vagotomy, plus recordings showing splenic nerve traffic driven by vagal stimulation. The second has been attempted and reported negative [151]. Outcome data cannot adjudicate, because both framings predict benefit: an eleven-point sham-controlled difference in responder rate in a refractory population is a real and modest result, and it is compatible with either account [151,153]. Only one framing licenses an edge labelled "reflex"; the therapeutic claim survives either way [149,151].

Two further weaknesses are worth naming because they are easy to miss. First, the founding experiment is not reproducible from the record this volume works from: the current, frequency, pulse width and train duration of the rat vagal stimulation are not carried [148], and the parametric work that would make a vagal drive specifiable was done later, in a different animal, for a different readout [140]. Since trigeminal co-recruitment appears above 1.2 mA in rat locus coeruleus work [140], an unspecified amplitude leaves open whether the drive was selective at all.

Second, the human non-invasive literature has a target-engagement problem stacked on top of the mechanism problem. D'Agostini and colleagues (2023) found no effect of continuous taVNS on any noradrenergic or endocrine marker [145]; Pervaz and colleagues (2025) resolved the field by protocol, with pulsed delivery showing an effect and continuous delivery showing the null [146]; and Megemont, McBurney-Lin and Yang (2022) showed in mice that pupil diameter is not an accurate real-time readout of locus coeruleus activity [144]. The taVNS engagement question (group H-tavns-engagement) therefore needs a readout validated against direct noradrenergic measurement, with pulsed against continuous delivery within participants [145,146]. Alen (2022) makes the broader point for the human literature as a whole: it is mostly correlational, with heart-rate-variability indices standing in for vagal activity [152].

## How this volume uses it

Section 9 uses this pathway as its organising case: it is the volume's one complete drive → coupling → cellular → molecular → system → outcome chain in a single preparation [148], and the section takes it step by step, then the argument about whether it is a reflex [149,151]. The dose critique in section 3 is applied to it directly — the founding parameters are missing, and the parametric characterisation came later and for another readout [140,148]. The T-cell relay is used in section 9 and again in sections 9's graph requirements as the proof that nodes cannot be restricted to neurons, axons and brain regions [150], with neuropod cells as a second such node type [158]. Section 12.5 and section 14.13 use the taVNS results as the field's sharpest target-engagement failure [145,146], and section 8.6 uses the pupil proxy's weakness [144]. Section 14.12 files the reflex framing itself as an open dispute, and section 15 uses SCKAN as the anatomical substrate for this level while noting what it does not contain [155].
