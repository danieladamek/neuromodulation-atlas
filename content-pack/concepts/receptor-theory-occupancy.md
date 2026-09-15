---
id: receptor-theory-occupancy
title: Receptor theory and occupancy
one_liner: "How affinity, occupancy and intrinsic efficacy connect a drug concentration to a measured response, and why occupancy alone does not fix the effect."
why_here: "Sections 3.7 and 5.7 treat receptor occupancy as pharmacology's mechanism-level dose metric and then show the threshold model breaking; this page supplies the binding algebra and the efficacy terms those arguments assume."
prerequisites: [dose-and-parameter-sets]
terms: [receptor-occupancy, affinity, intrinsic-efficacy, operational-model, partial-agonist, allosteric-modulation, receptor-compartment, raclopride-pet, d2-receptor, positron-emission-tomography, target-engagement, active-species]
figures: []
further_reading:
  - { title: "Kenakin T. Principles: receptor theory in pharmacology. Trends Pharmacol Sci 2004", url: "https://www.sciencedirect.com/science/article/pii/S016561470400063X", kind: review }
  - { title: "Siafis S, et al. Antipsychotic dose, dopamine D2 receptor occupancy and extrapyramidal side-effects: a systematic review and dose-response meta-analysis. Mol Psychiatry 2023", url: "https://www.nature.com/articles/s41380-023-02203-y", kind: review }
self_check:
  - q: "A ligand has K_D = 4 nM. What free concentration gives 80% occupancy of its receptor at equilibrium?"
    options: ["3.2 nM", "8 nM", "16 nM", "20 nM"]
    answer: 2
    explanation: "Rearranging rho = [L]/([L]+K_D) gives [L] = K_D·rho/(1-rho) = 4 nM x 0.8/0.2 = 16 nM. Occupancy is a saturating function, so each further increment of occupancy costs disproportionately more concentration."
  - q: "In a tissue with large receptor reserve (operational efficacy tau = 10), roughly what fraction of receptors is occupied at the concentration giving half-maximal response?"
    options: ["About 8%", "About 50%", "About 91%", "Exactly the same as K_D predicts, 50%"]
    answer: 0
    explanation: "The operational model gives EC50 = K_A/(1+tau) = K_A/11. Substituting into the occupancy equation gives rho = (K_A/11)/(K_A/11 + K_A) = 1/12, about 8%. EC50 and K_D coincide only when tau is small, so a potency estimate is not an affinity estimate."
  - q: "A dose-response meta-analysis found that extrapyramidal risk rises steeply above roughly 75-85% D2 occupancy for antipsychotic antagonists but stays low for aripiprazole at comparably high occupancy. What does this show?"
    options: ["Occupancy measurements by PET are unreliable above 75%", "Occupancy predicts effect only once the ligand's intrinsic efficacy is specified", "Aripiprazole does not reach high D2 occupancy in patients", "Partial agonists bind a different receptor"]
    answer: 1
    explanation: "Aripiprazole is a partial agonist: at the same occupancy it produces a different stimulus. An occupancy window is therefore a property of a drug class rather than a transferable dose metric, which is the substance of the H-d2-occupancy dispute in section 14.19."
  - q: "Systemically injected clozapine-N-oxide was shown not to enter the brain, while its metabolite clozapine does and occupies the designer receptors. Which quantity was therefore mis-specified in earlier chemogenetic studies?"
    options: ["The receptor's K_D for acetylcholine", "The Hill coefficient of the binding curve", "The identity of the active species, and hence what was occupying the receptor", "The volume of distribution of the vehicle"]
    answer: 2
    explanation: "Occupancy is only interpretable once the acting ligand is named. Gomez and colleagues (2017) showed the nominal compound was not the one at the receptor, so the dose was exposure to a metabolite."
---

## What it is

