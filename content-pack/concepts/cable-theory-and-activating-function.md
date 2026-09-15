---
id: cable-theory-and-activating-function
title: Cable theory and the activating function
one_liner: "Why an extracellular electrode excites a neuron through the second spatial derivative of the potential along its axis, not through the potential itself."
why_here: "Section 4 opens with the physics of extracellular stimulation and uses the activating function to argue that coupling is geometric; this page derives the result that argument uses."
prerequisites: [electric-field-modelling]
terms: [cable-model, activating-function, node-of-ranvier, myelinated-axon, current-distance-relation, chronaxie, recruitment-order, cathodal-stimulation, anodal-stimulation, conduction-block, sodium-channel-inactivation, morphologically-realistic-model]
figures: []
further_reading:
  - { title: "Gerstner et al., Neuronal Dynamics, Chapter 3: Dendrites and synapses (cable equation and compartmental models)", url: "https://neuronaldynamics.epfl.ch/online/Ch3.html", kind: textbook }
  - { title: "Malmivuo & Plonsey, Bioelectromagnetism, Chapter 3: Subthreshold membrane phenomena (cable theory, strength-duration)", url: "https://www.bem.fi/book/03/03.htm", kind: textbook }
  - { title: "Ranck (1975), Which elements are excited in electrical stimulation of mammalian central nervous system: a review", url: "https://doi.org/10.1016/0006-8993(75)90364-9", kind: review }
self_check:
  - q: "A long straight axon lies in a perfectly uniform extracellular field. What does the activating function predict?"
    options:
      - "Maximal depolarisation at the axon's midpoint"
      - "No driving term along the straight portion, with polarisation concentrated at terminations, bends and points where the gradient changes"
      - "Uniform depolarisation along the whole axon"
      - "Hyperpolarisation everywhere"
    answer: 1
    explanation: "The drive is the second spatial derivative of the extracellular potential along the fibre. A uniform field makes the potential linear in x, so its second derivative vanishes, and only the places where the geometry or the gradient breaks are driven."
  - q: "Chronaxie is best described as:"
    options:
      - "The pulse width at which threshold current is twice the rheobase"
      - "The membrane time constant"
      - "The charge needed for threshold at very long pulse widths"
      - "The distance at which threshold current doubles"
    answer: 0
    explanation: "It is a strength-duration parameter: the pulse width giving twice the infinite-duration threshold. Ranck's review gives about 50-100 microseconds for central myelinated axons, but 200-700 microseconds for some grey-matter stimulation, which he took as leaving open what was being excited."
  - q: "In electrical stimulation of a nerve or tract, recruitment order relative to natural physiological recruitment is:"
    options:
      - "The same: small fibres first"
      - "Reversed: large-diameter myelinated fibres have the lowest thresholds and go first"
      - "Random with respect to diameter"
      - "Determined only by pulse polarity"
    answer: 1
    explanation: "Threshold falls with fibre diameter, so large myelinated fibres are recruited first. A hybrid finite-element and biophysical model of lumbosacral epidural stimulation predicted large myelinated dorsal-root afferents first, with motor pools engaged transsynaptically, and the predictions were confirmed in rats."
  - q: "What is the status of the activating function as a result?"
    options:
      - "A measurement of membrane potential in vivo"
      - "A property of a cable model - theory, not measurement - whose predictions require morphology and active conductances to be checked"
      - "An empirical fit to human epidural recordings"
      - "A regulatory safety limit"
    answer: 1
    explanation: "Rattay derived it from a compartmental cable model; the volume flags it as theoretical, and later morphologically realistic and kilohertz-waveform modelling shows where the linear, one-dimensional version is insufficient."
---

## What it is

An extracellular electrode does not inject current into a neuron. It imposes a potential on the tissue around the cell, and the cell responds to how that potential varies *in space* along its own axis. This is the single most consequential fact about electrical stimulation, and cable theory is the framework that makes it quantitative.

A neurite is modelled as a leaky cable: a conductive core (the cytoplasm) separated from the outside by a membrane with resistance and capacitance. Rattay modelled an axon as a chain of discrete compartments — nodes of Ranvier for myelinated fibres, arbitrary segments for unmyelinated ones — and combined each compartment's time-dependent membrane equation with spatial difference equations for the extracellular potential [33]. Both fibre types turn out to obey the same formal structure, and the term that drives excitation is the second spatial difference of the extracellular potential along the fibre [33]:

