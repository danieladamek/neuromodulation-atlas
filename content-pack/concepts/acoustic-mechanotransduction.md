---
id: acoustic-mechanotransduction
title: Acoustic coupling and mechanotransduction
one_liner: "What a pressure wave delivers to tissue - force, heat, bubble activity - and which structures are candidates for converting it into neural activity."
why_here: "Section 5 sets out four rival accounts of low-intensity ultrasound plus an auditory confound; this page gives the acoustics and the transduction candidates those accounts argue over."
prerequisites: [dose-and-parameter-sets]
terms: [tus, sonication, isppa, watts-per-square-centimetre, megapascal, mechanical-index, duty-cycle, in-situ-exposure, free-field-parameters, hydrophone, skull-density-ratio, intramembrane-cavitation, cavitation, microbubble, acoustic-radiation-force, mechanosensitive-channel, piezo1, trpa1, cem43]
figures: []
further_reading:
  - { title: "ITRUSST consensus on biophysical safety for transcranial ultrasound stimulation (2025)", url: "https://doi.org/10.1016/j.brs.2025.10.007", kind: review }
  - { title: "Caffaratti et al. (2024), Neuromodulation with ultrasound: hypotheses on the directionality of effects and a community resource", url: "https://doi.org/10.7554/eLife.100827", kind: review }
  - { title: "Grogan & Mount, Ultrasound Physics and Instrumentation (StatPearls)", url: "https://www.ncbi.nlm.nih.gov/books/NBK570593/", kind: textbook }
self_check:
  - q: "A plane wave of peak pressure 0.5 MPa travels in brain tissue with characteristic acoustic impedance 1.5 MRayl. Roughly what is the peak intensity?"
    options:
      - "About 0.8 W/cm2"
      - "About 8 W/cm2"
      - "About 80 W/cm2"
      - "About 800 W/cm2"
    answer: 1
    explanation: "I = p^2 / (2 rho c) = (5e5 Pa)^2 / (2 x 1.5e6 Pa s/m) = 8.3e4 W/m2 = 8.3 W/cm2. Pressure and intensity are not independent parameters for a plane wave; reporting both without the impedance used is what makes parameter sets hard to compare."
  - q: "Mechanical index is defined as:"
    options:
      - "Peak rarefactional pressure in MPa divided by the square root of frequency in MHz"
      - "Time-average intensity divided by duty cycle"
      - "Peak pressure multiplied by pulse duration"
      - "The ratio of in situ to free-field pressure"
    answer: 0
    explanation: "MI = p_r / sqrt(f) with p_r in MPa and f in MHz. The ITRUSST safety consensus classes transcranial ultrasound as non-significant risk at MI or MItc of 1.9 or lower, while stating that its values are expert consensus and not regulatory limits."
  - q: "Sweeping the carrier frequency from 0.5 to 43 MHz in ex vivo salamander retina made ganglion-cell responses stronger at higher frequencies. Why does that matter?"
    options:
      - "It confirms that cavitation is the mechanism"
      - "It is the opposite of what cavitation-based mechanisms predict, so it excludes cavitation in that preparation and favours radiation force"
      - "It shows the effect is thermal"
      - "It shows the effect is auditory"
    answer: 1
    explanation: "Cavitation thresholds rise with frequency, so cavitation predicts weaker responses at higher frequency. Menz and colleagues found the reverse and accounted for the responses with a quantitative radiation-force model; frequency sweeps are therefore a discriminating test."
  - q: "Why is the auditory confound a competitor to all four mechanistic accounts rather than an alternative to one of them?"
    options:
      - "Because ultrasound cannot reach the brain"
      - "Because sharp-edged pulse envelopes activate the auditory pathway, so an observed response may not have arisen at the acoustic focus at all, whichever transducer is proposed"
      - "Because hydrophones cannot measure in situ pressure"
      - "Because duty cycle is never reported"
    answer: 1
    explanation: "Guinea pig and mouse work showed widespread activation ascending through the auditory system; smoothing the envelope removed the auditory response while sparing the motor response; and in humans four experiments found reported motor inhibition was driven by peripheral auditory stimulation."
---

## What it is

An acoustic wave is a travelling pattern of pressure and particle motion. Sent into tissue it does several things at once, and the field disagrees about which of them carries a neural effect [65,66,71]. Momentum transfer produces acoustic radiation force and micron-scale tissue displacement, imaged directly in isolated salamander retina during sonication [66]. Absorption produces heating, and any heating history reduces to an equivalent time at a reference temperature, CEM43 [85]. Where gas bodies are present the wave drives bubble oscillation instead of being absorbed, which is why microbubble techniques work far below ablative intensities [80].

