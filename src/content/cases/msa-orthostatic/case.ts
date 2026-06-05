import type { CaseMeta } from "../../schema";

export const caseMeta = {
  "id": "case-05",
  "slug": "msa-orthostatic",
  "order": 5,
  "title": "Множественная системная атрофия. Ортостатическая проба",
  "focus": "Станция на диагностику нейрогенной ортостатической гипотензии у пациента с быстро прогрессирующим паркинсонизмом и вегетативными нарушениями.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12381@2025-04-29T110254.pdf",
    "href": "/cases/msa-orthostatic/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/msa-orthostatic/original-01.jpg",
      "alt": "Оригинальная задача msa-orthostatic, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/msa-orthostatic/original-02.jpg",
      "alt": "Оригинальная задача msa-orthostatic, страница 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "MSA",
    "ортостаз"
  ],
  "reviewStatus": "reviewing"
} satisfies CaseMeta;
