---
id: oscillations-and-entrainment
title: Oscillations, phase and entrainment
one_liner: "What a neural oscillation is, how phase and coherence are measured, and what it takes for an applied rhythm to entrain an endogenous one."
why_here: "Section 8.1 treats oscillation, phase and coherence as control variables and section 4.5 asks whether 1-2 mA scalp currents can impose phase; this page supplies the phase-response and coherence formalism and the field amplitudes those arguments trade in."
prerequisites: [field-neuron-coupling-geometry]
terms: [oscillation, entrainment, phase-locking, coherence, gamma-oscillation, network-resonance, local-field-potential, endogenous-field, tacs, mu-rhythm, beta-burst, forty-hz-stimulation, volts-per-metre, millivolts-per-millimetre]
figures: []
further_reading:
  - { title: "Fries P. A mechanism for cognitive dynamics: neuronal communication through neuronal coherence. Trends Cogn Sci 2005", url: "https://www.sciencedirect.com/science/article/pii/S1364661305002421", kind: review }
  - { title: "Bastos AM, Schoffelen JM. A tutorial review of functional connectivity analysis methods and their interpretational pitfalls. Front Syst Neurosci 2016", url: "https://www.frontiersin.org/articles/10.3389/fnsys.2015.00175/full", kind: review }
self_check:
  - q: "Magnitude-squared coherence between two signals is reported as 0.4 at 20 Hz. What are its units?"
    options: ["Microvolts squared per hertz", "Radians", "None - it is a dimensionless ratio bounded between 0 and 1", "Decibels"]
    answer: 2
    explanation: "Coherence is the squared cross-spectrum normalised by the two auto-spectra, so the power units cancel. It is bounded on [0,1] and mixes phase consistency with amplitude covariation, which is why phase-locking value is often reported beside it."
  - q: "An oscillator with intrinsic frequency 10.0 Hz is driven at 10.4 Hz. Under the Adler equation, entrainment requires what?"
    options: ["The drive amplitude to exceed the oscillator's amplitude", "The coupling strength times the phase-response amplitude to exceed the frequency detuning, here 0.4 Hz expressed in rad/s", "The drive to be applied for at least one second", "Nothing - any detuning can be entrained given enough cycles"]
    answer: 1
    explanation: "Entrainment exists when a fixed point of dphi/dt = 2*pi*df - eps*Z*sin(phi) exists, i.e. when eps*Z >= |2*pi*df|. Wider detuning needs stronger coupling, which is the Arnold-tongue condition."
  - q: "Endogenous fields during physiological activity in ferret cortex were about 2-4 mV/mm, and 2 mA transcranial current gave about 0.8 V/m measured intracranially in human patients. How do these compare?"
    options: ["The human field is roughly ten times larger", "They are the same order of magnitude, since 1 V/m = 1 mV/mm, with the human value at or below the endogenous range", "They cannot be compared because the units differ", "The human field is about a thousand times larger"]
    answer: 1
    explanation: "1 V/m equals 1 mV/mm exactly. So 0.8 V/m sits below the 2-4 mV/mm endogenous range measured in ferret, and at or below the roughly 1 V/m minimum effective field from rat recordings - which is the arithmetic at the centre of the H-tes-entrainment dispute."
  - q: "In awake macaques, tACS entrained neurons that were weakly locked to an ongoing oscillation but often reduced phase locking in neurons already strongly locked. What does this imply for a graph edge from tACS to entrainment?"
    options: ["The edge should be labelled with a single positive sign", "The edge's sign depends on the ongoing state, so state must be a property of the edge", "Entrainment does not occur in primates", "Only gamma-band edges are affected"]
    answer: 1
    explanation: "Efficacy is a joint function of the applied drive and the ongoing state. The same stimulus increases locking in one population and decreases it in another within one dataset, which the authors offer as a source of inconsistent human tACS outcomes."
---

## What it is

A neural oscillation is a rhythmic fluctuation in the excitability of a population of neurons, visible as a periodic component in a local field potential, an intracranial recording or a scalp EEG. Oscillations are named by frequency band — delta, theta, alpha, the sensorimotor mu-rhythm, beta, gamma — and they are not merely descriptive in this literature: they are treated as control variables. Fries' account supplies the reason. Active neuronal groups oscillate, so their excitability fluctuates rhythmically, opening and closing short windows for receiving input and emitting output, and two groups influence one another effectively only when their windows align at a consistent phase relation [128]. A changing pattern of coherence is then a changing effective connectivity, reconfigurable on cognitive timescales [128].

