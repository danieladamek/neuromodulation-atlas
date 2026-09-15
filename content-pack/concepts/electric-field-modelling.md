---
id: electric-field-modelling
title: Electric field modelling as dosimetry
one_liner: "How finite-element models turn a device setting into an estimated electric field in a particular head, and what that estimate does and does not license."
why_here: "Sections 3 and 4 treat the modelled E-field as the bridge between a device setting and a neuron; this page gives the physics and the numerical set-up that bridge rests on."
prerequisites: [dose-and-parameter-sets]
terms: [e-field, dosimetry, finite-element-head-model, simnibs, tissue-conductivity, current-shunting, e-field-outcome-measure, volts-per-metre, millivolts-per-millimetre, motor-threshold, depth-focality-tradeoff, current-density]
figures: []
further_reading:
  - { title: "SimNIBS documentation (head-model creation, TMS/TES simulation, optimisation)", url: "https://simnibs.github.io/simnibs/build/html/index.html", kind: textbook }
  - { title: "Van Hoornweder et al. (2023), Outcome measures for electric field modeling in tES and TMS: a systematic review", url: "https://doi.org/10.1016/j.neuroimage.2023.120379", kind: review }
  - { title: "Malmivuo & Plonsey, Bioelectromagnetism (full text online)", url: "https://www.bem.fi/book/", kind: textbook }
self_check:
  - q: "What does the quasi-static approximation assume, as used in tES and TMS field modelling?"
    options:
      - "That the tissue is a perfect insulator"
      - "That propagation delay, capacitive tissue effects and induction from the tissue's own currents are negligible at the frequencies involved, so the field can be solved one instant at a time"
      - "That the electric field is uniform across the head"
      - "That conductivity is the same in every tissue"
    answer: 1
    explanation: "At kHz frequencies and head-sized geometries the wavelength is enormous and permittivity effects are small relative to conduction, so Maxwell's equations reduce to a static conduction problem scaled by the instantaneous source strength."
  - q: "Intracranial measurements in 10 epilepsy patients found what cortical field at 2 mA of scalp stimulation?"
    options:
      - "About 0.08 V/m"
      - "About 0.8 V/m"
      - "About 8 V/m"
      - "About 80 V/m"
    answer: 1
    explanation: "Huang and colleagues measured roughly 0.8 V/m (0.8 mV/mm), lower than commonly assumed; individual finite-element models correlated with the measurements at r = 0.86 for cortical and r = 0.88 for depth electrodes."
  - q: "A graph stores 'E-field at target = 0.45 V/m'. Why is this insufficient?"
    options:
      - "V/m is the wrong unit for electric field"
      - "Because it does not name the outcome measure, the pipeline or the segmentation, and 308 different E-field outcome measures are in use that give different values"
      - "Because E-field cannot be modelled below 1 V/m"
      - "Because only TMS fields can be modelled, not tES"
    answer: 1
    explanation: "The same simulation supports mean, peak, percentile and ROI-based measures on volumes or surfaces; without the metric and pipeline the number cannot be compared with any other."
  - q: "Why do animal stimulation doses not transfer directly to humans?"
    options:
      - "Animal tissue has no conductivity"
      - "Because head size and geometry make the field per unit current differ by up to about 100-fold across mouse, monkey and human models"
      - "Because animals are always stimulated with magnetic rather than electric fields"
      - "Because the quasi-static approximation fails in rodents"
    answer: 1
    explanation: "Comparative finite-element modelling of mouse, monkey and human heads predicted tES fields differing by up to roughly 100-fold, so doses transfer only if the fields are matched."
---

## What it is

One device setting produces different fields in different heads, because the field depends on the geometry and conductivity of the tissue between the source and the target. Electric field modelling is the practice of estimating that field person by person, from an anatomical MRI, by solving a boundary-value problem numerically. It is dosimetry in the same sense as radiation dosimetry: a calculation that converts an operator-side setting into an estimate of the physical quantity at the tissue.

