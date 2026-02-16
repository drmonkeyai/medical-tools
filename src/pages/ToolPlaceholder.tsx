// src/pages/ToolPlaceholder.tsx
import { useMemo } from "react";
import type { ComponentType } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { specialties } from "../data/tools";

// Calculators
import EGFR from "../calculators/EGFR";
import ISI from "../calculators/ISI";

import SCORE2 from "../calculators/SCORE2";
import SCORE2OP from "../calculators/SCORE2OP";
import SCORE2ASIAN from "../calculators/SCORE2ASIAN";
import SCORE2DIABETES from "../calculators/SCORE2DIABETES";
import CVRiskESC from "../calculators/CVRiskESC";
import WHOPenHearts from "../calculators/WHOPenHearts";

import CHA2DS2VASc from "../calculators/CHA2DS2VASc";
import HASBLED from "../calculators/HASBLED";

import Centor from "../calculators/Centor";
import CURB65 from "../calculators/CURB65";
import QSOFA from "../calculators/QSOFA";
import ChildPugh from "../calculators/ChildPugh";

import FamilyAPGAR from "../calculators/FamilyAPGAR";
import SCREEM from "../calculators/SCREEM";
import Pedigree from "../calculators/Pedigree";
import BMI from "../calculators/BMI";

type ToolFlat = {
  name: string;
  description?: string;
  route: string;
  specialtyName: string;
};

function HeaderRow(props: { title: string; onBack: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>{props.title}</h2>

      <button
        onClick={props.onBack}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid var(--line)",
          background: "white",
          cursor: "pointer",
          fontWeight: 900,
        }}
        title="Trở về trang trước"
      >
        ← Trở về trang trước
      </button>
    </div>
  );
}

export default function ToolPlaceholder() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const slugNorm = (slug ?? "").toLowerCase().trim();

  // =========================
  // Special-case: Drug Interactions (iframe)
  // =========================
  const isDrugInteractions =
    location.pathname === "/drug-interactions" || slugNorm === "drug-interactions";

  if (isDrugInteractions) {
    return (
      <div className="page">
        <div className="card" style={{ height: "calc(100vh - 140px)" }}>
          <HeaderRow title="Tương tác thuốc" onBack={() => navigate(-1)} />

          <div style={{ color: "var(--muted)", marginBottom: 12, marginTop: 10 }}>
            Nguồn: Drugs.com • Chỉ mang tính tham khảo, không thay thế quyết định
            lâm sàng.
          </div>

          <div
            style={{
              height: "100%",
              borderRadius: 12,
              border: "1px solid var(--line)",
              overflow: "hidden",
              background: "white",
            }}
          >
            <iframe
              src="https://www.drugs.com/drug_interactions.html"
              title="Drug Interactions - Drugs.com"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a
              href="https://www.drugs.com/drug_interactions.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                color: "var(--primary)",
                fontWeight: 800,
              }}
            >
              Mở toàn màn hình ↗
            </a>

            <Link
              to="/tools"
              style={{
                textDecoration: "none",
                color: "var(--primary)",
                fontWeight: 800,
              }}
            >
              ← Quay lại danh sách công cụ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // Map slug -> calculator component
  // =========================
  const componentRegistry: Record<string, ComponentType> = useMemo(
    () => ({
      // Thận – tiết niệu
      egfr: EGFR,

      // Giấc ngủ
      isi: ISI,

      // Tim mạch
      score2: SCORE2,
      "score2-op": SCORE2OP,
      "score2-asian": SCORE2ASIAN,
      "score2-diabetes": SCORE2DIABETES,
      "cv-risk-esc": CVRiskESC,

      "who-pen-hearts": WHOPenHearts,

      "cha2ds2-vasc": CHA2DS2VASc,
      "has-bled": HASBLED,

      // Hô hấp
      centor: Centor,
      curb65: CURB65,

      // Truyền nhiễm
      qsofa: QSOFA,

      // Tiêu hoá
      "child-pugh": ChildPugh,

      // Gia đình – xã hội
      "family-apgar": FamilyAPGAR,
      screem: SCREEM,
      pedigree: Pedigree,

      // Nội tiết
      bmi: BMI,
    }),
    []
  );

  const ToolComponent = slugNorm ? componentRegistry[slugNorm] : undefined;

  if (ToolComponent) {
    return <ToolComponent />;
  }

  // =========================
  // Fallback: show placeholder if slug exists but calculator not implemented
  // =========================
  const toolsFlat: ToolFlat[] = useMemo(() => {
    return specialties.flatMap((s: any) =>
      (s.tools ?? []).map((t: any) => ({
        ...t,
        specialtyName: s.name,
      }))
    );
  }, []);

  const tool = useMemo(() => {
    if (!slugNorm) return undefined;
    const route = `/tools/${slugNorm}`;
    return toolsFlat.find((t) => t.route === route);
  }, [slugNorm, toolsFlat]);

  return (
    <div className="page">
      <div className="card">
        <HeaderRow
          title={tool ? tool.name : "Tool đang được phát triển"}
          onBack={() => navigate(-1)}
        />

        <div style={{ color: "var(--muted)", marginBottom: 12, marginTop: 10 }}>
          {tool ? tool.specialtyName : "Không xác định chuyên khoa"} •{" "}
          {tool ? tool.description : `slug: ${slugNorm}`}
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          Trang này sẽ chứa form nhập liệu + tính điểm + diễn giải kết quả.
          <div style={{ marginTop: 8, color: "var(--muted)" }}>
            (Hiện chưa có component calculator cho tool này.)
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <Link
            to="/tools"
            style={{
              textDecoration: "none",
              color: "var(--primary)",
              fontWeight: 800,
            }}
          >
            ← Quay lại danh sách công cụ
          </Link>
        </div>
      </div>
    </div>
  );
}
