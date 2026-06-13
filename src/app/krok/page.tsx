import type { Metadata } from "next";

import { KrokTrainer } from "@/components/KrokTrainer";
import { getKrokBooklets } from "@/content/krok/loader";

export const metadata: Metadata = {
  title: "КРОК тести",
  description:
    "Тренувальні буклети КРОК 3 з неврології: 2024, 2025, 2026 та випадковий буклет зі збереженням прогресу."
};

export const dynamic = "force-static";

export default function KrokPage() {
  return <KrokTrainer booklets={getKrokBooklets()} />;
}