Mechanotransduction is the second half of the question: given that a force arrives, what converts it into a change in membrane current? Candidate answers are of three kinds. The membrane itself may rectify the wave, as in the intramembrane cavitation model, where the lipid bilayer acts as a bilayer sonophore whose leaflets separate and re-approach, producing a periodic capacitance change and displacement currents [65]. A protein may do it: mechanosensitive channels such as TREK-1, TREK-2, TRAAK, NaV1.5, Piezo1, astrocytic TRPA1 and even CFTR have all been reported to respond [67,68,69,70]. Or heat may do it, with the mechanical parameters merely setting how much energy is deposited [71].

Two practical facts frame all of this. The skull attenuates and aberrates the beam, so what the transducer emits into water (free field) and what arrives in the brain (in situ) are different quantities that the ITRUSST reporting consensus asks to be reported separately [20]; in 25 patients treated with MR-guided focused ultrasound, skull density ratio correlated positively with peak target temperature and skull volume negatively [87]. And the device makes an audible transient as well as a focal pressure field, which is a second stimulus with a different transducer [74,75,76,77].

## L1 — Intuition

Sound is a squeeze. A loudspeaker pushes air, the push travels, and your eardrum moves. Focused ultrasound is the same thing at frequencies too high to hear, aimed like light through a lens so that the squeezing is concentrated in a spot a few millimetres across, deep inside the head, without anything being inserted.

What could a squeeze do to a neuron? Several things, and they are hard to tell apart. It can push: a steady force that nudges tissue by a fraction of a micrometre. It can warm: some of the wave's energy is absorbed and turns into heat, and neurons are exquisitely temperature-sensitive. If there are tiny bubbles about — injected deliberately, as in blood-brain barrier work — it can make them swell and shrink violently, which tugs on whatever they touch. And it can stretch the membrane itself, which may open channels that are built to sense mechanical strain.

Then there is the awkward extra. A pulse with sharp edges makes a click that the ear hears, even when the ear is not the target. So an animal or person may respond to the sound of the device rather than to the pressure in the brain. Much of the field's recent work has been about separating those two, by smoothing the pulse, by masking the sound, and by testing deaf animals. Any claim of the form "ultrasound does X to circuit Y" has to survive that separation first.

## L2 — Undergraduate

The reported acoustic parameters divide into three groups.

**Field quantities.** Peak positive and peak rarefactional pressure in MPa; intensity in W/cm2, quoted as spatial-peak pulse-average (ISPPA) or spatial-peak temporal-average (ISPTA); centre frequency in kHz or MHz; and the focal dimensions in mm. Pressure is measured with a calibrated hydrophone in water, then derated or modelled for the skull [20].

**Timing quantities.** Pulse duration, pulse repetition frequency, duty cycle (the fraction of time the wave is on), sonication duration, and the inter-sonication interval [20]. Duty cycle links the two intensity conventions: ISPTA = ISPPA x duty cycle.

**Exposure quantities.** In situ pressure and intensity in the brain; mechanical index; and temperature rise or thermal dose [19,20].

For the same reason as in electrical dose, these are not interchangeable: the ITRUSST reporting consensus asks for six domains — transducer and drive system, drive settings, free-field acoustic parameters, pulse timing, in situ estimates, and intensity parameters — precisely because a single intensity does not identify a protocol [20].

Worked example — one protocol, three numbers. Take 500 kHz, peak rarefactional pressure 0.5 MPa in situ, 20 ms pulses at 5 Hz for 40 s.

- Intensity: for a plane wave, $I = p^2/(2\rho c)$ with $\rho c = 1.5\times10^{6}$ Pa s/m, giving $I_{\mathrm{SPPA}} = (5\times10^{5})^2 / (3\times10^{6}) \approx 8.3\times10^{4}$ W/m2 $= 8.3$ W/cm2.
- Duty cycle: 20 ms x 5 per s = 0.10, so ISPTA = 0.83 W/cm2.
- Mechanical index: $0.5/\sqrt{0.5} = 0.71$, below the 1.9 that the ITRUSST safety consensus treats as non-significant risk, with the caveat that these are consensus values and not regulatory limits [19].