Receptor theory is the quantitative half of pharmacology. It asks how the concentration of a ligand at a receptor relates to the number of receptors it occupies, and then how that occupancy relates to a response that can be measured in a cell, a tissue or a patient. The first relation is chemistry and is well behaved: it follows from the law of mass action and produces a saturating curve with one parameter, the equilibrium dissociation constant. The second relation is biology, and it is where the difficulty lives.

Two ligands can occupy the same receptors to the same extent and produce different responses, because they differ in *intrinsic efficacy*: how effectively an occupied receptor is converted into a stimulus for the cell. Tissues also differ in how much stimulus they need, because they differ in receptor density and in the gain of the downstream machinery. The operational model of agonism was built to separate these — a ligand-specific affinity term, a ligand-and-tissue-specific efficacy term — so that the same agonist can be described consistently across preparations. The reference review for this volume treats the operational model as having supplanted simpler analyses of drug–receptor interaction in functional systems, alongside the extended ternary complex model, allosteric modulation, and ligand-selective active states [91].

Occupancy matters to this volume for a specific reason. It is the closest thing pharmacology has to a *mechanism-level dose*: with positron emission tomography, occupancy can be measured in a living human brain, whereas a milligram amount cannot be. The evidence that it works as a dose metric is real. In 22 first-episode patients with schizophrenia randomised to haloperidol 1.0 or 2.5 mg/day, [11C]raclopride PET put D2 occupancy between 38% and 87%, and clinical response, extrapyramidal symptoms and hyperprolactinaemia became likelier above about 65%, 72% and 78% occupancy respectively [26]. A later review generalises this to a 65–80% D2 window for antipsychotics and 70–80% serotonin transporter occupancy for antidepressants [27].

The evidence that it fails as a universal dose metric is also real, and this volume keeps both. Occupancy is a fraction of sites bound; it says nothing about which conformation was stabilised, where in the cell the receptor sat, or whether the compound administered was the compound bound [28,29,92].

## L1 — Intuition

Think of a receptor population as a very large set of seats in a stadium, and of a drug as an arriving crowd. How many seats fill up depends on how many people arrive and on how much they like the seats. A ligand with high affinity is one that people are keen to sit in and reluctant to leave; a low dose of it fills many seats. That is occupancy, and it saturates: once nearly every seat is taken, adding more people changes nothing, which is why the dose–occupancy curve flattens at the top.

But filling seats is not the point. The point is the noise the crowd makes. Two crowds of the same size can cheer at completely different volumes. That is intrinsic efficacy: some ligands, once seated, shout; some murmur; and an antagonist sits in the seat in silence and stops anyone else from using it. A partial agonist murmurs no matter how many seats it fills, which is exactly why a drug can occupy 80% of dopamine D2 receptors and still not produce the movement side effects that a silent-seat antagonist produces at the same occupancy.

Two further wrinkles matter for this volume. A stadium can be so large that a tenth of the seats filled already produces a deafening noise, so the loudness curve and the seat-filling curve sit in different places. And you have to know who actually sat down: in one well-known case the compound that was injected never reached the seats at all, and a chemical relative of it did the sitting.

## L2 — Undergraduate

**Binding.** For a ligand $L$ binding reversibly to a receptor $R$, mass action gives $L + R \rightleftharpoons LR$ with equilibrium dissociation constant $K_D = k_{\text{off}}/k_{\text{on}}$, in units of concentration (commonly nmol L⁻¹, nM). At equilibrium the fractional occupancy is

$$\rho = \frac{[L]}{[L] + K_D}$$

where $\rho$ is dimensionless and $[L]$ is the *free* ligand concentration. $K_D$ is the concentration giving half occupancy; affinity is $1/K_D$. Worked example: a ligand with $K_D = 2$ nM at a free concentration of 6 nM gives $\rho = 6/(6+2) = 0.75$, i.e. 75% occupancy. Raising the concentration to 18 nM gives 90%; a ninefold increase in exposure bought 15 percentage points of occupancy, which is the practical meaning of saturation.

