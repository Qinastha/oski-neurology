import type { Metadata } from "next";

import { CasesExplorer, type ExplorerCase } from "@/components/CasesExplorer";
import { getAllCases, getSearchBlob } from "@/content/loader";

export const metadata: Metadata = {
  title: "Усі станції"
};

export const dynamic = "force-static";

export default function CasesPage() {
  const cases: ExplorerCase[] = getAllCases().map((studyCase) => ({
    id: studyCase.id,
    slug: studyCase.slug,
    order: studyCase.order,
    title: studyCase.title,
    focus: studyCase.focus,
    group: studyCase.group,
    tags: studyCase.tags,
    reviewStatus: studyCase.reviewStatus,
    hasImaging: studyCase.group === "imaging",
    checklistCount: studyCase.checklist.length,
    search: getSearchBlob(studyCase)
  }));

  return <CasesExplorer cases={cases} />;
}
