---
id: field-neuron-coupling-geometry
title: Field–neuron coupling geometry
one_liner: "How much a given field polarises a neuron depends on orientation, morphology and compartment, and on whether the cell is silent or already active."
why_here: "Section 4 argues that coupling is a function of geometry and cell type, so a field magnitude alone does not predict an effect; this page supplies the measured coupling constants and the geometry behind that argument."
prerequisites: [cable-theory-and-activating-function, electric-field-modelling]
terms: [uniform-field, coupling-constant, somato-dendritic-axis, compartment-specific-polarisation, terminal-polarisation, modulation-versus-initiation, millivolts-per-millimetre, layer-v-pyramidal-neuron, gyral-crown, endogenous-field, entrainment, temporal-interference]
figures: []
further_reading:
  - { title: "Siebner et al. (2022), Transcranial magnetic stimulation of the brain: what is stimulated? A consensus and critical position paper", url: "https://doi.org/10.1016/j.clinph.2022.04.022", kind: review }
  - { title: "Merrill, Bikson & Jefferys (2005), Electrical stimulation of excitable tissue: design of efficacious and safe protocols", url: "https://doi.org/10.1016/j.jneumeth.2004.10.020", kind: review }
  - { title: "Malmivuo & Plonsey, Bioelectromagnetism, Chapter 3: Subthreshold membrane phenomena", url: "https://www.bem.fi/book/03/03.htm", kind: textbook }
self_check:
  - q: "In rat CA1 slices, a uniform DC field applied perpendicular to the somato-dendritic axis did what?"
    options:
      - "Polarised the soma more strongly than a parallel field did"
      - "Did not polarise the soma at all, yet still changed afferent synaptic responses"
      - "Had no measurable effect of any kind"
      - "Reversed the sign of dendritic polarisation only"
    answer: 1
    explanation: "Bikson and colleagues found somatic polarisation only for fields with a component along the somato-dendritic axis; perpendicular fields left the soma unpolarised while still altering synaptic responses, so orientation is a condition of coupling rather than a modifier of it."
  - q: "A field of 1 V/m acts along the somato-dendritic axis of a CA1 pyramidal cell. Using the measured coupling constant, roughly how much somatic polarisation results?"
    options:
      - "About 0.012 mV"
      - "About 0.12 mV"
      - "About 1.2 mV"
      - "About 12 mV"
    answer: 1
    explanation: "The measured coupling was about 0.12 mV per mV/mm, and 1 V/m equals 1 mV/mm, so roughly 0.12 mV - a fraction of a millivolt, far below the depolarisation needed to initiate a spike from rest."
  - q: "Why is the threshold for modulating ongoing activity lower than the threshold for initiating activity?"
    options:
      - "Because modulation uses higher frequencies"
      - "Because an already-active cell sits near threshold, so a sub-millivolt shift changes spike timing or rate, whereas a silent cell must be driven all the way to threshold"
      - "Because ongoing activity increases the coupling constant"
      - "Because endogenous fields cancel applied fields"
    answer: 1
    explanation: "Terzuolo and Bullock showed in invertebrate neurons that changing the firing frequency of an active cell needs a much smaller imposed gradient than exciting a silent one; the volume keeps initiation and modulation as separate claims with separate thresholds."
  - q: "What does the volume conclude about somatic and terminal polarisation?"
    options:
      - "They are the same mechanism measured two ways"
      - "They are two mechanisms under one word that do not scale together, and predict different sensitivities to electrode or coil orientation"
      - "Terminal polarisation has been measured directly in human cortex"
      - "Only terminal polarisation occurs in uniform fields"
    answer: 1
    explanation: "Somatic polarisation is proportional to the field along the somato-dendritic axis and has been measured in rodent slices; terminal and bend polarisation is predicted by cable analysis to dominate in a uniform field, so a claim about somata does not license a claim about terminals."
---

## What it is

