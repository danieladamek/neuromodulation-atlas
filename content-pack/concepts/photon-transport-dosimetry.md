---
id: photon-transport-dosimetry
title: Photon transport and optical dose
one_liner: "How light is attenuated by absorption and scattering in tissue, and why the dose that reaches cortex is the contested quantity in photobiomodulation."
why_here: "Sections 3 and 5 treat transcranial photobiomodulation as the volume's cleanest case of a cell-level mechanism failing to establish a delivered dose at the target; this page gives the transport physics that dispute turns on."
prerequisites: [dose-and-parameter-sets]
terms: [photobiomodulation, fluence, irradiance, transmittance, monte-carlo-photon-transport, melanin, cytochrome-c-oxidase, action-spectrum, mj-per-mm2, optogenetics, channelrhodopsin-2]
figures: []
further_reading:
  - { title: "Jacques & Prahl, Optical properties of tissue (ECE 532 course notes, Oregon Medical Laser Center)", url: "https://omlc.org/classroom/ece532/class3/index.html", kind: textbook }
  - { title: "Huang, Chen, Carroll & Hamblin (2009), Biphasic dose response in low level light therapy", url: "https://journals.sagepub.com/doi/10.2203/dose-response.09-027.Hamblin", kind: review }
  - { title: "Monte Carlo eXtreme (MCX) documentation: GPU Monte Carlo photon transport in turbid media", url: "https://mcx.space/wiki/", kind: textbook }
self_check:
  - q: "A device delivers 100 mW/cm2 to the scalp for 100 s. What fluence has been delivered at the scalp?"
    options:
      - "1 J/cm2"
      - "10 J/cm2"
      - "100 J/cm2"
      - "1000 J/cm2"
    answer: 1
    explanation: "Fluence is irradiance integrated over time: 0.1 W/cm2 x 100 s = 10 J/cm2, equivalently 100 mJ/mm2. Fluence alone does not recover the irradiance and time that produced it, which is why the biphasic-dose claim is under-specified when only fluence is reported."
  - q: "In the red and near-infrared window, why is simple Beer-Lambert attenuation the wrong model for brain tissue?"
    options:
      - "Because absorption is zero at those wavelengths"
      - "Because scattering dominates absorption by one to two orders of magnitude, so photons travel diffusively rather than ballistically"
      - "Because tissue is optically homogeneous"
      - "Because photons change wavelength as they travel"
    answer: 1
    explanation: "Reduced scattering coefficients of order 10 per cm against absorption of a few tenths per cm mean most photons are scattered many times; attenuation of diffuse fluence is governed by an effective coefficient combining both, not by absorption alone."
  - q: "A measured skull transmittance and a modelled cortical energy fraction disagree by more than an order of magnitude. What does the volume conclude?"
    options:
      - "The measurement is wrong"
      - "The model is wrong"
      - "The two figures are not directly comparable: one is a measured transmittance, the other a modelled fraction of deposited energy; paired measurement and modelling in the same specimens and devices would settle it"
      - "Both show that cortex receives more than 10% of incident light"
    answer: 2
    explanation: "Tittelmeier and colleagues measured more than 99% of light absorbed or scattered, with maximum transmittance 0.31% for a 905 nm laser and 0.71% for an 810 nm LED helmet; a Monte Carlo preprint estimated up to about 15% of incident energy reaching cortex. The volume treats them as different quantities rather than a settled contradiction."
  - q: "What identifies cytochrome c oxidase as the photoacceptor in photobiomodulation?"
    options:
      - "Direct imaging of the enzyme in human cortex"
      - "An action spectrum tracking the absorption of oxidised cytochrome c oxidase"
      - "Knockout in patients"
      - "PET occupancy measurement"
    answer: 1
    explanation: "Wong-Riley and colleagues found that across 670, 728, 770, 830 and 880 nm the efficacy of light in restoring cyanide-blocked activity tracked the absorption spectrum of oxidised cytochrome c oxidase, with 830 and 670 nm effective and 728 nm not. The evidence is in vitro."
---

## What it is

Optical neuromodulation covers two very different situations. In optogenetics the light is a trigger for an installed actuator, and the only question about the light is whether enough of it arrives at cells that express the actuator [90]. In photobiomodulation (PBM) the light acts on an endogenous absorber, and the reported dose is wavelength (nm), irradiance (mW/cm2) and fluence (J/cm2) [21]. Both depend on the same physics: how photons travel through tissue.

