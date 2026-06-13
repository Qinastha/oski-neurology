import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-20",
  "slug": "cervical-myelopathy-mri",
  "order": 20,
  "title": "Шийна мієлопатія. Стеноз",
  "focus": "Компресійна шийна мієлопатія: центральна грижа C5-C6, стеноз каналу, компресія спинного мозку.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12571@2025-04-29T111732.pdf",
    "href": "/cases/cervical-myelopathy-mri/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/cervical-myelopathy-mri/original-01.png",
      "alt": "Оригінальне завдання cervical-myelopathy-mri, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/cervical-myelopathy-mri/original-02.png",
      "alt": "Оригінальне завдання cervical-myelopathy-mri, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "мієлопатія",
    "стеноз",
    "шийний відділ",
    "МРТ",
    "C5-C6"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint,
  "keyAnswer": "Компресійна шийна мієлопатія зі стенозом хребтового каналу і компресією спинного мозку, що потребує термінової нейрохірургічної оцінки.",
  "imaging": [
    {
      "src": "/cases/cervical-myelopathy-mri/scan-01.jpeg",
      "alt": "Сагітальний T2-зріз шийного відділу при компресійній мієлопатії",
      "caption": "Сагітальний T2"
    },
    {
      "src": "/cases/cervical-myelopathy-mri/scan-02.jpeg",
      "alt": "Сагітальний T1-зріз шийного відділу при компресійній мієлопатії",
      "caption": "Сагітальний T1"
    },
    {
      "src": "/cases/cervical-myelopathy-mri/scan-03.jpeg",
      "alt": "Стеноз шийного каналу на сагітальному МРТ-зрізі",
      "caption": "Стеноз каналу"
    },
    {
      "src": "/cases/cervical-myelopathy-mri/scan-04.jpeg",
      "alt": "Аксіальний зріз шийного відділу без грубої центральної компресії",
      "caption": "Аксіальний зріз"
    },
    {
      "src": "/cases/cervical-myelopathy-mri/scan-05.jpeg",
      "alt": "Аксіальний зріз шийного відділу із центральною компресією",
      "caption": "Аксіальна компресія"
    },
    {
      "src": "/cases/cervical-myelopathy-mri/scan-06.jpeg",
      "alt": "Центральна грижа диска C5-C6 зі стенозом і компресією спинного мозку",
      "caption": "Грижа C5-C6 і стеноз"
    }
  ],
  "sources": [
    {
      "label": "StatPearls / NCBI Bookshelf: Cervical Myelopathy",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK482312/"
    },
    {
      "label": "AAFP: Degenerative Cervical Myelopathy - Recognition and Management",
      "href": "https://www.aafp.org/pubs/afp/issues/2020/1215/p740.html"
    },
    {
      "label": "ACR Appropriateness Criteria: Myelopathy",
      "href": "https://acsearch.acr.org/docs/69484/Narrative/"
    },
    {
      "label": "StatPearls / NCBI Bookshelf: Lhermitte Sign",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK493237/"
    }
  ]
} satisfies CaseMeta;
