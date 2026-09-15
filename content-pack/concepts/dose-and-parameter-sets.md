---
id: dose-and-parameter-sets
title: Dose as a parameter set
one_liner: "Why a stimulation dose is a set of parameters with units rather than a single number."
why_here: "Section 3 argues that device settings are not dose and that no drive class reduces to one intensity; this page gives the background that argument assumes."
prerequisites: []
terms: [dose, dose-parameter-set, exposure, nominal-stimulus, effective-stimulus, charge-per-phase, charge-density, shannon-equation, mechanical-index, cem43, fluence, irradiance, receptor-occupancy, cmax]
figures: []
further_reading:
  - { title: "Peterchev et al. (2012), Fundamentals of transcranial electric and magnetic stimulation dose", url: "https://doi.org/10.1016/j.brs.2011.10.001", kind: review }
  - { title: "ITRUSST consensus on standardised reporting for transcranial ultrasound stimulation (2024)", url: "https://doi.org/10.1016/j.brs.2024.04.013", kind: review }
  - { title: "Merrill, Bikson & Jefferys (2005), Electrical stimulation of excitable tissue: design of efficacious and safe protocols", url: "https://doi.org/10.1016/j.jneumeth.2004.10.020", kind: review }
self_check:
  - q: "A paper reports that a tDCS study used '2 mA'. On the definition used in this volume, what has been reported?"
    options:
      - "The dose, completely"
      - "One entry in the dose parameter set"
      - "The exposure at the target"
      - "The effective stimulus at the membrane"
    answer: 1
    explanation: "Amplitude is a single parameter. The dose also includes electrode configuration, waveform, pulse parameters and the timing of pulses, trains and sessions; the field in tissue is a separate quantity this volume calls exposure."
  - q: "Charge per phase and charge density differ in what way?"
    options:
      - "They are the same quantity in different units"
      - "Charge per phase is charge delivered in one phase of a pulse (C); charge density is that charge divided by the electrode's geometric surface area (C/cm2)"
      - "Charge density applies only to magnetic stimulation"
      - "Charge per phase is measured in volts per metre"
    answer: 1
    explanation: "Q = I x t_pulse has units of coulombs; dividing by electrode area gives C/cm2, conventionally microcoulombs per square centimetre. McCreery and colleagues found neural injury depended on the two acting together, not on either alone."
  - q: "Why does this volume store the nominal and the effective stimulus as two separate properties rather than one field with a flag?"
    options:
      - "Because journals require it"
      - "Because the two have the same units and would otherwise be added together"
      - "Because the device setting and the quantity that reaches the tissue are different measurements with different provenance, and the relation between them is model-dependent and often disputed"
      - "Because only the nominal stimulus can be measured"
    answer: 2
    explanation: "Free-field and in situ acoustic values, device settings and modelled E-field, and administered amount versus target-site exposure are pairs of distinct quantities; collapsing them hides exactly the step that the literature disputes."
  - q: "Which statement about summary dose metrics matches the volume's position?"
    options:
      - "An E-field value of '0.8 V/m at target' is comparable across studies without further qualification"
      - "A summary metric must name the rule used to compute it, because a systematic review found 308 different E-field outcome measures in use"
      - "CEM43 is a regulatory limit"
      - "Receptor occupancy fixes drug effect regardless of the ligand"
    answer: 1
    explanation: "Van Hoornweder and colleagues catalogued 308 E-field outcome measures that gave different values and sampled different regions; a stored value that does not name its metric and pipeline cannot be compared with any other."
---

## What it is

In pharmacology the word "dose" names the amount of a substance given. Neuromodulation borrowed the word but not the simplicity: an electrical, magnetic, acoustic or optical drive is specified by many settings at once, and no single one of them determines what happens in tissue. The reference definition for transcranial methods comes from Peterchev and colleagues in 2012: dose is every device-side parameter that determines the field delivered to the body — the electrode or coil configuration, the waveform, the pulse parameters, and the timing of pulses, trains and sessions [9].