Section 4 needs two numbers to get from a field to a physiological effect: how much field arrives, and how much membrane polarisation a unit of field produces. The first is dosimetry. The second is coupling, and it is not a single constant — it depends on the angle between the field and the cell, on the cell's morphology, on which part of the cell you look at, and on what the cell was doing beforehand.

For transcranial methods the simplification that makes this tractable is that the field across any one neuron is nearly uniform: the field varies over centimetres, while a neuron spans tens to hundreds of micrometres. So the preparation of choice is a slice in a uniform field, with the field expressed in mV/mm (identical to V/m) and the response in mV of membrane polarisation. The ratio is the *coupling constant*, whose units are mV per mV/mm — which is to say, units of length.

In rat hippocampal slices, uniform DC fields below 40 mV/mm applied parallel to the somato-dendritic axis polarised CA1 pyramidal somata linearly, at a mean of about 0.12 mV per mV/mm, with polarisation varying along the cell, largest at the dendritic tips, and time constants of about 15–70 ms [36]. The two ends of the cell polarise with opposite sign: the field that depolarises the soma hyperpolarises the distal dendrite [36]. Fields applied perpendicular to that axis did not polarise the soma at all, yet still changed afferent synaptic responses, and the authors concluded that uniform fields modulate excitability continuously through compartment-specific polarisation, with no clear threshold [36].

Morphology sets the constant as much as orientation does. Patch-clamp recordings from reconstructed rat motor-cortex neurons in uniform fields showed that morphology predicts somatic subthreshold polarisation, with layer V pyramidal cells the most sensitive; suprathreshold thresholds reflected both direct polarisation and network input and were lower in layers V/VI than in layers II/III, and field stimulation produced burst firing that somatic current injection did not [49].

## L1 — Intuition

A weak electric field does not switch a neuron on. It tilts it.

Picture a neuron as a long thin object with a body at one end and branches at the other. An external field pushes charge along that length, so one end becomes slightly more positive inside and the other slightly more negative. The size of the tilt depends on how the cell is lined up with the field: a cell lying along the field gets the full push, and a cell lying across it gets almost none. So orientation matters more than people expect.

The tilt is small. At the field strengths scalp stimulation delivers, it is a fraction of a millivolt, where a neuron at rest needs something like fifteen millivolts to fire. So the honest description of what a weak field does is not "it makes cells fire" but "it makes cells that were already about to fire fire slightly sooner or later". That matters in an active, rhythmic network, because timing is what a rhythm is made of. It is much harder to believe if the claim is that the field started the activity from scratch.

Two more consequences follow. Different parts of one cell tilt in opposite directions, so "the cell was depolarised" is an incomplete sentence — you have to say which end. And the places where a cell is electrically interrupted, its tips and bends, feel a smooth field most strongly, which is why the ends of axons rather than cell bodies are the favoured target of magnetic stimulation.

## L2 — Undergraduate

Define the coupling constant $\kappa$ by $\Delta V_m = \kappa\,E_\parallel$, where $E_\parallel$ is the field component along the cell's principal axis. With $\Delta V_m$ in mV and $E_\parallel$ in mV/mm, $\kappa$ has units of mm. Measured in rat CA1 pyramidal somata, $\kappa \approx 0.12$ mm (0.12 mV per mV/mm) for subthreshold DC fields up to 40 mV/mm, and the relation is linear over that range [36].

Three geometric facts qualify that number.

1. **Orientation.** Only the component along the somato-dendritic axis polarises the soma, so $E_\parallel = |\mathbf{E}|\cos\theta$ with $\theta$ the angle between field and axis. At $\theta = 90^\circ$ somatic polarisation vanishes [36].
2. **Compartment.** Polarisation varies along the cell and reverses sign between soma and distal dendrite, so one number per cell is a summary of a profile [36].
3. **Cell class and morphology.** Layer V pyramidal cells are the most sensitive class measured in rat motor cortex, and thresholds differ between layers V/VI and II/III [49].

