# Medical sanity check: OSCE Neurology content

Date: 2026-06-06

Scope: first pass over the 15 non-imaging cases. This is an educational sanity check against the case text, internal logic, and commonly used clinical references. It is not a final clinical guideline review. The 5 imaging cases need a separate image-by-image pass because checklist correctness depends on actual CT/MRI findings.

Legend:
- OK: internally consistent for OSCE preparation.
- Warning: clinically plausible, but wording or emphasis should be tightened.
- Fix: likely wrong, internally conflicting, or too unsafe to leave as-is.

## Source anchors used

- BPPV: AAO-HNS 2017 guideline on diagnosis with positional testing and treatment with repositioning maneuvers: https://www.entnet.org/quality-practice/quality-products/clinical-practice-guidelines/bppv/
- Mini-Cog: standard 0-5 scoring and positive screen logic, summarized in Cochrane review: https://pmc.ncbi.nlm.nih.gov/articles/PMC8406662/
- Orthostatic hypotension: consensus definition, BP fall at least 20/10 mmHg within 3 minutes of standing: https://www.neurology.org/doi/10.1212/WNL.46.5.1470
- Neurosyphilis: CDC STI Treatment Guidelines, neurosyphilis regimen and tertiary syphilis manifestations including tabes dorsalis: https://www.cdc.gov/std/treatment-guidelines/neurosyphilis.htm and https://www.cdc.gov/std/treatment-guidelines/syphilis.htm
- Cauda equina: Merck Manual, saddle sensory loss, bladder/bowel dysfunction, urgent MRI and immediate surgery when sphincter dysfunction or weakness is present: https://www.merckmanuals.com/professional/neurologic-disorders/spinal-cord-disorders/cauda-equina-syndrome
- Rinne/Weber: British Society of Audiology procedure and interpretation cautions: https://www.thebsa.org.uk/wp-content/uploads/2023/10/OD104-51-BSA-Recommended-Procedure-Rinne-Weber-Tuning-Fork-Tests-February-2022.pdf
- Trigeminal neuralgia: AAN clinician summary, MRI considerations and carbamazepine/oxcarbazepine evidence: https://www.aan.com/Guidelines/home/GetGuidelineContent/303
- Cubital tunnel/ulnar neuropathy: Merck Manual and ultrasound guideline background: https://www.merckmanuals.com/en-pr/professional/musculoskeletal-and-connective-tissue-disorders/hand-disorders/cubital-tunnel-syndrome and https://pubmed.ncbi.nlm.nih.gov/34921428/
- Weber syndrome: midbrain syndrome with ipsilateral CN III palsy and contralateral hemiparesis: https://www.ncbi.nlm.nih.gov/books/NBK559158/
- Astereognosis: contralateral parietal localization with intact primary sensation: https://www.ncbi.nlm.nih.gov/books/NBK560773/
- Cerebellar vs sensory ataxia: Romberg distinction and heel-to-shin as cerebellar exam element: https://pmc.ncbi.nlm.nih.gov/articles/PMC8046926/ and https://med.stanford.edu/stanfordmedicine25/the25/cerebellar.html
- Lumbar radiculopathy: S1 posterior leg radiation and Achilles reflex association: https://www.ncbi.nlm.nih.gov/books/NBK546593/

## Executive summary

- Reviewed: 15/15 non-imaging cases.
- Highest priority fix: `hearing-rinne-weber`. The checklist currently mixes Weber lateralization to the right with a negative left Rinne, then concludes left conductive hearing loss. That is internally unstable and should become a conditional interpretation or be corrected to match the intended station result.
- Content hygiene already fixed: two stray `ок` lines were removed from `cauda-equina/original.md`.
- Good overall: BPPV, Mini-Cog, cauda equina, parietal astereognosis, cubital tunnel, Parkinson gait/Thevenard, trigeminal neuralgia, and most cerebellar/orthostatic content are broadly consistent with the station tasks.
- Main wording cleanups: Weber syndrome should say fascicular/ventral midbrain involvement rather than confidently naming the CN III nucleus; cerebellar station should promote heel-to-shin if the original task asks for it; neurosyphilis should state neurosyphilis-specific treatment pathway more explicitly.

## Case-by-case notes

