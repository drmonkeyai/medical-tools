import LabResultRow from "./LabResultRow";
import type { AssessmentLabResult, LabCatalogItem } from "./types";

interface Props {
  title: string;
  items: LabCatalogItem[];
  resultMap: Map<string, AssessmentLabResult>;
  drafts: Record<string, string>;
  draftDates: Record<string, string>;
  onChangeValue: (code: string, value: string) => void;
  onChangeDate: (code: string, value: string) => void;
}

function toDisplayValue(item?: AssessmentLabResult) {
  if (!item) return "";
  if (item.value_type === "numeric") return item.value_numeric ?? "";
  if (item.value_type === "boolean") return item.value_boolean == null ? "" : String(item.value_boolean);
  return item.value_text ?? item.raw_result_text ?? "";
}

export default function LabCategorySection({
  title,
  items,
  resultMap,
  drafts,
  draftDates,
  onChangeValue,
  onChangeDate,
}: Props) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const existing = resultMap.get(item.code);
          const value = drafts[item.code] ?? String(toDisplayValue(existing) ?? "");
          const dateValue =
            draftDates[item.code] ??
            (existing?.measured_at ? existing.measured_at.slice(0, 10) : "");

          return (
            <LabResultRow
              key={item.code}
              item={item}
              existing={existing}
              value={value}
              dateValue={dateValue}
              onChangeValue={(next) => onChangeValue(item.code, next)}
              onChangeDate={(next) => onChangeDate(item.code, next)}
            />
          );
        })}
      </div>
    </div>
  );
}
