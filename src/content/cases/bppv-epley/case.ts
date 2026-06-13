import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-07",
  "slug": "bppv-epley",
  "order": 7,
  "title": "ДППГ. Маневр Еплі",
  "focus": "Станція на лікування ДППГ репозиційним маневром Еплі та коректне пояснення пацієнтці механізму захворювання.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12384@2025-04-29T110703.pdf",
    "href": "/cases/bppv-epley/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/bppv-epley/original-01.jpg",
      "alt": "Оригінальне завдання bppv-epley, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/bppv-epley/original-02.jpg",
      "alt": "Оригінальне завдання bppv-epley, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/bppv-epley/original-03.jpg",
      "alt": "Оригінальне завдання bppv-epley, сторінка 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "ДППГ",
    "Еплі",
    "репозиційний маневр"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
