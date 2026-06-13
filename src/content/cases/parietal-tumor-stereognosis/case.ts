import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-13",
  "slug": "parietal-tumor-stereognosis",
  "order": 13,
  "title": "Ураження тім'яної долі. Стереогноз",
  "focus": "Змішана станція: пояснити пацієнту пробу на стереогноз, виконати її обома руками і локалізувати астереогноз у тім'яній корі.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12506@2025-04-29T111147.pdf",
    "href": "/cases/parietal-tumor-stereognosis/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/parietal-tumor-stereognosis/original-01.jpg",
      "alt": "Оригінальне завдання parietal-tumor-stereognosis, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/parietal-tumor-stereognosis/original-02.jpg",
      "alt": "Оригінальне завдання parietal-tumor-stereognosis, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/parietal-tumor-stereognosis/original-03.jpg",
      "alt": "Оригінальне завдання parietal-tumor-stereognosis, сторінка 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "стереогноз",
    "тім'яна доля",
    "складна чутливість"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