$$f \;\propto\; \frac{\partial^{2} V_{e}}{\partial x^{2}}.$$

This quantity is the *activating function*. Where it is positive the membrane depolarises; where it is negative it hyperpolarises; and the pattern predicted for a monopolar electrode generalises to other electrode layouts [33]. The result is theoretical — a property of a cable model, not a measurement [33].

Its consequences are geometric rather than energetic, and they explain most of what is otherwise puzzling about electrical stimulation: why a uniform field acts at terminals and bends rather than along straight lengths, why the biggest axons are excited first, why cathodal and anodal pulses have different thresholds, why pulse width selects among cell types, and why very strong currents block conduction instead of driving it [33,34].

## L1 — Intuition

Imagine a long rope lying on a hillside, and think of the height of the ground as the voltage outside a nerve fibre. If the slope is perfectly even, the rope lies along it without being stretched anywhere in particular: an even slope pulls on every part of the rope the same way, so nothing bunches up. What stretches and bunches the rope is *curvature* — a dip, a ridge, a place where the slope changes.

Nerve fibres behave like that rope. Current does not flow into them because the outside voltage is high; it flows in where the outside voltage is *curved* along the fibre's length. Put an electrode near a nerve and you make a sharp dip in the voltage landscape: near that dip, current enters the fibre on one side and leaves on the other, so one patch depolarises and its neighbours hyperpolarise. Put the fibre in a field that is smooth and even, as transcranial stimulation does, and the only places with curvature are the ends, the bends and the branch points — so that is where the action is.

This one idea explains a lot. Electrode placement matters more than raw power. Orientation matters, because only variation along the fibre counts. Big fat axons are easier to excite than small ones. And if you push too hard, you can lock a fibre up rather than fire it, because the patches that were hyperpolarised become gates that the signal cannot pass.

## L2 — Undergraduate

Take a uniform cylindrical cable with intracellular potential $V_i$ and extracellular potential $V_e$, and define the membrane potential $V_m = V_i - V_e$. Balancing axial current against membrane current gives the cable equation, which in the absence of an applied field is

$$\lambda^{2}\frac{\partial^{2} V_m}{\partial x^{2}} - \tau_m\frac{\partial V_m}{\partial t} - V_m = 0,$$

with the electrotonic length constant $\lambda = \sqrt{d R_m / (4 R_i)}$ (mm) and the membrane time constant $\tau_m = R_m C_m$ (ms). Typical values are $\lambda$ of a few hundred micrometres to about a millimetre and $\tau_m$ of order 10 ms.

Applying an extracellular field adds a source term, and that source term is the activating function. Its sign structure is what matters practically. Near a cathode (negative electrode) the extracellular potential dips, its second derivative is positive at the dip, and the membrane under the electrode depolarises, flanked by hyperpolarised regions — the "virtual anodes". An anodal pulse reverses this, which is why myelinated fibres in Ranck's compiled literature usually required less cathodal than anodal current, and why fibre orientation relative to current flow mattered [34].

Two empirical relations follow. The *current–distance relation* gives threshold current as a function of the distance from electrode to fibre, rising roughly with the square of distance; Ranck compiled these for myelinated fibres and cell bodies near monopolar electrodes and found axons generally had lower thresholds than somata, with equivalent data for other electrode types lacking [34]. The *strength–duration relation* gives threshold current as a function of pulse width, falling towards an asymptote (the rheobase) as the pulse lengthens; its curvature is summarised by chronaxie.

Worked example — selectivity by pulse width. Take the Weiss form $I_{th} = I_{rh}(1 + t_{ch}/t_p)$. For a central myelinated axon with chronaxie $t_{ch} = 75\ \mu$s and rheobase $I_{rh} = 0.5$ mA, a 50 µs pulse needs $0.5 \times (1 + 75/50) = 1.25$ mA, and a 500 µs pulse needs $0.5\times(1+0.15) = 0.58$ mA. Now take an element with $t_{ch} = 400\ \mu$s, in the 200–700 µs range Ranck reported for some grey-matter stimulation [34], and the same rheobase: at 50 µs it needs 4.5 mA, at 500 µs 0.9 mA. Shortening the pulse therefore biases strongly towards the short-chronaxie element — the standard route to fibre-versus-cell-body selectivity, and the reason ECT pulse width changes outcomes at matched charge [260].

