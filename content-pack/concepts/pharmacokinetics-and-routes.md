---
id: pharmacokinetics-and-routes
title: Pharmacokinetics and routes of administration
one_liner: "How an administered amount becomes an exposure over time, and why the route is part of the dose rather than a detail of delivery."
why_here: "Sections 3.7 and 11.1 argue that a drug's dose is an exposure at a compartment, not a milligram amount; this page gives the compartmental algebra, the AUC, Cmax and half-life definitions, and the route dependence those arguments assume."
prerequisites: [dose-and-parameter-sets, receptor-theory-occupancy]
terms: [exposure, auc, cmax, exposure-response-analysis, route-of-administration, compartment, intrathecal, intranasal, convection-enhanced-delivery, blood-brain-barrier, brain-extracellular-fluid, pbpk-model, pulsatile-exposure, active-species, three-pillars]
figures: []
further_reading:
  - { title: "Pharmacokinetics (StatPearls, NCBI Bookshelf) — absorption, distribution, metabolism, excretion, half-life and clearance", url: "https://www.ncbi.nlm.nih.gov/books/NBK557744/", kind: textbook }
  - { title: "Merkus FWHM, van den Berg MP. Can nasal drug delivery bypass the blood-brain barrier? Questioning the direct transport theory. Drugs R D 2007", url: "https://link.springer.com/article/10.2165/00126839-200708030-00001", kind: review }
self_check:
  - q: "A drug is given as a 100 mg intravenous bolus. Clearance is 10 L/h and volume of distribution is 50 L. What is the elimination half-life?"
    options: ["0.2 h", "3.47 h", "5.0 h", "10 h"]
    answer: 1
    explanation: "k_e = CL/V_d = 10/50 = 0.2 per hour, and t_half = ln2/k_e = 0.693/0.2 = 3.47 h. Half-life is a derived quantity: it follows from clearance and volume of distribution, and neither alone fixes it."
  - q: "The same 100 mg is then given orally with bioavailability F = 0.5. What happens to total exposure, AUC?"
    options: ["It is unchanged, because clearance is unchanged", "It halves, because AUC = F x Dose / CL", "It doubles, because absorption is slower", "It cannot be calculated without k_a"]
    answer: 1
    explanation: "AUC for extravascular dosing is F x Dose / CL, so AUC falls from 10 to 5 mg·h/L. The absorption rate constant k_a changes Cmax and t_max but cancels out of AUC."
  - q: "Twenty patients with spinal spasticity who had failed oral baclofen improved on intrathecal infusion of the same drug. What does the comparison isolate?"
    options: ["A difference in intrinsic efficacy between the two preparations", "A placebo effect of the pump", "The compartment reached, with the molecule and its receptor pharmacology held fixed", "A change in the drug's K_D at GABA-B receptors"]
    answer: 2
    explanation: "Only the route changed. Oral dosing puts occupancy where the side effects are; intrathecal dosing puts it where the circuit is, which is why the volume treats route as a property of the drive rather than an annotation on it."
  - q: "Why is plasma exposure described in this volume as a proxy rather than the dose for a CNS drug?"
    options: ["Plasma assays are not sensitive enough", "What matters at the receptor is the brain extracellular fluid concentration, set by barrier transport and CNS distribution", "Plasma concentrations are only measurable after steady state", "AUC is undefined for drugs that cross the blood-brain barrier"]
    answer: 1
    explanation: "CNS exposure is set by passive diffusion plus active influx and efflux at the barrier and then by distribution among plasma, brain extracellular fluid and CSF; the volume's reference review states that concentration at the receptor, not in plasma, is the dose."
---

## What it is

Pharmacokinetics is the description of what the body does to a drug over time: absorption into the circulation, distribution among tissues, metabolism, and excretion. It is separate from pharmacodynamics, which is what the drug does to the body. The reason the distinction is load-bearing in this volume is that a prescription states an *amount* — 50 mg once daily — while the quantity that drives a receptor is a *concentration at a site, as a function of time*. Pharmacokinetics is the machinery that converts the first into the second, and different routes of administration convert it differently.