That definition does three things. It fixes dose on the operator's side of the interface, where it can be reported exactly. It makes the field in tissue a *consequence* of dose rather than dose itself. And it separates both from the physiological effect [9]. This volume keeps those three as separate nodes and reserves the word *exposure* for the in-tissue quantity, because other authors use "dose" for it — for example the proposal to calibrate TMS intensity to the modelled cortical electric field rather than to the motor threshold [15]. The two usages name different things, not rival theories [9,15].

The reason this matters is empirical, not terminological. Parameters other than amplitude change the result. In rat locus coeruleus, higher vagus nerve stimulation current and longer pulse widths increased firing rate, while pulse frequency changed *when* a burst occurred without changing how much activity there was [140]. In humans, a Bayesian meta-analysis of 18 transcutaneous auricular vagus studies found strong evidence for a pupil effect with pulsed stimulation and strong evidence for the null with continuous stimulation at matched amplitude [146]. In electroconvulsive therapy, crossing electrode placement with pulse width in 90 patients gave 73% remission for ultrabrief right unilateral treatment against 35% for ultrabrief bilateral, with the mildest cognitive burden in the first arm — an outcome that delivered charge alone does not predict [260].

Each drive class therefore has its own parameter set, its own units, and its own list of things that are not standardised. The same structure recurs: a device-side specification, an in-tissue exposure that has to be modelled or measured, and a summary number that everyone wants and no one has agreed on.

## L1 — Intuition

Think about watering a plant. If you tell a friend you gave it "a litre", you have said almost nothing useful. A litre poured in one go runs off the surface; the same litre delivered as a slow drip over an hour soaks in. Sprayed on the leaves it does something different again from poured at the roots. And what the plant actually experiences is not the litre you poured but the water that reaches the roots, which depends on the soil.

Stimulation dose works the same way. "2 milliamps" is the litre. It says nothing about where the electrodes were, whether the current was steady or pulsed, how long each pulse lasted, how many pulses came per second, how long the session ran, or how many sessions there were. Two studies can both report 2 mA and deliver almost nothing in common.

So a dose in this field is a list, not a number, and every item on the list carries a unit. There is a second gap on top of that. Even with the whole list, what the neurons experience depends on the body in the way that soaking depends on the soil: skull thickness, tissue conductivity, skin pigmentation, how much a drug crosses into the brain. The operator controls the pouring. The tissue decides the soaking. Good reporting keeps those two things visibly apart, and this volume gives them different names: dose for what was set, exposure for what arrived.

## L2 — Undergraduate

A *dose parameter set* is the complete device-side specification of a drive, each entry with its unit. For transcranial electric and magnetic stimulation the entries are the electrode montage or coil type and position, the waveform, the pulse parameters (amplitude, width, shape), and the timing of pulses, trains and sessions [9]. For low-intensity transcranial ultrasound the ITRUSST reporting consensus asks for six domains: the transducer and drive system, the drive settings, the free-field acoustic parameters, the pulse timing, in situ estimates of brain exposure, and the intensity parameters [20]. For photobiomodulation the reported quantities are wavelength (nm), irradiance (mW/cm²) and fluence (J/cm²) [21]. For drugs they are the administered amount (mg or mg/kg), the route, and the schedule [163,180,181].

Alongside the parameter set sits the *exposure*: the quantity estimated or measured in tissue. For tES that is the electric field in V/m (equivalently mV/mm); for ultrasound the in situ pressure in MPa and intensity in W/cm²; for drugs the plasma or brain extracellular-fluid concentration, summarised as AUC and Cmax [25,164]. The three-pillars framework in drug development makes the same split explicit: exposure at the target site, target binding, and pharmacological activity must each be shown [24].

Worked example — charge accounting for an implanted electrode. A stimulator delivers a charge-balanced biphasic pulse at 3 mA with 200 µs per phase, at 50 Hz, through an electrode of geometric surface area 0.06 cm².

