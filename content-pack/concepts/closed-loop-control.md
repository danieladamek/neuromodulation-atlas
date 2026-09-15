---
id: closed-loop-control
title: Closed-loop control
one_liner: "When delivery depends on a measured state, the intervention becomes a control loop and dose stops being a setting in a table."
why_here: "Sections 8.3 and 13.4 treat adaptive stimulation as a change in what dose means; this page supplies the control-theory and biomarker background those sections assume."
prerequisites: [dose-and-parameter-sets, oscillations-and-entrainment, metaplasticity-and-state-dependence]
terms: [closed-loop-stimulation, adaptive-dbs, biomarker, beta-burst, local-field-potential, phase-triggered-stimulation, mu-rhythm, state-dependence, dose-parameter-set, ultraharmonic-emission]
figures: []
further_reading:
  - { title: "Advances in closed-loop deep brain stimulation devices (Parastarfeizabadi & Kouzani, J NeuroEng Rehabil 2017)", url: "https://link.springer.com/article/10.1186/s12984-017-0295-1", kind: review }
  - { title: "Closed-loop neuroscience and non-invasive brain stimulation: a tale of two loops (Zrenner et al., Front Cell Neurosci 2016)", url: "https://www.frontiersin.org/journals/cellular-neuroscience/articles/10.3389/fncel.2016.00092/full", kind: review }
  - { title: "Chronic adaptive deep brain stimulation versus conventional stimulation in Parkinson's disease (Oehrn et al., Nat Med 2024)", url: "https://www.nature.com/articles/s41591-024-03196-z", kind: review }
self_check:
  - q: "In the eight-patient adaptive DBS study, what showed that the benefit came from timing rather than from stimulating less?"
    options: ["Continuous stimulation at half amplitude matched adaptive stimulation", "Random intermittent stimulation did not match adaptive stimulation", "Blinded raters could not tell the conditions apart", "Total stimulation time was unchanged"]
    answer: 1
    explanation: "Beta-triggered stimulation improved blinded motor scores about 27% more than continuous stimulation with 56% less stimulation time, and random intermittent stimulation did not reproduce it — locating the benefit in when current flowed."
  - q: "Why is a stimulation-entrained gamma oscillation a peculiar control variable?"
    options: ["It cannot be recorded from an implanted lead", "It exists only while stimulation is on, so the controller partly produces its own input", "It is identical across patients", "It is measured in millivolts per millimetre"]
    answer: 1
    explanation: "The chronic adaptive trial used stimulation-entrained gamma in STN or motor cortex as the per-patient marker; such a signal is partly produced by the intervention it governs, so the biomarker is not a neutral observer."
  - q: "What happened to delivered charge when beta-triggered adaptive DBS improved motor scores?"
    options: ["It rose in proportion to the improvement", "It stayed fixed by design", "It fell by more than half", "It was not measurable"]
    answer: 2
    explanation: "Stimulation time fell by 56% while blinded motor scores improved, which is why the volume says intensity stops indexing dose once the loop is closed."
  - q: "In the feedback-controlled ultrasound protocol for barrier opening, what was the controlled signal?"
    options: ["Measured tissue temperature", "Ultraharmonic acoustic emissions from microbubbles detected by a hydrophone", "Cortical EEG power", "Injected microbubble concentration"]
    answer: 1
    explanation: "Pressure was ramped until ultraharmonic emissions appeared, then held at a set fraction of that threshold; at 50% the barrier opened with no detectable damage, and higher fractions caused gross damage."
  - q: "What does a closed loop do to the idea of a fixed dose?"
    options: ["Nothing: the parameter set is just recorded at the start", "Delivered parameters become a distribution over states, set per site or per patient", "Dose becomes irrelevant because the device self-limits", "Dose can be replaced by the control law's gain alone"]
    answer: 1
    explanation: "Because the threshold or marker is chosen per site or per patient and delivery depends on the measured state, the delivered parameters form a distribution rather than a setting in a protocol table."
---

## What it is

