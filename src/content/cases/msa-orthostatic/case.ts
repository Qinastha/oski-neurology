import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-05",
  "slug": "msa-orthostatic",
  "order": 5,
  "title": "Мультисистемна атрофія. Ортостатична проба",
  "focus": "Станція на діагностику нейрогенної ортостатичної гіпотензії у пацієнта зі швидко прогресуючим паркінсонізмом і вегетативними порушеннями.",
  "group": "non-imaging",
  "sourcePdf": {
    "label": "task_12381@2025-04-29T110254.pdf",
    "href": "/cases/msa-orthostatic/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/msa-orthostatic/original-01.jpg",
      "alt": "Оригинальная задача msa-orthostatic, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/msa-orthostatic/original-02.jpg",
      "alt": "Оригинальная задача msa-orthostatic, страница 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "без МРТ/КТ",
    "MSA",
    "ортостаз",
    "нейрогенна ортостатична гіпотензія"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint
} satisfies CaseMeta;
