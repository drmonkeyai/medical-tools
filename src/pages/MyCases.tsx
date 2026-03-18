import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCases, type Patient } from "../context/CasesContext";

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clampInt(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.floor(v)));
}

export default function MyCases() {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    closeCase,
    loading,
    updateCasePatient,
  } = useCases();

  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ca đang được chọn trong danh sách (1 click)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // popup chỉnh sửa
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editYob, setEditYob] = useState<number>(1990);
  const [editSex, setEditSex] = useState<Patient["sex"]>("Nam");
  const [editWeightKg, setEditWeightKg] = useState<string>("");
  const [editHeightCm, setEditHeightCm] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const nowYear = new Date().getFullYear();

  const filteredCases = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return cases;

    return cases.filter((c) => {
      const name = c.patient.name?.toLowerCase() ?? "";
      const yob = String(c.patient.yob ?? "");
      const sex = c.patient.sex?.toLowerCase() ?? "";
      const resultsText = c.results.map((r) => r.tool.toLowerCase()).join(" ");
      return (
        name.includes(q) ||
        yob.includes(q) ||
        sex.includes(q) ||
        resultsText.includes(q)
      );
    });
  }, [cases, keyword]);

  // ĐÃ SỬA LỖI Ở ĐÂY: Chuyển hướng đến đúng route chi tiết ca bệnh
  async function handleOpenCase(id: string) {
    setActiveCaseId(id);
    navigate(`/cases/${id}`);
  }

  async function handleDeleteCase(id: string) {
    const ok = window.confirm("Bạn có chắc muốn xóa ca này không?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await closeCase(id);

      if (selectedCaseId === id) {
        setSelectedCaseId(null);
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Không xóa được ca");
    } finally {
      setDeletingId(null);
    }
  }

  function openEditModal(id: string) {
    const c = cases.find((item) => item.id === id);
    if (!c) return;

    setEditingCaseId(id);
    setEditName(c.patient.name ?? "");
    setEditYob(c.patient.yob ?? 1990);
    setEditSex(c.patient.sex ?? "Nam");
    setEditWeightKg(c.patient.weightKg ? String(c.patient.weightKg) : "");
    setEditHeightCm(c.patient.heightCm ? String(c.patient.heightCm) : "");
    setEditError("");
  }

  function closeEditModal() {
    if (savingEdit) return;
    setEditingCaseId(null);
    setEditError("");
  }

  async function handleSaveEdit() {
    if (!editingCaseId) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError("Vui lòng nhập họ tên.");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      const w = editWeightKg.trim() ? Number(editWeightKg) : undefined;
      const h = editHeightCm.trim() ? Number(editHeightCm) : undefined;

      const nextPatient: Patient = {
        name: trimmedName,
        yob: clampInt(editYob, 1900, nowYear),
        sex: editSex,
        weightKg: Number.isFinite(w as number) ? (w as number) : undefined,
        heightCm: Number.isFinite(h as number) ? (h as number) : undefined,
      };

      await updateCasePatient(editingCaseId, nextPatient);
      setEditingCaseId(null);
    } catch (error: any) {
      console.error(error);
      setEditError(error?.message || "Không lưu được thay đổi.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div
      style={{
        padding: 12,
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.06)",
          padding: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              Ca của tôi
            </div>
            <div
              style={{
                marginTop: 4,
                color: "#64748b",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Tổng {cases.length} ca • Hiển thị {filteredCases.length} ca • 1 click để chọn • 2 click để mở ca
            </div>
          </div>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên, năm sinh, giới, tool..."
            style={{
              width: "min(420px, 100%)",
              height: 38,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "0 12px",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 2fr) 90px 80px 130px 120px 170px 190px",
            gap: 0,
            alignItems: "center",
            padding: "10px 12px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            fontSize: 12,
            fontWeight: 800,
            color: "#475569",
          }}
        >
          <div>Bệnh nhân</div>
          <div>Năm sinh</div>
          <div>Giới</div>
          <div>Cân nặng / Cao</div>
          <div>Kết quả</div>
          <div>Cập nhật</div>
          <div style={{ textAlign: "right" }}>Thao tác</div>
        </div>

        {loading ? (
          <div
            style={{
              padding: 16,
              fontSize: 14,
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            Đang tải ca...
          </div>
        ) : filteredCases.length === 0 ? (
          <div
            style={{
              padding: 18,
              textAlign: "center",
              color: "#64748b",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {cases.length === 0 ? "Chưa có ca nào được tạo." : "Không tìm thấy ca phù hợp."}
          </div>
        ) : (
          <div style={{ maxHeight: "calc(100vh - 230px)", overflowY: "auto" }}>
            {filteredCases.map((c, index) => {
              const isActive = c.id === activeCaseId;
              const isSelected = c.id === selectedCaseId;
              const latest = c.results?.[0];

              const rowBg = isSelected
                ? "rgba(37,99,235,0.10)"
                : isActive
                ? "rgba(37,99,235,0.05)"
                : index % 2 === 0
                ? "#fff"
                : "#fcfcfd";

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  onDoubleClick={() => handleOpenCase(c.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(220px, 2fr) 90px 80px 130px 120px 170px 190px",
                    gap: 0,
                    alignItems: "center",
                    padding: "8px 12px",
                    borderBottom: "1px solid #eef2f7",
                    background: rowBg,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={c.patient.name}
                      >
                        {c.patient.name || "Chưa có tên"}
                      </div>

                      {isActive ? (
                        <span
                          style={{
                            flex: "0 0 auto",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#166534",
                            background: "rgba(22,163,74,0.10)",
                            padding: "3px 8px",
                            borderRadius: 999,
                          }}
                        >
                          Đang chọn
                        </span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      ID: {c.id.slice(0, 8)}...
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {c.patient.yob || "—"}
                  </div>

                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {c.patient.sex || "—"}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.patient.weightKg ? `${c.patient.weightKg} kg` : "—"} /{" "}
                    {c.patient.heightCm ? `${c.patient.heightCm} cm` : "—"}
                  </div>

                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 34,
                        height: 26,
                        padding: "0 8px",
                        borderRadius: 999,
                        background: "rgba(37,99,235,0.08)",
                        color: "#1d4ed8",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {c.results.length}
                    </div>

                    {latest ? (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={latest.tool}
                      >
                        {latest.tool}
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDateTime(latest?.when || c.createdAt)}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(c.id)}
                      style={{
                        height: 32,
                        padding: "0 10px",
                        borderRadius: 9,
                        border: "1px solid #2563eb",
                        background: "#fff",
                        color: "#2563eb",
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Chỉnh sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCase(c.id)}
                      disabled={deletingId === c.id}
                      style={{
                        height: 32,
                        padding: "0 10px",
                        borderRadius: 9,
                        border: "1px solid #ef4444",
                        background: "#fff",
                        color: "#ef4444",
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: deletingId === c.id ? "not-allowed" : "pointer",
                        opacity: deletingId === c.id ? 0.6 : 1,
                      }}
                    >
                      {deletingId === c.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingCaseId ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div
            style={{
              width: "min(680px, 96vw)",
              background: "#fff",
              borderRadius: 18,
              padding: 18,
              boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>Chỉnh sửa thông tin ca</div>
                <div style={{ marginTop: 4, color: "#64748b", fontWeight: 600 }}>
                  Cập nhật thông tin bệnh nhân của ca đang chọn.
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: savingEdit ? "not-allowed" : "pointer",
                  fontWeight: 900,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Họ tên</div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={savingEdit}
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    padding: "0 12px",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Năm sinh</div>
                  <input
                    type="number"
                    value={editYob}
                    min={1900}
                    max={nowYear}
                    onChange={(e) => setEditYob(Number(e.target.value))}
                    disabled={savingEdit}
                    style={{
                      width: "100%",
                      height: 42,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      padding: "0 12px",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Giới</div>
                  <select
                    value={editSex}
                    onChange={(e) => setEditSex(e.target.value as Patient["sex"])}
                    disabled={savingEdit}
                    style={{
                      width: "100%",
                      height: 42,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      padding: "0 12px",
                      fontSize: 14,
                      outline: "none",
                      background: "#fff",
                    }}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Cân nặng (kg)</div>
                  <input
                    value={editWeightKg}
                    onChange={(e) => setEditWeightKg(e.target.value)}
                    disabled={savingEdit}
                    style={{
                      width: "100%",
                      height: 42,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      padding: "0 12px",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Chiều cao (cm)</div>
                  <input
                    value={editHeightCm}
                    onChange={(e) => setEditHeightCm(e.target.value)}
                    disabled={savingEdit}
                    style={{
                      width: "100%",
                      height: 42,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      padding: "0 12px",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {editError ? (
                <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14 }}>
                  {editError}
                </div>
              ) : null}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  style={{
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontWeight: 800,
                    cursor: savingEdit ? "not-allowed" : "pointer",
                  }}
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  style={{
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 10,
                    border: "1px solid #2563eb",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: savingEdit ? "not-allowed" : "pointer",
                  }}
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}