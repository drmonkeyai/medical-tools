import type {
  ClinicalNoteField,
  ClinicalNoteGroup,
  ClinicalNoteSectionData,
} from "./types";

type ClinicalNoteSectionProps = {
  data: ClinicalNoteSectionData;
  className?: string;
};

type NoteFieldItemProps = {
  field: ClinicalNoteField;
};

type NoteGroupSectionProps = {
  group: ClinicalNoteGroup;
};

function NoteFieldItem({ field }: NoteFieldItemProps) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderTop: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          marginBottom: 4,
          fontSize: 12,
          fontWeight: 800,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {field.label}
      </div>

      {field.isEmpty ? (
        <div
          style={{
            fontSize: 14,
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          Chưa có dữ liệu
        </div>
      ) : (
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.65,
            color: "#0f172a",
          }}
        >
          {field.content}
        </div>
      )}
    </div>
  );
}

function NoteGroupSection({ group }: NoteGroupSectionProps) {
  return (
    <section
      style={{
        borderTop: "1px solid #e2e8f0",
        paddingTop: 18,
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {group.title}
        </h3>
      </div>

      {!group.hasAnyContent ? (
        <div
          style={{
            padding: "10px 0 2px 0",
            fontSize: 14,
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          Chưa có dữ liệu cho nhóm này.
        </div>
      ) : (
        <div>
          {group.fields
            .filter((field) => !field.isEmpty)
            .map((field) => (
              <NoteFieldItem key={field.key} field={field} />
            ))}
        </div>
      )}
    </section>
  );
}

export default function ClinicalNoteSection({
  data,
  className,
}: ClinicalNoteSectionProps) {
  return (
    <section
      className={className}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#ffffff",
        padding: 16,
      }}
    >
      <div
        style={{
          paddingBottom: 12,
          marginBottom: 4,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Clinical Note
        </h2>

        <p
          style={{
            margin: "6px 0 0 0",
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Ghi chú lâm sàng theo cấu trúc Family Medicine / Outpatient
        </p>
      </div>

      {!data.hasAnyContent ? (
        <div
          style={{
            marginTop: 12,
            padding: "16px 14px",
            border: "1px dashed #cbd5e1",
            borderRadius: 8,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Chưa có ghi chú lâm sàng cho lần đánh giá này.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 18,
            marginTop: 8,
          }}
        >
          {data.groups
            .filter((group) => group.hasAnyContent)
            .map((group) => (
              <NoteGroupSection key={group.key} group={group} />
            ))}
        </div>
      )}
    </section>
  );
}