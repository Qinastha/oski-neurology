import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-02",
  "slug": "radiculopathy-topic",
  "order": 2,
  "title": "Радикулопатія. Топічний діагноз",
  "focus": "Станція на деталізацію корінцевого больового синдрому, виключення червоних прапорців і топічну локалізацію ураження.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12252@2025-04-29T110757.pdf",
    "href": "/cases/radiculopathy-topic/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/radiculopathy-topic/original-01.jpg",
      "alt": "Оригинальная задача radiculopathy-topic, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/radiculopathy-topic/original-02.jpg",
      "alt": "Оригинальная задача radiculopathy-topic, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/radiculopathy-topic/original-03.jpg",
      "alt": "Оригинальная задача radiculopathy-topic, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "радикулопатія"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
