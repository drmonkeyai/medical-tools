// src/calculators/score2Core.ts
export type Sex = "male" | "female";
export type RiskRegion = "Low" | "Moderate" | "High" | "Very high";

export function round1(x: number) {
  return Math.round(x * 10) / 10;
}

export function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(min, x));
}

/**
 * SCORE2 (40–69) - dùng đúng công thức theo RiskScorescvd (SCORE2/OP).
 * Input: TC, HDL tính bằng mmol/L; SBP mmHg; smoker 0/1; diabetes 0/1 (SCORE2 gốc thường dùng diabetes=0).
 */
export function calcSCORE2(params: {
  region: RiskRegion;
  age: number;
  sex: Sex;
  smoker: 0 | 1;
  sbp: number;
  totalChol: number; // mmol/L
  hdl: number; // mmol/L
  diabetes?: 0 | 1; // default 0
}) {
  const {
    region,
    age,
    sex,
    smoker,
    sbp,
    totalChol,
    hdl,
    diabetes = 0,
  } = params;

  // scale1/scale2 theo Risk.region + age<70 + sex
  let scale1 = NaN;
  let scale2 = NaN;

  if (region === "Low" && age < 70 && sex === "male") {
    scale1 = -0.5699;
    scale2 = 0.7476;
  } else if (region === "Low" && age < 70 && sex === "female") {
    scale1 = -0.7380;
    scale2 = 0.7019;
  } else if (region === "Moderate" && age < 70 && sex === "male") {
    scale1 = -0.1565;
    scale2 = 0.8009;
  } else if (region === "Moderate" && age < 70 && sex === "female") {
    scale1 = -0.3143;
    scale2 = 0.7701;
  } else if (region === "High" && age < 70 && sex === "male") {
    scale1 = 0.3207;
    scale2 = 0.9360;
  } else if (region === "High" && age < 70 && sex === "female") {
    scale1 = 0.5710;
    scale2 = 0.9369;
  } else if (region === "Very high" && age < 70 && sex === "male") {
    scale1 = 0.5836;
    scale2 = 0.8294;
  } else if (region === "Very high" && age < 70 && sex === "female") {
    scale1 = 0.9412;
    scale2 = 0.8329;
  } else {
    // Nếu ai nhập tuổi >=70 thì không phải SCORE2 nữa (SCORE2-OP).
    return { riskPercent: NaN, riskGroup: "N/A" as const };
  }

  // Linear predictor (age<70)
  let lp = 0;

  if (sex === "male") {
    lp =
      0.3742 * ((age - 60) / 5) +
      0.6012 * smoker +
      0.2777 * ((sbp - 120) / 20) +
      0.6457 * diabetes +
      0.1458 * ((totalChol - 6) / 1) +
      -0.2698 * ((hdl - 1.3) / 0.5) +
      -0.0755 * ((age - 60) / 5) * smoker +
      -0.0255 * ((age - 60) / 5) * ((sbp - 120) / 20) +
      -0.0281 * ((age - 60) / 5) * ((totalChol - 6) / 1) +
      0.0426 * ((age - 60) / 5) * ((hdl - 1.3) / 0.5) +
      -0.0983 * ((age - 60) / 5) * diabetes;

    const uncal = 1 - Math.pow(0.9605, Math.exp(lp));
    const cal =
      1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
    const riskPercent = round1(cal * 100);

    return { riskPercent, riskGroup: score2Group(age, riskPercent) };
  }

  // female
  lp =
    0.4648 * ((age - 60) / 5) +
    0.7744 * smoker +
    0.3131 * ((sbp - 120) / 20) +
    0.8096 * diabetes +
    0.1002 * ((totalChol - 6) / 1) +
    -0.2606 * ((hdl - 1.3) / 0.5) +
    -0.1088 * ((age - 60) / 5) * smoker +
    -0.0277 * ((age - 60) / 5) * ((sbp - 120) / 20) +
    -0.0226 * ((age - 60) / 5) * ((totalChol - 6) / 1) +
    0.0613 * ((age - 60) / 5) * ((hdl - 1.3) / 0.5) +
    -0.1272 * ((age - 60) / 5) * diabetes;

  const uncal = 1 - Math.pow(0.9776, Math.exp(lp));
  const cal =
    1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
  const riskPercent = round1(cal * 100);

  return { riskPercent, riskGroup: score2Group(age, riskPercent) };
}

