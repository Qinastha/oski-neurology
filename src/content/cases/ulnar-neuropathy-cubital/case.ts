import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-14",
  "slug": "ulnar-neuropathy-cubital",
  "order": 14,
  "title": "Невропатія локтевого нерва. Кубітальний канал",
  "focus": "Змішана станція: уточнити скарги, провести клінічні проби локтевого нерва, визначити рівень ураження і запропонувати діагностику та лікування.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12536@2025-04-29T110851.pdf",
    "href": "/cases/ulnar-neuropathy-cubital/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/ulnar-neuropathy-cubital/original-01.jpg",
      "alt": "Оригинальная задача ulnar-neuropathy-cubital, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/ulnar-neuropathy-cubital/original-02.jpg",
      "alt": "Оригинальная задача ulnar-neuropathy-cubital, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/ulnar-neuropathy-cubital/original-03.jpg",
      "alt": "Оригинальная задача ulnar-neuropathy-cubital, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "локтевий нерв",
    "кубітальний канал",
    "ЕНМГ"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
