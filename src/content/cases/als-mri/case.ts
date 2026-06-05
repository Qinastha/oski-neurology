import type { CaseMeta } from "../../schema";

export const caseMeta = {
  "id": "case-19",
  "slug": "als-mri",
  "order": 19,
  "title": "БАС. Нейровизуализация",
  "focus": "Боковой амиотрофический склероз: гиперинтенсивность кортикоспинальных трактов и признак бокала вина.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12566@2025-04-29T111718.pdf",
    "href": "/cases/als-mri/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/als-mri/original-01.png",
      "alt": "Оригинальная задача als-mri, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/als-mri/original-02.png",
      "alt": "Оригинальная задача als-mri, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/als-mri/original-03.png",
      "alt": "Оригинальная задача als-mri, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "БАС",
    "мотонейрон",
    "МРТ",
    "кортикоспинальные тракты"
  ],
  "reviewStatus": "reviewing",
  "keyAnswer": "Прогрессирующее поражение верхнего и нижнего мотонейрона; МРТ помогает исключить мимики и может показывать признаки поражения кортикоспинальных трактов.",
  "imaging": [
    {
      "src": "/cases/als-mri/scan-01.jpeg",
      "alt": "05 - БАС - гиперинтенсивность кортикоспинальных трактов в стволе",
      "caption": "05 - БАС - гиперинтенсивность кортикоспинальных трактов в стволе"
    },
    {
      "src": "/cases/als-mri/scan-02.jpeg",
      "alt": "06 - БАС - аксиальный T2 срез ствола",
      "caption": "06 - БАС - аксиальный T2 срез ствола"
    },
    {
      "src": "/cases/als-mri/scan-03.jpeg",
      "alt": "12 - БАС - признак бокала вина на МРТ",
      "caption": "12 - БАС - признак бокала вина на МРТ"
    }
  ],
  "sources": [
    {
      "label": "Stroke Imaging, StatPearls / NCBI Bookshelf",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK546635/"
    },
    {
      "label": "Glioblastoma Multiforme, StatPearls / NCBI Bookshelf",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK558954/"
    },
    {
      "label": "Multiple Sclerosis, StatPearls / NCBI Bookshelf",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK499849/"
    },
    {
      "label": "Amyotrophic Lateral Sclerosis, StatPearls / NCBI Bookshelf",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK573427/"
    },
    {
      "label": "Cervical Myelopathy, StatPearls / NCBI Bookshelf",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK482312/"
    }
  ]
} satisfies CaseMeta;
