import type { CaseMeta } from "../../schema";

export const caseMeta = {
  "id": "case-10",
  "slug": "cauda-equina",
  "order": 10,
  "title": "Синдром конского хвоста",
  "focus": "Станция без полноценного актерского диалога: нужно устно разобрать клинический кейс, синдромы, уровень поражения и срочную тактику.",
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
    "конский хвост"
  ],
  "reviewStatus": "reviewing"
} satisfies CaseMeta;
