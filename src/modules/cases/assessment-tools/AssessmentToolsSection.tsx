import { useMemo, useState } from "react";
import { getAssessmentToolCatalog, findAssessmentTool } from "./catalog";
import AssessmentToolPicker from "./AssessmentToolPicker";
import AssessmentToolRunner from "./AssessmentToolRunner";
import CalculatorRunsSection from "../calculator-runs/CalculatorRunsSection";
import type { CalculatorRunsSectionData } from "../calculator-runs/types";

type Props = {
  assessmentId?: string;
  data?: CalculatorRunsSectionData | null;
};

export default function AssessmentToolsSection({
  assessmentId,
  data,
}: Props) {
  const [selectedToolKey, setSelectedToolKey] = useState<string>("family_apgar");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const tools = useMemo(() => getAssessmentToolCatalog(), []);
  const selectedTool = useMemo(
    () => findAssessmentTool(selectedToolKey),
    [selectedToolKey]
  );

  const historyData: CalculatorRunsSectionData = data ?? { runs: [] };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <AssessmentToolPicker
        tools={tools}
        selectedToolKey={selectedToolKey}
        onSelect={setSelectedToolKey}
      />

      <AssessmentToolRunner
        tool={selectedTool}
        assessmentId={assessmentId}
        onToolSaved={() => setHistoryRefreshKey((value) => value + 1)}
      />

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 14,
          }}
        >
          Lịch sử công cụ đánh giá
        </div>

        <CalculatorRunsSection
          key={`${assessmentId ?? "no-assessment"}-${historyRefreshKey}`}
          data={historyData}
          assessmentId={assessmentId}
        />
      </div>
    </div>
  );
}