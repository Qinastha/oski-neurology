import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-12",
  "slug": "weber-syndrome",
  "order": 12,
  "title": "Альтернуючий синдром Вебера",
  "focus": "Усний розбір без повноцінного акторського діалогу: розпізнати стовбуровий інсульт, назвати синдром Вебера, судинний басейн і невідкладну тактику.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12504@2025-04-29T110823.pdf",
    "href": "/cases/weber-syndrome/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/weber-syndrome/original-01.jpg",
      "alt": "Оригинальная задача weber-syndrome, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/weber-syndrome/original-02.jpg",
      "alt": "Оригинальная задача weber-syndrome, страница 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "Вебер",
    "стовбур",
    "середній мозок",
    "інсульт"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
