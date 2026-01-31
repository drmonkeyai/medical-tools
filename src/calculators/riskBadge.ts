// src/calculators/riskBadge.ts

export type RiskLevel = "low" | "moderate" | "high" | "very_high";

// Map từ chuỗi riskGroup (trả về từ score2Core) -> RiskLevel
export function riskLevelFromGroup(group?: string): RiskLevel | null {
  if (!group) return null;

  const g = group.toLowerCase();

  // chấp nhận nhiều cách viết
  if (g.includes("very") && g.includes("high")) return "very_high";
  if (g.includes("rất cao") || g.includes("rat cao")) return "very_high";

  if (g.includes("high") || g.includes("cao")) return "high";
  if (g.includes("moderate") || g.includes("vừa") || g.includes("trung")) return "moderate";
  if (g.includes("low") || g.includes("thấp") || g.includes("thap")) return "low";

  return null;
}

// Label tiếng Việt để hiển thị UI
export function riskLabelVi(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Nguy cơ thấp";
    case "moderate":
      return "Nguy cơ vừa";
    case "high":
      return "Nguy cơ cao";
    case "very_high":
      return "Nguy cơ rất cao";
  }
}

// ClassName badge (đồng bộ với CSS bạn sẽ set trong index.css)
export function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "badge badge--low";
    case "moderate":
      return "badge badge--moderate";
    case "high":
      return "badge badge--high";
    case "very_high":
      return "badge badge--veryhigh";
  }
}
