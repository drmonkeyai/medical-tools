import type { AssessmentLabResult, LabCatalogItem } from "./types";

interface Props {
  item: LabCatalogItem;
  existing?: AssessmentLabResult;
  value: string;
  dateValue: string;
  onChangeValue: (value: string) => void;
  onChangeDate: (value: string) => void;
}

export default function LabResultRow({
  item,
  existing,
  value,
  dateValue,
  onChangeValue,
  onChangeDate,
}: Props) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-slate-500">{item.groupName}</div>
      </div>

      <div className="space-y-3">
        <input
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder="Nhập kết quả"
          className="w-full rounded-xl border px-3 py-2"
        />

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
          <div className="min-w-[90px] rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {item.canonicalUnit ?? "-"}
          </div>
        </div>

        {existing?.reference_range_text ? (
          <div className="text-xs text-slate-500">
            Tham chiếu: {existing.reference_range_text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
