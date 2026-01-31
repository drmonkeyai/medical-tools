import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RiskTargetsCard from "../components/RiskTargetsCard";
import type { RiskLevel } from "./riskBadge";
import { calcSCORE2OP, type RiskRegion, type Sex, clamp } from "./score2Core";

function riskLevelFromPercent_SCORE2_OP(p: number): RiskLevel {
  if (p < 2) return "low";
  if (p < 10) return "moderate";
  if (p < 20) return "high";
  return "very-high";
}

function parseNum(x: string | null): number | undefined {
  if (x === null) return undefined;
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

export default function SCORE2OP() {
  const navigate = useNavigate();
  const location = useLocation();

  const [region, setRegion] = useState<RiskRegion>("High");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(75);
  const [smoker, setSmoker] = useState<0 | 1>(0);
  const [hasDiabetes, setHasDiabetes] = useState<0 | 1>(0);
  const [sbp, setSbp] = useState<number>(150);
  const [totalChol, setTotalChol] = useState<number>(5.5);
  const [hdl, setHdl] = useState<number>(1.4);

  // ✅ nhận dữ liệu khi chuyển từ SCORE2
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("from") !== "score2") return;

    const qRegion = q.get("region") as RiskRegion | null;
    const qSex = q.get("sex") as Sex | null;

    const qAge = parseNum(q.get("age"));
    const qSmoker = parseNum(q.get("smoker"));
    const qSbp = parseNum(q.get("sbp"));
    const qTc = parseNum(q.get("tc"));
    const qHdl = parseNum(q.get("hdl"));

    if (qRegion) setRegion(qRegion);
    if (qSex) setSex(qSex);
    if (qAge !== undefined) setAge(qAge);
    if (qSmoker !== undefined) setSmoker((qSmoker ? 1 : 0) as 0 | 1);
    if (qSbp !== undefined) setSbp(qSbp);
    if (qTc !== undefined) setTotalChol(qTc);
    if (qHdl !== undefined) setHdl(qHdl);
  }, [location.search]);

  const isUnderAge = Number.isFinite(age) && age < 70;

  // ✅ Modal: age < 70 -> chuyển SCORE2
  const [showUnderAgeModal, setShowUnderAgeModal] = useState(false);
  useEffect(() => {
    if (isUnderAge) setShowUnderAgeModal(true);
    else setShowUnderAgeModal(false);
  }, [isUnderAge]);

  function buildScore2Url() {
    const q = new URLSearchParams();
    q.set("from", "score2-op");
    q.set("region", region);
    q.set("sex", sex);
    q.set("age", String(Math.round(age)));
    q.set("smoker", String(smoker));
    q.set("sbp", String(Math.round(sbp)));
    q.set("tc", String(totalChol));
    q.set("hdl", String(hdl));
    return `/tools/score2?${q.toString()}`;
  }

  function goToScore2() {
    if (location.pathname !== "/tools/score2") {
      navigate(buildScore2Url(), { replace: true });
    }
  }

  // ✅ Modal: diabetes -> chuyển SCORE2-DIABETES
  const [showDmModal, setShowDmModal] = useState(false);
  useEffect(() => {
    if (hasDiabetes === 1) setShowDmModal(true);
  }, [hasDiabetes]);

  function buildDiabetesUrl() {
    const q = new URLSearchParams();
    q.set("from", "score2-op");
    q.set("region", region);
    q.set("sex", sex);
    q.set("age", String(Math.round(age)));
    q.set("smoker", String(smoker));
    q.set("sbp", String(Math.round(sbp)));
    q.set("tc", String(totalChol));
    q.set("hdl", String(hdl));
    return `/tools/score2-diabetes?${q.toString()}`;
  }

  function goToDiabetes() {
    navigate(buildDiabetesUrl(), { replace: false });
  }

  const safe = useMemo(() => {
    const a = clamp(Math.round(age), 70, 99);
    const s = clamp(Math.round(sbp), 90, 220);
    const tc = clamp(totalChol, 2.0, 10.0);
    const h = clamp(hdl, 0.5, 3.0);
    return { a, s, tc, h };
  }, [age, sbp, totalChol, hdl]);

  const result = useMemo(() => {
    if (isUnderAge) return null; // ✅ không tính OP khi <70
    if (!Number.isFinite(age)) return null;

    try {
      return calcSCORE2OP({
        region,
        age: safe.a,
        sex,
        smoker,
        sbp: safe.s,
        totalChol: safe.tc,
        hdl: safe.h,
        diabetes: 0,
      });
    } catch {
      return null;
    }
  }, [isUnderAge, age, region, sex, smoker, safe]);

  const riskPercent =
    typeof (result as any)?.riskPercent === "number" ? (result as any).riskPercent : undefined;

  const level: RiskLevel | undefined =
    typeof riskPercent === "number" && Number.isFinite(riskPercent)
      ? riskLevelFromPercent_SCORE2_OP(riskPercent)
      : undefined;

  return (
    <div className="page">
      <div className="card">
        <div className="calcHeader">
          <div>
            <h1 className="calcTitle">SCORE2-OP</h1>
            <div className="calcSub">
              Ước tính nguy cơ tim mạch 5–10 năm cho người ≥70 tuổi. Tuổi &lt;70 cần dùng SCORE2.
            </div>
          </div>

          <button className="btn" onClick={() => navigate(-1)} title="Trở về trang trước">
            ← Trở về trang trước
          </button>
        </div>

        <div className="formGrid">
          <div className="field field--wide">
            <label className="label">Risk region</label>
            <select className="select" value={region} onChange={(e) => setRegion(e.target.value as RiskRegion)}>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very high">Very high</option>
            </select>
          </div>

          <div className="field field--wide">
            <label className="label">Giới</label>
            <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="field field--wide">
            <label className="label">Tuổi (≥70)</label>
            <input
              className="input"
              type="number"
              value={Number.isFinite(age) ? age : ""}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="≥70"
            />
            <div className="help">Nếu nhập &lt;70, hệ thống sẽ đề xuất chuyển về SCORE2.</div>
          </div>

          <div className="field field--wide">
            <label className="label">Hút thuốc</label>
            <select className="select" value={smoker} onChange={(e) => setSmoker(Number(e.target.value) as 0 | 1)}>
              <option value={0}>Không</option>
              <option value={1}>Có</option>
            </select>
          </div>

          <div className="field field--wide">
            <label className="label">Đái tháo đường</label>
            <select className="select" value={hasDiabetes} onChange={(e) => setHasDiabetes(Number(e.target.value) as 0 | 1)}>
              <option value={0}>Không</option>
              <option value={1}>Có → dùng SCORE2-DIABETES</option>
            </select>
            <div className="help">Nếu có ĐTĐ, nên dùng SCORE2-DIABETES.</div>
          </div>

          <div className="field field--wide">
            <label className="label">HA tâm thu (mmHg)</label>
            <input className="input" type="number" value={sbp} onChange={(e) => setSbp(Number(e.target.value))} />
          </div>

          <div className="field field--wide">
            <label className="label">Cholesterol toàn phần (mmol/L)</label>
            <input className="input" type="number" step="0.1" value={totalChol} onChange={(e) => setTotalChol(Number(e.target.value))} />
          </div>

          <div className="field field--wide">
            <label className="label">HDL (mmol/L)</label>
            <input className="input" type="number" step="0.1" value={hdl} onChange={(e) => setHdl(Number(e.target.value))} />
          </div>
        </div>

        <div className="divider" />

        {isUnderAge ? (
          <div style={{ color: "var(--muted)", fontWeight: 700 }}>
            Tuổi &lt; 70: SCORE2-OP không áp dụng. Vui lòng chuyển sang SCORE2.
          </div>
        ) : level ? (
          <RiskTargetsCard modelName="SCORE2-OP" riskLevel={level} riskPercent={riskPercent} showSecondary={true} />
        ) : (
          <div style={{ color: "var(--muted)", fontWeight: 700 }}>
            Chưa có kết quả (kiểm tra lại dữ liệu nhập).
          </div>
        )}
      </div>

      {/* Modal: age <70 -> chuyển SCORE2 */}
      {showUnderAgeModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowUnderAgeModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "white",
              boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Tuổi &lt; 70 → cần dùng SCORE2</div>

              <button
                onClick={() => setShowUnderAgeModal(false)}
                style={{
                  border: "1px solid var(--line)",
                  background: "white",
                  borderRadius: 12,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
                title="Đóng"
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)", fontWeight: 700, lineHeight: 1.5 }}>
              SCORE2-OP chỉ áp dụng cho <b>≥70 tuổi</b>. Với tuổi <b>&lt;70</b>, guideline khuyến cáo dùng <b>SCORE2</b>.
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setShowUnderAgeModal(false);
                  setAge(70);
                }}
                style={{
                  border: "1px solid var(--line)",
                  background: "white",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Ở lại (nhập lại tuổi)
              </button>

              <button
                onClick={goToScore2}
                style={{
                  border: "none",
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Chuyển sang SCORE2 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: diabetes -> chuyển SCORE2-DIABETES */}
      {showDmModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDmModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9998,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "white",
              boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Có đái tháo đường → nên dùng SCORE2-DIABETES</div>

              <button
                onClick={() => setShowDmModal(false)}
                style={{
                  border: "1px solid var(--line)",
                  background: "white",
                  borderRadius: 12,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
                title="Đóng"
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)", fontWeight: 700, lineHeight: 1.5 }}>
              SCORE2-DIABETES dùng thêm <b>tuổi chẩn đoán ĐTĐ, HbA1c, eGFR</b> để ước tính nguy cơ chính xác hơn.
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setShowDmModal(false);
                  setHasDiabetes(0);
                }}
                style={{
                  border: "1px solid var(--line)",
                  background: "white",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Ở lại
              </button>

              <button
                onClick={goToDiabetes}
                style={{
                  border: "none",
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Chuyển sang SCORE2-DIABETES →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