The pipeline has three stages. First, segmentation: the MRI is divided into tissue classes — white matter, grey matter, cerebrospinal fluid, skull, scalp, and in more recent tools many more. The CHARM method used in SimNIBS separates 15 head tissues, and its authors showed that uncorrected imaging artefacts produced local E-field differences above 30%, with the extra classes improving estimates over five-tissue models [12]. Second, a volume mesh is built and each element is assigned a conductivity in S/m. Third, the field is computed with a finite-element solver for the given electrode montage or coil position and orientation.

SimNIBS was introduced with a statement of the three barriers to routine use: uncertainty in the models, the missing link between the calculated field and physiology, and usability [10]. A later implementation was validated against analytical solutions and found that accurate tissue geometry and a sufficiently accurate numerical method mattered most for reliable results [11]. ROAST, an independent open-source pipeline for transcranial electric stimulation, was compared with other software and with human intracranial recordings, with small reported differences [13].

The output is a field, not a dose and not an effect. What it buys is comparability: with a model you can say that a given montage produces a stronger field at one target than another in *this* head, and you can ask whether animal and human protocols are field-matched, which comparative modelling shows they usually are not [212].

## L1 — Intuition

Electric current takes the easiest path, and a head is not a uniform lump. Skin conducts reasonably well, bone poorly, cerebrospinal fluid very well, brain somewhere in between. So when you put two electrodes on a scalp and push a small current between them, most of it never reaches the brain at all: roughly three quarters is shunted through the scalp and skull, spreading sideways instead of going in.

That makes the brain field hard to guess. Two people given identical settings can end up with fields that differ substantially, because their skulls differ in thickness, their fluid layers differ in depth, and the target sits at a different angle to the current flow. A model is a way of doing the bookkeeping. You take the person's MRI, label which tissue is where, give each tissue a conductivity, and let a computer solve for where the current goes. The answer is a map of field strength and direction over the brain.

Two cautions come with the map. It is only as good as the labelling — a mis-segmented skull or an imaging artefact changes the answer by tens of per cent. And a map is not a number. To report "the field at the target" you must decide whether you mean the peak, the average over a region, the 99th percentile, or something else, and different choices give genuinely different answers about genuinely different pieces of brain.

## L2 — Undergraduate

The governing physics is volume conduction. Inside tissue, current density $\mathbf{J}$ (A/m²) is related to the electric field $\mathbf{E}$ (V/m) by Ohm's law in its local form, $\mathbf{J} = \sigma \mathbf{E}$, with $\sigma$ the conductivity in S/m. For transcranial electric stimulation the field derives from a scalar potential, $\mathbf{E} = -\nabla \phi$, and charge conservation with no sources inside the tissue gives Laplace's equation in inhomogeneous form, $\nabla\cdot(\sigma\nabla\phi) = 0$. Current enters through electrode patches and the rest of the outer surface is insulating.

For TMS there is no injected current. A capacitor discharge through the coil produces a time-varying magnetic vector potential, whose rate of change induces a field in the tissue; the induced field then redistributes charge at conductivity boundaries, which adds a second, potential-driven term.

Both problems are solved with the finite-element method: the head is divided into tetrahedra, the potential is approximated by simple functions on each element, and the differential equation becomes a large sparse linear system that is solved for the nodal potentials. The field follows by differentiating, so field accuracy is more sensitive to mesh quality than potential accuracy is [11].

Units are worth fixing. 1 V/m = 1 mV/mm, so the physiology literature's "mV/mm" and the modelling literature's "V/m" are the same number. Conductivities are in S/m (grey matter of order 0.2–0.4 S/m, skull an order of magnitude lower, CSF an order higher).