- Charge per phase: $Q = I\,t = 3\times10^{-3}\,\mathrm{A} \times 200\times10^{-6}\,\mathrm{s} = 6\times10^{-7}\,\mathrm{C} = 0.6\ \mu\mathrm{C/phase}$.
- Charge density: $Q/A = 0.6\ \mu\mathrm{C} / 0.06\ \mathrm{cm^2} = 10\ \mu\mathrm{C/cm^2}$ per phase.
- Duty cycle: $200\ \mu\mathrm{s} \times 2\ \mathrm{phases} \times 50\ \mathrm{s^{-1}} = 0.02$, i.e. 2% of the time.

Those three numbers come from the same two settings, and the safety literature uses the first two together: McCreery and colleagues pulsed platinum electrodes on cat cortex for 7 h and found injury depended on charge density and charge per phase jointly, across roughly 10–800 µC/cm² and 0.05–5 µC/phase, with neither variable alone predicting damage [16]. Shannon then fitted a log-linear boundary between the two, the rule now used in device design [17]. Note what the calculation does *not* give you: the field at any neuron, or how much of the charge went into Faradaic reactions at the interface [63].

## L3 — Graduate

Dose quantities are related by definitions, and carrying the units through shows which relations are identities and which are physical claims.

**Charge and the Shannon boundary.** For a rectangular cathodic phase of amplitude $I$ and width $t_p$,

$$Q = I\,t_{p}, \qquad D = \frac{Q}{A},$$

- $Q$ — charge per phase, C (reported in µC);
- $I$ — current amplitude, A;
- $t_p$ — phase width, s;
- $A$ — geometric surface area of the electrode, cm²;
- $D$ — charge density per phase, C/cm² (reported in µC/cm²).

Shannon's model draws the safe/damaging boundary as a straight line in log–log coordinates [17]:

$$\log_{10} D = k - \log_{10} Q,$$

- $k$ — a fitted dimensionless constant (values around 1.5–2 in the original fit);
- $D$, $Q$ — as above, in µC/cm² per phase and µC per phase.

The form is an identity in disguise: since $D = Q/A$, the line is equivalent to $Q^{2}/A = 10^{k}$, i.e. a constant of dimension C²/cm². That is why the rule carries no frequency, duty cycle or pulse-shape term — a point its critics press [18].

**Thermal dose.** Sapareto and Dewey's conversion of any time–temperature history to an equivalent time at 43 °C is

$$\mathrm{CEM43} = \sum_i t_i \, R^{\,(43 - T_i)},$$

- $t_i$ — time spent at temperature $T_i$, min;
- $T_i$ — temperature, °C;
- $R$ — dimensionless rate constant taking different values above and below a break temperature near 43 °C;
- CEM43 — cumulative equivalent minutes at 43 °C, min [85].

The exponent is dimensionless only because $43 - T_i$ is a temperature *difference* in °C; the formula is a fitted Arrhenius-style reduction, presented by its authors as a practical standard rather than the only possible one [85].

**Acoustic mechanical index.** The mechanical index is defined as a ratio of quantities in fixed units rather than as a dimensionless physical group:

$$\mathrm{MI} = \frac{p_{r}\,[\mathrm{MPa}]}{\sqrt{f\,[\mathrm{MHz}]}},$$

- $p_r$ — peak rarefactional (derated) pressure in MPa;
- $f$ — centre frequency in MHz.

At $p_r = 0.5$ MPa and $f = 0.5$ MHz, MI $= 0.5/\sqrt{0.5} = 0.71$. The ITRUSST safety consensus classes transcranial ultrasound as non-significant risk at MI (or transcranial MItc) of 1.9 or lower, while stating explicitly that its values are expert consensus opinion and not safety limits, and that more data are needed to locate the threshold for significant risk [19].

**Optical dose.** Fluence is the time integral of irradiance,

$$H = \int_0^{T} E(t)\,dt = E\,T \ \text{(constant irradiance)},$$

- $H$ — fluence, J/cm²;
- $E$ — irradiance, W/cm²;
- $T$ — exposure time, s.

100 mW/cm² for 100 s gives 10 J/cm², which is also 100 mJ/mm² since 1 J/cm² = 10 mJ/mm². The pair $(E, T)$ is not recoverable from $H$, which is why the biphasic-dose claim — low fluence stimulating more than high — is under-specified when only fluence is reported [21].

