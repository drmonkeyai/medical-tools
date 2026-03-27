import {
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteCase } from "../hooks/useDeleteCase";
import { useCreateCase } from "../hooks/useCreateCase";
import {
  useCasesList,
  type CaseListItem,
  type GenderValue,
} from "../hooks/useCasesList";

type SortKey = "case_code" | "case_name" | "gender" | "birth_year" | "created_at";
type SortDirection = "asc" | "desc";

type CreateCaseForm = {
  fullName: string;
  dateOfBirth: string;
  gender: "" | "male" | "female" | "other";
  occupation: string;
};

const initialForm: CreateCaseForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  occupation: "",
};

function formatGender(value: GenderValue) {
  if (value === "male") return "Nam";
  if (value === "female") return "Nữ";
  if (value === "other") return "Khác";
  return "—";
}

function formatCreatedDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

function inputStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 14,
    boxSizing: "border-box",
  };
}

function linkButtonStyle(): CSSProperties {
  return {
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left",
  };
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#475569",
        }}
      >
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone = "default",
  disabled,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "primary" | "danger";
  disabled?: boolean;
}) {
  const tones: Record<string, CSSProperties> = {
    default: {
      border: "1px solid #cbd5e1",
      background: "#ffffff",
      color: "#0f172a",
    },
    primary: {
      border: "1px solid #2563eb",
      background: "#eff6ff",
      color: "#1d4ed8",
    },
    danger: {
      border: "1px solid #fecaca",
      background: "#fef2f2",
      color: "#b91c1c",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...tones[tone],
      }}
    >
      {label}
    </button>
  );
}

function IconButton({
  label,
  icon,
  onClick,
  tone = "default",
  disabled,
}: {
  label: string;
  icon: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  const tones: Record<string, CSSProperties> = {
    default: {
      border: "1px solid #cbd5e1",
      background: "#ffffff",
      color: "#0f172a",
    },
    danger: {
      border: "1px solid #fecaca",
      background: "#fef2f2",
      color: "#b91c1c",
    },
  };

  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...tones[tone],
      }}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

function HeaderSortButton({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortDirection: SortDirection;
  onClick: () => void;
}) {
  const active = currentSortKey === sortKey;
  const arrow = active ? (sortDirection === "asc" ? " ↑" : " ↓") : "";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        textAlign: "left",
        fontWeight: 700,
        color: active ? "#1d4ed8" : "#475569",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {label}
      {arrow}
    </button>
  );
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, "vi");
}

