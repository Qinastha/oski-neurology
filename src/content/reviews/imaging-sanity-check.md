# Imaging sanity check: OSCE Neurology content

Date: 2026-06-06

Scope: first image-dependent pass over the 5 CT/MRI cases. I compared `original.md`, `checklist.md`, case metadata, and the visible scan gallery images in `site/public/cases/*/scan-*`. This is an educational sanity check, not a radiology report.

Legend:
- OK: internally consistent and visible/supportable from the case.
- Warning: mostly correct, but one or more findings should be framed as inferred, conditional, or supportive.
- Fix applied: content was adjusted in this pass.

## Source anchors used

- Acute stroke imaging: https://www.ncbi.nlm.nih.gov/books/NBK546635/ and https://www.merckmanuals.com/en-ca/professional/neurologic-disorders/stroke/ischemic-stroke
- Alteplase/warfarin INR threshold: https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2016/01/15/14/35/Scientific-Rationale-for-the-Inclusion-and-Exclusion-Criteria and https://pmc.ncbi.nlm.nih.gov/articles/PMC7995316/
- Glioblastoma/high-grade glioma MRI pattern: https://www.ncbi.nlm.nih.gov/books/NBK558954/
- MS MRI lesion assessment and MAGNIMS/McDonald logic: https://pmc.ncbi.nlm.nih.gov/articles/PMC6598631/ and https://pmc.ncbi.nlm.nih.gov/articles/PMC4760851/
- ALS neuroimaging limitations: https://pmc.ncbi.nlm.nih.gov/articles/PMC3075738/ and https://pmc.ncbi.nlm.nih.gov/articles/PMC3080036/
- Degenerative cervical myelopathy: https://www.aafp.org/afp/2020/1215/p740 and https://journals.sagepub.com/doi/pdf/10.1177/2192568217701914

## Executive summary

- Reviewed: 5/5 imaging cases.
- No major diagnosis-to-case mismatch found.
- Fixes applied:
  - Removed stray `Ok` from `multiple-sclerosis-mri/original.md`.
  - Added the INR <= 1,7 threshold for thrombolysis in `stroke-ct-mca/checklist.md`.
  - Changed ALS "специфический учебный признак" to "учебный поддерживающий признак" and clarified that it is not an independent diagnostic criterion.
- Main remaining caution: several imaging findings are visible only as teaching screenshot/caption context, not as full DICOM-quality evidence. The UI should keep captions, but answers should distinguish visible findings from case-provided/inferred findings.

## Case-by-case notes

| Case | Status | Image/text sanity check |
|---|---:|---|
| `stroke-ct-mca` | OK, fix applied | Clinical syndrome strongly supports left MCA stroke: right hemiparesis + expressive speech impairment. CT screenshots show early ischemic signs matching the station: hyperdense MCA, loss of gray-white differentiation/insular ribbon, sulcal effacement. Checklist correctly asks for noncontrast CT, ECG, glucose, INR, CTA if available, reperfusion pathway, stroke unit admission. Added INR <= 1,7 threshold for thrombolysis in a warfarin patient. |
| `glioma-dislocation` | OK/Warning | Images show a large supratentorial intra-axial mass with perifocal edema, heterogeneous/ring enhancement, mass effect and midline/ventricular distortion. This supports high-grade glioma as a preliminary imaging diagnosis. Checklist correctly avoids final histology without tissue. Hemorrhage should be described as present if supported by SWI/T2*/source frame; from these screenshots alone it is partly caption/source-driven. |
| `multiple-sclerosis-mri` | OK/Warning | Visible T2 axial images show multiple hyperintense white-matter lesions, including periventricular/callosal-looking lesions, consistent with demyelinating disease in the clinical context. Original task states spinal cord involvement, but the gallery only shows brain slices, so spinal cord lesions should be phrased as "по условию задачи" unless spinal images are added. DIT is supported by relapsing history; MRI-only DIT would need enhancing/nonenhancing lesions or interval new lesions. Current checklist already states this caveat. |
| `als-mri` | Warning, fix applied | The case has a progressive UMN-predominant syndrome with bulbar/pseudobulbar features and asks for neuroimaging. MRI signs of corticospinal tract hyperintensity / "wine glass" can be useful teaching clues, but ALS is not diagnosed by MRI alone; MRI mainly excludes mimics and provides supportive evidence. Checklist already says ENMG and LMN signs are needed; wording was tightened so the "wine glass" sign is supportive, not specific/diagnostic. |
| `cervical-myelopathy-mri` | OK/Warning | Sagittal and axial cervical MRI screenshots support degenerative canal stenosis with cord compression; T2 cord signal/myelomalacia language is plausible from the displayed educational frames. Clinical task fits cervical myelopathy with hand dysfunction, gait/balance impairment, UMN signs and possible radicular/segmental arm component. Checklist correctly requests cervical MRI and urgent neurosurgical evaluation. Keep the C5-C6 disc vs C7 cord-segment wording as a teaching caveat, not a literal one-to-one level statement. |

## Recommended next edits

1. `glioma-dislocation`
   - If we want maximal rigor, add a phrase: "кровоизлияние указать по SWI/T2* или по предоставленному источнику; на текущих обзорных скриншотах не переоценивать как самостоятельный видимый факт."

2. `multiple-sclerosis-mri`
   - Consider adding spinal cord scan images if available, because the original task explicitly says there are spinal cord lesions.
   - Keep DIT phrased via relapsing history or dynamic/contrast MRI, not as proven from the two current axial T2 frames alone.

3. `als-mri`
   - If this station is meant to teach ALS diagnosis, consider adding a short checklist line that formal diagnosis relies on clinical UMN/LMN signs, EMG, progression, and exclusion of mimics, not MRI signs alone.

4. `cervical-myelopathy-mri`
   - Keep explicit neurosurgical urgency because clinical myelopathy plus cord compression should not be treated as ordinary neck pain/radiculopathy.

## Visual evidence inventory

- `stroke-ct-mca`: 3 CT screenshots reviewed.
- `glioma-dislocation`: 4 MRI screenshots reviewed.
- `multiple-sclerosis-mri`: 2 MRI screenshots reviewed.
- `als-mri`: 3 MRI screenshots reviewed.
- `cervical-myelopathy-mri`: 6 cervical MRI screenshots reviewed.