| Case | Status | Sanity check |
|---|---:|---|
| `dementia-mini-cog` | OK | Mini-Cog flow and interpretation are broadly correct: 3-word recall plus clock drawing is a screen, not a final dementia diagnosis. Good that follow-up evaluation and neuroimaging are included. |
| `radiculopathy-topic` | Warning | The answer is appropriately cautious with L5/S1. If the station gives posterior leg pain and Achilles reflex loss, S1 should be emphasized; if dorsal foot/great toe findings dominate, L5 is more likely. Keep as conditional unless source text is clearer. |
| `trigeminal-neuralgia-sensory` | OK | History, trigger zones, sensory testing, MRI to exclude secondary causes, and carbamazepine/oxcarbazepine direction are consistent with standard teaching. |
| `neurosyphilis-vibration` | Warning | Posterior column/vibration loss and tabes dorsalis logic are plausible. Tactics are too soft: add that suspected neurosyphilis requires confirmatory serology/CSF pathway and CDC-style IV penicillin G regimen under specialist care. |
| `msa-orthostatic` | OK/Warning | Orthostatic hypotension criterion 20/10 mmHg within 3 minutes is correct. Consider adding supine rest before measurement and serial standing BP timing if the station allows it. |
| `bppv-dix-hallpike` | OK | Positional vertigo history, Dix-Hallpike, 45-degree head turn, eyes open, nystagmus assessment, and repositioning recommendation match guideline-level teaching. |
| `bppv-epley` | OK | Epley sequence is broadly correct for posterior canal BPPV. Current 30-second holds are acceptable for OSCE, though many descriptions use 30-60 seconds or until symptoms/nystagmus settle. |
| `hearing-rinne-weber` | Fix | Current content should not conclude straightforward left conductive hearing loss from Weber louder on the right plus negative Rinne on the left. In simple left conductive loss Weber should lateralize left. With Weber right, think left sensorineural loss, right conductive loss, mixed findings, or false-negative Rinne in severe unilateral SNHL. Make the station answer conditional or align the scripted patient responses. |
| `parkinson-gait-thevenard` | OK | Postural instability and Hoehn-Yahr stage III are consistent: bilateral disease with postural instability while still physically independent. |
| `cauda-equina` | OK | Bilateral radicular pain, weakness, hypotonia/hyporeflexia, saddle hypesthesia, bladder/bowel dysfunction, peripheral pelvic organ dysfunction, L1-S2/cauda equina level, and urgent lumbosacral MRI are consistent. Consider adding explicit emergency neurosurgical pathway. |
| `trigeminal-sensory` | OK | Sensory testing in trigeminal distribution and preliminary trigeminal neuralgia framing are reasonable. Mention that objective sensory deficit is a red flag for secondary trigeminal neuropathy/neuralgia and strengthens MRI indication. |
| `weber-syndrome` | Warning | Syndrome localization is correct: ventral midbrain/cerebral peduncle with ipsilateral CN III palsy and contralateral hemiparesis. Clean up "ураження ядра ІІІ пари": classic Weber is often fascicular CN III involvement with corticospinal tract, not necessarily a nuclear lesion. |
| `parietal-tumor-stereognosis` | OK | Astereognosis with intact primary sensation localizes to the contralateral parietal cortex. Right-hand deficit supports left parietal involvement. MRI with contrast and neuro-oncology/neurosurgery direction are appropriate. |
| `ulnar-neuropathy-cubital` | OK | Ulnar distribution symptoms, Tinel at cubital tunnel, elbow flexion provocation, atrophy check, ENMG/NCS and ultrasound direction are coherent. Conservative vs surgical escalation is reasonable. |
| `cerebellar-ataxia` | Warning | Core cerebellar interpretation is correct. Avoid calling Romberg "positive" as a cerebellar sign; cerebellar ataxia is unstable even with eyes open, while sensory ataxia worsens with eyes closed. If original task asks for heel-to-shin, add it as a first-class checklist item rather than optional text. |

## Recommended next edits

1. `site/src/content/cases/hearing-rinne-weber/checklist.md`
   - Replace the fixed diagnosis with conditional interpretation.
   - Either change scripted Weber response to "громче слева" for left conductive loss, or change Rinne interpretation to match left sensorineural loss/false-negative scenario.

2. `site/src/content/cases/weber-syndrome/checklist.md`
   - Change "ураження ядра ІІІ пари" to "ураження волокон/фасцікул III пари в середньому мозку" or "ядро-фасцікулярний комплекс" if the station expects that wording.

3. `site/src/content/cases/cerebellar-ataxia/checklist.md`
   - Add heel-to-shin as its own required step if the original task asks for it.
   - Keep Romberg interpretation explicitly framed as differentiation from sensory ataxia.

4. `site/src/content/cases/neurosyphilis-vibration/checklist.md`
   - Strengthen tactics: serologic confirmation, CSF evaluation when indicated, specialist route, and neurosyphilis-specific IV penicillin treatment concept.

5. `site/src/content/cases/cauda-equina/checklist.md`
   - Add emergency neurosurgical consultation/decompression language after MRI, because bladder/bowel dysfunction and weakness make this an urgent pathway.

## Imaging cases

These 5 cases were reviewed in the dedicated imaging pass:

- `stroke-ct-mca`
- `glioma-dislocation`
- `multiple-sclerosis-mri`
- `als-mri`
- `cervical-myelopathy-mri`

See `site/src/content/reviews/imaging-sanity-check.md` for the image-by-image sanity notes.
