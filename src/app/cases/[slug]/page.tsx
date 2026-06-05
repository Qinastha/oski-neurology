import type { Metadata } from "next";

import { CaseReader } from "@/components/CaseReader";
import { getAdjacentCases, getAllCases, getCaseBySlug, getCaseSummaries } from "@/content/loader";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getCaseSummaries().map((studyCase) => ({ slug: studyCase.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const studyCase = getCaseBySlug(slug);

  return {
    title: studyCase.title,
    description: studyCase.focus
  };
}

export default async function CasePage({ params }: PageProps) {
  const { slug } = await params;
  const studyCase = getCaseBySlug(slug);
  const cases = getAllCases().map((item) => ({
    id: item.id,
    slug: item.slug,
    order: item.order,
    title: item.title,
    focus: item.focus,
    group: item.group,
    tags: item.tags,
    reviewStatus: item.reviewStatus,
    hasImaging: item.group === "imaging",
    checklistCount: item.checklist.length
  }));
  const adjacent = getAdjacentCases(slug);

  return (
    <CaseReader
      cases={cases}
      next={adjacent.next}
      previous={adjacent.previous}
      studyCase={studyCase}
    />
  );
}
