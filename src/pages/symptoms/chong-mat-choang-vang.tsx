import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SymptomLayout from "./SymptomLayout";

type DizzyType = "vertigo" | "presyncope" | "disequilibrium" | "unclear";
type Course = "seconds" | "minutes" | "hours_days" | "continuous" | "unclear";
type Trigger = "position" | "standing" | "stress_hypervent" | "none" | "unclear";
type Hearing = "none" | "unilateral_tinnitus_hl" | "bilateral_or_other" | "unclear";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="card"
      style={{
        marginTop: 14,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </section>
  );
}

function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "danger" | "warn" | "ok";
  children: React.ReactNode;
}) {
  const map = {
    neutral: { bg: "#f1f5f9", bd: "#e2e8f0", fg: "#0f172a" },
    danger: { bg: "#fff1f2", bd: "#fecdd3", fg: "#9f1239" },
    warn: { bg: "#fffbeb", bd: "#fde68a", fg: "#92400e" },
    ok: { bg: "#ecfdf5", bd: "#a7f3d0", fg: "#065f46" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: map.bg,
        border: `1px solid ${map.bd}`,
        color: map.fg,
        fontWeight: 800,
        fontSize: 12.5,
      }}
    >
      {children}
    </span>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid var(--line)",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3 }}
      />
      <div>
        <div style={{ fontWeight: 800 }}>{label}</div>
        {hint ? (
          <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 2 }}>
            {hint}
          </div>
        ) : null}
      </div>
    </label>
  );
}

function SmallSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 800 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          height: 38,
          borderRadius: 12,
          border: "1px solid var(--line)",
          padding: "0 10px",
          background: "#fff",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ChongMatChoangVang() {
  // STEP 1: clarify symptom
  const [dizzyType, setDizzyType] = useState<DizzyType>("unclear");
  const [course, setCourse] = useState<Course>("unclear");
  const [trigger, setTrigger] = useState<Trigger>("unclear");
  const [hearing, setHearing] = useState<Hearing>("unclear");

  // STEP 7: exam / stability checklist
  const [vitalsDone, setVitalsDone] = useState(false);
  const [orthostaticDone, setOrthostaticDone] = useState(false);

  // STEP 2: Red flags (central)
  const [rfFocalNeuro, setRfFocalNeuro] = useState(false);
  const [rfSevereAtaxia, setRfSevereAtaxia] = useState(false);
  const [rfCentralNystagmus, setRfCentralNystagmus] = useState(false);
  const [rfDiplopiaDysarthriaDysphagia, setRfDiplopiaDysarthriaDysphagia] =
    useState(false);
  const [rfNewSevereHeadache, setRfNewSevereHeadache] = useState(false);
  const [rfContinuousHoursDays, setRfContinuousHoursDays] = useState(false);
  const [rfHemibodyWeakNumb, setRfHemibodyWeakNumb] = useState(false);

  // Stroke risks
  const [riskHTN, setRiskHTN] = useState(false);
  const [riskDM, setRiskDM] = useState(false);
  const [riskAfib, setRiskAfib] = useState(false);

  // common causes
  const [postViral, setPostViral] = useState(false);
  const [migraineHx, setMigraineHx] = useState(false);
  const [standingTrigger, setStandingTrigger] = useState(false);
  const [anxietyHypervent, setAnxietyHypervent] = useState(false);

  // masking causes / meds
  const [possibleAnemia, setPossibleAnemia] = useState(false);
  const [thyroid, setThyroid] = useState(false);
  const [electrolyte, setElectrolyte] = useState(false);
  const [olderUTI, setOlderUTI] = useState(false);

  const [medAntihypertensive, setMedAntihypertensive] = useState(false);
  const [medDiuretic, setMedDiuretic] = useState(false);
  const [medBzd, setMedBzd] = useState(false);
  const [medAntidepressant, setMedAntidepressant] = useState(false);
  const [alcoholStimulants, setAlcoholStimulants] = useState(false);

  // selective tests
  const [ecgConsidered, setEcgConsidered] = useState(false);
  const [cbcLytesGlucose, setCbcLytesGlucose] = useState(false);
  const [ctMriConsidered, setCtMriConsidered] = useState(false);
  const [audiologyConsidered, setAudiologyConsidered] = useState(false);

  const anyStrokeRisk = useMemo(
    () => riskHTN || riskDM || riskAfib,
    [riskHTN, riskDM, riskAfib]
  );

  const hasRedFlags = useMemo(() => {
    return (
      rfFocalNeuro ||
      rfSevereAtaxia ||
      rfCentralNystagmus ||
      rfDiplopiaDysarthriaDysphagia ||
      rfNewSevereHeadache ||
      rfContinuousHoursDays ||
      rfHemibodyWeakNumb ||
      anyStrokeRisk
    );
  }, [
    rfFocalNeuro,
    rfSevereAtaxia,
    rfCentralNystagmus,
    rfDiplopiaDysarthriaDysphagia,
    rfNewSevereHeadache,
    rfContinuousHoursDays,
    rfHemibodyWeakNumb,
    anyStrokeRisk,
  ]);

  const isVestibular = dizzyType === "vertigo";
  const isNonVestibular = dizzyType === "presyncope" || dizzyType === "disequilibrium";

  const suggestBPPV = useMemo(() => {
    return (
      isVestibular &&
      trigger === "position" &&
      (course === "seconds" || course === "minutes") &&
      hearing !== "unilateral_tinnitus_hl" &&
      !hasRedFlags
    );
  }, [isVestibular, trigger, course, hearing, hasRedFlags]);

  const suggestVestibularNeuritis = useMemo(() => {
    return (
      isVestibular &&
      (course === "hours_days" || course === "continuous") &&
      postViral &&
      hearing !== "unilateral_tinnitus_hl" &&
      !hasRedFlags
    );
  }, [isVestibular, course, postViral, hearing, hasRedFlags]);

  const suggestVestibularMigraine = useMemo(() => {
    return isVestibular && migraineHx && !hasRedFlags;
  }, [isVestibular, migraineHx, hasRedFlags]);

  const suggestOrthostatic = useMemo(() => {
    const trig = trigger === "standing" || standingTrigger || dizzyType === "presyncope";
    return trig && !hasRedFlags;
  }, [trigger, standingTrigger, dizzyType, hasRedFlags]);

  const suggestAcousticNeuroma = useMemo(() => {
    return hearing === "unilateral_tinnitus_hl";
  }, [hearing]);

  const medsOrSubstances = useMemo(() => {
    return (
      medAntihypertensive ||
      medDiuretic ||
      medBzd ||
      medAntidepressant ||
      alcoholStimulants
    );
  }, [
    medAntihypertensive,
    medDiuretic,
    medBzd,
    medAntidepressant,
    alcoholStimulants,
  ]);

  const disposition = useMemo(() => {
    if (hasRedFlags) {
      return {
        tone: "danger" as const,
        title: "Nghi chóng mặt nguy hiểm (trung ương) → chuyển viện khẩn",
        bullets: [
          "Chỉ cần 1 red flag hoặc nguy cơ đột quỵ cao → ưu tiên an toàn.",
          "Không theo dõi ngoại trú; chuyển viện/cấp cứu thần kinh.",
          "Nếu có kinh nghiệm và bệnh nhân đang chóng mặt liên tục: HINTS có thể hỗ trợ định hướng (không thay thế chuyển viện khi nghi trung ương).",
        ],
      };
    }

    if (!vitalsDone) {
      return {
        tone: "warn" as const,
        title: "Chưa đủ dữ kiện → hoàn tất khám bắt buộc trước khi kết luận",
        bullets: [
          "Đo sinh hiệu, tim mạch, tai–thính lực, thần kinh–tiểu não.",
          "Đo HA 3 tư thế nếu nghi tiền ngất/hạ HA tư thế.",
        ],
      };
    }

    if (suggestBPPV) {
      return {
        tone: "ok" as const,
        title: "Gợi ý BPPV (phổ biến nhất) → ưu tiên test & thao tác",
        bullets: [
          "Làm Dix–Hallpike khi nghi BPPV.",
          "Nếu phù hợp: thao tác Epley; không ưu tiên thuốc ức chế tiền đình kéo dài.",
          "Dặn dò phòng té ngã; tái khám nếu thay đổi/không cải thiện.",
        ],
      };
    }

    if (suggestVestibularNeuritis) {
      return {
        tone: "ok" as const,
        title: "Gợi ý viêm TK tiền đình → điều trị ngắn ngày + phục hồi",
        bullets: [
          "Thường sau nhiễm siêu vi; không ù tai/không điếc.",
          "Thuốc triệu chứng ngắn ngày nếu cần + phục hồi tiền đình sớm.",
          "Nếu ù tai/giảm thính lực → nghĩ viêm mê đạo (cân nhắc chuyển tuyến).",
        ],
      };
    }

    if (suggestVestibularMigraine) {
      return {
        tone: "ok" as const,
        title: "Gợi ý migraine tiền đình (hay bị bỏ sót) → khai thác migraine kỹ",
        bullets: [
          "Chóng mặt tái diễn + tiền sử migraine (cá nhân/gia đình); có thể không đau đầu rõ.",
          "Cá thể hoá điều trị/hẹn theo dõi; tránh chẩn đoán vội khi chưa loại trừ nguy hiểm.",
        ],
      };
    }

    if (suggestOrthostatic) {
      return {
        tone: "ok" as const,
        title: "Gợi ý hạ HA tư thế/tiền ngất → ưu tiên HA 3 tư thế + rà soát thuốc",
        bullets: [
          "Đo HA 3 tư thế (nếu chưa).",
          "Chỉnh thuốc, uống đủ nước, đứng dậy từ từ.",
          "Cân nhắc ECG/Holter nếu kèm hồi hộp, ngất, hoặc nghi rối loạn nhịp.",
        ],
      };
    }

    if (anxietyHypervent) {
      return {
        tone: "ok" as const,
        title: "Gợi ý lo âu/tăng thông khí → trấn an + tư vấn (chẩn đoán loại trừ)",
        bullets: [
          "Chỉ kết luận sau khi đã loại trừ nguy hiểm và nguyên nhân nội khoa.",
          "Áp dụng ICE + Bio–Psycho–Social: giải thích cơ chế, giảm sợ hãi, hẹn theo dõi.",
        ],
      };
    }

    return {
      tone: "neutral" as const,
      title: "Chưa rõ nguyên nhân → tìm nguyên nhân che lấp + xét nghiệm chọn lọc",
      bullets: [
        "Rà soát bệnh nội khoa (thiếu máu, tuyến giáp, điện giải, nhiễm trùng tiềm ẩn…) và thuốc.",
        "Người già/nhiều bệnh nền/khám không rõ → cân nhắc ECG, CTM–điện giải–glucose.",
        "Diễn tiến xấu hoặc xuất hiện dấu thần kinh → chuyển viện.",
      ],
    };
  }, [
    hasRedFlags,
    vitalsDone,
    suggestBPPV,
    suggestVestibularNeuritis,
    suggestVestibularMigraine,
    suggestOrthostatic,
    anxietyHypervent,
  ]);

  const pageTitle = "Chóng mặt / choáng váng";
  const subtitle =
    "Ưu tiên loại trừ nguy hiểm (trung ương) → phân nhóm tiền đình/không tiền đình → thường gặp: BPPV & hạ HA tư thế; tránh lạm dụng CT/MRI.";

  // ✅ QUAN TRỌNG: nội dung phải nằm trong children của SymptomLayout
  return (
    <SymptomLayout title={pageTitle} subtitle={subtitle}>
      {/* mini header row (giữ giống các page khác của bạn) */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <Link
          to="/symptoms"
          style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800 }}
        >
          ← Danh sách triệu chứng
        </Link>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill tone={hasRedFlags ? "danger" : vitalsDone ? "ok" : "neutral"}>
            {hasRedFlags ? "Có Red flags" : vitalsDone ? "Đã khám cơ bản" : "Chưa khám đủ"}
          </Pill>
          {isVestibular && !hasRedFlags ? <Pill tone="neutral">Tiền đình (Vertigo)</Pill> : null}
          {isNonVestibular && !hasRedFlags ? <Pill tone="neutral">Không tiền đình</Pill> : null}
          {medsOrSubstances ? <Pill tone="warn">Có thuốc/chất liên quan</Pill> : null}
        </div>
      </div>

      <Section title="1️⃣ BƯỚC 1 — Xác nhận “chóng mặt” & làm rõ bệnh nhân đang nói gì">
        <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Câu hỏi chìa khóa:</b> “Khi bác nói chóng mặt, bác thấy <b>quay tròn</b>,{" "}
          <b>choáng sắp ngất</b>, hay <b>đi không vững</b>?”
          <br />
          Mục tiêu: <b>phân nhóm đúng</b> trước, chưa cần “đặt tên bệnh” ngay.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <SmallSelect<DizzyType>
            label="Bệnh nhân mô tả phù hợp nhất"
            value={dizzyType}
            onChange={setDizzyType}
            options={[
              { value: "unclear", label: "Chưa rõ / hỗn hợp" },
              { value: "vertigo", label: "Quay tròn (Vertigo)" },
              { value: "presyncope", label: "Choáng sắp ngất (Presyncope)" },
              { value: "disequilibrium", label: "Mất thăng bằng (Disequilibrium)" },
            ]}
          />
          <SmallSelect<Course>
            label="Diễn tiến/cơn"
            value={course}
            onChange={setCourse}
            options={[
              { value: "unclear", label: "Chưa rõ" },
              { value: "seconds", label: "Rất ngắn (10–60 giây)" },
              { value: "minutes", label: "Vài phút" },
              { value: "hours_days", label: "Vài giờ – vài ngày" },
              { value: "continuous", label: "Liên tục, không giảm" },
            ]}
          />
          <SmallSelect<Trigger>
            label="Yếu tố khởi phát"
            value={trigger}
            onChange={setTrigger}
            options={[
              { value: "unclear", label: "Chưa rõ" },
              { value: "position", label: "Thay đổi tư thế đầu/thân" },
              { value: "standing", label: "Đứng dậy / đứng lâu" },
              { value: "stress_hypervent", label: "Stress / tăng thông khí" },
              { value: "none", label: "Không rõ yếu tố" },
            ]}
          />
          <SmallSelect<Hearing>
            label="Ù tai/giảm thính lực?"
            value={hearing}
            onChange={setHearing}
            options={[
              { value: "unclear", label: "Chưa hỏi/chưa rõ" },
              { value: "none", label: "Không" },
              { value: "unilateral_tinnitus_hl", label: "Một bên (ù tai + giảm thính lực)" },
              { value: "bilateral_or_other", label: "Hai bên/khác" },
            ]}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          <CheckRow
            label="Khởi phát khi đứng dậy/đứng lâu (gợi ý tiền ngất)"
            checked={standingTrigger}
            onChange={setStandingTrigger}
          />
          <CheckRow
            label="Lo âu/tăng thông khí"
            checked={anxietyHypervent}
            onChange={setAnxietyHypervent}
          />
          <CheckRow
            label="Sau nhiễm siêu vi gần đây"
            checked={postViral}
            onChange={setPostViral}
          />
          <CheckRow
            label="Tiền sử migraine (cá nhân hoặc gia đình)"
            checked={migraineHx}
            onChange={setMigraineHx}
          />
        </div>
      </Section>

      <Section title="2️⃣ BƯỚC 2 — Loại trừ chóng mặt nguy hiểm (Red flags)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill tone="danger">Chỉ cần 1 dấu hiệu → xử trí như cấp cứu thần kinh</Pill>
          <Pill tone={anyStrokeRisk ? "warn" : "neutral"}>
            Nguy cơ đột quỵ: {anyStrokeRisk ? "Có" : "Chưa ghi nhận"}
          </Pill>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="Dấu thần kinh khu trú" checked={rfFocalNeuro} onChange={setRfFocalNeuro} />
          <CheckRow
            label="Mất điều hoà vận động nặng, không tương xứng"
            checked={rfSevereAtaxia}
            onChange={setRfSevereAtaxia}
          />
          <CheckRow
            label="Rung giật nhãn cầu trung ương (dọc/đổi hướng)"
            checked={rfCentralNystagmus}
            onChange={setRfCentralNystagmus}
          />
          <CheckRow
            label="Song thị / nói khó / nuốt khó"
            checked={rfDiplopiaDysarthriaDysphagia}
            onChange={setRfDiplopiaDysarthriaDysphagia}
          />
          <CheckRow
            label="Đau đầu dữ dội mới xuất hiện"
            checked={rfNewSevereHeadache}
            onChange={setRfNewSevereHeadache}
          />
          <CheckRow
            label="Chóng mặt liên tục nhiều giờ – nhiều ngày"
            checked={rfContinuousHoursDays}
            onChange={setRfContinuousHoursDays}
          />
          <CheckRow
            label="Yếu liệt/tê nửa người"
            checked={rfHemibodyWeakNumb}
            onChange={setRfHemibodyWeakNumb}
          />
        </div>

        <div style={{ marginTop: 12, fontWeight: 900 }}>Yếu tố nguy cơ đột quỵ</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 8,
          }}
        >
          <CheckRow label="Tăng huyết áp" checked={riskHTN} onChange={setRiskHTN} />
          <CheckRow label="Đái tháo đường" checked={riskDM} onChange={setRiskDM} />
          <CheckRow label="Rung nhĩ" checked={riskAfib} onChange={setRiskAfib} />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          Có red flags → nghĩ: <b>đột quỵ thân não–tiểu não</b>, u não, xuất huyết não… →{" "}
          <b>chuyển viện khẩn, không theo dõi ngoại trú</b>.
        </div>
      </Section>

      <Section title="3️⃣ BƯỚC 3 — Phân biệt trung ương & ngoại biên (gợi ý thực hành)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Ngoại biên (thường gặp)</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65 }}>
              <li>Khởi phát đột ngột</li>
              <li>Cơn ngắn, từng đợt</li>
              <li>Buồn nôn/nôn rõ</li>
              <li>Rung giật nhãn cầu ngang, một hướng</li>
              <li>Không có dấu thần kinh khu trú</li>
            </ul>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Trung ương (nguy hiểm)</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65 }}>
              <li>Âm ỉ hoặc đột ngột, nhưng hay kéo dài</li>
              <li>Liên tục, không giảm</li>
              <li>Rung giật nhãn cầu dọc / đổi hướng</li>
              <li>Có dấu thần kinh kèm theo</li>
            </ul>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
              Nghi trung ương → <b>không xử trí như tiền đình lành tính</b>.
            </div>
          </div>
        </div>
      </Section>

      <Section title="4️⃣ BƯỚC 4 — Thường gặp nhất tại phòng khám YHGĐ (gợi ý nhanh)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill tone={suggestBPPV ? "ok" : "neutral"}>BPPV: {suggestBPPV ? "Gợi ý cao" : "Chưa rõ"}</Pill>
          <Pill tone={suggestVestibularNeuritis ? "ok" : "neutral"}>
            Viêm TK tiền đình: {suggestVestibularNeuritis ? "Gợi ý cao" : "Chưa rõ"}
          </Pill>
          <Pill tone={suggestVestibularMigraine ? "ok" : "neutral"}>
            Migraine tiền đình: {suggestVestibularMigraine ? "Gợi ý cao" : "Chưa rõ"}
          </Pill>
          <Pill tone={suggestOrthostatic ? "ok" : "neutral"}>
            HA tư thế/tiền ngất: {suggestOrthostatic ? "Gợi ý cao" : "Chưa rõ"}
          </Pill>
          {suggestAcousticNeuroma ? <Pill tone="warn">Nghi u TK thính giác</Pill> : null}
        </div>

        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>
            <b>BPPV (phổ biến nhất):</b> cơn rất ngắn (10–60 giây), khởi phát khi trở mình/ngồi dậy/ngửa đầu; thường không ù tai/không điếc.
          </li>
          <li>
            <b>Viêm TK tiền đình:</b> chóng mặt dữ dội kéo dài vài ngày, thường sau nhiễm siêu vi; không ù tai/không điếc.
          </li>
          <li>
            <b>Migraine tiền đình:</b> tái diễn; có tiền sử migraine, có thể không đau đầu rõ.
          </li>
          <li>
            <b>Không tiền đình:</b> hạ HA tư thế/tiền ngất, lo âu/tăng thông khí, ngất vasovagal…
          </li>
        </ul>
      </Section>

      <Section title="5️⃣ BƯỚC 5 — Nguyên nhân che lấp & thuốc (bắt buộc rà soát)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="Thiếu máu (gợi ý)" checked={possibleAnemia} onChange={setPossibleAnemia} />
          <CheckRow label="Rối loạn tuyến giáp" checked={thyroid} onChange={setThyroid} />
          <CheckRow label="Rối loạn điện giải" checked={electrolyte} onChange={setElectrolyte} />
          <CheckRow
            label="Nhiễm trùng tiềm ẩn (UTI ở người già…) (gợi ý)"
            checked={olderUTI}
            onChange={setOlderUTI}
          />
        </div>

        <div style={{ marginTop: 12, fontWeight: 900 }}>Thuốc/chất hay gây chóng mặt</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 8,
          }}
        >
          <CheckRow
            label="Thuốc hạ huyết áp"
            checked={medAntihypertensive}
            onChange={setMedAntihypertensive}
          />
          <CheckRow label="Lợi tiểu" checked={medDiuretic} onChange={setMedDiuretic} />
          <CheckRow label="Benzodiazepine" checked={medBzd} onChange={setMedBzd} />
          <CheckRow
            label="Thuốc chống trầm cảm"
            checked={medAntidepressant}
            onChange={setMedAntidepressant}
          />
          <CheckRow
            label="Rượu / chất kích thích"
            checked={alcoholStimulants}
            onChange={setAlcoholStimulants}
          />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Rà soát thuốc là bước bắt buộc.</b> Nếu có thuốc/chất liên quan, ưu tiên điều chỉnh và theo dõi lại.
        </div>
      </Section>

      <Section title="7️⃣ Khám lâm sàng có trọng điểm (checklist)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill tone={vitalsDone ? "ok" : "neutral"}>Sinh hiệu: {vitalsDone ? "Đã đo" : "Chưa đo"}</Pill>
          <Pill tone={orthostaticDone ? "ok" : "neutral"}>
            HA 3 tư thế: {orthostaticDone ? "Đã đo" : "Chưa đo"}
          </Pill>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="Đã đo sinh hiệu" checked={vitalsDone} onChange={setVitalsDone} />
          <CheckRow
            label="Đã đo huyết áp 3 tư thế (nếu nghi tiền ngất)"
            checked={orthostaticDone}
            onChange={setOrthostaticDone}
          />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Khám bắt buộc:</b> sinh hiệu; tim mạch; tai–thính lực; thần kinh–tiểu não. <br />
          <b>Test tại phòng khám:</b> Dix–Hallpike (nghi BPPV), Romberg; HINTS (chỉ khi có kinh nghiệm và bệnh nhân đang chóng mặt liên tục).
        </div>
      </Section>

      <Section title="8️⃣ Cận lâm sàng — chỉ định có chọn lọc">
        <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          ❌ Không cần làm khi: BPPV điển hình / ngoại biên rõ / không red flags. <br />
          ✅ Cân nhắc khi: nghi trung ương, không rõ nguyên nhân, người già/nhiều bệnh nền.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          <CheckRow
            label="Cân nhắc ECG ± Holter"
            checked={ecgConsidered}
            onChange={setEcgConsidered}
            hint="Khi tiền ngất/ngất, hồi hộp, nghi rối loạn nhịp."
          />
          <CheckRow
            label="Cân nhắc CTM + điện giải + glucose"
            checked={cbcLytesGlucose}
            onChange={setCbcLytesGlucose}
          />
          <CheckRow
            label="Cân nhắc CT/MRI não"
            checked={ctMriConsidered}
            onChange={setCtMriConsidered}
            hint="Khi nghi trung ương hoặc khám thần kinh bất thường."
          />
          <CheckRow
            label="Đo thính lực (khi nghi u TK thính giác)"
            checked={audiologyConsidered}
            onChange={setAudiologyConsidered}
          />
        </div>
      </Section>

      <Section title="9️⃣ Quyết định xử trí & chỉ định chuyển tuyến">
        <div
          style={{
            borderRadius: 16,
            border: "1px solid var(--line)",
            padding: 14,
            background:
              disposition.tone === "danger"
                ? "#fff1f2"
                : disposition.tone === "warn"
                ? "#fffbeb"
                : disposition.tone === "ok"
                ? "#ecfdf5"
                : "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Pill tone={disposition.tone}>
              {disposition.tone === "danger"
                ? "CHUYỂN VIỆN"
                : disposition.tone === "warn"
                ? "ĐÁNH GIÁ"
                : disposition.tone === "ok"
                ? "NGOẠI TRÚ"
                : "THEO DÕI"}
            </Pill>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{disposition.title}</div>
          </div>

          <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            {disposition.bullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>

          {hasRedFlags ? (
            <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
              <b>Chỉ định chuyển tuyến:</b> có red flags / nghi trung ương / không cải thiện / trẻ em chóng mặt /
              nghi u, nhiễm trùng, bệnh tim.
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Nguyên tắc:</b> loại trừ trung ương trước; điều trị theo nguyên nhân;{" "}
          <b>không lạm dụng thuốc ức chế tiền đình kéo dài</b>.
        </div>
      </Section>

      <Section title="🔁 Tóm tắt thuật toán 1 trang">
        <div
          style={{
            border: "1px dashed var(--line)",
            borderRadius: 14,
            padding: 12,
            background: "#fff",
            lineHeight: 1.65,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>CHÓNG MẶT → xử trí theo thứ tự</div>
          <div>
            1) <b>Red flags?</b> → <b>Có</b> → Chuyển viện. <br />
            2) <b>Không</b> → <b>Tiền đình hay không?</b> <br />
            3) <b>Tiền đình</b> → BPPV / Viêm TK tiền đình / Migraine. <br />
            4) <b>Không tiền đình</b> → HA tư thế / tim mạch / lo âu. <br />
            5) <b>Không rõ</b> → tìm bệnh che lấp + rà soát thuốc + xét nghiệm chọn lọc.
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Kết luận thực hành:</b> Chóng mặt là <b>chứng</b>, không phải chẩn đoán. Ưu tiên không bỏ sót đột quỵ;
          tránh lạm dụng CT/MRI; bệnh sử + khám quyết định phần lớn chẩn đoán.{" "}
          <b>BPPV và hạ HA tư thế</b> là 2 nguyên nhân phổ biến nhất.
        </div>
      </Section>
    </SymptomLayout>
  );
}