Three quantities do the work. *Phase* is where in its cycle an oscillation is at a given instant, in radians or degrees. *Phase locking* is the consistency of the phase relation between two signals, or between a spike train and a rhythm, across repetitions. *Coherence* is the frequency-resolved, normalised covariation of two signals, mixing amplitude and phase consistency. All three are dimensionless or angular, which is what makes them comparable across recording modalities with wildly different physical units.

*Entrainment* is the specific claim that an applied periodic drive has pulled an endogenous oscillator into a fixed phase relation with itself. It is a stronger claim than "the recording now contains the stimulation frequency", because a stimulus artefact and a passively driven response also do that. Genuine entrainment implies a nonlinear oscillator with a preferred frequency, and it brings the standard signatures of coupled oscillators: a frequency-detuning limit, an amplitude dependence, and phase pulling that persists briefly after the drive stops.

The reason this is contested for non-invasive stimulation is arithmetic. In ferret cortex, endogenous fields during physiological activity reached about 2–4 mV/mm, and in ferret cortical slices applied fields of that in-vivo-like amplitude sped up, regularised and entrained the slow oscillation [37]. Against that, rat recordings put the minimum effective field near 1 V/m, and 2 mA in humans delivered about 0.8 V/m measured intracranially [40,50]. Since 1 V/m = 1 mV/mm, conventional transcranial currents deliver fields at or below the amplitude at which entrainment has been demonstrated — which is the whole of dispute group H-tes-entrainment [40,50].

## L1 — Intuition

Brain activity is rhythmic. Populations of neurons become more and less excitable in cycles, many times a second, and the rhythm sets when a message will land: arrive on the upswing and you are heard, arrive on the downswing and you are ignored. On this picture two brain areas talk to each other not by being connected — they are always connected — but by getting their rhythms into a stable relationship. Change the phase relationship and you change who is talking to whom without moving a single wire.

Entrainment is what happens when an outside rhythm captures an inside one. The everyday example is a pendulum clock on a wall shared with another clock: a very small mechanical coupling, applied cycle after cycle, is enough to pull the two into step. Two conditions matter. The outside rhythm must be close enough in frequency to the inside one — try to drive a 10 Hz rhythm at 4 Hz and nothing catches — and the nudge must be strong enough. Wider the frequency gap, stronger the nudge needed.

That trade-off is exactly where the argument about transcranial alternating current sits. The nudge available from 1–2 mA through the scalp is a field of roughly the same size as the fields the brain generates itself, and possibly smaller than the smallest field shown to shift firing in an animal. Some recordings in awake monkeys show spike timing being shifted; some rodent work says the field is too weak and that the effect people see comes from stimulating nerves in the skin instead. Both camps are arguing about the same few numbers, in the same units.

## L2 — Undergraduate

**Describing an oscillation.** Band-pass filter a signal and apply the Hilbert transform (or take a wavelet convolution) to obtain an analytic signal $z(t) = A(t)e^{i\theta(t)}$: an instantaneous amplitude $A(t)$ in the signal's own units (µV for EEG) and an instantaneous phase $\theta(t)$ in radians. Power is $A^2$, in µV²; a power spectral density is in µV² Hz⁻¹.

**Phase locking.** For $N$ observations of the phase difference $\Delta\theta_n$ between two signals (or between spikes and a rhythm), the phase-locking value is $\mathrm{PLV} = \left|\frac{1}{N}\sum_n e^{i\Delta\theta_n}\right|$, dimensionless and bounded between 0 and 1: zero for uniformly distributed phase differences, 1 for a perfectly fixed relation. PLV is biased upward at small $N$, which matters when comparing conditions with unequal trial counts.

**Coherence.** Magnitude-squared coherence at frequency $f$ is

$$C_{xy}(f) = \frac{|S_{xy}(f)|^{2}}{S_{xx}(f)\,S_{yy}(f)}$$

where $S_{xy}$ is the cross-spectral density (µV² Hz⁻¹) and $S_{xx}, S_{yy}$ the auto-spectra (µV² Hz⁻¹). The units cancel, giving a dimensionless quantity bounded between 0 and 1. Unlike PLV, coherence is sensitive to amplitude covariation as well as phase consistency — one reason the two are usually reported together.

