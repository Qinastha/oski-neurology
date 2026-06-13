import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-06",
  "slug": "bppv-dix-hallpike",
  "order": 6,
  "title": "ДППГ. Тест Дікса-Холпайка",
  "focus": "Станція на діагностику доброякісного пароксизмального позиційного головокружіння з оцінкою позиційного ністагму.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12382@2025-04-29T110312.pdf",
    "href": "/cases/bppv-dix-hallpike/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/bppv-dix-hallpike/original-01.jpg",
      "alt": "Оригінальне завдання bppv-dix-hallpike, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/bppv-dix-hallpike/original-02.jpg",
      "alt": "Оригінальне завдання bppv-dix-hallpike, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/bppv-dix-hallpike/original-03.jpg",
      "alt": "Оригінальне завдання bppv-dix-hallpike, сторінка 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "ДППГ",
    "Dix-Hallpike",
    "позиційний ністагм"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
