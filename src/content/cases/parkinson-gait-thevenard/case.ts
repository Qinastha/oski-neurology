import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-09",
  "slug": "parkinson-gait-thevenard",
  "order": 9,
  "title": "Хвороба Паркінсона. Оцінка ходи і тест Тевенара",
  "focus": "Станція на виявлення постуральної нестабільності та визначення III стадії хвороби Паркінсона за Hoehn-Yahr.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12419@2025-04-29T110331.pdf",
    "href": "/cases/parkinson-gait-thevenard/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/parkinson-gait-thevenard/original-01.jpg",
      "alt": "Оригінальне завдання parkinson-gait-thevenard, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/parkinson-gait-thevenard/original-02.jpg",
      "alt": "Оригінальне завдання parkinson-gait-thevenard, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/parkinson-gait-thevenard/original-03.jpg",
      "alt": "Оригінальне завдання parkinson-gait-thevenard, сторінка 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "Паркінсон",
    "хода",
    "Hoehn-Yahr"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