**What entrainment requires.** An oscillator can be entrained when the drive's frequency lies within a band around its own, and the width of that band grows with drive amplitude: the Arnold tongue. Two testable consequences follow. First, *resonance*: the effect should be largest when drive frequency matches the network's intrinsic rhythm, which is what large-scale simulations with supporting ferret recordings report for tACS [53]. Second, *state dependence*: an oscillator already strongly locked to something else resists capture. In awake macaques, tACS entrained neurons weakly locked to an ongoing oscillation and often reduced phase locking in neurons already strongly locked, offered by the authors as a source of inconsistent human tACS outcomes [44].

**Worked example.** A 10 Hz drive on a 10.4 Hz endogenous rhythm has a detuning of $0.4$ Hz $= 2\pi(0.4) \approx 2.5$ rad s⁻¹. If the drive shifts phase by at most $0.1$ rad per cycle, its maximum pulling rate is about $0.1 \times 2\pi \times 10 \approx 6.3$ rad s⁻¹, which exceeds the detuning, so entrainment is possible. Halve the drive amplitude and the same detuning becomes unentrainable. This is the algebra behind "how much field do you need".

## L3 — Graduate

**Phase reduction.** Take a stable limit-cycle oscillator with natural frequency $\omega_0$ (rad s⁻¹) perturbed weakly by a stimulus $s(t)$. To first order the dynamics collapse onto the phase alone:

$$\dot{\theta} = \omega_0 + Z(\theta)\,s(t)$$

Symbols: $\theta$ phase (rad); $\omega_0 = 2\pi f_0$ natural angular frequency (rad s⁻¹); $s(t)$ the stimulus, for a transcranial field the local field magnitude in V m⁻¹ (equivalently mV mm⁻¹); $Z(\theta)$ the infinitesimal phase-response curve, in rad per unit stimulus per unit time — for a field drive, rad s⁻¹ per V m⁻¹. $Z$ is the object that any claim of "phase-specific effect" is implicitly about, and its sign structure decides whether a given delivery phase advances or delays the cycle. Validity requires weak coupling and a stimulus that does not leave the limit cycle's neighbourhood — an assumption that fails for suprathreshold pulses.

**Entrainment condition.** For sinusoidal drive at $\omega_d$, write the relative phase $\psi = \theta - \omega_d t$ and average over one cycle. With $Z$ approximated by its first Fourier component of amplitude $Z_1$ and drive amplitude $\varepsilon$ (V m⁻¹), this gives Adler's equation

$$\dot{\psi} = \Delta\omega - \varepsilon Z_1 \sin\psi , \qquad \Delta\omega = \omega_0 - \omega_d$$

A fixed point — that is, entrainment at constant phase lag $\psi^\ast = \arcsin(\Delta\omega/\varepsilon Z_1)$ — exists if and only if

$$|\Delta\omega| \le \varepsilon Z_1$$

which is the Arnold tongue: entrainment range grows linearly with drive amplitude near threshold. Three predictions follow that distinguish entrainment from a driven response: a finite locking bandwidth, a phase lag that varies systematically with detuning, and a brief persistence of pulled phase after the drive ends.

**Putting numbers in.** Endogenous fields in ferret cortex during physiological activity were about 2–4 mV mm⁻¹, and applied fields of that amplitude entrained the slow oscillation in ferret slices; network modelling attributed the effect to small, simultaneous depolarisation of many neurons rather than strong drive of any one [37]. Vöröslakos and colleagues put the minimum effective field near 1 V m⁻¹ in rat, and measured about 0.8 V m⁻¹ intracranially in humans at 2 mA, needing roughly 4–6 mA to modulate human EEG alpha [40,50]. Because 1 V m⁻¹ $\equiv$ 1 mV mm⁻¹, the conventional human dose lands just below the demonstrated range. For temporal interference the modelled numbers are far larger: suprathreshold responses in morphologically realistic layer-5 pyramidal models required about 75–230 V m⁻¹ against the 0.1–1 V m⁻¹ available at tolerable scalp currents [48].

