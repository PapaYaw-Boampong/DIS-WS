import { percentageScore } from "@/lib/portal/format";
import type { ResultSummary } from "@/types/portal";

/** School grade bands, shared by the summary cards and report card views. */
export function resultGrade(percentage: number) {
  if (percentage >= 80) return { label: "A · Excellent", variant: "success" } as const;
  if (percentage >= 70) return { label: "B · Very good", variant: "success" } as const;
  if (percentage >= 60) return { label: "C · Good", variant: "info" } as const;
  if (percentage >= 50) return { label: "D · Credit", variant: "warning" } as const;
  return { label: "E · Needs support", variant: "danger" } as const;
}

export function averagePercentage(results: readonly ResultSummary[]) {
  if (!results.length) {
    return 0;
  }

  return Math.round(
    results.reduce(
      (total, result) => total + percentageScore(result.score, result.total),
      0,
    ) / results.length,
  );
}