Tissue is not transparent, and it is not simply opaque either. In the red and near-infrared, absorption is comparatively weak — this is the "optical window" between haemoglobin absorption at shorter wavelengths and water absorption at longer ones — while scattering is strong. So light entering a head does not travel in a beam; it spreads, randomises direction within a millimetre or so, and decays. Photon transport dosimetry is the calculation of how much optical energy reaches a given depth, and it is done either with the diffusion approximation or with Monte Carlo simulation of individual photon paths.

For PBM the endogenous absorber has been identified, in vitro, as an enzyme. Competing 670 nm light against potassium cyanide in primary neuron cultures, Wong-Riley and colleagues found light partially restored cytochrome c oxidase activity blocked by 10-100 micromolar cyanide and cut cell death from 83.6% to 43.5% at 300 micromolar, with protection failing at millimolar concentrations; the identification rests on an action spectrum across 670, 728, 770, 830 and 880 nm that tracked the absorption spectrum of oxidised cytochrome c oxidase [88]. The step from absorption to signalling is attributed to nitric oxide, again in vitro [89].

The contested part is not the mechanism but the delivery. Tittelmeier and colleagues measured transmission of near-infrared light from commercial transcranial devices through human skull and found more than 99% absorbed or scattered, with maximum transmittance 0.31% for a 905 nm laser and 0.71% for an 810 nm LED helmet; in their cell experiments mitochondrial stimulation appeared only at intensities 14-775 times above the maximum transmitted level, and they conclude that any clinical benefit must be indirect or placebo [22]. Monte Carlo simulations at 810 and 1064 nm instead estimated that up to about 15% of incident energy reaches cortex transcranially and about 1% intranasally, scaling linearly with power density and falling substantially with higher skin melanin; that study is a preprint with a co-author affiliated to a device company [23].

## L1 — Intuition

Hold a torch against your palm in a dark room and your hand glows red. That glow is the whole story of tissue optics in one image. Red and near-infrared light does get into flesh — several millimetres, even a centimetre or two — but it does not go in straight. It bounces off every cell boundary it meets, thousands of times, so the light that emerges is a diffuse red haze with no memory of the torch's shape.

Two things eat the light on the way. Absorption converts photons into heat or chemistry, and in the red window there is comparatively little of it. Scattering does not destroy photons but sends them wandering, which lengthens their path and gives absorption more chances to catch them. Together they mean light strength falls off sharply with depth, roughly halving every few millimetres in brain-like tissue.

Now put a skull in the way. Skin, fat, bone and the fluid around the brain each scatter and absorb, and skin pigmentation adds absorption at the surface. The practical question for shining light at a brain from outside is not whether photons reach cortex — a few always will — but whether enough reach it to do whatever the mechanism requires. That is a numbers question, and it is where the field disagrees: one group measured less than 1% of the light getting through a skull, another modelled up to around 15% of energy reaching cortex. They are measuring different things, which is part of why the dispute is unresolved.


## L2 — Undergraduate

Four radiometric quantities recur, and their units must be kept straight. Radiant power is in W. Irradiance is power per unit area at a surface, in W/cm2 (PBM devices usually report mW/cm2). Fluence rate, or fluence per unit time inside scattering tissue, is also W/cm2 but counts photons arriving from all directions, so inside a scattering medium it can exceed the incident irradiance near the surface. Fluence is irradiance integrated over time, in J/cm2, and 1 J/cm2 = 10 mJ/mm2.

Attenuation is described by three coefficients, all in units of inverse length (per cm): the absorption coefficient, the scattering coefficient, and the reduced scattering coefficient, which folds in the anisotropy of individual scattering events. In the red and near-infrared, reduced scattering in brain and skull is of order 10 per cm while absorption is of order 0.1-0.5 per cm, so scattering dominates by one to two orders of magnitude.

That ordering is why the naive Beer-Lambert law, exponential decay set by absorption alone, is the wrong tool. A collimated beam is randomised within about a millimetre; beyond that the sensible quantity is the diffuse fluence rate, whose decay is governed by an effective attenuation coefficient built from both absorption and reduced scattering. The practical consequence is that penetration depends on scattering as much as on the absorption spectrum, and that the depth at which fluence has fallen to 1/e is a few millimetres rather than centimetres.

