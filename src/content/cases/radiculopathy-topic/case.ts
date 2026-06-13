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
      "alt": "Оригінальне завдання radiculopathy-topic, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/radiculopathy-topic/original-02.jpg",
      "alt": "Оригінальне завдання radiculopathy-topic, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/radiculopathy-topic/original-03.jpg",
      "alt": "Оригінальне завдання radiculopathy-topic, сторінка 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без КТ/МРТ",
    "радикулопатія"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
