import type { Metadata } from "next";

import { KrokTrainer } from "@/components/KrokTrainer";
import { getKrokCatalog } from "@/content/krok/loader";

export const metadata: Metadata = {
  title: "КРОК тести",
  description:
    "Буклети КРОК 3 з неврології: офіційні 2024, 2025, 2026, випадковий офіційний буклет і тренувальні AI-буклети."
};

export const dynamic = "force-static";

export default function KrokPage() {
  const { officialBooklets, trainingBooklets } = getKrokCatalog();

  return <KrokTrainer officialBooklets={officialBooklets} trainingBooklets={trainingBooklets} />;
}
