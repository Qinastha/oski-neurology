import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-16",
  "slug": "stroke-ct-mca",
  "order": 16,
  "title": "Ішемічний інсульт у басейні СМА. КТ",
  "focus": "Гострий ішемічний інсульт у басейні середньої мозкової артерії: нативна КТ, реперфузійне вікно і варфарин/INR.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12267@2025-04-29T111549.pdf",
    "href": "/cases/stroke-ct-mca/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/stroke-ct-mca/original-01.png",
      "alt": "Оригінальне завдання stroke-ct-mca, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/stroke-ct-mca/original-02.png",
      "alt": "Оригінальне завдання stroke-ct-mca, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "інсульт",
    "СМА",
    "КТ",
    "гострий початок",
    "тромболізис",
    "тромбектомія"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint,
  "keyAnswer": "Гострий ішемічний інсульт у басейні лівої середньої мозкової артерії: на КТ ранні ішемічні ознаки - гіперденсивна СМА, втрата сіро-білої диференціації/острівцевої стрічки та згладження борозен; за умовою потрібна термінова оцінка INR перед тромболізисом.",
  "imaging": [
    {
      "src": "/cases/stroke-ct-mca/scan-01.jpeg",
      "alt": "Нативна КТ: рання ішемія в басейні СМА з втратою сіро-білої диференціації",
      "caption": "Втрата сіро-білої диференціації"
    },
    {
      "src": "/cases/stroke-ct-mca/scan-02.jpeg",
      "alt": "Нативна КТ: гіперденсивна середня мозкова артерія",
      "caption": "Гіперденсивна СМА"
    },
    {
      "src": "/cases/stroke-ct-mca/scan-03.jpeg",
      "alt": "Нативна КТ: втрата острівцевої стрічки при ішемії в басейні СМА",
      "caption": "Втрата острівцевої стрічки"
    }
  ],
  "sources": [
    {
      "label": "StatPearls / NCBI Bookshelf: Stroke Imaging",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK546635/"
    },
    {
      "label": "StatPearls / NCBI Bookshelf: Acute Stroke",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK535369/"
    },
    {
      "label": "Merck Manual Professional: Ischemic Stroke",
      "href": "https://www.merckmanuals.com/professional/neurologic-disorders/stroke/ischemic-stroke"
    },
    {
      "label": "AHA/ASA 2019 acute ischemic stroke guideline update",
      "href": "https://pubmed.ncbi.nlm.nih.gov/31662037/"
    }
  ]
} satisfies CaseMeta;