/**
 * SCORE2-OP (>=70) theo RiskScorescvd.
 */
export function calcSCORE2OP(params: {
  region: RiskRegion;
  age: number;
  sex: Sex;
  smoker: 0 | 1;
  sbp: number;
  totalChol: number; // mmol/L
  hdl: number; // mmol/L
  diabetes?: 0 | 1; // default 0
}) {
  const {
    region,
    age,
    sex,
    smoker,
    sbp,
    totalChol,
    hdl,
    diabetes = 0,
  } = params;

  if (age < 70) return { riskPercent: NaN, riskGroup: "N/A" as const };

  // scale1/scale2 theo Risk.region + age>=70 + sex
  let scale1 = NaN;
  let scale2 = NaN;

  if (region === "Low" && sex === "male") {
    scale1 = -0.34;
    scale2 = 1.19;
  } else if (region === "Low" && sex === "female") {
    scale1 = -0.52;
    scale2 = 1.01;
  } else if (region === "Moderate" && sex === "male") {
    scale1 = 0.01;
    scale2 = 1.25;
  } else if (region === "Moderate" && sex === "female") {
    scale1 = -0.1;
    scale2 = 1.1;
  } else if (region === "High" && sex === "male") {
    scale1 = 0.08;
    scale2 = 1.15;
  } else if (region === "High" && sex === "female") {
    scale1 = 0.38;
    scale2 = 1.09;
  } else if (region === "Very high" && sex === "male") {
    scale1 = 0.05;
    scale2 = 0.7;
  } else if (region === "Very high" && sex === "female") {
    scale1 = 0.38;
    scale2 = 0.69;
  } else {
    return { riskPercent: NaN, riskGroup: "N/A" as const };
  }

  // Linear predictor OP (age>=70)
  if (sex === "male") {
    const lp =
      0.0634 * (age - 73) +
      0.4245 * diabetes +
      0.3524 * smoker +
      0.0094 * (sbp - 150) +
      0.0850 * (totalChol - 6) +
      -0.3564 * (hdl - 1.4) +
      -0.0174 * (age - 73) * diabetes +
      -0.0247 * (age - 73) * smoker +
      -0.0005 * (age - 73) * (sbp - 150) +
      0.0073 * (age - 73) * (totalChol - 6) +
      0.0091 * (age - 73) * (hdl - 1.4);

    const uncal = 1 - Math.pow(0.7576, Math.exp(lp - 0.0929));
    const cal =
      1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
    const riskPercent = round1(cal * 100);
    return { riskPercent, riskGroup: score2opGroup(riskPercent) };
  }

  // female
  const lp =
    0.0789 * (age - 73) +
    0.6010 * diabetes +
    0.4921 * smoker +
    0.0102 * (sbp - 150) +
    0.0605 * (totalChol - 6) +
    -0.3040 * (hdl - 1.4) +
    -0.0107 * (age - 73) * diabetes +
    -0.0255 * (age - 73) * smoker +
    -0.0004 * (age - 73) * (sbp - 150) +
    -0.0009 * (age - 73) * (totalChol - 6) +
    0.0154 * (age - 73) * (hdl - 1.4);

  const uncal = 1 - Math.pow(0.8082, Math.exp(lp - 0.229));
  const cal =
    1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
  const riskPercent = round1(cal * 100);
  return { riskPercent, riskGroup: score2opGroup(riskPercent) };
}

/**
 * SCORE2-ASIAN (Asia-Pacific) theo RiskScorescvd SCORE2_Asia_Pacific.
 * (Trong file package họ gọi "Asia-Pacific", bạn đang đặt tên tool là "SCORE2-ASIAN")
 */