**Efficacy.** Occupancy is not response. A full agonist produces the tissue's maximal response, a partial agonist a submaximal one at full occupancy, a neutral antagonist none while still occupying. So a concentration–response curve has its own midpoint, $EC_{50}$, which in general is *not* $K_D$. An allosteric modulator binds a separate site and changes affinity or efficacy at the primary site rather than activating directly.

**Occupancy in humans.** PET gives occupancy by competition: a radiotracer with known kinetics is displaced by the drug. Occupancy is estimated as the fractional reduction in tracer binding potential,

$$\rho_{\text{PET}} = 1 - \frac{BP_{\text{drug}}}{BP_{\text{baseline}}}$$

with both $BP$ terms dimensionless. This is what produced the numbers this volume uses: 38–87% D2 occupancy across two haloperidol doses, with response more likely above ~65% and extrapyramidal symptoms above ~72% [26]; and, generalised, 65–80% D2 for antipsychotics, 70–80% SERT for antidepressants [27].

**Why the volume cares.** Occupancy is the second of the three "pillars" that a mechanism-testing study is supposed to demonstrate — exposure at the target site, target binding, and expression of pharmacological activity [24]. A trial that reports a milligram dose and a symptom score has demonstrated neither of the first two.

## L3 — Graduate

**Occupancy from mass action.** With total receptor concentration $[R_T] = [R] + [LR]$ and $K_D = [L][R]/[LR]$, substitution gives $[LR] = [R_T][L]/([L]+K_D)$ and hence $\rho = [L]/([L]+K_D)$. Symbols: $[L]$ free ligand concentration (nM); $[R]$ free receptor concentration (nM); $[LR]$ bound complex (nM); $[R_T]$ total receptor concentration (nM); $K_D$ equilibrium dissociation constant (nM); $\rho$ fractional occupancy (dimensionless, 0–1). Assumptions: one ligand, one site, one state, equilibrium reached, ligand depletion negligible ($[L] \gg [R_T]$), and no cooperativity. Cooperativity or aggregated non-identical sites are absorbed empirically into a Hill form $\rho = [L]^{n}/([L]^{n}+K_D^{n})$, where $n$ is dimensionless and descriptive rather than mechanistic.

**The operational model.** To get from occupancy to response without asserting proportionality, the operational model passes occupancy through a rectangular hyperbolic transducer function. Writing response $E$ as a function of agonist concentration $[A]$,

$$E = \frac{E_{\max}\,\tau\,[A]}{[A](\tau+1) + K_A}$$

Symbols: $E$ observed response (units of whatever is measured — mV, spikes s⁻¹, % maximal contraction); $E_{\max}$ the maximal response the *system* can give (same units); $[A]$ agonist concentration (nM); $K_A$ the agonist's equilibrium dissociation constant (nM); $\tau = [R_T]/K_E$ the operational efficacy, dimensionless, where $K_E$ (nM) is the concentration of agonist–receptor complex producing half of $E_{\max}$. $\tau$ is ligand-specific *and* tissue-specific: it carries both intrinsic efficacy and receptor density.

Two consequences follow directly. The observed maximum is $E_{\max}\tau/(1+\tau)$, so a partial agonist is simply a ligand whose $\tau$ is small; and

$$EC_{50} = \frac{K_A}{1+\tau}$$

so potency and affinity coincide only as $\tau \to 0$. With $\tau = 10$, $EC_{50} = K_A/11$, and the occupancy at that concentration is $\rho = (K_A/11)/(K_A/11 + K_A) = 1/12 \approx 8\%$. This is receptor reserve, and it is why "the drug occupies 8% of receptors" is not evidence of a weak effect. Conversely a therapeutic *window* expressed in occupancy — 65–80% D2 [26,27] — is implicitly a statement about a particular $\tau$: it transfers to another ligand only if that ligand's intrinsic efficacy matches.

