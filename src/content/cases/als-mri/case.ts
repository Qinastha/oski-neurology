import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-19",
  "slug": "als-mri",
  "order": 19,
  "title": "БАС. Нейровізуалізація",
  "focus": "Бічний аміотрофічний склероз: гіперінтенсивність кортикоспінальних трактів і симптом келиха вина.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12566@2025-04-29T111718.pdf",
    "href": "/cases/als-mri/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/als-mri/original-01.png",
      "alt": "Оригинальная задача als-mri, страница 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/als-mri/original-02.png",
      "alt": "Оригинальная задача als-mri, страница 2",
      "caption": "Страница 2 оригинального задания"
    },
    {
      "src": "/cases/als-mri/original-03.png",
      "alt": "Оригинальная задача als-mri, страница 3",
      "caption": "Страница 3 оригинального задания"
    }
  ],
  "tags": [
    "БАС",
    "мотонейрон",
    "МРТ",
    "кортикоспінальні тракти"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint,
  "keyAnswer": "Ймовірна хвороба мотонейрона/БАС із вираженим ураженням верхнього мотонейрона; МРТ допомагає виключити міміки й може показувати підтримувальні ознаки ураження кортикоспінальних трактів.",
  "imaging": [
    {
      "src": "/cases/als-mri/scan-01.jpeg",
      "alt": "T2-зріз із гіперінтенсивністю кортикоспінальних трактів у стовбурі",
      "caption": "CST у стовбурі"
    },
    {
      "src": "/cases/als-mri/scan-02.jpeg",
      "alt": "Аксіальний T2-зріз стовбура при підозрі на хворобу мотонейрона",
      "caption": "Аксіальний T2"
    },
    {
      "src": "/cases/als-mri/scan-03.jpeg",
      "alt": "Коронарний зріз із навчальним симптомом келиха вина при БАС",
      "caption": "Симптом келиха вина"
    }
  ],
  "sources": [
    {
      "label": "NCBI Bookshelf: Clinical Manifestation and Management of ALS",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK573427/"
    },
    {
      "label": "Merck Manual Professional: ALS and other motor neuron diseases",
      "href": "https://www.merckmanuals.com/professional/neurologic-disorders/peripheral-nervous-system-and-motor-unit-disorders/amyotrophic-lateral-sclerosis-als-and-other-motor-neuron-diseases-mnds"
    },
    {
      "label": "NICE NG42: Motor neurone disease assessment and management",
      "href": "https://www.nice.org.uk/guidance/ng42/chapter/recommendations"
    },
    {
      "label": "Practical Neurology: Diagnosing ALS - Gold Coast criteria and the role of EMG",
      "href": "https://pn.bmj.com/content/22/3/176"
    }
  ]
} satisfies CaseMeta;