The field's summary statistics for an exposure are few: the area under the concentration–time curve (AUC), the peak concentration (Cmax), the time at which the peak occurs (tmax), and the elimination half-life. Exposure–response analysis then links those summaries to clinical endpoints, and there are published good-practice recommendations for doing so [25]. This matters because drug development fails at this joint: in an analysis of 44 Pfizer Phase II programmes, lack of efficacy was the main reason for failure, and in 43% of cases it was unclear whether the mechanism had been adequately tested [24]. The authors' proposed remedy was the three "pillars" — exposure at the target site, target binding, and expression of pharmacological activity [24].

The route of administration sets all of the summary statistics except clearance. Oral dosing adds an absorption step and first-pass metabolism, and so fixes bioavailability and the shape of the rising limb. Intravenous infusion sets the input function directly. Intrathecal delivery changes which compartment is dosed. Convection-enhanced delivery abandons diffusion entirely and uses bulk flow, so its dose parameters are infusion rate, volume, catheter placement and tissue hydraulic conductivity [160]. The intranasal route is claimed to reach the CNS without passing through the systemic circulation, which is a claim about compartments rather than about kinetics [161,162].

For a drug acting in the brain there is one further layer. Plasma exposure is itself a proxy: what matters at the receptor is the concentration in brain extracellular fluid, set by passive diffusion together with active influx and efflux at the blood–brain barrier and then by distribution among CNS compartments, and usually estimated with physiologically based models tied to animal data [164].

## L1 — Intuition

Imagine watering a plant. The label on the watering can tells you how much water you poured, but the plant responds to how wet its roots are and for how long. Pour a litre quickly and you get a brief flood and a lot of run-off; drip the same litre over an hour and the soil stays damp the whole time. Same amount, different exposure.

A drug works the same way. A tablet swallowed has to survive the gut and a first pass through the liver, so only a fraction of it ever reaches the bloodstream, and it arrives gradually: a slow rise, a modest peak, a long tail. The same amount injected into a vein arrives all at once: a high early peak and then a decline. Both may deliver similar total exposure or wildly different exposure, depending on how much survived absorption.

Where you pour also matters. Oral baclofen has to reach the whole body to get a little into the spinal cord, and the side effects arrive with it; the same molecule delivered by a pump into the fluid around the spinal cord puts the drug where the problem is and leaves the rest of the body largely alone. In twenty patients whose oral treatment had failed, that change of route — and nothing else — worked.

Two numbers carry most of this: the total exposure (the area under the concentration curve) and the peak. And one number tells you how fast it leaves: the half-life, the time for the concentration to halve. Whether a drug feels smooth or spiky depends on the peaks, which is why levodopa's erratic absorption, not its receptor pharmacology, drives much of the clinical picture in Parkinson's disease.

## L2 — Undergraduate

**One compartment, intravenous bolus.** Treat the body as a single well-mixed compartment of apparent volume $V_d$ (L) from which drug is removed by first-order elimination. After a bolus dose $D$ (mg),

$$C(t) = \frac{D}{V_d}\,e^{-k_e t}$$

with $C$ in mg L⁻¹ and $k_e$ in h⁻¹. Three derived quantities follow: $k_e = CL/V_d$; the half-life $t_{1/2} = \ln 2/k_e$; and the total exposure $AUC_{0\to\infty} = D/CL$ in mg·h·L⁻¹.

*Worked example.* $D = 100$ mg, $V_d = 50$ L, $CL = 10$ L h⁻¹. Then $k_e = 0.2$ h⁻¹, $t_{1/2} = 3.47$ h, the initial concentration is $C_0 = 2$ mg L⁻¹ and $AUC = 10$ mg·h·L⁻¹. Note that half-life is derived, not primary: halving clearance or doubling the volume of distribution both double it.

