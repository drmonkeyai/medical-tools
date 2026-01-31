// src/calculators/riskBadge.ts

// Chuẩn hoá risk level dùng trong toàn dự án
export type RiskLevel = "low" | "moderate" | "high" | "very-high";

// Nếu core trả riskGroup theo dạng khác nhau, bạn map về RiskLevel ở đây.
// Bạn có thể chỉnh thêm alias tuỳ theo riskGroup bạn đang dùng.
export function riskLevelFromGroup(group: string): RiskLevel {
  const g = (group || "").toLowerCase().trim();

  // ✅ alias cho "very high"
  if (
    g === "very-high" ||
    g === "veryhigh" ||
    g === "very high" ||
    g === "rất cao" ||
    g === "rat cao" ||
    g === "very_high"
  ) {
    return "very-high";
  }

  // ✅ alias cho "high"
  if (g === "high" || g === "cao") return "high";

  // ✅ alias cho "moderate"
  if (g === "moderate" || g === "medium" || g === "vừa" || g === "trung bình" || g === "trung binh") {
    return "moderate";
  }

  // ✅ mặc định low
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
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

// Class badge dựa theo CSS bạn đã có trong index.css
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
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}
