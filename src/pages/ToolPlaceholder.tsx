// src/pages/ToolPlaceholder.tsx
import { useMemo } from "react";
import type { ComponentType } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { specialties } from "../data/tools";

// Existing calculators
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

import PHQ9 from "../calculators/PHQ9";
import GAD7 from "../calculators/GAD7";
import AuditC from "../calculators/AuditC";
import StopBang from "../calculators/StopBang";
import Epworth from "../calculators/Epworth";
import QTcCalculator from "../calculators/QTcCalculator";

// Batch 1 calculators
import BSA from "../calculators/BSA";
import Hba1cEag from "../calculators/Hba1cEag";
import CorrectedCalcium from "../calculators/CorrectedCalcium";
import CockcroftGault from "../calculators/CockcroftGault";
import FENa from "../calculators/FENa";
import FEUrea from "../calculators/FEUrea";
import AKIKDIGO from "../calculators/AKIKDIGO";

type ToolFlat = {
  id: string;
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

  // Special-case legacy route
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

  const componentRegistry: Record<string, ComponentType> = useMemo(
    () => ({
      // =========================
      // GIA ĐÌNH – XÃ HỘI
      // =========================
      "family-apgar": FamilyAPGAR,
      screem: SCREEM,
      phq9: PHQ9,
      gad7: GAD7,
      "audit-c": AuditC,
      pedigree: Pedigree,

      // =========================
      // THẬN – TIẾT NIỆU
      // =========================
      egfr: EGFR,
      "cockcroft-gault": CockcroftGault,
      "aki-kdigo": AKIKDIGO,
      fena: FENa,
      feurea: FEUrea,

      // =========================
      // TIM MẠCH
      // =========================
      score2: SCORE2,
      "score2-op": SCORE2OP,
      "score2-asian": SCORE2ASIAN,
      "score2-diabetes": SCORE2DIABETES,
      "cv-risk-esc": CVRiskESC,
      "who-pen-hearts": WHOPenHearts,
      "cha2ds2-vasc": CHA2DS2VASc,
      "has-bled": HASBLED,
      qtc: QTcCalculator,

      // =========================
      // HÔ HẤP
      // =========================
      centor: Centor,
      curb65: CURB65,

      // =========================
      // GIẤC NGỦ
      // =========================
      isi: ISI,
      "stop-bang": StopBang,
      epworth: Epworth,

      // =========================
      // NỘI TIẾT
      // =========================
      bmi: BMI,
      bsa: BSA,
      "hba1c-eag": Hba1cEag,
      "corrected-calcium": CorrectedCalcium,

      // =========================
      // TIÊU HOÁ
      // =========================
      "child-pugh": ChildPugh,

      // =========================
      // TRUYỀN NHIỄM
      // =========================
      qsofa: QSOFA,
    }),
    []
  );

  const ToolComponent = slugNorm ? componentRegistry[slugNorm] : undefined;

  if (ToolComponent) {
    return <ToolComponent />;
  }

  const toolsFlat: ToolFlat[] = useMemo(() => {
    return specialties.flatMap((s) =>
      (s.tools ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        route: t.route,
        specialtyName: s.name,
      }))
    );
  }, []);

  const tool = useMemo(() => {
    if (!slugNorm) return undefined;

    return toolsFlat.find((t) => {
      const routeSlug = t.route.startsWith("/tools/")
        ? t.route.replace("/tools/", "").toLowerCase().trim()
        : "";
      return routeSlug === slugNorm;
    });
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