Worked example — reading a validation study. In 10 epilepsy patients with implanted electrodes, 2 mA delivered at the scalp produced measured cortical fields of about 0.8 V/m [40]. Take that as a calibration constant: roughly 0.4 V/m per mA at cortex for that montage class. Then 1 mA gives ≈ 0.4 V/m, and 4 mA — the upper end supported by pooled safety data over more than 300,000 sessions [43] — gives ≈ 1.6 V/m, assuming linearity, which the quasi-static formulation guarantees for a fixed montage. Compare this with the measured somatic coupling constant of about 0.12 mV per mV/mm in rat CA1 [36]: 0.8 V/m predicts around 0.1 mV of somatic polarisation. The same models correlated with the measurements at r = 0.86 (cortical) and r = 0.88 (depth), and calibrating tissue conductivities improved accuracy, while adding white-matter anisotropy or a multi-layer skull did not [40].

## L3 — Graduate

**Why the problem is quasi-static.** Start from Maxwell's equations in tissue. Three approximations are made in sequence, each with a validity condition at the frequencies used (DC to a few kHz for tES, and effective spectral content up to tens of kHz for a TMS pulse):

1. *Propagation is ignored.* The wavelength at 10 kHz in tissue is many kilometres, vastly larger than the ~0.2 m head, so retardation is negligible.
2. *Capacitive effects are ignored.* The ratio of displacement to conduction current is $\omega\varepsilon/\sigma$. With $\sigma \approx 0.3$ S/m, relative permittivity $\varepsilon_r \approx 10^{5}$ at low frequency ($\varepsilon = \varepsilon_r\varepsilon_0 \approx 9\times10^{-7}$ F/m) and $\omega = 2\pi\times 10^{4}$ s⁻¹, the ratio is of order $10^{-1}$ or smaller, and far smaller at tES frequencies.
3. *Induction from the tissue's own currents is ignored*, so the ohmic field is curl-free and expressible as $-\nabla\phi$.

What survives is a static conduction problem whose solution scales instantaneously with the source amplitude:

$$\nabla\cdot(\sigma(\mathbf{r})\,\nabla\phi(\mathbf{r})) = 0,$$

- $\sigma(\mathbf{r})$ — local conductivity tensor or scalar, S/m;
- $\phi(\mathbf{r})$ — electric potential, V;
- $\mathbf{r}$ — position, m.

with boundary conditions $-\sigma\nabla\phi\cdot\mathbf{n} = J_n$ on electrode surfaces (injected normal current density, A/m²) and $-\sigma\nabla\phi\cdot\mathbf{n} = 0$ on the remaining outer surface. Because the operator is linear, doubling the injected current doubles $\mathbf{E}$ everywhere: the *pattern* is a property of the head and montage, and the amplitude is the dose knob.

**TMS.** With the coil current $I(t)$ and its vector potential $\mathbf{A}$,

$$\mathbf{E} = -\frac{\partial \mathbf{A}}{\partial t} - \nabla\phi, \qquad \nabla\cdot\left(\sigma\left(\frac{\partial\mathbf{A}}{\partial t} + \nabla\phi\right)\right) = 0,$$

- $\mathbf{A}$ — magnetic vector potential from the coil windings, V·s/m (computed in free space, since tissue permeability is that of vacuum);
- $\partial\mathbf{A}/\partial t$ — the primary induced field, V/m, proportional to $dI/dt$;
- $\nabla\phi$ — the secondary field from charge accumulated at conductivity boundaries, V/m.

The second equation is the same elliptic problem as before with a source term set by the primary field. Hence the standard result that TMS field magnitude scales with $dI/dt$ (order 10⁸ A/s) and that geometry, not tissue detail, dominates: the field is largest in superficial gyral cortex and falls with depth.

**Finite-element set-up.** Multiply the equation by a test function $v$, integrate over the domain $\Omega$ and apply the divergence theorem:

$$\int_\Omega \sigma\,\nabla\phi\cdot\nabla v \, d\Omega = \int_{\partial\Omega} J_n\, v \, dS.$$

Expanding $\phi \approx \sum_j \phi_j N_j(\mathbf{r})$ in nodal basis functions $N_j$ (piecewise linear on tetrahedra) gives $\mathbf{K}\boldsymbol{\phi} = \mathbf{b}$ with stiffness matrix $K_{ij} = \int_\Omega \sigma\nabla N_i\cdot\nabla N_j\,d\Omega$. Solving for $\boldsymbol{\phi}$ (V) and differentiating the basis expansion gives $\mathbf{E}$ (V/m), one order less accurate than $\phi$ — which is why Saturnino, Madsen and Thielscher found geometric accuracy and numerical scheme to be the dominant error sources [11].

