import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useRunAndSaveCalculator } from "../../../features/calculators/hooks/useRunAndSaveCalculator";
import { mapCalculatorRunsSection } from "./mapper";
import type {
  CalculatorDefinitionRow,
  CalculatorRunInputRow,
  CalculatorRunRow,
  CalculatorRunsSectionData,
} from "./types";

type Props = {
  data?: CalculatorRunsSectionData | null;
  assessmentId?: string;
};

type RunnerCalculatorOption = {
  id: string;
  code: string;
  name: string;
};

const SUPPORTED_CODES = [
  "fib4",
  "apri",
  "child-pugh",
  "child_pugh",
  "bmi",
  "phq9",
  "gad7",
  "family_apgar",
  "family_apgar_score",
  "screem",
] as const;

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
}

function formatResultBlock(run: CalculatorRunsSectionData["runs"][number]) {
  if (run.resultLabel) {
    return (
      <>
        <strong>Kết quả:</strong> {run.resultLabel}
        {run.resultValue !== null && run.resultValue !== undefined
          ? ` • ${run.resultValue}`
          : ""}
        {run.resultText ? ` • ${run.resultText}` : ""}
      </>
    );
  }

  if (run.resultValue !== null && run.resultValue !== undefined) {
    return (
      <>
        <strong>Kết quả:</strong> {run.resultValue}
        {run.resultText ? ` • ${run.resultText}` : ""}
      </>
    );
  }

  if (run.resultText) {
    return (
      <>
        <strong>Kết quả:</strong> {run.resultText}
      </>
    );
  }

  return null;
}