export function calcSCORE2ASIAN(params: {
  region: RiskRegion;
  age: number;
  sex: Sex;
  smoker: 0 | 1;
  sbp: number;
  totalChol: number; // mmol/L
  hdl: number; // mmol/L
  diabetes?: 0 | 1; // default 0
}) {
  const {
    region,
    age,
    sex,
    smoker,
    sbp,
    totalChol,
    hdl,
    diabetes = 0,
  } = params;

  // scale1/scale2 Asia-Pacific (không chia theo <70/≥70 trong source)
  let scale1 = NaN;
  let scale2 = NaN;

  if (region === "Low" && sex === "male") {
    scale1 = -0.375229965;
    scale2 = 0.62020875;
  } else if (region === "Moderate" && sex === "male") {
    scale1 = 0.284885676;
    scale2 = 0.778128607;
  } else if (region === "High" && sex === "male") {
    scale1 = 0.778231091;
    scale2 = 0.844985356;
  } else if (region === "Very high" && sex === "male") {
    scale1 = 0.608975204;
    scale2 = 0.679014197;
  } else if (region === "Low" && sex === "female") {
    scale1 = -0.986572446;
    scale2 = 0.536743779;
  } else if (region === "Moderate" && sex === "female") {
    scale1 = 0.08278687;
    scale2 = 0.718980326;
  } else if (region === "High" && sex === "female") {
    scale1 = 0.611474287;
    scale2 = 0.703624072;
  } else if (region === "Very high" && sex === "female") {
    scale1 = 0.502751798;
    scale2 = 0.555577072;
  } else {
    return { riskPercent: NaN, riskGroup: "N/A" as const };
  }

  // Linear predictor giống SCORE2 (age centred 60) nhưng theo source Asia-Pacific
  const lp =
    (sex === "male"
      ? 0.3742 * ((age - 60) / 5) +
        0.6012 * smoker +
        0.2777 * ((sbp - 120) / 20) +
        0.6457 * diabetes +
        0.1458 * ((totalChol - 6) / 1) +
        -0.2698 * ((hdl - 1.3) / 0.5) +
        -0.0755 * ((age - 60) / 5) * smoker +
        -0.0255 * ((age - 60) / 5) * ((sbp - 120) / 20) +
        -0.0983 * ((age - 60) / 5) * diabetes +
        -0.0281 * ((age - 60) / 5) * ((totalChol - 6) / 1) +
        0.0426 * ((age - 60) / 5) * ((hdl - 1.3) / 0.5)
      : 0.4648 * ((age - 60) / 5) +
        0.7744 * smoker +
        0.3131 * ((sbp - 120) / 20) +
        0.8096 * diabetes +
        0.1002 * ((totalChol - 6) / 1) +
        -0.2606 * ((hdl - 1.3) / 0.5) +
        -0.1088 * ((age - 60) / 5) * smoker +
        -0.0277 * ((age - 60) / 5) * ((sbp - 120) / 20) +
        -0.1272 * ((age - 60) / 5) * diabetes +
        -0.0226 * ((age - 60) / 5) * ((totalChol - 6) / 1) +
        0.0613 * ((age - 60) / 5) * ((hdl - 1.3) / 0.5));

  const base = sex === "male" ? 0.9605 : 0.9776;
  const uncal = 1 - Math.pow(base, Math.exp(lp));
  const cal =
    1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
  const riskPercent = round1(cal * 100);

  // Asia-Pacific classify theo mốc 5/10/20 (source)
  const riskGroup =
    riskPercent < 5
      ? "Low risk"
      : riskPercent < 10
      ? "Moderate risk"
      : riskPercent < 20
      ? "High risk"
      : "Very high risk";

  return { riskPercent, riskGroup };
}

/**
 * SCORE2-DIABETES theo RiskScorescvd.
 * Thêm biến: tuổi chẩn đoán ĐTĐ, HbA1c (mmol/mol), eGFR (mL/min/1.73m2)
 */
