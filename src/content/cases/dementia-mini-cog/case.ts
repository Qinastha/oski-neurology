import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-01",
  "slug": "dementia-mini-cog",
  "order": 1,
  "title": "Деменція. Mini-Cog",
  "focus": "Станція на коректне проведення скринінгу когнітивних порушень Mini-Cog і професійне пояснення необхідності дообстеження.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12251@2025-04-29T110224.pdf",
    "href": "/cases/dementia-mini-cog/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/dementia-mini-cog/original-01.jpg",
      "alt": "Оригинальная задача dementia-mini-cog, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/dementia-mini-cog/original-02.jpg",
      "alt": "Оригинальная задача dementia-mini-cog, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/dementia-mini-cog/original-03.jpg",
      "alt": "Оригинальная задача dementia-mini-cog, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "деменція",
    "Mini-Cog"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