**Pharmacological exposure.** Administered amount $\to$ exposure is a pharmacokinetic transformation, not a unit conversion: $\mathrm{AUC} = \int_0^{\infty} C(t)\,dt$ in mg·h/L, with $C_{\max}$ in mg/L, and the receptor-relevant quantity is the brain extracellular-fluid concentration, usually estimated with physiologically based models rather than measured [25,164]. Receptor occupancy from PET is the closest thing to a mechanism-level metric: haloperidol 1.0 or 2.5 mg/day gave D2 occupancies of 38–87% across 22 patients, with response, extrapyramidal symptoms and hyperprolactinaemia becoming likely above about 65%, 72% and 78% respectively [26].

## L4 — Expert

Three things are genuinely unsettled, and all three are about the step from a parameter set to a single number.

First, the scope of the charge-safety rule. Shannon (1992) fitted one boundary to earlier tissue-damage data, most influentially McCreery et al. (1990), whose dataset was cat cortex, platinum surface electrodes of 0.002–0.5 cm², and 400 µs/phase pulse pairs at 50 Hz [16,17]. Cogan, Ludwig, Welle and Takmakov (2016) argue that the rule omits frequency, duty cycle, current density and electrode size, and that microelectrodes deliver higher charge densities without damage; they call for revised thresholds [18]. One position treats the boundary as a general limit; the other as an empirical fit of narrow scope. Damage data varying frequency, duty cycle and electrode size independently, in the electrode classes now in use, would decide it [18].

Second, the missing E-field metric. Van Hoornweder and colleagues (2023) found 308 distinct E-field outcome measures in 202 tES and TMS studies — 197 volume-based, 111 surface-based — then ran 1,000 models in 100 people and showed the measures give different values, sample different regions and do not always correlate strongly; region-of-interest and percentile-based whole-brain measures overlapped by only about 6% within a person in the preprint version [14]. Their conclusion is that no consensus exists on which feature to extract or how [14]. E-field-based TMS dosing remains a proposal whose proponents list simulation, target definition and cross-region thresholds as open problems, and motor-threshold dosing remains the clinical norm [15].

Third, occupancy as a transferable metric. Reviews give 65–80% D2 occupancy as the antipsychotic window and 70–80% SERT occupancy for antidepressants [27]. A dose–response meta-analysis of 110 studies (37,193 participants) found extrapyramidal risk rising steeply above roughly 75–85% occupancy for antagonists, while partial agonists such as aripiprazole kept that risk low at high occupancy [28]. Occupancy predicts effect only once intrinsic efficacy is specified. Worse, occupancy presumes the administered compound is the acting ligand: Gomez et al. (2017) showed systemically injected clozapine-N-oxide does not enter the brain and has low affinity for DREADDs, being converted in vivo to clozapine, which does [29].

The volume's own reading is that this is a reporting failure with a structural cause. Peterchev, Rosa, Deng, Prudic and Lisanby (2010) made the argument in its sharpest form for ECT, two years before the general tES/TMS definition: amplitude, pulse shape, pulse width, train frequency, directionality, polarity and duration each have distinct neurobiological consequences, so total charge and energy are inadequate summaries, and devices should expose and display every parameter [261]. An expert classification of implantable pain therapies notes, likewise, that published studies often omit the effective dose, preventing replication [2].

## How this volume uses it

Section 3 is built on this page: it takes Peterchev's definition as its reference point, works through electric, magnetic, convulsive, acoustic, optical and pharmacological dose in turn, and ends with a table of what is reported, what is standardised and what is missing per drive class [9,19,20,21,25]. Three schema requirements follow from it — dose stored as a parameter set per drive class with units; nominal and effective stimulus as separate properties, never one field with a flag; and every summary metric naming the rule that produced it [9,14,17,20]. Section 4 uses the exposure side of the split when it asks how much field actually arrives in a human brain [40,50], and section 5 uses it when it separates the wave aimed at cortex from the auditory transient the same device produces [74,77]. Section 12's treatment of confounds and section 13's evidence grading both assume that a dose which cannot be reported cannot be replicated [2].
