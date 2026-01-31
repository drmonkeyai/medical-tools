// src/calculators/riskBadge.ts

export type RiskLevel = "low" | "moderate" | "high" | "very-high" | "extreme";

/**
 * Risk categories theo ESC/EAS 2025 Focused Update (Table 3) cho SCORE2/SCORE2-OP:
 *  <2%: low; 2–<10%: moderate; 10–<20%: high; ≥20%: very-high
 */
export function riskLevelFromScore2Percent(riskPercent?: number): RiskLevel {
  if (riskPercent === undefined || riskPercent === null || !Number.isFinite(riskPercent)) return "low";
  if (riskPercent < 2) return "low";
  if (riskPercent < 10) return "moderate";
  if (riskPercent < 20) return "high";
  return "very-high";
}

/** Helper cho các model khác nếu bạn cần (vd ASIAN/DIABETES dùng 5/10/20) */
export function riskLevelFromPercent(
  riskPercent: number | undefined,
  cutoffs: { lowToModerate: number; moderateToHigh: number; highToVeryHigh: number }
): Exclude<RiskLevel, "extreme"> {
  if (riskPercent === undefined || riskPercent === null || !Number.isFinite(riskPercent)) return "low";
  if (riskPercent < cutoffs.lowToModerate) return "low";
  if (riskPercent < cutoffs.moderateToHigh) return "moderate";
  if (riskPercent < cutoffs.highToVeryHigh) return "high";
  return "very-high";
}

/** Nếu core trả riskGroup dạng chữ, vẫn hỗ trợ alias để không rơi về low */
export function riskLevelFromGroup(group: string): Exclude<RiskLevel, "extreme"> {
  const g = (group || "").toLowerCase().trim();

  if (["very-high", "very high", "veryhigh", "very_high", "rất cao", "rat cao"].includes(g)) return "very-high";
  if (["high", "cao"].includes(g)) return "high";
  if (["moderate", "medium", "vừa", "trung bình", "trung binh"].includes(g)) return "moderate";
  return "low";
}

export function riskLabelVi(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Thấp";
    case "moderate":
      return "Vừa";
    case "high":
      return "Cao";
    case "very-high":
      return "Rất cao";
    case "extreme":
      return "Cực cao";
  }
}

export function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "badge badge--low";
    case "moderate":
      return "badge badge--moderate";
    case "high":
      return "badge badge--high";
    case "very-high":
      return "badge badge--veryhigh";
    case "extreme":
      return "badge badge--extreme";
  }
}
