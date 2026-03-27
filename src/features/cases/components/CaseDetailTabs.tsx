import { useMemo } from "react";
import type { CaseDetailTabKey } from "../types/caseDetail";

type Props = {
  activeTab: CaseDetailTabKey;
  onChange: (tab: CaseDetailTabKey) => void;
  counts?: Partial<Record<CaseDetailTabKey, number>>;
};

const TAB_ORDER: Array<{ key: CaseDetailTabKey; label: string }> = [
  { key: "overview", label: "Tổng quan" },
  { key: "history", label: "Tiền sử" },
  { key: "ice", label: "ICE" },
  { key: "risk", label: "Yếu tố nguy cơ" },
  { key: "biopsychosocial", label: "BioPsychoSocial" },
  { key: "labs", label: "Cận lâm sàng" },
  { key: "calculator", label: "Công cụ đánh giá" },
  { key: "monitoring", label: "Theo dõi tại nhà" },
  { key: "management", label: "Kế hoạch quản lý" },
  { key: "treatment", label: "Điều trị cụ thể" },
  { key: "immunization", label: "Tiêm chủng" },
];

export default function CaseDetailTabs({
  activeTab,
  onChange,
  counts,
}: Props) {
  const tabs = useMemo(() => {
    return TAB_ORDER.map((tab) => ({
      ...tab,
      count: counts?.[tab.key],
    }));
  }, [counts]);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              style={{
                padding: "14px 16px",
                borderRadius: 999,
                border: selected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                background: selected ? "#eef2ff" : "#ffffff",
                color: selected ? "#1d4ed8" : "#0f172a",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {tab.label}
              {typeof tab.count === "number" ? ` (${tab.count})` : ""}
            </button>
          );
        })}
      </div>
    </section>
  );
}