**Where the model is extended.** Constitutive activity, inverse agonism and ligand-selective active states require state-based treatments (extended ternary complex and successors), and allosteric ligands require separate affinity and cooperativity terms for the modulator [91]. The consequence the volume draws out is that occupancy alone does not fix the effect, because intrinsic efficacy and agonist-selective active states intervene between binding and response [91].

**Compartment and species.** Two further terms sit outside the algebra. The concentration in the equation is the concentration *at the receptor*, which for a CNS drug is the brain extracellular fluid concentration set by barrier transport and CNS distribution, not plasma [164]; and the receptor's location can be part of the mechanism rather than a detail, since the plasticity-promoting effects of psychedelics were attributed to intracellular rather than cell-surface 5-HT2A receptors, which accounts for membrane-impermeant serotonin failing to engage the same mechanism despite being a 5-HT2A agonist [92]. And $[A]$ must be the acting species: PET and pharmacology in rodent and rhesus macaque showed that systemically injected clozapine-N-oxide does not enter the brain and has low affinity for the designer receptors it was built for, which are occupied instead by its metabolite clozapine [29].

## L4 — Expert

The live dispute in this volume is whether an occupancy window is a transferable dose metric at all (group H-d2-occupancy). Kapur and colleagues (2000) established the threshold picture in 22 first-episode patients with a single antagonist, and the thresholds they reported — about 65% for response, 72% for extrapyramidal symptoms, 78% for hyperprolactinaemia — became a design rule [26]; Arakawa and colleagues (2020) generalise it across receptor classes [27]. Siafis, Leucht and colleagues (2023), pooling 110 studies and 37,193 participants, found extrapyramidal risk rising steeply above roughly 75–85% occupancy for antagonists while partial agonists such as aripiprazole kept that risk low at high occupancy [28]. Formally this is exactly what the operational model predicts: occupancy is the argument of the transducer function, not the response. Practically it means the window is a property of the drug class. The measurement that would settle it is occupancy–outcome data across a graded-efficacy ligand series at one receptor in one design, with a pharmacodynamic readout beside the PET number [28].

A second fragility is the assumption of a single site and a single state. Kenakin (2004) argues that agonist-selective active states and allosteric mechanisms make "affinity plus occupancy" insufficient for functional prediction [91]; on that account the operational $\tau$ is a lumped parameter whose stability across assays is an empirical question, not a given. Where a biased agonist stabilises different conformations, two ligands at identical occupancy diverge in which downstream pathway is engaged, and no single-number dose metric recovers that.

Third, the identity and the location of the bound species are both contested in this literature rather than assumed. Gomez and colleagues (2017) reassigned the acting ligand in chemogenetics to a metabolite [29]. Vargas and colleagues (2023) placed the plasticity-relevant 5-HT2A receptor inside the cell [92], against the standard account that weights 5-HT2A receptors on layer V pyramidal apical dendrites [172]. Belelli and Lambert (2005) describe a class of ligands — pregnane neurosteroids — that are both circulating messengers and locally synthesised, so the relevant concentration may never appear in plasma at all [179]. Each of these breaks a different link in the chain from administered dose to receptor occupancy, and the volume's position is that an occupancy claim is only as good as the exposure and species measurements behind it [24,29,164].

## How this volume uses it

Section 3.7 uses occupancy as the pharmacological counterpart of Peterchev's device-setting/induced-field split: the milligram amount is the device setting of pharmacology, exposure is the delivered dose, and PET occupancy is the closest available mechanism-level dose metric [24,26,27]. Section 5.7 uses receptor theory as one of five coupling routes, and draws the specific conclusion that occupancy does not fix the effect because intrinsic efficacy and agonist-selective states intervene [91], and that where the receptor is engaged is part of the coupling rather than a pharmacokinetic detail [92]. Section 11.2 uses the same algebra negatively: affinity measured in a dish predicts nothing until exposure at the target is measured [29,164]. Section 14.19 files the transferability of the occupancy window as an open dispute (H-d2-occupancy), and section 11.7 requires every drug edge in the graph to name its active species and its receptor's compartment [29,92,167].