export function calcSCORE2DIABETES(params: {
  region: RiskRegion;
  age: number;
  sex: Sex;
  smoker: 0 | 1;
  sbp: number;
  totalChol: number; // mmol/L
  hdl: number; // mmol/L
  diabetes: 1; // tool này dành cho ĐTĐ
  diabetesAge: number; // tuổi chẩn đoán ĐTĐ
  hba1c: number; // mmol/mol
  egfr: number; // mL/min/1.73m2
}) {
  const {
    region,
    age,
    sex,
    smoker,
    sbp,
    totalChol,
    hdl,
    diabetes,
    diabetesAge,
    hba1c,
    egfr,
  } = params;

  // scale1/scale2 giống SCORE2 (age<70 set) theo source SCORE2_Diabetes
  let scale1 = NaN;
  let scale2 = NaN;

  if (region === "Low" && sex === "male") {
    scale1 = -0.5699;
    scale2 = 0.7476;
  } else if (region === "Moderate" && sex === "male") {
    scale1 = -0.1565;
    scale2 = 0.8009;
  } else if (region === "High" && sex === "male") {
    scale1 = 0.3207;
    scale2 = 0.9360;
  } else if (region === "Very high" && sex === "male") {
    scale1 = 0.5836;
    scale2 = 0.8294;
  } else if (region === "Low" && sex === "female") {
    scale1 = -0.7380;
    scale2 = 0.7019;
  } else if (region === "Moderate" && sex === "female") {
    scale1 = -0.3143;
    scale2 = 0.7701;
  } else if (region === "High" && sex === "female") {
    scale1 = 0.5710;
    scale2 = 0.9369;
  } else if (region === "Very high" && sex === "female") {
    scale1 = 0.9412;
    scale2 = 0.8329;
  } else {
    return { riskPercent: NaN, riskGroup: "N/A" as const };
  }

  const logEgfr = Math.log(egfr);
  const zEgfr = (logEgfr - 4.5) / 0.15;
  const zHba1c = (hba1c - 31) / 9.34;
  const zAge = (age - 60) / 5;
  const zSbp = (sbp - 120) / 20;
  const zTc = (totalChol - 6) / 1;
  const zHdl = (hdl - 1.3) / 0.5;

  let lp = 0;

  if (sex === "male") {
    lp =
      // SCORE2 variables
      0.5368 * zAge +
      0.4774 * smoker +
      0.1322 * zSbp +
      0.6457 * diabetes +
      0.1102 * zTc +
      -0.1087 * zHdl +
      -0.0672 * zAge * smoker +
      -0.0268 * zAge * zSbp +
      -0.0983 * zAge * diabetes +
      -0.0181 * zAge * zTc +
      0.0095 * zAge * zHdl +
      // DM2 additional
      -0.0998 * diabetes * ((diabetesAge - 50) / 5) +
      0.0955 * zHba1c +
      -0.0591 * zEgfr +
      0.0058 * zEgfr * zEgfr +
      -0.0134 * zHba1c * zAge +
      0.0169 * zEgfr * zAge;

    const uncal = 1 - Math.pow(0.9605, Math.exp(lp));
    const cal =
      1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
    const riskPercent = round1(cal * 100);

    const riskGroup =
      riskPercent < 5
        ? "Low risk"
        : riskPercent < 10
        ? "Moderate risk"
        : riskPercent < 20
        ? "High risk"
        : "Very high risk";

    return { riskPercent, riskGroup };
  }

  // female
  lp =
    0.6624 * zAge +
    0.6139 * smoker +
    0.1421 * zSbp +
    0.8096 * diabetes +
    0.1127 * zTc +
    -0.1568 * zHdl +
    -0.1122 * zAge * smoker +
    -0.0167 * zAge * zSbp +
    -0.1272 * zAge * diabetes +
    -0.0200 * zAge * zTc +
    0.0186 * zAge * zHdl +
    // DM2 additional
    -0.118 * diabetes * ((diabetesAge - 50) / 5) +
    0.1173 * zHba1c +
    -0.0640 * zEgfr +
    0.0062 * zEgfr * zEgfr +
    -0.0196 * zHba1c * zAge +
    0.0169 * zEgfr * zAge;

  const uncal = 1 - Math.pow(0.9776, Math.exp(lp));
  const cal =
    1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncal))));
  const riskPercent = round1(cal * 100);

  const riskGroup =
    riskPercent < 5
      ? "Low risk"
      : riskPercent < 10
      ? "Moderate risk"
      : riskPercent < 20
      ? "High risk"
      : "Very high risk";

  return { riskPercent, riskGroup };
}

function score2Group(age: number, riskPercent: number) {
  // Nhóm nguy cơ theo mốc SCORE2 (trong source)
  if (age < 50) {
    if (riskPercent < 2.5) return "Low risk";
    if (riskPercent < 7.5) return "Moderate risk";
    return "High risk";
  }
  if (age >= 50 && age <= 69) {
    if (riskPercent < 5) return "Low risk";
    if (riskPercent < 10) return "Moderate risk";
    return "High risk";
  }
  return "N/A";
}

function score2opGroup(riskPercent: number) {
  // Với OP, source classify theo mốc (>=70): <7.5; 7.5-<15; >=15
  if (riskPercent < 7.5) return "Low risk";
  if (riskPercent < 15) return "Moderate risk";
  return "High risk";
}