Notice what the three numbers share: they are all functions of pressure, frequency and timing. None of them says which structure absorbs the wave, and two protocols with identical ISPTA can differ in duty cycle by an order of magnitude — which matters, because duty cycle predicted the direction of human outcomes in a systematic review of 32 studies while ISPPA alone did not [79].

## L3 — Graduate

**Pressure, intensity and impedance.** For a plane progressive wave, particle velocity and pressure are in phase and related by the characteristic acoustic impedance $Z = \rho c$. The instantaneous intensity is $p u$, so the time-average intensity of a sinusoid of peak amplitude $p_0$ is

$$I = \frac{p_0^{2}}{2\rho c},$$

- $I$ — intensity, W/m2 (1 W/cm2 = $10^{4}$ W/m2);
- $p_0$ — peak pressure amplitude, Pa (1 MPa = $10^{6}$ Pa);
- $\rho$ — tissue density, kg/m3 (about 1040 for brain);
- $c$ — sound speed, m/s (about 1500 in brain), so $\rho c \approx 1.5\times10^{6}$ Pa s/m (1.5 MRayl).

Units check: Pa2 / (Pa s/m) = Pa m/s = (N/m2)(m/s) = W/m2. The relation holds only for a progressive plane wave; standing waves break it, and transducer-to-target distance mattered strongly in retina precisely because standing waves shaped the effective stimulus [66].

**Mechanical index.** MI is a dimensional convention rather than a physical group:

$$\mathrm{MI} = \frac{p_{r}\,[\mathrm{MPa}]}{\sqrt{f\,[\mathrm{MHz}]}},$$

- $p_r$ — peak rarefactional pressure, derated or estimated in situ, MPa;
- $f$ — centre frequency, MHz.

Its form encodes the empirical observation that inertial cavitation thresholds rise roughly as $\sqrt{f}$, which is why it indexes mechanical rather than thermal risk, and why the frequency dependence of an effect is diagnostic: cavitation-based mechanisms weaken with increasing frequency, radiation force does not [66]. ITRUSST classes transcranial ultrasound as non-significant risk at MI or MItc of 1.9 or lower, while stating that the document is expert consensus, that its values are not safety limits, and that more data are needed to locate the threshold for significant risk [19].

**Radiation force and heating come from the same absorption term.** For a travelling wave attenuated by absorption coefficient $\alpha$ (Np/m), the body force per unit volume and the initial heating rate are

$$F = \frac{2\alpha I}{c}, \qquad \frac{dT}{dt} = \frac{2\alpha I}{\rho C_p},$$

- $F$ — radiation force density, N/m3;
- $\alpha$ — absorption coefficient, Np/m (1 dB/cm = 11.5 Np/m);
- $I$ — local intensity, W/m2;
- $c$ — sound speed, m/s;
- $\rho C_p$ — volumetric heat capacity, J/(m3 K), about $3.8\times10^{6}$ for brain;
- $dT/dt$ — heating rate before conduction and perfusion remove heat, K/s.

Take the worked protocol above, with an illustrative brain absorption of 0.3 dB/cm at 500 kHz, i.e. $\alpha \approx 3.5$ Np/m. Then at $I_{\mathrm{SPPA}} = 8.3\times10^{4}$ W/m2 the in-pulse heating rate is $2(3.5)(8.3\times10^{4})/3.8\times10^{6} \approx 0.15$ K/s, so with a 10% duty cycle the time-averaged rate is about 0.015 K/s and 40 s of sonication deposits of order 0.6 K before losses. That is small for damage and not small for physiology, which is exactly why the thermal account is live.

**From temperature to dose.** Sapareto and Dewey's reduction converts any time-temperature history to an equivalent time at 43 degrees C:

$$\mathrm{CEM43} = \sum_i t_i\,R^{(43 - T_i)},$$

- $t_i$ — time at temperature $T_i$, min;
- $T_i$ — temperature, degrees C;
- $R$ — dimensionless rate factor, with different values above and below a break near 43 degrees C;
- CEM43 — cumulative equivalent minutes at 43 degrees C, min [85].

A 0.6 K rise from 37 degrees C accumulates a CEM43 of order $10^{-4}$ min over a 40 s sonication, negligible thermally, while the same formalism at ablative exposures describes an MR-guided thalamotomy that reduced hand-tremor scores from 18.1 to 9.6 at three months against 16.0 to 15.8 after sham [85,86]. Dose, not modality, decides whether acoustic coupling is reversible modulation or a lesion.