**Adding a route.** For extravascular administration with first-order absorption rate constant $k_a$ (h⁻¹) and bioavailability $F$ (dimensionless), exposure becomes $AUC = F D / CL$ — so $F$ scales total exposure and $k_a$ does not. What $k_a$ sets is the shape: $t_{\max} = \ln(k_a/k_e)/(k_a-k_e)$, and hence Cmax. With $F = 0.5$ and $k_a = 1.0$ h⁻¹ in the example above, $t_{\max} = \ln 5/0.8 = 2.0$ h and Cmax ≈ 0.67 mg L⁻¹, against 2 mg L⁻¹ immediately after the intravenous bolus. Same milligrams, one third of the peak, half the exposure.

**Schedules.** On repeated dosing at interval $\tau$ the accumulation factor is $1/(1-e^{-k_e\tau})$, and steady state is approached in about $4$–$5$ half-lives. A single 60-hour intravenous infusion (brexanolone) and a 50 mg oral course once daily for 14 days (zuranolone) are two different exposures built on the same target pharmacology [180,181].

**Why routes are dose variables here.** Route fixes onset, exposure profile over time, and compartment reached [163,186]. In the baclofen crossover, intrathecal infusion of the same GABA-B agonist lowered muscle tone in every one of 20 patients who had failed oral dosing, with benefit maintained over a mean 19.2 months [163]. For levodopa, a human review attributes wearing-off, dyskinesia and the long-duration response largely to erratic plasma uptake and dose-to-dose variability rather than to receptor pharmacology [186].

## L3 — Graduate

**Derivation.** Mass balance on one compartment with first-order elimination gives $V_d\,dC/dt = -CL\cdot C$, hence $dC/dt = -k_e C$ with $k_e = CL/V_d$, and $C(t) = C_0 e^{-k_e t}$ with $C_0 = D/V_d$. Integrating, $AUC_{0\to\infty} = \int_0^\infty C\,dt = C_0/k_e = (D/V_d)(V_d/CL) = D/CL$.

Symbols and units: $C(t)$ plasma concentration (mg L⁻¹); $D$ dose (mg); $V_d$ apparent volume of distribution (L) — a proportionality constant between amount in body and plasma concentration, not an anatomical volume; $CL$ clearance (L h⁻¹) — the volume of plasma cleared of drug per unit time, the only primary parameter of elimination; $k_e$ first-order elimination rate constant (h⁻¹); $t_{1/2}$ half-life (h); $AUC$ area under the concentration–time curve (mg·h·L⁻¹); $F$ bioavailability (dimensionless, 0–1); $k_a$ absorption rate constant (h⁻¹).

**With absorption.** For first-order input into the same compartment,

$$C(t) = \frac{F D k_a}{V_d (k_a - k_e)}\left(e^{-k_e t} - e^{-k_a t}\right)$$

Setting $dC/dt = 0$ gives $t_{\max} = \ln(k_a/k_e)/(k_a - k_e)$, which depends only on the two rate constants, and $C_{\max} = (FD/V_d)\,e^{-k_e t_{\max}}$. Integrating the whole expression returns $AUC = FD/CL$: the $k_a$ terms cancel. This is the algebraic form of the volume's claim that route and schedule are dose variables [163,186]. Route enters through $F$ and $k_a$ and, in the flip-flop regime $k_a < k_e$, through the apparent terminal slope as well, where the measured "half-life" is the absorption half-life in disguise.

**Assumptions, and where they fail.** Instantaneous mixing, linear (concentration-independent) clearance, and a single kinetically homogeneous compartment. Saturable metabolism makes $CL$ concentration-dependent; slow tissue distribution requires two or more compartments; and target-mediated disposition makes the receptor itself a clearance route. None of these survives contact with the CNS problem, where the compartment of interest is not plasma. Concentration in brain extracellular fluid is set by passive diffusion plus active influx and efflux at the barrier and then by distribution among plasma, brain extracellular fluid and CSF, and the authoritative review adds that disease-related changes in barrier function rarely yield large gains in penetration [164]. The practical substitute is a physiologically based model with compartment-specific transport terms fitted to animal data [164].

