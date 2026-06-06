import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-11",
  "slug": "trigeminal-sensory",
  "order": 11,
  "title": "Тригемінальна невралгія. Чутлива функція V нерва",
  "focus": "Змішана станція: пояснити причину нападоподібного лицевого болю, отримати згоду і послідовно перевірити чутливу функцію трійчастого нерва.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12468@2025-04-29T111113.pdf",
    "href": "/cases/trigeminal-sensory/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/trigeminal-sensory/original-01.jpg",
      "alt": "Оригинальная задача trigeminal-sensory, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/trigeminal-sensory/original-02.jpg",
      "alt": "Оригинальная задача trigeminal-sensory, страница 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "трійчастий нерв",
    "чутливість"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
