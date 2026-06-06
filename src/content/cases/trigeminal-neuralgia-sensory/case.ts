import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-03",
  "slug": "trigeminal-neuralgia-sensory",
  "order": 3,
  "title": "Невралгія трійчастого нерва. Перевірка чутливості",
  "focus": "Станція на розпізнавання тригемінальної невралгії та коректне дослідження чутливої функції V пари.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12256@2025-04-29T111009.pdf",
    "href": "/cases/trigeminal-neuralgia-sensory/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/trigeminal-neuralgia-sensory/original-01.jpg",
      "alt": "Оригинальная задача trigeminal-neuralgia-sensory, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/trigeminal-neuralgia-sensory/original-02.jpg",
      "alt": "Оригинальная задача trigeminal-neuralgia-sensory, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/trigeminal-neuralgia-sensory/original-03.jpg",
      "alt": "Оригинальная задача trigeminal-neuralgia-sensory, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "V нерв",
    "тригемінальна невралгія"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