export default function CalculatorRunsSection({
  data,
  assessmentId,
}: Props) {
  const params = useParams();
  const currentAssessmentId = assessmentId ?? params.assessmentId ?? "";

  const [localData, setLocalData] = useState<CalculatorRunsSectionData>(
    data ?? { runs: [] }
  );
  const [supportedCalculators, setSupportedCalculators] = useState<
    RunnerCalculatorOption[]
  >([]);
  const [selectedCalculatorCode, setSelectedCalculatorCode] = useState("");
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [lastRunMessage, setLastRunMessage] = useState("");

  const {
    runningCalculator,
    runCalculatorError,
    execute,
    resetRunCalculatorError,
  } = useRunAndSaveCalculator();

  useEffect(() => {
    setLocalData(data ?? { runs: [] });
  }, [data]);

  const loadRuns = useCallback(async () => {
    if (!currentAssessmentId) return;

    try {
      setLoadingRuns(true);
      setLoadError("");

      const { data: runData, error: runsError } = await supabase
        .from("calculator_runs")
        .select(
          "id, calculator_id, assessment_id, patient_id, case_id, run_at, result_label, result_value, result_text, risk_level, interpretation, result_json"
        )
        .eq("assessment_id", currentAssessmentId)
        .order("run_at", { ascending: false });

      if (runsError) {
        throw new Error(runsError.message);
      }

      const runRows = (runData ?? []) as CalculatorRunRow[];
      const calculatorIds = Array.from(
        new Set(runRows.map((row) => row.calculator_id).filter(Boolean))
      );
      const runIds = runRows.map((row) => row.id);

      let definitionRows: CalculatorDefinitionRow[] = [];
      if (calculatorIds.length > 0) {
        const { data: defsData, error: defsError } = await supabase
          .from("calculator_definitions")
          .select("id, code, name")
          .in("id", calculatorIds);

        if (defsError) {
          throw new Error(defsError.message);
        }

        definitionRows = (defsData ?? []) as CalculatorDefinitionRow[];
      }

      let inputRows: CalculatorRunInputRow[] = [];
      if (runIds.length > 0) {
        const { data: inputsData, error: inputsError } = await supabase
          .from("calculator_run_inputs")
          .select(
            "id, calculator_run_id, input_key, input_label, input_type, input_value_text, input_value_numeric, input_value_boolean, input_value_date, input_value_json, unit, source_observation_id, created_at"
          )
          .in("calculator_run_id", runIds)
          .order("created_at", { ascending: true });

        if (inputsError) {
          throw new Error(inputsError.message);
        }

        inputRows = (inputsData ?? []) as CalculatorRunInputRow[];
      }

      const mapped = mapCalculatorRunsSection({
        runs: runRows,
        definitions: definitionRows,
        runInputs: inputRows,
      });

      setLocalData(mapped);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không tải được lịch sử calculator.";
      setLoadError(message);
    } finally {
      setLoadingRuns(false);
    }
  }, [currentAssessmentId]);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    async function loadCalculatorOptions() {
      try {
        setLoadingOptions(true);

        const { data: defsData, error } = await supabase
          .from("calculator_definitions")
          .select("id, code, name")
          .in("code", [...SUPPORTED_CODES])
          .order("name", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        const rows = ((defsData ?? []) as CalculatorDefinitionRow[]).map(
          (row) => ({
            id: row.id,
            code: row.code,
            name: row.name,
          })
        );

        setSupportedCalculators(rows);

        setSelectedCalculatorCode((prev) => {
          if (prev && rows.some((item) => item.code === prev)) {
            return prev;
          }
          return rows[0]?.code ?? "";
        });
      } catch (error) {
        console.error("LOAD CALCULATOR OPTIONS ERROR:", error);
      } finally {
        setLoadingOptions(false);
      }
    }

    void loadCalculatorOptions();
  }, []);

  const selectedCalculatorName = useMemo(() => {
    return (
      supportedCalculators.find((item) => item.code === selectedCalculatorCode)
        ?.name ?? selectedCalculatorCode
    );
  }, [supportedCalculators, selectedCalculatorCode]);

  async function handleRunCalculator() {
    if (!currentAssessmentId) {
      setLastRunMessage("Thiếu assessmentId.");
      return;
    }

    if (!selectedCalculatorCode) {
      setLastRunMessage("Chưa chọn calculator.");
      return;
    }

    try {
      resetRunCalculatorError();
      setLastRunMessage("");

      const result = await execute(selectedCalculatorCode, currentAssessmentId);

      await loadRuns();

      if (result.result.interpretation) {
        setLastRunMessage(
          `${selectedCalculatorName}: ${result.result.interpretation}`
        );
      } else {
        setLastRunMessage(
          `${selectedCalculatorName}: đã chạy và lưu thành công.`
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không chạy/lưu được calculator.";
      setLastRunMessage(message);
    }
  }

  const sectionData = localData ?? { runs: [] };

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          background: "#ffffff",
          padding: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
          Chạy calculator cho lần đánh giá hiện tại
        </div>

        {!currentAssessmentId ? (
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Chưa xác định được assessment hiện tại.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "minmax(0, 1fr) auto",
                alignItems: "end",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: "#334155",
                  }}
                >
                  Calculator
                </div>

                <select
                  value={selectedCalculatorCode}
                  onChange={(e) => setSelectedCalculatorCode(e.target.value)}
                  disabled={loadingOptions || runningCalculator}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                  }}
                >
                  {!supportedCalculators.length ? (
                    <option value="">
                      {loadingOptions
                        ? "Đang tải danh sách calculator..."
                        : "Không có calculator phù hợp"}
                    </option>
                  ) : null}

                  {supportedCalculators.map((item) => (
                    <option key={item.id} value={item.code}>
                      {item.name} ({item.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleRunCalculator();
                }}
                disabled={
                  runningCalculator ||
                  !currentAssessmentId ||
                  !selectedCalculatorCode
                }
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #2563eb",
                  background: runningCalculator ? "#bfdbfe" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor:
                    runningCalculator || !selectedCalculatorCode
                      ? "not-allowed"
                      : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {runningCalculator ? "Đang chạy..." : "Chạy và lưu"}
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
              Dữ liệu sẽ được resolve từ hồ sơ bệnh nhân, sinh hiệu assessment
              và observation của assessment hiện tại.
            </div>

            {runCalculatorError ? (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: 14,
                }}
              >
                {runCalculatorError}
              </div>
            ) : null}

            {lastRunMessage ? (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #dbeafe",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: 14,
                }}
              >
                {lastRunMessage}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 10,
            color: "#0f172a",
          }}
        >
          Calculator Runs
        </h2>

        {loadError ? (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: 14,
            }}
          >
            {loadError}
          </div>
        ) : null}

        {loadingRuns ? (
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Đang tải lịch sử calculator...
          </div>
        ) : !sectionData.runs.length ? (
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Chưa có calculator run nào cho lần đánh giá này.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sectionData.runs.map((run) => (
              <div
                key={run.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  background: "#fff",
                  padding: 16,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {run.calculatorName}
                  {run.calculatorCode ? ` (${run.calculatorCode})` : ""}
                </div>

                <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                  {formatDateTime(run.runAt)}
                </div>

                <div style={{ marginTop: 10, fontSize: 14 }}>
                  {formatResultBlock(run)}

                  {run.riskLevel ? (
                    <div style={{ marginTop: 4 }}>
                      <strong>Mức nguy cơ:</strong> {run.riskLevel}
                    </div>
                  ) : null}

                  {run.interpretation ? (
                    <div style={{ marginTop: 4 }}>
                      <strong>Diễn giải:</strong> {run.interpretation}
                    </div>
                  ) : null}
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    Input snapshot
                  </div>

                  {!run.inputs.length ? (
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      Không có input snapshot.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {run.inputs.map((input) => (
                        <div
                          key={input.id}
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{input.label}</div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#475569",
                              marginTop: 2,
                            }}
                          >
                            {input.displayValue}
                            {input.unit ? ` ${input.unit}` : ""}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              marginTop: 2,
                            }}
                          >
                            {input.key} • {input.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}