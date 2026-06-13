import type { CaseMeta } from "../../schema";
import { stationBlueprint } from "./blueprint";

export const caseMeta = {
  "id": "case-17",
  "slug": "glioma-dislocation",
  "order": 17,
  "title": "Високозлоякісна гліома. Дислокаційний синдром",
  "focus": "Внутрішньомозкове об'ємне утворення з МР-ознаками high-grade glioma, перифокальним набряком, мас-ефектом і дислокаційним синдромом.",
  "group": "imaging",
  "sourcePdf": {
    "label": "task_12284@2025-04-29T111601.pdf",
    "href": "/cases/glioma-dislocation/source.pdf"
  },
  "originalPages": [
    {
      "src": "/cases/glioma-dislocation/original-01.png",
      "alt": "Оригінальне завдання glioma-dislocation, сторінка 1",
      "caption": "Страница 1 оригинального задания"
    },
    {
      "src": "/cases/glioma-dislocation/original-02.png",
      "alt": "Оригінальне завдання glioma-dislocation, сторінка 2",
      "caption": "Страница 2 оригинального задания"
    }
  ],
  "tags": [
    "гліома",
    "мас-ефект",
    "дислокація",
    "МРТ",
    "нейрохірургія"
  ],
  "reviewStatus": "checked",
  "blueprint": stationBlueprint,
  "keyAnswer": "Внутрішньомозкове об'ємне утворення правої півкулі з неоднорідним/кільцеподібним контрастуванням, вираженим перифокальним набряком, мас-ефектом і дислокацією структур; попередньо high-grade glioma/підозра на гліобластому, але остаточний діагноз потребує гістомолекулярної верифікації.",
  "imaging": [
    {
      "src": "/cases/glioma-dislocation/scan-01.jpeg",
      "alt": "МРТ коронарний зріз: об'ємне утворення з вираженим перифокальним набряком",
      "caption": "Перифокальний набряк"
    },
    {
      "src": "/cases/glioma-dislocation/scan-02.jpeg",
      "alt": "МРТ T1 з контрастом, коронарний зріз: неоднорідне контрастування пухлини",
      "caption": "T1 з контрастом"
    },
    {
      "src": "/cases/glioma-dislocation/scan-03.jpeg",
      "alt": "МРТ аксіальний зріз: кільцеподібне контрастування та некротично-кістозні ділянки",
      "caption": "Кільцеподібне контрастування"
    },
    {
      "src": "/cases/glioma-dislocation/scan-04.jpeg",
      "alt": "МРТ аксіальний зріз: мас-ефект і дислокація серединних структур",
      "caption": "Мас-ефект і дислокація"
    }
  ],
  "sources": [
    {
      "label": "NICE NG99: Brain tumours and brain metastases in over 16s",
      "href": "https://www.nice.org.uk/guidance/ng99/chapter/recommendations"
    },
    {
      "label": "EANO guidelines on adult diffuse gliomas",
      "href": "https://www.nature.com/articles/s41571-020-00447-z"
    },
    {
      "label": "StatPearls / NCBI Bookshelf: Glioblastoma Multiforme",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK558954/"
    },
    {
      "label": "StatPearls / NCBI Bookshelf: Brain Herniation",
      "href": "https://www.ncbi.nlm.nih.gov/books/NBK542246/"
    }
  ]
} satisfies CaseMeta;
