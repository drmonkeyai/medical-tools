import type { AssessmentLabReport } from "./types";

interface Props {
  reports: AssessmentLabReport[];
}

export default function LabReportsSection({ reports }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <h4 className="mb-3 font-medium">Phiếu / file cận lâm sàng</h4>

      {reports.length === 0 ? (
        <div className="text-sm text-slate-500">Chưa có phiếu cận lâm sàng nào.</div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border p-3 text-sm">
              <div className="font-medium">{report.report_title}</div>
              <div className="text-slate-500">
                {report.facility_name || "Nơi thực hiện chưa rõ"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