Then there is state. Terzuolo and Bullock set out to measure the imposed voltage gradient adequate to modulate firing, and found in invertebrate neurons that changing the frequency of an already-active cell needs a far smaller gradient than exciting a silent one [35]. Networks amplify: in ferret cortex, endogenous fields during physiological activity reached about 2–4 mV/mm, and applied fields of the same amplitude sped up, regularised and entrained the slow oscillation, with closed-loop positive feedback strengthening oscillatory structure and negative feedback weakening it [37].

Worked example — the arithmetic that frames the entrainment dispute. Intracranial measurements give about 0.8 V/m in human cortex at 2 mA of scalp stimulation [40]. Applying the measured coupling constant, $\Delta V_m \approx 0.12\ \mathrm{mm} \times 0.8\ \mathrm{mV/mm} \approx 0.1\ \mathrm{mV}$.

That is of order 1% of the distance from rest to threshold, so initiation from rest is implausible; but it is not negligible against the sub-millivolt fluctuations that set spike timing in an active network, and endogenous fields in active cortex are several times larger again [35,37]. Both sides of the dispute in section 4.5 grow out of this one line of arithmetic [40,50,51].

## L3 — Graduate

**Where the coupling constant comes from.** Take a passive cable of length $L$ in a uniform field $E_x$ directed along its axis, with sealed ends. The extracellular potential is linear in $x$, so the activating function vanishes in the interior and the field enters only through the boundary conditions $V_m'(\pm L/2) = E_x$. The steady-state cable equation then gives an antisymmetric polarisation profile with its extremes at the two ends:

$$|V_m(\pm L/2)| = E_x\,\lambda\,\tanh(L/2\lambda),$$

- $V_m$ — membrane polarisation, V;
- $E_x$ — uniform field component along the axis, V/m;
- $\lambda$ — electrotonic length constant, m;
- $L$ — cable length between electrical breaks, m;
- $x$ — position from the cable's midpoint, m.

Two readings follow. The coupling constant at an end is $\kappa = \lambda\tanh(L/2\lambda)$, a length that saturates at $\lambda$ when $L \gg \lambda$. The measured somatic $\kappa \approx 0.12$ mm in CA1 pyramidal cells is therefore an effective electrotonic distance set by the whole cell's geometry, not a property of the membrane alone [36]. And the profile is antisymmetric about a null point — the formal statement of compartment-specific polarisation, with soma and distal dendrite of opposite sign, as measured [36].

**Orientation as a condition, not a factor.** With the cell axis written as a unit vector, the drive is the projection $E_\parallel = |\mathbf{E}|\cos\theta$, so $\Delta V_m = \kappa |\mathbf{E}| \cos\theta$ (mV = mm × mV/mm). At $\theta = 90^\circ$ somatic polarisation is zero to first order, which is what was measured — and yet afferent synaptic responses still changed in the same slices, evidence that other elements with their own axes, afferent axons and their terminals, were being polarised by the same field [36].

**Terminals versus somata.** In a uniform field the cable analysis puts the largest polarisation at electrical discontinuities, of magnitude about $E_x \lambda_{\mathrm{local}}$ [33]. For a fine axonal branch with $\lambda_{\mathrm{local}}$ of 0.2–0.5 mm, a 1 V/m field gives 0.2–0.5 mV: the same order as somatic coupling, but at a different site, with a different reference axis (the local axon direction) and a different polarity dependence. Hence the volume's rule that a measurement of somatic polarisation does not license a claim about terminals [33,36].

**Realistic morphology.** Three-dimensional models change the numbers rather than the structure. Morphologically realistic TMS modelling put the lowest thresholds in intracortical axon terminals at the gyral crown and lip, with layer-5 pyramidal cells most excitable and field magnitude mattering more than direction [57]. Model layer-5 neurons needed about 17–47 V/m to fire under low-frequency tACS and 75–230 V/m under temporal interference, with conduction block above about 1,700 V/m; against roughly 0.1–1 V/m available at tolerable scalp currents, the gap between suprathreshold and available is two orders of magnitude, and none of those thresholds is a measurement [48].