Worked example — from a device setting to a cortical fluence. Take an 810 nm LED helmet delivering 100 mW/cm2 at the scalp for 100 s, so the incident fluence is 10 J/cm2 (100 mJ/mm2). Suppose the measured transmittance through scalp and skull is 0.71%, the maximum Tittelmeier and colleagues found for such a device [22]. Then the fluence arriving at cortex is 0.0071 x 10 J/cm2 = 0.071 J/cm2, i.e. 0.71 mJ/mm2. To deliver 1 J/cm2 at cortex through that transmittance would require 140 J/cm2 at the scalp, which at 100 mW/cm2 means 23 minutes of continuous exposure — and raises a thermal limit at the skin rather than an optical one. The same arithmetic run with a modelled 15% cortical energy fraction gives 1.5 J/cm2 for the same session [23], and the two answers differ by a factor of about 20.

## L3 — Graduate

**Beer-Lambert and its domain.** For a collimated beam in a purely absorbing medium, the irradiance of the unscattered (ballistic) component obeys

$$E(z) = E_0 \exp(-\mu_t z), \qquad \mu_t = \mu_a + \mu_s,$$

- $E(z)$ — irradiance at depth $z$, W/cm2;
- $E_0$ — incident irradiance, W/cm2;
- $\mu_a$ — absorption coefficient, cm$^{-1}$;
- $\mu_s$ — scattering coefficient, cm$^{-1}$;
- $\mu_t$ — total attenuation (extinction) coefficient, cm$^{-1}$;
- $z$ — depth, cm.

In tissue at 810 nm, $\mu_s$ is of order 100 cm$^{-1}$, so the ballistic component is gone within about a millimetre. Beer-Lambert with $\mu_t$ therefore describes what a collimated detector sees, not the energy present in the tissue: scattered photons are removed from the beam but not from the medium. This is the single most common error in reading PBM dosimetry.

**Anisotropy and the diffusion approximation.** Scattering in tissue is strongly forward-directed, with anisotropy factor $g$ (the mean cosine of the scattering angle) of about 0.9. Many small forward steps are equivalent to fewer isotropic ones, which defines the reduced scattering coefficient $\mu_s' = \mu_s(1-g)$, of order 10 cm$^{-1}$ at 810 nm. When $\mu_s' \gg \mu_a$, the radiative transport equation reduces to a diffusion equation for the fluence rate, and for an isotropic point source of power $P$ in an infinite medium

$$\Phi(r) = \frac{P \exp(-\mu_{\mathrm{eff}} r)}{4\pi D r}, \qquad \mu_{\mathrm{eff}} = \sqrt{3\mu_a(\mu_a + \mu_s')}, \qquad D = \frac{1}{3(\mu_a + \mu_s')},$$

- $\Phi(r)$ — fluence rate at distance $r$ from the source, W/cm2;
- $P$ — source power, W;
- $D$ — diffusion coefficient, cm;
- $\mu_{\mathrm{eff}}$ — effective attenuation coefficient, cm$^{-1}$;
- $r$ — distance from source, cm.

The optical penetration depth is $\delta = 1/\mu_{\mathrm{eff}}$ (cm). With representative near-infrared values $\mu_a = 0.2$ cm$^{-1}$ and $\mu_s' = 12$ cm$^{-1}$, $\mu_{\mathrm{eff}} = \sqrt{3(0.2)(12.2)} = 2.7$ cm$^{-1}$, so $\delta = 0.37$ cm. Attenuating diffuse fluence across 1.5 cm of scalp, skull and cerebrospinal fluid gives $\exp(-2.7 \times 1.5) = \exp(-4.1) \approx 1.7\%$, which is the right order of magnitude for a sub-percent measured transmittance once geometric and reflection losses are included [22].

