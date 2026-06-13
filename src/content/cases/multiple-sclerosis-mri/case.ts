import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-18",
  "slug": "multiple-sclerosis-mri",
  "order": 18,
  "title": "Розсіяний склероз. МРТ",
  "focus": "Розсіяний склероз: множинні T2/FLAIR-вогнища, перивентрикулярна і мозолиста локалізація.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12417@2025-04-29T111704.pdf",
    "href": "/cases/multiple-sclerosis-mri/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/multiple-sclerosis-mri/original-01.png",
      "alt": "Оригінальне завдання multiple-sclerosis-mri, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/multiple-sclerosis-mri/original-02.png",
      "alt": "Оригінальне завдання multiple-sclerosis-mri, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "розсіяний склероз",
    "МРТ",
    "T2",
    "FLAIR",
    "McDonald"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint,
  "keyAnswer": "Демієлінізуюче захворювання ЦНС, найімовірніше розсіяний склероз: множинні T2/FLAIR-вогнища у типових зонах, клінічна та МРТ-дисемінація у просторі й часі.",
  "imaging": [
    {
      "src": "/cases/multiple-sclerosis-mri/scan-01.jpeg",
      "alt": "Множинні T2/FLAIR-вогнища білої речовини при підозрі на розсіяний склероз",
      "caption": "Множинні T2/FLAIR-вогнища"
    },
    {
      "src": "/cases/multiple-sclerosis-mri/scan-02.jpeg",
      "alt": "Перивентрикулярні T2/FLAIR-вогнища білої речовини при підозрі на розсіяний склероз",
      "caption": "Перивентрикулярні вогнища"
    }
  ],
  "sources": [
    {
      "label": "StatPearls / NCBI Bookshelf: Multiple Sclerosis",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK499849/"
    },
    {
      "label": "Merck Manual Professional: Multiple Sclerosis",
      "href": "https://www.merckmanuals.com/professional/neurologic-disorders/demyelinating-disorders/multiple-sclerosis-ms"
    },
    {
      "label": "Thompson et al. 2017 McDonald criteria, Lancet Neurology",
      "href": "https://pubmed.ncbi.nlm.nih.gov/29275977/"
    },
    {
      "label": "Filippi et al. MAGNIMS MRI criteria, Lancet Neurology",
      "href": "https://pubmed.ncbi.nlm.nih.gov/26822746/"
    }
  ]
} satisfies CaseMeta;
