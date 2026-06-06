import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-10",
  "slug": "cauda-equina",
  "order": 10,
  "title": "Синдром кінського хвоста",
  "focus": "Станція без повноцінного акторського діалогу: потрібно усно розібрати клінічний кейс, синдроми, рівень ураження і невідкладну тактику.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12420@2025-04-29T110809.pdf",
    "href": "/cases/cauda-equina/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/cauda-equina/original-01.jpg",
      "alt": "Оригинальная задача cauda-equina, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/cauda-equina/original-02.jpg",
      "alt": "Оригинальная задача cauda-equina, страница 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "кінський хвіст",
    "невідкладний стан"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