**Why Monte Carlo is used instead.** The diffusion approximation fails where it is needed most: within a few transport mean free paths of the surface, at boundaries between layers of very different optical properties, and in thin low-scattering layers such as cerebrospinal fluid. Monte Carlo transport avoids the approximation by launching photon packets, sampling step lengths from $\exp(-\mu_t s)$, sampling deflection angles from a phase function parameterised by $g$, and depositing a weight fraction $\mu_a/\mu_t$ at each interaction until the packet is terminated. The output is a three-dimensional map of absorbed energy density (J/cm3) or fluence (J/cm2), from which a "fraction of incident energy deposited in cortex" can be computed [23]. That quantity is not a transmittance: transmittance is a ratio of powers across a specimen, while deposited energy fraction is a volume integral over a region, so the two need not agree even when both are correct [22,23].

**Pigment as a covariate.** Epidermal melanin adds a thin, strongly absorbing surface layer. In the simulation study, deposited cortical energy fell substantially with higher skin melanin, a covariate with no counterpart in the electrical reporting standards [9,23].

## L4 — Expert

The optical case is this volume's cleanest example of a mechanism established at the cell failing to establish a coupling event at the target [22,88].

The mechanism side is in reasonable shape for an in vitro claim. Wong-Riley and colleagues (2005) identified cytochrome c oxidase as the photoacceptor by action spectrum, with 830 and 670 nm effective and 728 nm not, and showed functional rescue of cyanide-blocked activity with reduced cell death [88]. Karu, Pyatibrat and Afanasyeva (2005) matched the action spectrum for cell attachment in HeLa cells across 600-860 nm to the same photoacceptor and showed nitric oxide donors shifted it [89]. Both are cell-culture results, and neither establishes a dose at a human cortical target [88,89].

The delivery side is a direct disagreement. Tittelmeier and colleagues (2025) measured more than 99% of light from commercial devices absorbed or scattered by human skull, with maximum transmittance 0.31% (905 nm laser) and 0.71% (810 nm LED helmet), and found mitochondrial stimulation in their own cell experiments only at 14-775 times the maximum transmitted intensity, concluding that benefit must be indirect or placebo [22]. Van Lankveld and colleagues (preprint) modelled up to about 15% of incident energy reaching cortex at 810 and 1064 nm, about 1% intranasally, with linear scaling in power density and a substantial melanin effect; one co-author is affiliated with a PBM device company [23].

The volume declines to adjudicate, on the ground that the two numbers are not the same quantity: a measured transmittance through a specimen against a modelled fraction of deposited energy in a region [22,23]. Paired measurement and modelling in the same specimens, with the same devices, reporting one defined quantity, would settle it [22,23]. Until that exists, a stated optical dose at cortex inherits the ambiguity, and the honest schema entry names the quantity, the wavelength, the device and whether the value was measured or modelled.

Two further fragilities sit alongside. The biphasic dose claim — low fluence stimulating more than high — is argued by proponents from mostly in vitro and peripheral data, and its own authors attribute the field's mixed results partly to the breadth of parameter choice and concede poor mechanistic understanding [21]; since fluence does not determine the irradiance-time pair that produced it, biphasic curves plotted against fluence alone are not identified. And the contrast case is instructive: optogenetics solved the mechanism question by construction, since channelrhodopsin-2 delivered by lentivirus makes millisecond-timescale control follow from light arriving at cells that express it, so a negative result implicates delivery rather than mechanism [90]. Transcranial PBM has the opposite structure — an endogenous absorber with an in vitro action spectrum and an unresolved delivery estimate [22,88,90].

## How this volume uses it

Section 3.6 uses this page for optical dose: the reported quantities are wavelength, irradiance and fluence; the prior question for transcranial PBM is how much light arrives; and the measured-transmittance and modelled-deposition figures are set against each other as a live dispute with a named discriminating experiment [21,22,23]. Its synthesis — that a mechanism demonstrated at the cell does not establish a delivered dose at the target, and that skin pigmentation is a covariate absent from the electrical reporting standards — is the argument this page supplies the physics for [9,21,22,23]. Section 5.5 uses the transducer side: cytochrome c oxidase identified by action spectrum, the nitric oxide step, and the same delivery challenge, described there as the volume's cleanest case of a cell-level mechanism failing to establish a coupling event [22,88,89]. Section 5.6 draws the contrast with installed transducers, where light only has to arrive [90]. The schema requirements in sections 3.8 and 5.9 follow: optical dose stored as wavelength, irradiance and fluence with units; incident and cortical light as separate nominal and effective properties differing by more than two orders of magnitude; and each value carrying whether it was measured or modelled [21,22,23].
