import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-08",
  "slug": "hearing-rinne-weber",
  "order": 8,
  "title": "Оцінка слуху. Проби Рінне і Вебера",
  "focus": "Станція на розрізнення кондуктивної та сенсоневральної туговухості за допомогою камертональних проб.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12411@2025-04-29T111053.pdf",
    "href": "/cases/hearing-rinne-weber/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/hearing-rinne-weber/original-01.jpg",
      "alt": "Оригінальне завдання hearing-rinne-weber, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/hearing-rinne-weber/original-02.jpg",
      "alt": "Оригінальне завдання hearing-rinne-weber, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "Рінне",
    "Вебер",
    "слух"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
