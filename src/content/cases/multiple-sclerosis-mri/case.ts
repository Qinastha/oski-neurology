import type { CaseMeta } from "../../schema";

export const caseMeta = {
  "id": "case-18",
  "slug": "multiple-sclerosis-mri",
  "order": 18,
  "title": "Рассеянный склероз. МРТ",
  "focus": "Рассеянный склероз: множественные T2/FLAIR очаги, перивентрикулярная и мозолистая локализация.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12417@2025-04-29T111704.pdf",
    "href": "/cases/multiple-sclerosis-mri/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/multiple-sclerosis-mri/original-01.png",
      "alt": "Оригинальная задача multiple-sclerosis-mri, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/multiple-sclerosis-mri/original-02.png",
      "alt": "Оригинальная задача multiple-sclerosis-mri, страница 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "рассеянный склероз",
    "МРТ",
    "T2",
    "FLAIR",
    "McDonald"
  ],
  "reviewStatus": "reviewing",
  "keyAnswer": "Демиелинизирующее заболевание ЦНС, наиболее вероятно рассеянный склероз: множественные T2/FLAIR очаги в типичных зонах и критерии диссеминации.",
  "imaging": [
    {
      "src": "/cases/multiple-sclerosis-mri/scan-01.jpeg",
      "alt": "04 - рассеянный склероз - множественные T2 очаги",
      "caption": "04 - рассеянный склероз - множественные T2 очаги"
    },
    {
      "src": "/cases/multiple-sclerosis-mri/scan-02.jpeg",
      "alt": "18 - рассеянный склероз - перивентрикулярные T2 очаги",
      "caption": "18 - рассеянный склероз - перивентрикулярные T2 очаги"
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
