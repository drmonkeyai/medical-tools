import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SymptomLayout from "./SymptomLayout";

type AgeGroup = "adult" | "peds";
type PainQuality =
  | "epThat"
  | "nongRat"
  | "nhoi"
  | "tucNang"
  | "khongRo";
type Exertional = "co" | "khong" | "khongRo";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
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
        fontWeight: 700,
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
        <div style={{ fontWeight: 700 }}>{label}</div>
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
      <div style={{ fontWeight: 700 }}>{label}</div>
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

export default function DauNguc() {
  // Step 0: Basic selectors (optional but useful)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [painQuality, setPainQuality] = useState<PainQuality>("khongRo");
  const [exertional, setExertional] = useState<Exertional>("khongRo");

  // Step 1-2: Quick assessment / stability
  const [vitalsOk, setVitalsOk] = useState(false);
  const [spo2LowOrDyspnea, setSpo2LowOrDyspnea] = useState(false);
  const [alteredMental, setAlteredMental] = useState(false);
  const [severePain, setSeverePain] = useState(false);

  // Step 2: Red flags (adult)
  const [rfExertionOrSudden, setRfExertionOrSudden] = useState(false);
  const [rfProlonged20m, setRfProlonged20m] = useState(false);
  const [rfDiaphoresisNausea, setRfDiaphoresisNausea] = useState(false);
  const [rfHemoptysis, setRfHemoptysis] = useState(false);
  const [rfSyncope, setRfSyncope] = useState(false);
  const [rfWeightLoss, setRfWeightLoss] = useState(false);
  const [rfBpPulseDiff, setRfBpPulseDiff] = useState(false);

  const [hxCvd, setHxCvd] = useState(false);
  const [hxThrombo, setHxThrombo] = useState(false);
  const [hxCancer, setHxCancer] = useState(false);
  const [hxImmobTravel, setHxImmobTravel] = useState(false);

  // Step 2: Red flags (peds)
  const [rfPedsExertional, setRfPedsExertional] = useState(false);
  const [rfPedsSyncope, setRfPedsSyncope] = useState(false);
  const [rfPedsCyanosisDyspnea, setRfPedsCyanosisDyspnea] = useState(false);
  const [rfPedsPalpitations, setRfPedsPalpitations] = useState(false);
  const [rfPedsFamHx, setRfPedsFamHx] = useState(false);

  // Step 4: Common non-life-threatening features
  const [tenderChestWall, setTenderChestWall] = useState(false);
  const [worseWithMove, setWorseWithMove] = useState(false);

  const [heartburnMealRelated, setHeartburnMealRelated] = useState(false);
  const [worseLyingDown, setWorseLyingDown] = useState(false);

  const [pleuritic, setPleuritic] = useState(false);
  const [coughFever, setCoughFever] = useState(false);

  const [anxietyPanic, setAnxietyPanic] = useState(false);

  // Step 6: Selective tests (checkbox style)
  const [ecgDone, setEcgDone] = useState(false);
  const [ecgNormal, setEcgNormal] = useState(false);

  // Risk factors (Step 5)
  const [rfHTN, setRfHTN] = useState(false);
  const [rfDM, setRfDM] = useState(false);
  const [rfDyslip, setRfDyslip] = useState(false);
  const [rfObesity, setRfObesity] = useState(false);
  const [rfSmoking, setRfSmoking] = useState(false);

  const anyCardioRisk = useMemo(
    () => rfHTN || rfDM || rfDyslip || rfObesity || rfSmoking,
    [rfHTN, rfDM, rfDyslip, rfObesity, rfSmoking]
  );

  const redFlagsAdult = useMemo(() => {
    return (
      rfExertionOrSudden ||
      rfProlonged20m ||
      spo2LowOrDyspnea ||
      rfDiaphoresisNausea ||
      rfHemoptysis ||
      rfSyncope ||
      rfWeightLoss ||
      rfBpPulseDiff ||
      hxCvd ||
      hxThrombo ||
      hxCancer ||
      hxImmobTravel ||
      alteredMental ||
      severePain
    );
  }, [
    rfExertionOrSudden,
    rfProlonged20m,
    spo2LowOrDyspnea,
    rfDiaphoresisNausea,
    rfHemoptysis,
    rfSyncope,
    rfWeightLoss,
    rfBpPulseDiff,
    hxCvd,
    hxThrombo,
    hxCancer,
    hxImmobTravel,
    alteredMental,
    severePain,
  ]);

  const redFlagsPeds = useMemo(() => {
    return (
      rfPedsExertional ||
      rfPedsSyncope ||
      rfPedsCyanosisDyspnea ||
      rfPedsPalpitations ||
      rfPedsFamHx ||
      spo2LowOrDyspnea ||
      alteredMental ||
      severePain
    );
  }, [
    rfPedsExertional,
    rfPedsSyncope,
    rfPedsCyanosisDyspnea,
    rfPedsPalpitations,
    rfPedsFamHx,
    spo2LowOrDyspnea,
    alteredMental,
    severePain,
  ]);

  const hasRedFlags = ageGroup === "adult" ? redFlagsAdult : redFlagsPeds;

  const likelyChestWall = tenderChestWall || worseWithMove;
  const likelyGI = heartburnMealRelated || worseLyingDown;
  const likelyResp = pleuritic || coughFever;
  const likelyPsych = anxietyPanic;

  const suspicionCardiac = useMemo(() => {
    // heuristic for family medicine triage (not a diagnostic score)
    const typicalQuality = painQuality === "epThat" || painQuality === "tucNang";
    const exert = exertional === "co";
    return (
      hasRedFlags ||
      exert ||
      typicalQuality ||
      anyCardioRisk ||
      hxCvd ||
      (ecgDone && !ecgNormal)
    );
  }, [
    painQuality,
    exertional,
    hasRedFlags,
    anyCardioRisk,
    hxCvd,
    ecgDone,
    ecgNormal,
  ]);

  const disposition = useMemo(() => {
    // priority: emergency vs outpatient
    if (hasRedFlags) {
      return {
        tone: "danger" as const,
        title: "Xử trí như cấp cứu / chuyển viện ngay",
        bullets: [
          "Có ≥1 red flags → ưu tiên an toàn.",
          "Làm ECG nếu có thể (không trì hoãn chuyển viện).",
          "Xử trí ban đầu theo điều kiện (ABC, O₂ nếu SpO₂ thấp, đường truyền nếu cần…).",
        ],
      };
    }

    // if no red flags: need stability + ECG status guide
    if (!vitalsOk) {
      return {
        tone: "warn" as const,
        title: "Chưa đủ dữ kiện ổn định → đánh giá lại nhanh",
        bullets: [
          "Hoàn tất sinh hiệu/tri giác/SpO₂ và mức độ đau.",
          "Nếu bất thường → xử trí như cấp cứu.",
        ],
      };
    }

    // stable: guide to likely cause buckets
    const buckets: string[] = [];
    if (likelyChestWall) buckets.push("Cơ–xương–thành ngực");
    if (likelyGI) buckets.push("Tiêu hoá (GERD/viêm thực quản…)");
    if (likelyResp) buckets.push("Hô hấp (viêm phổi/màng phổi/hen…)");
    if (likelyPsych) buckets.push("Tâm lý–chức năng (lo âu/hoảng sợ…)");

    if (suspicionCardiac) {
      return {
        tone: "warn" as const,
        title: "Cân nhắc nguyên nhân tim mạch / cần cận lâm sàng chọn lọc",
        bullets: [
          "Không red flags nhưng có yếu tố gợi ý tim mạch hoặc nguy cơ cao.",
          "Cân nhắc ECG (nếu chưa), troponin theo bối cảnh, hoặc chuyển tuyến tuỳ nguy cơ.",
          "Dặn dấu hiệu trở nặng và hẹn tái khám sớm.",
        ],
      };
    }

    return {
      tone: "ok" as const,
      title: "Theo dõi & điều trị ngoại trú (nguy cơ thấp)",
      bullets: [
        buckets.length
          ? `Nguyên nhân thường gặp gợi ý: ${buckets.join(" / ")}.`
          : "Không gợi ý rõ → theo dõi sát + xem xét cận lâm sàng chọn lọc nếu kéo dài.",
        "Giải thích – trấn an đúng; dặn dò dấu hiệu cảnh báo (đau tăng, khó thở, ngất, vã mồ hôi…).",
        "Đánh giá yếu tố Bio–Psycho–Social (ICE, stress, sợ nhồi máu…) để giảm tái khám không cần thiết.",
      ],
    };
  }, [
    hasRedFlags,
    vitalsOk,
    likelyChestWall,
    likelyGI,
    likelyResp,
    likelyPsych,
    suspicionCardiac,
  ]);

  const pageTitle = "Đau ngực";
  const subtitle =
    "Ưu tiên loại trừ nguy hiểm → phân biệt tim/không tim → xử trí ngoại trú có chọn lọc, kết hợp Bio–Psycho–Social.";

  return (
    <SymptomLayout title={pageTitle} subtitle={subtitle}>
      {/* Quick nav back */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <Link to="/symptoms" style={{ textDecoration: "none", color: "var(--primary)" }}>
          ← Danh sách triệu chứng
        </Link>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill tone={hasRedFlags ? "danger" : vitalsOk ? "ok" : "neutral"}>
            {hasRedFlags ? "Có Red flags" : vitalsOk ? "Sinh hiệu ổn" : "Chưa đánh giá đủ"}
          </Pill>
          {suspicionCardiac && !hasRedFlags ? <Pill tone="warn">Cân nhắc tim mạch</Pill> : null}
        </div>
      </div>

      {/* BƯỚC 1 */}
      <Section title="1️⃣ BƯỚC 1 — Xác nhận đau ngực & đánh giá nhanh (1–2 phút)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <SmallSelect<AgeGroup>
              label="Nhóm tuổi"
              value={ageGroup}
              onChange={setAgeGroup}
              options={[
                { value: "adult", label: "Người lớn" },
                { value: "peds", label: "Trẻ em / vị thành niên" },
              ]}
            />
            <SmallSelect<PainQuality>
              label="Tính chất đau (gợi ý)"
              value={painQuality}
              onChange={setPainQuality}
              options={[
                { value: "khongRo", label: "Không rõ / hỗn hợp" },
                { value: "epThat", label: "Ép thắt / bóp nghẹt" },
                { value: "tucNang", label: "Tức / nặng ngực" },
                { value: "nongRat", label: "Nóng rát sau xương ức" },
                { value: "nhoi", label: "Nhói / châm chích" },
              ]}
            />
            <SmallSelect<Exertional>
              label="Liên quan gắng sức?"
              value={exertional}
              onChange={setExertional}
              options={[
                { value: "khongRo", label: "Chưa rõ" },
                { value: "co", label: "Có" },
                { value: "khong", label: "Không" },
              ]}
            />
          </div>

          <div style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.5 }}>
            <b>Nhắc ưu tiên:</b> Không phải mọi đau ngực đều do tim, nhưng luôn phải nghĩ đến tim trước.  
            Đánh giá nhanh: <b>HA, mạch, SpO₂, nhịp thở, tri giác</b>, mức độ đau, kèm khó thở/vã mồ hôi/buồn nôn.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            <CheckRow
              label="Sinh hiệu ổn (HA/mạch/nhịp thở chấp nhận được, SpO₂ không giảm)"
              checked={vitalsOk}
              onChange={setVitalsOk}
              hint="Nếu chưa đánh giá hoặc bất thường → ưu tiên an toàn."
            />
            <CheckRow
              label="Khó thở hoặc SpO₂ giảm"
              checked={spo2LowOrDyspnea}
              onChange={setSpo2LowOrDyspnea}
              hint="Tự xem là red flags nếu rõ."
            />
            <CheckRow
              label="Tri giác bất thường / lơ mơ"
              checked={alteredMental}
              onChange={setAlteredMental}
              hint="Red flags."
            />
            <CheckRow
              label="Đau rất nhiều / không chịu được"
              checked={severePain}
              onChange={setSeverePain}
              hint="Cần đánh giá nguy hiểm."
            />
          </div>
        </div>
      </Section>

      {/* BƯỚC 2 */}
      <Section title="2️⃣ BƯỚC 2 — Loại trừ đau ngực nguy hiểm (Red flags)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill tone="danger">Chỉ cần 1 dấu hiệu → xử trí như cấp cứu</Pill>
          <Pill tone="neutral">Gợi ý: ECG ± xử trí ban đầu → chuyển viện</Pill>
        </div>

        {ageGroup === "adult" ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 10,
              }}
            >
              <CheckRow
                label="Đau ngực khi gắng sức hoặc khởi phát đột ngột"
                checked={rfExertionOrSudden}
                onChange={setRfExertionOrSudden}
              />
              <CheckRow
                label="Đau kéo dài > 20 phút"
                checked={rfProlonged20m}
                onChange={setRfProlonged20m}
              />
              <CheckRow
                label="Vã mồ hôi lạnh / buồn nôn"
                checked={rfDiaphoresisNausea}
                onChange={setRfDiaphoresisNausea}
              />
              <CheckRow
                label="Ho ra máu"
                checked={rfHemoptysis}
                onChange={setRfHemoptysis}
              />
              <CheckRow
                label="Ngất hoặc tiền ngất"
                checked={rfSyncope}
                onChange={setRfSyncope}
              />
              <CheckRow
                label="Sụt cân không chủ ý"
                checked={rfWeightLoss}
                onChange={setRfWeightLoss}
              />
              <CheckRow
                label="Chênh lệch HA hoặc mạch hai tay"
                checked={rfBpPulseDiff}
                onChange={setRfBpPulseDiff}
              />
            </div>

            <div style={{ marginTop: 12, fontWeight: 800 }}>Tiền sử nguy cơ</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 10,
                marginTop: 8,
              }}
            >
              <CheckRow label="Bệnh tim mạch" checked={hxCvd} onChange={setHxCvd} />
              <CheckRow label="Huyết khối" checked={hxThrombo} onChange={setHxThrombo} />
              <CheckRow label="Ung thư" checked={hxCancer} onChange={setHxCancer} />
              <CheckRow
                label="Bất động kéo dài / bay đường dài"
                checked={hxImmobTravel}
                onChange={setHxImmobTravel}
              />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 10,
              }}
            >
              <CheckRow
                label="Đau khi gắng sức"
                checked={rfPedsExertional}
                onChange={setRfPedsExertional}
              />
              <CheckRow
                label="Đau kèm ngất"
                checked={rfPedsSyncope}
                onChange={setRfPedsSyncope}
              />
              <CheckRow
                label="Khó thở / tím tái"
                checked={rfPedsCyanosisDyspnea}
                onChange={setRfPedsCyanosisDyspnea}
              />
              <CheckRow
                label="Trống ngực rõ"
                checked={rfPedsPalpitations}
                onChange={setRfPedsPalpitations}
              />
              <CheckRow
                label="Tiền sử tim mạch gia đình"
                checked={rfPedsFamHx}
                onChange={setRfPedsFamHx}
              />
            </div>
          </>
        )}
      </Section>

      {/* BƯỚC 3 */}
      <Section title="3️⃣ BƯỚC 3 — 5 nguyên nhân đe doạ tính mạng (phải loại trừ)">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill tone="danger">Không được bỏ sót</Pill>
            <Pill tone="neutral">Nếu nghi ngờ → không theo dõi ngoại trú</Pill>
          </div>

          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Hội chứng mạch vành cấp</li>
            <li>Thuyên tắc phổi</li>
            <li>Bóc tách động mạch chủ</li>
            <li>Tràn khí màng phổi áp lực</li>
            <li>Vỡ phình động mạch chủ</li>
          </ul>

          <div style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.5 }}>
            Nếu <b>có red flags</b> hoặc <b>nghi ngờ</b> bất kỳ nguyên nhân nào trên:
            ưu tiên an toàn → xử trí ban đầu theo điều kiện → chuyển viện.
          </div>
        </div>
      </Section>

      {/* BƯỚC 4 */}
      <Section title="4️⃣ BƯỚC 4 — Đau ngực không đe doạ tính mạng: nguyên nhân thường gặp">
        <div style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55 }}>
          Chỉ xét nhóm này khi: <b>không red flags</b>, <b>sinh hiệu ổn</b>, và (nếu làm){" "}
          <b>ECG không gợi thiếu máu cơ tim</b>.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800 }}>4.1 Cơ–xương–thành ngực (thường gặp nhất)</div>
            <CheckRow
              label="Đau tăng khi ấn vào thành ngực"
              checked={tenderChestWall}
              onChange={setTenderChestWall}
            />
            <CheckRow
              label="Đau tăng khi cử động / xoay người"
              checked={worseWithMove}
              onChange={setWorseWithMove}
            />
            <div style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.5 }}>
              Ví dụ: viêm sụn sườn, đau cơ gian sườn, gãy xương sườn kín…
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800 }}>4.2 Tiêu hoá</div>
            <CheckRow
              label="Nóng rát sau xương ức / liên quan bữa ăn"
              checked={heartburnMealRelated}
              onChange={setHeartburnMealRelated}
            />
            <CheckRow
              label="Tăng khi nằm"
              checked={worseLyingDown}
              onChange={setWorseLyingDown}
            />
            <div style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.5 }}>
              Gợi ý: GERD, viêm thực quản, co thắt thực quản, loét dạ dày–tá tràng…
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800 }}>4.3 Hô hấp</div>
            <CheckRow
              label="Đau kiểu màng phổi (tăng khi hít sâu/ho)"
              checked={pleuritic}
              onChange={setPleuritic}
            />
            <CheckRow
              label="Ho/sốt kèm theo"
              checked={coughFever}
              onChange={setCoughFever}
            />
            <div style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.5 }}>
              Gợi ý: viêm phổi, viêm màng phổi, hen…
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800 }}>4.4 Tâm lý – chức năng</div>
            <CheckRow
              label="Lo âu / hoảng sợ / tăng thông khí"
              checked={anxietyPanic}
              onChange={setAnxietyPanic}
              hint="Chẩn đoán loại trừ sau khi loại trừ nguy hiểm."
            />
            <div style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.5 }}>
              Áp dụng ICE + Bio–Psycho–Social: trấn an, cá thể hoá xử trí, giảm tái khám không cần thiết.
            </div>
          </div>
        </div>
      </Section>

      {/* BƯỚC 5 */}
      <Section title="5️⃣ BƯỚC 5 — Bệnh đồng mắc & yếu tố nguy cơ (tim mạch + tâm lý–xã hội)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill tone={anyCardioRisk ? "warn" : "neutral"}>
            Nguy cơ tim mạch: {anyCardioRisk ? "Có" : "Chưa ghi nhận"}
          </Pill>
          <Pill tone={anxietyPanic ? "warn" : "neutral"}>
            Tâm lý–xã hội: {anxietyPanic ? "Có gợi ý" : "Chưa ghi nhận"}
          </Pill>
        </div>

        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          5.1 Bệnh đồng mắc làm tăng nguy cơ tim mạch
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          <CheckRow label="Tăng huyết áp" checked={rfHTN} onChange={setRfHTN} />
          <CheckRow label="Đái tháo đường" checked={rfDM} onChange={setRfDM} />
          <CheckRow label="Rối loạn lipid" checked={rfDyslip} onChange={setRfDyslip} />
          <CheckRow label="Béo phì" checked={rfObesity} onChange={setRfObesity} />
          <CheckRow label="Hút thuốc" checked={rfSmoking} onChange={setRfSmoking} />
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55 }}>
          Dù đau ngực không điển hình, nếu nguy cơ tim mạch cao vẫn cần đánh giá tổng thể và dặn dò rõ.
          Với YHGĐ, yếu tố tâm lý–xã hội (sợ nhồi máu, stress, hỗ trợ kém…) là một phần quyết định xử trí.
        </div>
      </Section>

      {/* BƯỚC 6 */}
      <Section title="6️⃣ Cận lâm sàng — chỉ định có chọn lọc">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55 }}>
            ❌ Không làm thường quy khi: đau thành ngực điển hình, không red flags, nguy cơ tim mạch thấp.  
            ✅ Cân nhắc khi: nghi tim mạch, nguy cơ cao, đau không rõ nguyên nhân.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            <CheckRow
              label="Đã làm ECG tại phòng khám"
              checked={ecgDone}
              onChange={(v) => {
                setEcgDone(v);
                if (!v) setEcgNormal(false);
              }}
            />
            <CheckRow
              label="ECG bình thường / không gợi thiếu máu cơ tim"
              checked={ecgNormal}
              onChange={setEcgNormal}
              hint="Chỉ tick khi đã làm ECG."
            />
          </div>

          <div style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55 }}>
            Gợi ý thêm (tuỳ bối cảnh): troponin, X-quang ngực, siêu âm tim, xét nghiệm tiêu hoá khi nghi ngờ…
          </div>
        </div>
      </Section>

      {/* QUYẾT ĐỊNH */}
      <Section title="7️⃣ Quyết định xử trí tại phòng khám">
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
                ? "CÂN NHẮC"
                : disposition.tone === "ok"
                ? "NGOẠI TRÚ"
                : "ĐÁNH GIÁ LẠI"}
            </Pill>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{disposition.title}</div>
          </div>

          <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            {disposition.bullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>

          {!hasRedFlags && vitalsOk ? (
            <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55 }}>
              <b>Dặn dò bắt buộc:</b> quay lại ngay / đi cấp cứu nếu đau tăng nhanh, khó thở, ngất/tiền ngất,
              vã mồ hôi lạnh, SpO₂ giảm, hoặc triệu chứng mới xuất hiện.
            </div>
          ) : null}
        </div>
      </Section>

      {/* THUẬT TOÁN 1 TRANG */}
      <Section title="8️⃣ Tóm tắt thuật toán 1 trang">
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              border: "1px dashed var(--line)",
              borderRadius: 14,
              padding: 12,
              background: "#fff",
              lineHeight: 1.65,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>ĐAU NGỰC → quyết định theo thứ tự</div>
            <div>
              1) <b>Red flags?</b> → <b>Có</b> → Cấp cứu / ECG nếu có thể / chuyển viện. <br />
              2) <b>Không red flags</b> → loại trừ <b>5 nguyên nhân nguy hiểm</b>. <br />
              3) <b>Không gợi nguy hiểm</b> → nghĩ nhóm thường gặp: <b>cơ–xương</b> / <b>tiêu hoá</b> /{" "}
              <b>hô hấp</b> / <b>tâm lý</b>. <br />
              4) Song song: <b>đánh giá nguy cơ tim mạch tổng thể</b> + yếu tố <b>Bio–Psycho–Social</b>. <br />
              5) <b>Cận lâm sàng có chọn lọc</b> (ECG/troponin/XQ…) khi nghi tim mạch, nguy cơ cao, hoặc đau không rõ.
            </div>
          </div>

          <div style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55 }}>
            <b>Kết luận thực hành:</b> Đau ngực là chứng nguy cơ cao. Mục tiêu YHGĐ: không bỏ sót nguy hiểm,
            không lạm dụng xét nghiệm, không bỏ qua tâm lý–xã hội; trấn an đúng + giải thích rõ là một phần điều trị.
          </div>
        </div>
      </Section>
    </SymptomLayout>
  );
}
