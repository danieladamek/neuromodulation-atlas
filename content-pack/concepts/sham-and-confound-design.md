---
id: sham-and-confound-design
title: Sham and confound design
one_liner: "Why a control condition is a procedure with its own effects, and how a side channel can produce the whole result you wanted to attribute to the brain."
why_here: "Section 12 is written as a checklist for reading a stimulation paper, and section 15 makes confounds nodes in the graph; this page supplies the design background both take for granted."
prerequisites: []
terms: [sham, blinding, expectancy, active-placebo, co-stimulation, auditory-confound, peripheral-route, proxy, readout, reporting-checklist]
figures: []
further_reading:
  - { title: "Rethinking the role of sham TMS (Duecker & Sack, Front Psychol 2015)", url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.00210/full", kind: review }
  - { title: "Inferring causality from noninvasive brain stimulation in cognitive neuroscience (Bergmann & Hartwigsen, J Cogn Neurosci 2021)", url: "https://direct.mit.edu/jocn/article/33/2/195/95534/Inferring-Causality-from-Noninvasive-Brain", kind: review }
  - { title: "Auditory confounds can drive online effects of transcranial ultrasonic stimulation in humans (Kop et al., eLife 2024)", url: "https://elifesciences.org/articles/88762", kind: review }
  - { title: "Report Approval for Transcranial Electrical Stimulation (RATES) (Nature Protocols 2026)", url: "https://www.nature.com/articles/s41596-025-01259-0", kind: review }
self_check:
  - q: "Why does the volume treat the choice of sham tDCS protocol as a source of irreproducibility?"
    options: ["Because shams differ in cost", "Because different sham procedures deliver different things and some may not be physiologically inert", "Because sham tDCS is always more uncomfortable than active", "Because sham protocols are never reported"]
    answer: 1
    explanation: "Sham tDCS protocols in use differ in more than sensation, so some may have biological effects of their own; whether short ramp-only shams are inert remains contested."
  - q: "What is the methodological complaint against judging blinding from end-of-study allocation guesses?"
    options: ["Guesses are never collected", "End-of-study checks can overestimate masking, while checks during stimulation reveal perceptual differences", "Guesses are only valid in drug trials", "They require an active placebo"]
    answer: 1
    explanation: "A meta-analysis of seven sham-controlled rTMS depression trials judged blinding adequate from guesses, but the review disputes the method: in-session checks reveal differences that end-of-study checks miss."
  - q: "In the multi-experiment human ultrasound work, what did manipulating intensity, duration and auditory masking show?"
    options: ["The motor inhibition was a direct ultrasonic effect", "The motor inhibition was driven by peripheral auditory stimulation", "Ultrasound had no measurable effect at all", "The effect depended only on skull thickness"]
    answer: 1
    explanation: "Across four experiments at three institutions, one preregistered, the reported motor inhibition replicated but was driven by peripheral auditory stimulation, so earlier flip-over-sham work needs reinterpretation."
  - q: "Why is a sham alone insufficient as a control, on the volume's account?"
    options: ["Because sham is unethical", "Because sham controls sensation but not site or timing, so active controls at another site or time are also needed", "Because sham cannot be blinded", "Because sham effects are always larger than active effects"]
    answer: 1
    explanation: "Sham TMS can have specific behavioural effects of its own and controls only the sensory and placebo channel; specificity claims need active control conditions at a different site or time."
  - q: "What is an active placebo, as used in a psychedelic trial cited by the volume?"
    options: ["A lower dose of the same drug", "An inert capsule with matched appearance", "A different compound producing noticeable effects without the hypothesised mechanism, such as 100 mg niacin", "A sham device"]
    answer: 2
    explanation: "Because the acute effects of psychedelics are unmistakable, one trial used 100 mg niacin, which produces a noticeable bodily sensation, as an active comparator."
---

## What it is

A confound is a rival explanation that the design has not excluded. In neuromodulation the rivals are unusually concrete, because every non-invasive drive stimulates more than its target: a coil discharge is a loud click and a scalp twitch, a scalp current is felt on the skin and can excite peripheral nerves, an ultrasound pulse with sharp edges is audible, and a drug with an unmistakable subjective effect tells the participant which arm they are in.

A sham is the standard response: a procedure meant to reproduce everything except the hypothesised active ingredient. The crucial point the volume insists on is that a sham is a *procedure*, not the absence of one, and different sham procedures deliver different things. Sham tDCS protocols in use differ in more than sensation, so some may have biological effects of their own, which makes the choice of sham a source of irreproducibility [195]; a review of protocols from 2010 to 2024 says the same of ramp-only shams, which may be neither physiologically inert nor perceptually convincing during the session [196]. Sham TMS can have specific behavioural effects of its own, which is why it belongs alongside active controls at another site or time rather than instead of them [198].

Confounds in this field are therefore usually *co-stimulation*: a side channel that carries the drive to the outcome without passing through the intended mechanism. Bergmann and Hartwigsen lay out the causal chain a stimulation study claims — induced field, local effect, network spread, behaviour — and list the confounds that weaken the claim at each step [199]. The TMS consensus states that TMS causes substantial somatosensory and auditory co-stimulation that must be controlled for [41].

The question is never whether the side channel exists but whether it alone produces the headline effect, and for several modalities that question is currently open (sections 12.3, 14.4). The design answer is symmetrical in both directions: block or match the peripheral input and see what survives.

## L1 — Intuition

Suppose you want to know whether a bell makes dogs salivate, but every time you ring the bell you also happen to open the fridge. The dogs might be responding to the bell, or to the fridge. The fix is not to argue about it: it is to open the fridge without the bell, and ring the bell without the fridge.

Brain stimulation always opens the fridge. A magnetic pulse clicks loudly and makes the scalp twitch. Electrical stimulation tingles and can stimulate nerves in the skin. Ultrasound, if its pulses have sharp edges, is heard — and in careful human experiments the "brain" effect of ultrasound on motor responses turned out to be driven by that sound rather than by the ultrasound reaching the brain.

So researchers use a sham: a fake version that looks, sounds and feels the same but is meant to do nothing. The trouble is that the fake version is also a real procedure. A sham that ramps current briefly still passes current. A sham coil still clicks. And participants are not passive: if they can tell which condition they are in, their expectations become part of the result, which is a serious problem with drugs whose effects are unmistakable.

The practical upshot is a habit of mind. For any claim that stimulation did something, ask what else the stimulator did at the same time, whether the control reproduced it, and whether anyone checked — during the session, not months later — that participants could not tell the difference.

## L2 — Undergraduate

Three control problems have to be handled separately, and a single sham addresses only the first two.

**Sensation and expectancy.** The sham must match the percept and the ritual. Its inadequacy is measurable: in a meta-analysis of 7 sham-controlled rTMS trials for depression (n = 489) participants' guesses about allocation did not differ between arms, and blinding was judged adequate [197] — but that inference is disputed, because end-of-study checks overestimate masking while in-session checks reveal perceptual differences [196]. In pharmacology the problem is worse: a systematic search of psychedelic and ketamine trials from 1990 to November 2020 found that they generally reported neither pre-trial expectancy nor blinding success, and the authors argue participants are effectively unblinded and effect sizes are likely overestimates [178]. One response is an active placebo, such as 100 mg niacin [177].

**Co-stimulation.** Here the control must block or match a specific side channel. Ultrasound and hearing is the worked case, and it is contested. In guinea pigs, widespread activation by transcranial ultrasound disappeared when the auditory nerves were cut or cochlear fluid removed [74]; in mice, ultrasound-evoked cortical activity resembled the response to audible sound and chemical deafening reduced both [75]. The rebuttal, also in mice, showed that smoothing the pulse envelope removed the auditory brainstem response while leaving the motor response intact, and that genetically deaf mice responded like hearing mice — on that account the confound is an engineerable pulse-edge transient [76]. The strongest human evidence points the other way: four experiments at three institutions, one preregistered, found that ultrasound-induced motor inhibition was driven by peripheral auditory stimulation [77], and a preregistered follow-up characterised and mitigated a second, somatosensory channel [78]. For tACS, anaesthetising the skin reduced tremor entrainment in humans and peripheral nerve stimulation alone reproduced the motor effects [54], while macaque neurons stayed entrained after topical anaesthesia [55] — results that need not conflict.

**Specificity of site and timing.** No sham addresses this. Active control conditions — the same protocol at a different site, or at a different time relative to the task — are what distinguish "this region at this moment" from "any stimulation at all" [198,199].

**Worked example.** A study reports that ultrasound over motor cortex reduces MEP amplitude, using a transducer-flipped sham. Checklist: acoustically matched sham rather than flipped or off, ramped pulse envelope, auditory masking, measured scalp sensation, active control at another site [76,77,78]. With a flipped sham only, the auditory channel is unmatched and the inference is unresolved.

## L3 — Graduate

Write an observed response in an arm as an additive decomposition:

$$ R_{\mathrm{active}} = T + S + P + \eta, \qquad R_{\mathrm{sham}} = S' + P' + \eta' $$

- $R$ — the measured readout in its own units (MEP amplitude in mV, symptom score in points);
- $T$ — the transcranial or target-mediated effect, the quantity of interest;
- $S$ — the side-channel (co-stimulation) contribution: auditory, somatosensory, nociceptive, peripheral-nerve;
- $P$ — the placebo/expectancy contribution, including any effect of believing one is in the active arm;
- $\eta$ — noise, assumed zero-mean;
- primes denote the sham arm's counterparts.

The difference $\Delta = \mathbb{E}[R_{\mathrm{active}}] - \mathbb{E}[R_{\mathrm{sham}}] = T + (S - S') + (P - P')$ estimates $T$ only under two assumptions: sensory matching, $S' = S$, and blinding, $P' = P$. Every result in section 12 is an attack on one of those equalities. A flip-over ultrasound sham leaves $S' \ne S$ in the auditory channel, and the measured $\Delta$ then contains $S - S'$ rather than $T$ [77]. A sham that participants can identify leaves $P' \ne P$, and the residual is expectancy [178]. A sham that is not physiologically inert makes $S'$ contain a real biological term, so $\Delta$ underestimates or distorts $T$ [195,196].

Blinding adequacy is quantified from allocation guesses. With $n_a$ participants in the active arm, of whom $c_a$ guess active and $w_a$ guess sham, Bang's blinding index for that arm is

$$ \mathrm{BI}_a = \frac{c_a - w_a}{n_a} $$

- $\mathrm{BI}_a$ — blinding index, dimensionless, on $[-1, 1]$;
- $c_a$ — number guessing correctly; $w_a$ — number guessing incorrectly; participants answering "don't know" count in $n_a$ but in neither $c_a$ nor $w_a$;
- $n_a$ — arm size.

$\mathrm{BI} = 0$ is random guessing (blinding preserved), $+1$ complete unblinding, negative values opposite guessing. Two properties matter. First, the index is a group statistic with sampling error of order $n_a^{-1/2}$, so an underpowered trial cannot detect moderate unblinding — the rTMS meta-analysis's null on guesses (n = 489 across 7 trials) is consistent with real but modest unmasking [197]. Second, *when* it is measured changes what it measures: an index computed at the end of a multi-week course reflects outcome-informed inference, while one computed during a session reflects perception, and the two dissociate [196].

Expectancy is better modelled multiplicatively than additively when it acts on a subjective endpoint: $R = (T + S)(1 + \beta E)$, with $E$ the participant's expectancy score and $\beta$ its sensitivity, because a participant who knows they received an active psychedelic dose amplifies whatever they would have reported. Unmeasured $E$ then biases $\Delta$ upward in proportion to the arm difference in $E$ — the mechanism the psychedelic-blinding critique invokes for inflated effect sizes [178].

Finally, the subtraction logic can fail even when both assumptions nearly hold, because readouts are not neutral. A realistic sham mimicking the sound and scalp sensation of TMS evoked EEG responses closely resembling those to real TMS at early and late latencies despite masking and padding [202]; with an optimised sham, noise masking, a second coil stacked on the real one and electrical scalp stimulation, subtraction left early TEP components and beta-band responses only with real TMS [203]. Whether a sham can match real TMS closely enough for subtraction to be valid is the dispute itself [202,203]. Where subtraction is untrustworthy, the alternatives are engineering the channel away (smoothing the ultrasound envelope [76], avoiding near-field scalp intensity peaks [78]) or abolishing it physiologically (deafened animals [74,76], anaesthetised skin [54,55]).

## L4 — Expert

Four disputes here are live in the volume's own terms. *Is short-ramp sham tDCS inert?* Fonteneau and colleagues (2019) argue sham protocols differ in more than sensation and may carry biological effects [195]; Ljubisavljevic and colleagues (2026) extend the charge to ramp-only shams and propose a specification-grade checklist [196]. *How much of a TMS-evoked potential is transcranial?* Conde and colleagues (2019) obtained sham responses closely resembling real TMS [202]; Gordon and colleagues (2021) recovered real-TMS-specific early components with a heavily optimised sham [203], and the 2023 TMS-EEG consensus still lists peripheral sensory contamination as open [201]. *Do human ultrasound effects survive auditory control?* Kop and colleagues (2024) attribute online motor inhibition to the auditory confound across four experiments [77]; Mohammadjavadi and colleagues (2019) show in mice that envelope smoothing removes the auditory response while the motor response persists [76]. *Are tACS motor effects peripheral?* Asamoah and colleagues (2019) reproduce them by peripheral nerve stimulation and reduce them with skin anaesthesia [54]; Vieira and colleagues (2020) retain macaque neuronal entrainment under topical anaesthesia [55].

Two structural weaknesses cut across all four. The first is that blinding evidence is almost always the wrong measurement: guess questionnaires administered at the end of a trial, analysed as a group statistic, in samples powered for efficacy rather than for detecting unmasking [196,197]. The second is that what checklists cannot force stays unreported: in-session blinding checks [196], expectancy in drug trials [178], scalp and auditory sensation in ultrasound [77,78], thermal measurement [71], and documentation of practices researchers say they follow [206]. Reporting standards exist — a tDCS consensus checklist [192], RATES with 66 items and a 26-item essential subset [193], ContES for concurrent tES-fMRI, against which 57 published studies met about 53% of items [194] — and the compliance number is the relevant one.

The measurements that would settle these are specified and cheap relative to the trials themselves: blinding probed during stimulation, before outcomes are known, reported alongside end-of-study guesses [196,197]; acoustically matched shams with measured envelopes plus masking, with scalp sensation quantified [77,78]; and, for any subtraction-based readout, a multisensory sham whose adequacy is demonstrated in the same sample rather than assumed [202,203].

## How this volume uses it

Section 12 is built on this page. 12.1 sets out the anatomy of a stimulation experiment and where degrees of freedom hide [199]; 12.2 treats sham and blinding as procedures with their own properties [195–198]; 12.3 catalogues co-stimulation as a rival explanation and gives the ultrasound-auditory and tACS-skin cases with their rebuttals [54,55,74–78]; 12.4 asks how far a readout is from the claim [201–203]; 12.5 makes target engagement a precondition for reading an efficacy null [199]. Sections 14.4 and 14.8 state the ultrasound-confound and tDCS-after-effect disputes formally, and section 13 uses unblinding as one of the reasons published effects are expected to shrink as controls tighten [178,206,207].

Section 15 encodes the argument: every claim edge carries its confound controls — sham type, when blinding was checked, sensory matching, whether engagement was shown — a confound is a node with `threatens` edges to the claims it endangers and counter-edges for rebuttals, and a claim from an unblinded or sham-inadequate study carries a flag so it is never silently merged with a controlled one.