## L3 — Graduate

**The compartmental derivation.** Consider compartments indexed $n$, each of membrane capacitance $c_m$ (F) and axial resistance $R_a$ (Ω) to its neighbours. Kirchhoff's current law at compartment $n$, written in terms of $V_{m,n} = V_{i,n} - V_{e,n}$:

$$c_m \frac{dV_{m,n}}{dt} = -I_{\mathrm{ion},n} + \frac{1}{R_a}\Big[(V_{m,n-1} - 2V_{m,n} + V_{m,n+1}) + (V_{e,n-1} - 2V_{e,n} + V_{e,n+1})\Big],$$

- $V_{m,n}$ — membrane potential of compartment $n$, V;
- $V_{e,n}$ — extracellular potential at compartment $n$, V (imposed by the electrode, computed from the volume-conduction problem);
- $I_{\mathrm{ion},n}$ — ionic membrane current, A (Hodgkin–Huxley-type or passive);
- $c_m$ — compartment capacitance, F;
- $R_a$ — axial resistance between compartment centres, Ω.

The first bracket is the cell's own internal redistribution. The second bracket is the entire effect of the electrode: it is a *known* driving term, the second spatial difference of $V_e$. Nothing else about the applied field enters [33].

**Continuum limit.** For a cylinder of diameter $d$ (cm), intracellular resistivity $\rho_i$ (Ω·cm) and specific membrane capacitance $c_m''$ (F/cm²), taking $\Delta x \to 0$ gives

$$\frac{\partial V_m}{\partial t} = \frac{1}{c_m''}\left[-i_{\mathrm{ion}} + \frac{d}{4\rho_i}\frac{\partial^{2} V_m}{\partial x^{2}}\right] + f, \qquad f = \frac{d}{4\rho_i c_m''}\frac{\partial^{2} V_e}{\partial x^{2}},$$

- $f$ — activating function, V/s (a rate of change of membrane potential, so often quoted in mV/ms);
- $d$ — fibre diameter, cm;
- $\rho_i$ — intracellular resistivity, Ω·cm;
- $c_m''$ — specific membrane capacitance, F/cm² (about $1\ \mu$F/cm²);
- $\partial^2 V_e/\partial x^2$ — second derivative of extracellular potential along the fibre, V/cm².

Two structural facts fall out. First, $f \propto d$: thicker fibres are driven harder by the same field, which is the physical basis of reversed recruitment order — large myelinated fibres first [34,61]. Second, since $E_x = -\partial V_e/\partial x$, we can write $f \propto -\partial E_x/\partial x$: the drive is the *gradient of the field component along the fibre*, so a spatially uniform field has no drive along a straight cable at all [33].

**Where a uniform field does act.** With a sealed end at $x = L$, the boundary condition $\partial V_m/\partial x = -\partial V_e/\partial x = E_x$ replaces the vanishing source term, and the steady-state solution of the passive cable in a uniform field gives a terminal polarisation of magnitude

$$|V_m(L)| = E_x \lambda \tanh\!\left(\frac{L}{\lambda}\right) \; \xrightarrow[L \gg \lambda]{} \; E_x \lambda,$$

- $E_x$ — field component along the cable, V/m;
- $\lambda$ — electrotonic length constant, m;
- $L$ — distance from the terminal to the nearest electrical break, m.

Units check: (V/m)(m) = V. Numerically, 1 V/m acting on a terminal with $\lambda = 0.3$ mm gives 0.3 mV, comparable in scale to the measured somatic coupling of about 0.12 mV per mV/mm in rat CA1 pyramidal cells [36] — which is why the two mechanisms are easy to confuse and do not scale together [33,36].

