import type { CaseMeta } from "./schema";
import { caseMeta as dementiaMiniCog } from "./cases/dementia-mini-cog/case";
import { caseMeta as radiculopathyTopic } from "./cases/radiculopathy-topic/case";
import { caseMeta as trigeminalNeuralgiaSensory } from "./cases/trigeminal-neuralgia-sensory/case";
import { caseMeta as neurosyphilisVibration } from "./cases/neurosyphilis-vibration/case";
import { caseMeta as msaOrthostatic } from "./cases/msa-orthostatic/case";
import { caseMeta as bppvDixHallpike } from "./cases/bppv-dix-hallpike/case";
import { caseMeta as bppvEpley } from "./cases/bppv-epley/case";
import { caseMeta as hearingRinneWeber } from "./cases/hearing-rinne-weber/case";
import { caseMeta as parkinsonGaitThevenard } from "./cases/parkinson-gait-thevenard/case";
import { caseMeta as caudaEquina } from "./cases/cauda-equina/case";
import { caseMeta as trigeminalSensory } from "./cases/trigeminal-sensory/case";
import { caseMeta as weberSyndrome } from "./cases/weber-syndrome/case";
import { caseMeta as parietalTumorStereognosis } from "./cases/parietal-tumor-stereognosis/case";
import { caseMeta as ulnarNeuropathyCubital } from "./cases/ulnar-neuropathy-cubital/case";
import { caseMeta as cerebellarAtaxia } from "./cases/cerebellar-ataxia/case";
import { caseMeta as strokeCtMca } from "./cases/stroke-ct-mca/case";
import { caseMeta as gliomaDislocation } from "./cases/glioma-dislocation/case";
import { caseMeta as multipleSclerosisMri } from "./cases/multiple-sclerosis-mri/case";
import { caseMeta as alsMri } from "./cases/als-mri/case";
import { caseMeta as cervicalMyelopathyMri } from "./cases/cervical-myelopathy-mri/case";

export const casesMeta = [
  dementiaMiniCog,
  radiculopathyTopic,
  trigeminalNeuralgiaSensory,
  neurosyphilisVibration,
  msaOrthostatic,
  bppvDixHallpike,
  bppvEpley,
  hearingRinneWeber,
  parkinsonGaitThevenard,
  caudaEquina,
  trigeminalSensory,
  weberSyndrome,
  parietalTumorStereognosis,
  ulnarNeuropathyCubital,
  cerebellarAtaxia,
  strokeCtMca,
  gliomaDislocation,
  multipleSclerosisMri,
  alsMri,
  cervicalMyelopathyMri,
] satisfies CaseMeta[];