**Bubbles.** With gas bodies present the energy pathway changes: a microbubble oscillates, radiating harmonics and ultraharmonics, and the coupling target becomes the endothelium rather than the neuron [80]. That radiated signature can define dose by response instead of applied energy — O'Reilly and Hynynen ramped pressure until ultraharmonic emissions appeared, then held it at a set fraction of that threshold, opening the barrier at 0.28 plus or minus 0.05 MPa with no detectable damage at 50% scaling [81].

## L4 — Expert

No study in this volume's corpus identifies the transducer for low-intensity ultrasound in human tissue, and four accounts remain live, each strongest in a different preparation [65,66,68,71].

The membrane-intrinsic account is Plaksin, Shoham and Kimmel's NICE model (2014): the bilayer acts as a sonophore, rectifying the wave into a capacitance change that drives displacement currents and, through Hodgkin-Huxley conductances, spiking, with no dedicated receptor. It reproduced previously published thresholds across pulsing regimes and predicted that duty cycle and intensity bias excitation against suppression, and it is a computational model throughout [65].

The protein account has heterologous and knockout support. Kubanek and colleagues (2016) modulated TREK-1, TREK-2, TRAAK and NaV1.5 currents in Xenopus oocytes reversibly by up to about 23%, abolished by ranolazine and barium respectively [67]. Zhu and colleagues (2023) found conditional Piezo1 knockout in mouse motor cortex sharply reduced ultrasound-evoked calcium responses, limb movement and EMG, with central amygdala more sensitive than motor cortex [68]. Oh and colleagues (2019) instead placed the transducer in astrocytic TRPA1, with calcium entry driving glutamate release through Best1 and NMDA-receptor activation on neighbouring neurons [69]. The two cellular assignments are in tension, because neuronal but not astrocytic Piezo1 deletion cut the amygdala response [68,69].

The force account changes the question from which channel to which force arrives: Menz and colleagues (2019) swept 0.5 to 43 MHz in ex vivo salamander retina, found responses stronger at higher frequency — the reverse of the cavitation prediction — and fitted a quantitative radiation-force model, with transducer distance mattering because standing waves shaped the stimulus [66]. The thermal account is Darrow and colleagues (2019): in rat ventral posterolateral thalamus, suppression of evoked potentials was independent of duty cycle, peak pressure and modulation frequency, tracked measured temperature, and was reproduced by heating through an optical fibre [71]. Human aggregation points the other way, with duty cycle and sonication duration predicting direction while ISPPA did not, on the authors' own account tentatively and with incomplete parameter reporting [79].

Behind all four stands the auditory confound: Guo and colleagues (2018) and Sato, Shapiro and Tsao (2018) showed widespread activation ascending through the auditory system rather than arising at the focus; Mohammadjavadi and colleagues (2019) removed the auditory response by smoothing the pulse envelope while sparing the motor response in deaf and hearing mice; and Kop and colleagues (2024), across four experiments at three institutions, found the replicable human motor inhibition was driven by peripheral auditory stimulation [74,75,76,77]. The discriminating tests are named by the papers themselves: a frequency sweep, duty cycle varied at matched temperature, and channel-specific loss of function with the field physics measured in the same preparation [65,66,68,71].

## How this volume uses it

Section 5.1 uses this page's physics to list what a pressure wave delivers — radiation force and displacement, heating, and bubble activity — and to put the skull between transducer and target as the bound on deliverable dose [66,80,85,87]. Section 5.2 sets out the four rival transduction accounts and the auditory confound that competes with all of them, and concludes that they are unresolved and that no corpus study identifies the transducer in human tissue [65,66,67,68,69,70,71,74,75,76,77]. Section 5.3 takes microbubble cavitation as a different coupling target, the endothelium, with emission-based dose control and a live dispute about whether barrier opening is itself a wounding event [80,81,83,84]. Section 5.4 uses the thermal formalism and the reversible-versus-lesion contrast [71,85,86]. Section 3.5 is the dose counterpart: free-field versus in situ parameters, the ITRUSST consensus documents treated as expert opinion rather than regulation, and the contested question of which acoustic parameter sets the direction of effect [19,20,79]. The schema requirements in sections 3.8 and 5.9 follow: acoustic parameter sets stored with pulse timing and envelope, nominal and in situ exposure as separate properties, and rival transducers as rival edges each carrying its preparation and discriminating test [20,65,66,71,76].