**Order-of-magnitude for a monopolar electrode.** A point source of current $I$ (A) in an infinite medium of conductivity $\sigma$ (S/m) gives $V_e(r) = I/(4\pi\sigma r)$ (V). For a fibre at perpendicular distance $h$ (m) from the electrode, $\partial^{2}V_e/\partial x^{2}$ at the closest point is $-I/(4\pi\sigma h^{3})$, so the drive falls as $h^{-3}$. Measured current–distance relations are nonetheless usually fitted with a quadratic term, because threshold reflects the integrated response of many compartments and their active conductances rather than the peak of $f$ alone [34].

**Block.** Sustained depolarisation inactivates sodium channels, so strong cathodal current excites a shell of elements while blocking propagation nearer the electrode [34]. Optimised charge-balanced 10 kHz waveforms can instead drive channels into inactivation by the closed-state path, giving block without the usual onset burst — a computational result [62]. At the electrode the limiting constraint is charge transfer across the interface, Faradaic or non-Faradaic, which bounds charge balance and electrode material [63].

## L4 — Expert

The activating function is not in dispute as mathematics; what is contested is how far the one-dimensional, linear reading of it survives real morphology and real channel dynamics.

The clearest challenge comes from morphologically realistic modelling. Aberra, Wang, Grill and Peterchev (2020) coupled reconstructed cortical neuron morphologies to TMS fields in a head model and found the lowest thresholds in intracortical axon terminals at the gyral crown and lip, with layer-5 pyramidal cells most excitable, field magnitude mattering more than direction, and activation sites shifting with current direction in a waveform-dependent way [57]. Wang, Aberra, Grill and Peterchev (2023) went further: in three-dimensional layer-5 models, temporal interference required about 75–230 V/m to be suprathreshold, against about 17–47 V/m for low-frequency tACS and block above roughly 1,700 V/m, and they state explicitly that three-dimensional morphology matters in a way earlier one-dimensional analyses missed [48]. None of those thresholds is a measurement [48].

A second fragility is what "excitation" means when the waveform is not a pulse. Mirzakhalili, Barra, Capogrosso and Lempka (2020) showed that passive membrane filtering cannot extract a kilohertz amplitude envelope, because the waveform's content is entirely high-frequency, while ion-channel rectification can — and that the same model predicts tonic firing or block in superficial tissue at intensities that activate deep targets [60]. Yi and Grill (2020) showed block can be engineered through closed-state sodium inactivation [62]. In both cases the linear activating function correctly identifies *where* current enters and is silent about *what the channels then do*, which is the part that decides the outcome.

Third, the empirical foundations are old and partial. Ranck's 1975 review remains the reference compilation of current–distance relations, and he flagged two gaps that have not closed: equivalent data for electrode types other than monopolar were lacking, and grey-matter chronaxies of 200–700 µs against 50–100 µs for central myelinated axons left open what is actually being excited in grey matter [34]. Where the theory has been tested against physiology it has done well: Capogrosso and colleagues (2013) predicted that lumbosacral epidural stimulation recruits large myelinated dorsal-root afferents first, engaging motor pools transsynaptically, and confirmed the intensity and electrode-position predictions in rats [61]. Human epidural recordings of D- and I-waves provide the measured counterpart in cortex, showing that intensity and current direction selectively engage different excitatory and inhibitory circuits with large inter-individual variability [58].

The discriminating measurements are therefore not about the cable equation but about the target: subcellular recording or imaging of polarisation at terminals and bends under a known uniform field, in the same preparation as somatic measurements, so that terminal and somatic coupling can be compared rather than inferred [33,36,57].

## How this volume uses it

Section 4.1 is built directly on this page: it introduces the activating function, flags it as theoretical, and draws the geometric consequence that polarisation concentrates at terminations, bends and gradient changes [33]. The same section uses current–distance relations, cathodal-versus-anodal thresholds, chronaxie and reversed recruitment order to argue that "stimulation" cannot be a bare edge in a graph, because what is excited depends on element class, diameter and orientation [34,61]. Section 4.2's synthesis — that somatic polarisation and terminal polarisation sit under one word and do not scale together — is the direct product of combining this page with the uniform-field measurements [33,36]. Section 4.4 uses it to underwrite the consensus position that TMS acts primarily on axon terminals at the gyral crown [41,57], and section 4.6 uses it to state why kilohertz envelopes need rectification rather than passive filtering [60]. Section 3.3's charge-safety discussion picks up where this page ends, at the electrode–tissue interface [17,63].
