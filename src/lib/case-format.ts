import type { CaseGroup, ReviewStatus } from "@/content/schema";

export function formatGroup(group: CaseGroup) {
  return group === "imaging" ? "МРТ/КТ" : "Без МРТ/КТ";
}

export function formatStatus(status: ReviewStatus) {
  const labels: Record<ReviewStatus, string> = {
    draft: "черновик",
    reviewing: "на проверке",
    checked: "проверено"
  };

  return labels[status];
}