**Measuring the outcome.** Three statistics carry most results, and they are not interchangeable. Spike–field locking as PLV or as a resultant vector length tests whether single neurons acquired a phase preference [44,51]. Coherence $C_{xy}(f)$ tests whether two population signals covary at a frequency, and is contaminated by volume conduction and by a shared reference, which is why phase-lag-based measures are preferred for inferring interaction from scalp data. Power at the drive frequency is the weakest of the three, because stimulation artefact occupies exactly that bin.

**Why the sign is not fixed.** Combining the resonance condition [53] with the competition result [44] gives a drive-by-state interaction: for a neuron already locked to an endogenous rhythm with its own coupling $\varepsilon_{\text{endo}}Z_1$, an applied drive at a different frequency subtracts from the existing locking rather than adding to it. Entrainment efficacy is therefore a function of the applied drive *and* the ongoing state jointly, not of the drive alone [37,44,53].

## L4 — Expert

The unresolved question is not whether oscillations can be entrained but whether the fields available non-invasively entrain them (group H-tes-entrainment). On the direct side, Krause and colleagues (2019) showed scalp tACS altering the timing but not the rate of single-neuron spiking in awake macaques including hippocampus and basal ganglia [51]; Vieira, Krause and Pack (2020) showed entrainment persisting when topical anaesthesia blocked somatosensory input [55]; Ali, Sellers and Fröhlich (2013) supplied the resonance mechanism [53]. On the sceptical side, Vöröslakos and colleagues (2018) put the rat threshold near 1 V m⁻¹ and the human intracranial field at 2 mA near 0.8 V m⁻¹, concluding conventional low-intensity tES is probably too weak for direct immediate effects [40,50]; Asamoah, Khatoun and Mc Laughlin (2019) showed skin anaesthesia reducing tACS tremor entrainment in rats and humans, with peripheral nerve stimulation alone reproducing the motor effects [54]. The positive single-unit evidence is macaque, the sceptical threshold is rat plus human EEG, and the two are joined only by field models [48]. What would settle it is one design: simultaneous intracranial recording and field measurement in humans at 1–2 mA, with peripheral block in the same session [40,50,54,55].

A second fragility is theoretical. Fries (2005) licenses entrainment-style intervention rather than demonstrating it: if phase gates communication, imposing phase should change routing [128]. No human study in this volume's corpus measures imposed phase at the single-neuron level [37,44,51,53,128], so the inferential chain runs theory → animal single-unit → human scalp measure, each join a separate claim.

Third, entrainment is sometimes asserted where it was not measured. The 40 Hz case is the clearest instance. Iaccarino and colleagues (2016) ran a chain from a 40 Hz drive through gamma entrainment to microglia and amyloid in Alzheimer's model mice [123], and Murdock and colleagues (2024) added glymphatic clearance as an effector [124]; Soula and colleagues (2023), recording at scale in model mice, found that 40 Hz flicker did *not* entrain native gamma, that the mice avoided the flicker, and that plaques and microglia were not meaningfully changed [125]. The first join of the chain — drive to entrainment — is exactly the one the counter-study attacks, and the settling experiment is a replication reporting invasively measured entrainment and amyloid in the same animals with flicker aversion controlled [125].

Finally, the measures are pitfall-rich in ways that matter for adjudication: coherence inflates with volume conduction and a shared reference, PLV is upwardly biased at small trial counts, and power at the drive frequency cannot be separated from artefact. Where a null is reported at one readout and an effect at another — as for phase-triggered TMS [137,213] — the readout is part of the claim.

## How this volume uses it

Section 8.1 rests on this page for its three working terms and for the interaction term it derives: efficacy is a joint function of the drive and the ongoing state [37,44,53,128]. Section 4.5 uses the field arithmetic to state the entrainment dispute in comparable units [40,50,51,54,55], and section 4.6 extends it to temporal interference, where the modelled suprathreshold requirement of about 75–230 V m⁻¹ is set against 0.1–1 V m⁻¹ delivered [48]. Section 6.4 uses phase as a state variable at the millisecond scale, where identical bursts at opposite mu-rhythm phases gave potentiation or nothing [137,213]. Section 7.7 uses entrainment as the first and most contested join in the 40 Hz chain [123–125], and section 8.3 uses band-limited features — beta bursts, stimulation-entrained gamma — as control signals for closed-loop delivery [135,136]. Section 8.7 then requires each circuit-level edge to name the biomarker and carry the state, because the same protocol moves one readout and not another [137,213].