**Error budget with numbers.** Segmentation quality: uncorrected artefacts changed local fields by more than 30%, and 15-tissue segmentation improved on 5-tissue models [12]. Conductivity: calibrating tissue conductivities against intracranial recordings improved accuracy, whereas white-matter anisotropy and multi-layer skull did not [40]. Shunting: about 75% of scalp-applied current never reaches the brain [50]. Coil geometry imposes a hard limit rather than an error — simulations of 50 TMS coils in a spherical head found a depth–focality tradeoff in every one, with tangential spreads from about 5 cm² (figure-of-eight types) to 34 cm² (circular types) over half-value depths of 0.9–3.5 cm [56]. And scale matters: modelled tES fields in mouse, monkey and human heads differ by up to about 100-fold, so cross-species dose transfer requires field matching [212].

## L4 — Expert

The physics of the forward problem is not what is contested; the inference from its output is.

The sharpest gap is the missing outcome measure. Van Hoornweder and colleagues (2023) catalogued 308 E-field outcome measures across 202 tES and TMS studies (197 volume-based, 111 surface-based), then ran 1,000 simulations in 100 individuals across ten montages and coils and showed the measures return different values, sample different regions and do not always correlate strongly; in the preprint, ROI measures and percentile-based whole-brain measures overlapped by only about 6% within a person [14]. Their own conclusion is that no consensus exists on which feature to extract or how [14]. This is not a detail of reporting: it means that "the field at the target" is not yet a well-defined quantity, and that meta-analyses regressing outcomes on modelled field are regressing on a variable whose definition varies with the source.

The second open question is validation. The measured anchor is thin: 10 epilepsy patients with intracranial electrodes [40], plus direct recordings in nonhuman primates and epilepsy patients placing peak tES fields at about 0.5 mV/mm in superficial cortex with little change across frequency or region [211]. Model–measurement correlations of r ≈ 0.86–0.88 are good for a spatial pattern and weak for an absolute value at a point, and conductivity calibration — which improved accuracy in the same study — is a free parameter that absorbs model error [40]. Thielscher, Antunes and Saturnino named linking the calculated field to physiology as a barrier in 2015, and it remains one [10].

The third is what dosing should be anchored to. Numssen, Kuhnke, Weise and Hartwigsen (2024) propose calibrating TMS intensity to the modelled cortical E-field rather than to the motor threshold, and list simulation quality, target definition and cross-region thresholds as unresolved; motor-threshold dosing remains the clinical norm [15]. The volume's position is that the two are different nodes — a device-side dose and an in-tissue exposure — so replacing one with the other changes what is reported, not what is delivered [9,15].

What would settle the open items is specified by the same literature: simultaneous intracranial field measurement and individualised modelling in the same participants at conventional intensities, across montages, with one pre-registered outcome measure; and cross-species studies that match modelled fields rather than currents [14,40,212]. Until then a modelled value must travel with its pipeline, its segmentation and its metric, or it is not a measurement of anything [11,12,14].

## How this volume uses it

Section 3.2 treats E-field modelling as the dosimetry step between a device-side dose and an in-tissue exposure, and uses the 308-metric result to argue that a graph storing "E-field at target = x V/m" without naming the metric and pipeline stores an incomparable value [9,11,12,14]. Section 4.3 uses the delivered-field numbers — 0.8 V/m measured intracranially at 2 mA, 75% shunting, 0.1–1 V/m available at tolerable scalp currents — as the numerator against which measured coupling constants are judged, and so as one side of the entrainment dispute [40,48,50]. Section 4.6 uses modelled thresholds for temporal interference in the same way [48]. Section 10's modality map and the schema requirements in sections 3.8 and 4.7 both require that a modelled field carry its provenance: measured, simulated, and in which species [40,48,56,212].
