import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-15",
  "slug": "cerebellar-ataxia",
  "order": 15,
  "title": "Мозочкова атаксія. Координаторні проби",
  "focus": "Станція на відмежування мозочкової атаксії від сенситивної та пірамідної патології з демонстрацією координаторних проб.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12538@2025-04-29T110905.pdf",
    "href": "/cases/cerebellar-ataxia/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/cerebellar-ataxia/original-01.jpg",
      "alt": "Оригінальне завдання cerebellar-ataxia, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/cerebellar-ataxia/original-02.jpg",
      "alt": "Оригінальне завдання cerebellar-ataxia, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/cerebellar-ataxia/original-03.jpg",
      "alt": "Оригінальне завдання cerebellar-ataxia, сторінка 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "атаксія",
    "мозочок",
    "координаторні проби"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