function sortItems(items: CaseListItem[], sortKey: SortKey, sortDirection: SortDirection) {
  const next = [...items];

  next.sort((a, b) => {
    let compare = 0;

    if (sortKey === "case_code") compare = compareText(a.caseCode, b.caseCode);
    if (sortKey === "case_name") compare = compareText(a.caseName, b.caseName);
    if (sortKey === "gender") compare = compareText(formatGender(a.gender), formatGender(b.gender));
    if (sortKey === "birth_year") compare = (a.birthYear ?? 0) - (b.birthYear ?? 0);
    if (sortKey === "created_at") {
      compare =
        (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
        (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    }

    return sortDirection === "asc" ? compare : -compare;
  });

  return next;
}

export default function CasesListPage() {
  const navigate = useNavigate();
  const { loading, cases, error, reloadCases, setCases } = useCasesList();
  const { deletingCase, deleteCaseError, deleteCase } = useDeleteCase();
  const {
    creatingCase,
    createCaseError,
    createCase,
    resetCreateCaseError,
  } = useCreateCase();

  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [quickCaseCode, setQuickCaseCode] = useState("");
  const [quickCaseName, setQuickCaseName] = useState("");
  const [quickGender, setQuickGender] = useState("");
  const [quickBirthYear, setQuickBirthYear] = useState("");
  const [quickCreatedAt, setQuickCreatedAt] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCaseForm>(initialForm);

  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);

  async function handleCreateCase() {
    try {
      await createCase({
        fullName: createForm.fullName,
        dateOfBirth: createForm.dateOfBirth,
        gender: createForm.gender as "male" | "female" | "other",
        occupation: createForm.occupation,
      });

      setIsCreateModalOpen(false);
      setCreateForm(initialForm);
      await reloadCases();
    } catch {
      // lỗi đã được hook set vào createCaseError
    }
  }

  async function handleDeleteCase(item: CaseListItem) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ca ${item.caseCode} không?\n\nThao tác này sẽ xóa toàn bộ lần đánh giá của ca.`
    );
    if (!confirmed) return;

    try {
      setDeletingCaseId(item.id);

      await deleteCase({
        caseId: item.id,
        patientId: item.patientId,
      });

      setCases((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : deleteCaseError || "Không xóa được ca.";
      window.alert(message);
    } finally {
      setDeletingCaseId(null);
    }
  }

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  }

  function applySearch() {
    setAppliedSearch(searchDraft.trim());
  }

  const filteredCases = useMemo(() => {
    const keyword = appliedSearch.trim().toLowerCase();

    const filtered = cases.filter((item) => {
      const globalMatch =
        !keyword ||
        item.caseCode.toLowerCase().includes(keyword) ||
        item.caseName.toLowerCase().includes(keyword) ||
        item.patientName.toLowerCase().includes(keyword) ||
        item.occupation.toLowerCase().includes(keyword) ||
        formatGender(item.gender).toLowerCase().includes(keyword) ||
        String(item.birthYear ?? "").includes(keyword) ||
        formatCreatedDate(item.createdAt).toLowerCase().includes(keyword);

      const caseCodeMatch =
        !quickCaseCode.trim() ||
        item.caseCode.toLowerCase().includes(quickCaseCode.trim().toLowerCase());

      const caseNameMatch =
        !quickCaseName.trim() ||
        item.caseName.toLowerCase().includes(quickCaseName.trim().toLowerCase());

      const genderMatch =
        !quickGender.trim() ||
        formatGender(item.gender).toLowerCase().includes(quickGender.trim().toLowerCase());

      const birthYearMatch =
        !quickBirthYear.trim() ||
        String(item.birthYear ?? "").includes(quickBirthYear.trim());

      const createdAtMatch =
        !quickCreatedAt.trim() ||
        formatCreatedDate(item.createdAt)
          .toLowerCase()
          .includes(quickCreatedAt.trim().toLowerCase());

      return (
        globalMatch &&
        caseCodeMatch &&
        caseNameMatch &&
        genderMatch &&
        birthYearMatch &&
        createdAtMatch
      );
    });

    return sortItems(filtered, sortKey, sortDirection);
  }, [
    cases,
    appliedSearch,
    quickCaseCode,
    quickCaseName,
    quickGender,
    quickBirthYear,
    quickCreatedAt,
    sortKey,
    sortDirection,
  ]);

  return (
    <div
      style={{
        padding: 24,
        display: "grid",
        gap: 20,
        background: "#f8fafc",
      }}
    >
      <section
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          background: "#ffffff",
          padding: 20,
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.2,
                color: "#0f172a",
              }}
            >
              Danh sách ca
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ActionButton label="Về trang chủ" onClick={() => navigate("/")} />
            <ActionButton
              label="+ Tạo ca mới"
              tone="primary"
              onClick={() => {
                resetCreateCaseError();
                setIsCreateModalOpen(true);
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(320px, 1fr) auto",
            alignItems: "center",
          }}
        >
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            placeholder="Tìm theo mã ca, tên ca, tên người bệnh, nghề nghiệp, giới tính, năm sinh, ngày tạo ca..."
            style={inputStyle()}
          />

          <ActionButton label="Tìm" tone="primary" onClick={applySearch} />
        </div>
      </section>

      <section
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <th style={{ padding: "14px 16px", textAlign: "left" }}>
                <HeaderSortButton
                  label="Mã ca"
                  sortKey="case_code"
                  currentSortKey={sortKey}
                  sortDirection={sortDirection}
                  onClick={() => toggleSort("case_code")}
                />
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>
                <HeaderSortButton
                  label="Tên ca"
                  sortKey="case_name"
                  currentSortKey={sortKey}
                  sortDirection={sortDirection}
                  onClick={() => toggleSort("case_name")}
                />
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>
                <HeaderSortButton
                  label="Giới tính"
                  sortKey="gender"
                  currentSortKey={sortKey}
                  sortDirection={sortDirection}
                  onClick={() => toggleSort("gender")}
                />
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>
                <HeaderSortButton
                  label="Năm sinh"
                  sortKey="birth_year"
                  currentSortKey={sortKey}
                  sortDirection={sortDirection}
                  onClick={() => toggleSort("birth_year")}
                />
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left" }}>
                <HeaderSortButton
                  label="Ngày tạo ca"
                  sortKey="created_at"
                  currentSortKey={sortKey}
                  sortDirection={sortDirection}
                  onClick={() => toggleSort("created_at")}
                />
              </th>
              <th
                style={{
                  padding: "14px 16px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#475569",
                }}
              >
                Thao tác
              </th>
            </tr>

            <tr
              style={{
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <th style={{ padding: "10px 16px" }}>
                <input
                  value={quickCaseCode}
                  onChange={(e) => setQuickCaseCode(e.target.value)}
                  placeholder="Lọc mã ca"
                  style={inputStyle()}
                />
              </th>
              <th style={{ padding: "10px 16px" }}>
                <input
                  value={quickCaseName}
                  onChange={(e) => setQuickCaseName(e.target.value)}
                  placeholder="Lọc tên ca"
                  style={inputStyle()}
                />
              </th>
              <th style={{ padding: "10px 16px" }}>
                <input
                  value={quickGender}
                  onChange={(e) => setQuickGender(e.target.value)}
                  placeholder="Lọc giới tính"
                  style={inputStyle()}
                />
              </th>
              <th style={{ padding: "10px 16px" }}>
                <input
                  value={quickBirthYear}
                  onChange={(e) => setQuickBirthYear(e.target.value)}
                  placeholder="Lọc năm sinh"
                  style={inputStyle()}
                />
              </th>
              <th style={{ padding: "10px 16px" }}>
                <input
                  value={quickCreatedAt}
                  onChange={(e) => setQuickCreatedAt(e.target.value)}
                  placeholder="Lọc ngày tạo"
                  style={inputStyle()}
                />
              </th>
              <th style={{ padding: "10px 16px" }} />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 20, color: "#64748b" }}>
                  Đang tải danh sách ca...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ padding: 20, color: "#dc2626" }}>
                  {error}
                </td>
              </tr>
            ) : filteredCases.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 20, color: "#64748b" }}>
                  Không có ca phù hợp bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredCases.map((item) => (
                <tr
                  key={item.id}
                  onDoubleClick={() => navigate(`/app/cases/${item.id}`)}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                  title="Double click để mở chi tiết ca"
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 14,
                      color: "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    {item.caseCode}
                  </td>

                  <td style={{ padding: "14px 16px", fontSize: 14 }}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/app/cases/${item.id}`);
                      }}
                      style={linkButtonStyle()}
                      title="Mở chi tiết ca"
                    >
                      {item.caseName}
                    </button>
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 14,
                      color: "#0f172a",
                    }}
                  >
                    {formatGender(item.gender)}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 14,
                      color: "#0f172a",
                    }}
                  >
                    {item.birthYear ?? "—"}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 14,
                      color: "#0f172a",
                    }}
                  >
                    {formatCreatedDate(item.createdAt)}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        gap: 8,
                      }}
                    >
                      <IconButton
                        label="Xem chi tiết"
                        icon="📓"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/app/cases/${item.id}`);
                        }}
                      />
                      <IconButton
                        label="Xóa ca"
                        icon="🗑️"
                        tone="danger"
                        disabled={deletingCase && deletingCaseId === item.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteCase(item);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {isCreateModalOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 760,
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              padding: 20,
              display: "grid",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Tạo ca mới
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 26,
                  color: "#0f172a",
                }}
              >
                Thông tin ca bệnh
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <Field label="Họ và tên" required>
                <input
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  style={inputStyle()}
                />
              </Field>

              <Field label="Ngày tháng năm sinh" required>
                <input
                  type="date"
                  value={createForm.dateOfBirth}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  style={inputStyle()}
                />
              </Field>

              <Field label="Giới tính" required>
                <select
                  value={createForm.gender}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      gender: e.target.value as CreateCaseForm["gender"],
                    }))
                  }
                  style={inputStyle()}
                >
                  <option value="">Chưa chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </Field>

              <Field label="Nghề nghiệp">
                <input
                  value={createForm.occupation}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  placeholder="Không bắt buộc"
                  style={inputStyle()}
                />
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <ActionButton
                label="Đóng"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreateCaseError();
                  setCreateForm(initialForm);
                }}
                disabled={creatingCase}
              />
              <ActionButton
                label={creatingCase ? "Đang lưu..." : "Lưu ca mới"}
                tone="primary"
                disabled={creatingCase}
                onClick={() => {
                  void handleCreateCase();
                }}
              />
            </div>

            {createCaseError ? (
              <div style={{ color: "#dc2626", fontSize: 14 }}>{createCaseError}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}