An open-loop intervention delivers what the protocol says, whatever the nervous system is doing: 10 Hz for 20 minutes, 130 Hz continuously, 20 mg orally. A closed-loop intervention measures something first, decides from that measurement whether and how to deliver, and repeats. The measured quantity is called the control variable or biomarker; the rule mapping it to delivery is the control law; and the loop runs at whatever rate the actuator and the estimator allow — milliseconds for phase-triggered TMS, seconds for a symptom-driven adjustment.

Feedback entered this field first as a safety device rather than a therapy. In acoustic blood-brain barrier opening, a hydrophone listens for the ultraharmonic emissions that mark the onset of unstable microbubble behaviour, pressure is ramped until they appear, and then held at a fixed fraction of that per-animal threshold — 50% opened the barrier with no detectable damage, while higher fractions caused gross damage [81]. Nothing about the therapy changed; what changed was that the delivered pressure became a function of a measurement in that animal.

In the brain the control variable is neural. Subthalamic beta-band local field potentials recorded from the stimulating electrode gated deep brain stimulation in eight patients with advanced Parkinson's disease, so current flowed only when a pathological beta burst crossed threshold: blinded motor scores improved 50%, about 27% better than conventional continuous stimulation, while total stimulation time fell 56%, and random intermittent stimulation did not match it [135]. A later blinded randomised cross-over feasibility trial in four patients ran adaptive stimulation chronically at home, using stimulation-entrained gamma oscillations in subthalamic nucleus or motor cortex — chosen per patient — as the marker of dopaminergic state [136].

Non-invasively the equivalent is phase-triggered stimulation, and its record includes a null. Identical triple-pulse TMS bursts locked by real-time EEG to the high-excitability negative peak of the sensorimotor mu rhythm produced LTP-like potentiation of motor evoked potentials, while the same bursts locked to the positive peak produced no change [137]; a companion study triggering burst rTMS on mu phase found no change in resting EEG or TMS-EEG excitability measures at all [213].

## L1 — Intuition

A thermostat does not heat a house for twenty minutes because the manual says so. It measures the temperature, switches the boiler on if the house is too cold, and switches it off when it is not. The boiler's total run time is no longer something you set; it is something that comes out of the weather, the insulation and where you put the dial.

Closed-loop neuromodulation is the same move. Instead of running stimulation continuously, a device watches a signal from the brain and stimulates only when that signal says the moment is right — during a pathological rhythm burst, say, or at a particular point in an ongoing brain wave. In Parkinson's disease this has been done with an implanted electrode listening to the very nucleus it stimulates: patients did better on blinded motor ratings while the device delivered roughly half as much stimulation.

Two things follow. The first is that you can no longer say what dose someone received by reading the protocol; you have to read the log of what the device did, which depends on that person's brain. Two patients on identical settings can receive very different amounts.

The second is that the signal being watched is not an innocent bystander. If the marker a device triggers on is itself produced by the stimulation — a rhythm that only exists while the device is running — then the observer and the intervention are tangled together, and "what was measured" needs stating as carefully as "what was delivered".

## L2 — Undergraduate

A control loop has four parts: a sensor, a state estimator, a control law and an actuator. In adaptive DBS the sensor is the implanted lead, the estimate is band-limited power (beta, roughly 13–30 Hz) computed over a short window, the control law is a threshold with hysteresis, and the actuator is the pulse generator whose amplitude ramps up when the estimate crosses the threshold and down when it falls back [135]. In phase-triggered TMS the sensor is scalp EEG, the estimate is the instantaneous phase of the mu rhythm, the control law is "fire when the predicted phase equals the target phase", and the actuator is the stimulator, with the whole loop closing in a few milliseconds [137].

Three design choices then determine everything. *Which variable*: endogenous beta bursts [135], stimulation-entrained gamma [136], acoustic emissions from microbubbles [81], or the phase of an ongoing cortical rhythm [137]. *Which rule*: threshold gating, proportional control on the error between estimate and set point, or trigger-on-event. *Which per-subject calibration*: the barrier-opening protocol set pressure as a fraction of each animal's own emission threshold [81]; the chronic trial selected a different marker for each patient [136].

