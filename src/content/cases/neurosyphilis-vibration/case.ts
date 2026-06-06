import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-04",
  "slug": "neurosyphilis-vibration",
  "order": 4,
  "title": "Нейросифіліс. Вібраційна чутливість",
  "focus": "Станція на дослідження палестезії камертоном 128 Гц і синдромальну діагностику ураження задніх канатиків.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12258@2025-04-29T111029.pdf",
    "href": "/cases/neurosyphilis-vibration/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/neurosyphilis-vibration/original-01.jpg",
      "alt": "Оригинальная задача neurosyphilis-vibration, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/neurosyphilis-vibration/original-02.jpg",
      "alt": "Оригинальная задача neurosyphilis-vibration, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/neurosyphilis-vibration/original-03.jpg",
      "alt": "Оригинальная задача neurosyphilis-vibration, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "нейросифіліс",
    "tabes dorsalis",
    "вібраційна чутливість"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