**Units, assembled.** Coupling constant in mm; field in mV/mm; polarisation in mV; polarisation time constants 15–70 ms [36]; endogenous fields in active ferret cortex 2–4 mV/mm [37]; delivered human cortical field about 0.8 mV/mm at 2 mA [40]. A field value that arrives without orientation, compartment, cell class and network state cannot be converted into a polarisation at all.

## L4 — Expert

The live dispute is whether conventional 1–2 mA transcranial alternating current stimulation entrains neurons directly.

For direct entrainment: Krause, Vieira, Csorba, Pilly and Pack (2019) found that scalp tACS in awake macaques altered the timing but not the rate of single-neuron spiking, including in hippocampus and basal ganglia [51]. Johnson and colleagues (2020) reported dose-dependent entrainment in awake monkey neocortex at human-feasible intensities, with increased burst firing and phase locking [52]. Ali, Sellers and Fröhlich (2013) offered network resonance as a mechanism, with enhancement largest when stimulation matches the intrinsic rhythm [53]. Krause, Vieira, Thivierge and Pack (2022) then showed a state dependence that complicates all of this: tACS entrained weakly locked neurons but often reduced phase locking in neurons already strongly locked to an endogenous rhythm [44].

Against it: Vöröslakos and colleagues (2018) put the rat intracellular threshold for affecting spiking and subthreshold activity at about 1 mV/mm, needed about 4–6 mA in living humans to modulate EEG alpha reliably, and noted that about 75% of scalp-applied current is shunted before it reaches the brain; they conclude that conventional low-intensity tES is probably too weak for direct, immediate effects [50]. Asamoah, Khatoun and Mc Laughlin (2019) proposed a peripheral route instead: anaesthetising the skin reduced tACS-induced tremor entrainment, and peripheral nerve stimulation alone reproduced the motor effects [54]. Vieira, Krause and Pack (2020) answered with the matching control in the species that produced the positive evidence — macaque hippocampal and visual-cortex neurons stayed entrained after topical anaesthesia blocked somatosensory input [55].

The volume's reading is that the disagreement is partly an artefact of mismatched preparations: the positive single-unit evidence is in macaques [51,52,55], the sceptical threshold comes from rat intracellular recording plus human EEG [50], and the two are joined only by field models [48]. One matched study would settle it: simultaneous intracranial recording and field measurement in humans at 1–2 mA, with peripheral block applied in the same session [40,50,54,55].

Temporal interference is the same argument at a higher carrier frequency. Grossman and colleagues (2017) demonstrated envelope-following in anaesthetised mice, with steerable depth and hippocampal stimulation without driving overlying cortex [39]. Mirzakhalili and colleagues (2020) showed that passive membrane filtering cannot demodulate the envelope while ion-channel rectification can, and that the same model predicts tonic firing or block in superficial tissue at intensities reaching deep targets [60]. Wang and colleagues (2023) put the required fields two orders of magnitude above what scalp currents deliver [48]. Vieira, Krause and Pack (2024) measured TI-tACS in macaques as roughly 80% less potent than conventional tACS, changing spike timing but not rate [46]. Human reports of subthreshold hippocampal and memory effects stand alongside this rather than resolving it [45].

## How this volume uses it

Section 4.2 is this page's home: it reports the measured coupling constant, the orientation dependence, the compartment reversal and the morphology dependence, and draws the synthesis that somatic and terminal polarisation are two mechanisms under one word that do not scale together [33,36,49]. Section 4.3 sets the coupling constant against delivered-field measurements to ask whether the numerator is large enough for the denominator [40,48,50]. Section 4.4 uses the same geometry to underwrite the TMS consensus that the primary targets are axon terminals at the gyral crown, with state-dependent spread [41,57]. Sections 4.5 and 4.6 stage the entrainment and temporal-interference disputes as arguments about coupling magnitude and route [39,44,46,48,51,54,55,60]. The schema requirements in section 4.7 follow directly: an edge from a field to a neural element must carry orientation, element class, field magnitude with unit and provenance, and whether the claim is initiation or modulation [33,34,35,40,44].