The reason to bother is that efficacy is a joint function of drive and ongoing state, not of drive alone (section 8.1). If phase or burst state gates the effect, then delivering at the wrong moment is wasted or counterproductive, and a controller that only delivers at the right moment should do more with less. That is what was observed: less stimulation time, better blinded scores, and no equivalent benefit from random intermittency [135].

**Worked example.** Take a device sampling local field potentials at 1 kHz. It filters 13–30 Hz, squares and smooths over a 200 ms window to give an estimate $\hat s_t$, and compares it with a threshold $\theta$ set at, say, the 60th percentile of that patient's overnight distribution. When $\hat s_t > \theta$, amplitude ramps to the therapeutic value over 250 ms; when it drops below, it ramps down. If beta bursts occupy 40% of the patient's day, the device delivers roughly 40% of the charge of continuous stimulation. Change $\theta$ to the 30th percentile and delivered charge nearly doubles without touching amplitude or frequency — which is why, in a closed loop, the threshold rule is a dose parameter.

## L3 — Graduate

Write the controlled system in discrete time. Let $x_t$ be the (unobserved) neural state, $y_t$ the measurement, $u_t$ the actuation and $\hat x_t$ the estimate:

$$ \hat x_t = h(y_{t-\tau_1}, \dots, y_{t-\tau_1-W}), \qquad u_t = g(\hat x_t; \theta), \qquad x_{t+1} = F(x_t, u_{t-\tau_2}) + \varepsilon_t $$

- $x_t$ — state of the target circuit at step $t$ (e.g. burst amplitude, oscillation phase); units depend on the variable;
- $y_t$ — measurement, e.g. local field potential in µV or EEG in µV;
- $\hat x_t$ — state estimate produced by the estimator $h$ from a window of $W$ past samples;
- $\tau_1$ — sensing and computation latency, in ms (a few ms for real-time EEG phase estimation, tens of ms for smoothed band power);
- $u_t$ — actuation, e.g. stimulation amplitude in mA or acoustic pressure in MPa;
- $g$ — control law with parameters $\theta$ (threshold, gain, target phase);
- $\tau_2$ — actuation and physiological delay, in ms;
- $F$ — the system's state transition, unknown and nonlinear;
- $\varepsilon_t$ — state noise.

Three control laws cover the published devices. Threshold gating, $u_t = u_{\max}\,\mathbb{1}[\hat s_t > \theta]$, where $\hat s_t$ is estimated band power (µV²) — the beta-triggered DBS case [135]. Proportional control, $u_t = \min(u_{\max}, K(\hat s_t - \theta)_+)$, with gain $K$ in mA/µV². Event triggering, $u_t = u_{\max}\,\mathbb{1}[\hat\phi_t \approx \phi^{*}]$, where $\hat\phi_t$ is estimated phase in radians and $\phi^{*}$ the target phase — the mu-rhythm TMS case [137]. The safety analogue holds pressure at a fraction $\alpha$ of a measured per-subject threshold, $u = \alpha \, p_{\mathrm{th}}$, with $\alpha = 0.5$ opening the barrier without detectable damage [81].

Now ask what "dose" means. For an open-loop protocol, the delivered quantity is a product of settings: charge per session $Q = I \cdot t_p \cdot f \cdot T_{\mathrm{sess}}$, with $I$ the current in A, $t_p$ the pulse width in s, $f$ the pulse frequency in Hz and $T_{\mathrm{sess}}$ the session duration in s. Closing the loop replaces the deterministic product with a functional of the state trajectory:

$$ Q = \int_{0}^{T} u(t)\,t_p f \, \mathrm{d}t \;=\; u_{\max} t_p f \int_0^T \mathbb{1}[\hat s(t) > \theta]\,\mathrm{d}t \;=\; u_{\max} t_p f\, T \, \Pr\!\left[\hat s > \theta\right] $$

- $Q$ — delivered charge in coulombs;
- $T$ — wall-clock duration of the epoch in s;
- $\Pr[\hat s > \theta]$ — the fraction of time the estimate exceeds threshold: a property of the patient's own signal statistics, not of the protocol.