**Routes that break the compartment model altogether.** Convection-enhanced delivery replaces diffusion with bulk flow: a sustained pressure gradient during interstitial infusion into animal white matter carried solute centimetres rather than millimetres, with volume of distribution scaling linearly with volume infused — about 6:1 distribution-to-infusion for $^{111}$In-transferrin and about 13:1 for $^{14}$C-sucrose — and reached local concentrations orders of magnitude above achievable systemic levels [160]. Here the governing quantities are hydraulic: infusion rate (µL min⁻¹), infused volume (µL or mL), catheter placement, and tissue hydraulic conductivity. Intrathecal infusion changes which fluid compartment is dosed [163]. The intranasal route is claimed to reach CNS tissue by olfactory and trigeminal perineural and perivascular bulk flow, skipping the systemic circulation [161].

**Exposure is not the same as duration of effect.** Intravenous ketamine 0.5 mg/kg in 18 patients with treatment-resistant depression produced improvement within 110 minutes that persisted about a week [166]; an effect outlasting clearance by days cannot be carried by continuing occupancy [166]. The kinetic summary constrains the input to the chain, not the chain's own time constants.

## L4 — Expert

Two things in this area are genuinely open, and one is widely misreported.

The contested one is direct nose-to-brain transport (group H-nose-to-brain). Lochhead and Thorne (2012) set out olfactory and trigeminal pathways with perineural and perivascular bulk flow as routes that skip the systemic circulation [161]. Merkus and van den Berg (2007) appraised roughly 100 mostly animal studies and found only twelve adequately designed to test direct transport, of which two — both in rats — indicated it; they report no pharmacokinetic evidence that intranasal dosing in humans delivers more drug to brain targets than intravenous dosing at comparable systemic exposure, and note that the human olfactory area is proportionally far smaller than the rodent's [162]. Their design criteria name the experiment that would settle it: matched doses by the two routes with brain and plasma exposure measured in the same subjects [162]. Note what is *not* contested: TRANSFORM-2 randomised 227 patients with treatment-resistant depression to flexibly dosed intranasal esketamine or placebo spray with a new oral antidepressant and found greater MADRS improvement by day 28 [169]. A route can be clinically decisive while the mechanism claim about it stays open.

The second is the status of plasma exposure as a surrogate. de Lange and Hammarlund-Udenaes (2022) argue that the target-site concentration must be modelled rather than inferred, and that disease-related barrier changes rarely deliver large penetration gains [164]. The practical difficulty is that the reference data for such models come from animals, so the CNS exposure estimate inherits a species-translation assumption that the plasma number does not make visible.

The misreported one is half-life. It is a derived parameter, $\ln 2\,V_d/CL$, and it is routinely used as if it indexed duration of action. The volume's counterexamples cut both ways: ketamine's antidepressant effect outlasts its clearance by days [166], while levodopa's clinical problems are attributed to dose-to-dose variability in plasma uptake rather than to pharmacodynamics, so pulsatile and continuous exposure of the same receptors behave as different drives [186]. Bonaventura and colleagues (2022) add the sharpest version of the exposure problem: a screen across thousands of human proteins found no direct target for the proposed active metabolite (2R,6R)-hydroxynorketamine, which nonetheless remained behaviourally active [167]. Where the acting species is unresolved, it is not clear which molecule's kinetics to model at all — and Gomez and colleagues (2017) showed a case where the answer was a metabolite that the design had assumed to be inert [29].

## How this volume uses it

Section 3.7 rests on this page directly: it argues that the milligram amount is the device setting of pharmacology, that exposure summarised as AUC and Cmax is what exposure–response analysis links to endpoints [25], and that plasma exposure is itself a proxy for brain extracellular fluid concentration [164]. Section 11.1 makes route "a first-class variable", using the intrathecal baclofen crossover [163], convection-enhanced delivery [160], the intranasal dispute [161,162] and levodopa's pulsatile exposure [186]; section 11.2 uses the barrier model as the pharmacological analogue of a device's E-field model [164]. Section 11.5 contrasts brexanolone's single 60-hour infusion with zuranolone's 14-day oral course at fixed target pharmacology [180,181]. Section 11.7 then converts all of this into a schema requirement: route, exposure profile and compartment reached are properties of the drive node rather than annotations on it, and exposure is modelled at the target site rather than read from plasma [163,164,180,181].