So the delivered dose is $u_{\max} t_p f T$ multiplied by an occupancy term that belongs to the patient. Two patients with identical device settings differ in $Q$ by the ratio of their burst occupancies, and the same patient differs between days. This is the volume's claim that intensity stops indexing dose [135]: charge fell 56% while effect rose [135], so any dose–response relation built from $u_{\max}$ alone is misspecified. What must be recorded instead is the control variable, the threshold rule, and the *distribution* of delivered parameters over states [81,135,136].

Two further consequences are structural. First, latency is a dose parameter: with a state that decorrelates on the timescale of one oscillation cycle, an estimator delay $\tau_1$ comparable to a quarter cycle turns phase-locked delivery into phase-random delivery, so the same nominal control law delivers a different intervention on different hardware. Second, the estimator is not independent of the actuator when the marker is stimulation-entrained [136]: then $y_t$ depends on $u_{t-\tau_2}$ directly, the loop is no longer estimating an endogenous state, and an outcome cannot be attributed to tracking a pathological signal without a separate argument.

## L4 — Expert

What is contested here is not whether feedback works but what it is tracking, and whether the readout used to validate it generalises. The beta-burst account rests on eight patients (Little and colleagues, 2013) with blinded motor scoring and the informative control of random intermittent stimulation [135]; the chronic result rests on four patients (Oehrn and colleagues, 2024) whose control signal was a per-patient stimulation-entrained gamma oscillation [136]. Both are small, single-centre and in Parkinson's disease, and neither establishes that closed-loop delivery is superior in indications where no equally proximate biomarker exists.

Non-invasively the dispute is sharper. Zrenner and colleagues (2018) report phase-dependent LTP-like potentiation of the motor evoked potential, with no matching change in TMS-EEG measures [137]; Desideri and colleagues (2018) find nil effects of mu-phase-triggered burst rTMS on resting EEG and TMS-EEG excitability and conclude that EEG measures do not track corticospinal excitability [213]. The volume treats this as unresolved and readout-dependent, with thin cross-laboratory replication [137,213]. The discriminating experiment is explicit: the same protocol scored on MEP and EEG readouts in one sample [213].

Three assumptions are fragile in specific regimes. *That the biomarker indexes the pathology.* A control signal that exists only during stimulation is partly the intervention's own product [136], and proxies one level removed can be weak: pupil diameter rises monotonically with locus coeruleus spike count in mice yet predicts only a small fraction of moment-to-moment activity and is itself state-dependent (Megemont and colleagues) [144]. *That the loop is fast enough.* Phase-locked protocols assume the estimated phase still holds when the pulse lands, which fails as the target rhythm becomes less stationary. *That more feedback is better.* Feedback control can entrain the controlled system at the loop's own resonance, and the volume's own evidence that timing rather than intermittency carries the benefit [135] is the only strong exclusion of a trivial alternative on offer.

Measurements that would settle the open questions: multicentre, adequately powered adaptive-versus-continuous trials with pre-registered control variables; simultaneous MEP and EEG readouts under identical phase-triggered protocols [137,213]; and, for any adaptive device, publication of the delivered-parameter distribution rather than the nominal settings, so that dose–response can be estimated from what was delivered [81,135,136].

## How this volume uses it

Section 8.3 introduces biomarkers and closed-loop control as the circuit-level consequence of state dependence, with the beta-triggered [135] and chronic gamma-triggered [136] results and the non-invasive phase-triggered pair [137,213]. Section 13.4 is the load-bearing use: it argues that two things about dose change once the drive depends on the state it modulates — delivered charge falls as effect rises, so intensity stops indexing dose, and the delivered parameters become a distribution over states rather than a row in a protocol table [81,135,136]. Section 12.1 uses the same material to ask, of any paper, whether brain state was controlled or merely recorded.

Section 15 turns this into a schema requirement: each dose node records whether its parameters were fixed or feedback-controlled, and if controlled, the control variable, the threshold rule, whether the variable was endogenous or stimulation-entrained, and the delivered distribution rather than a single value.
