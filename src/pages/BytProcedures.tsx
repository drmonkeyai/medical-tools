// src/pages/BytProcedures.tsx
import { useEffect, useMemo, useState } from "react";

type BYTProcedureDoc = {
  id: string;
  title: string;

  decisionNo?: string;
  issuedDate?: string;
  year?: number;
  issuer?: string;
  specialty?: string;
  summary?: string;

  driveUrl: string;
  downloadUrl?: string;
  tags?: string[];
};

const LS_KEY = "byt_procedures_v1";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function safeParseDocs(raw: string): BYTProcedureDoc[] {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x) =>
        x &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        typeof x.driveUrl === "string"
    ) as BYTProcedureDoc[];
  } catch {
    return [];
  }
}

function dedupeById(docs: BYTProcedureDoc[]) {
  const m = new Map<string, BYTProcedureDoc>();
  for (const d of docs) m.set(d.id, d);
  return Array.from(m.values());
}

function toPreviewUrl(url: string) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m?.[1]) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}

export default function BytProcedures() {
  const [docs, setDocs] = useState<BYTProcedureDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  // filters/sort
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? safeParseDocs(raw) : [];
    const cleaned = dedupeById(parsed);
    setDocs(cleaned);
    if (cleaned.length > 0) setSelectedId(cleaned[0].id);
  }, []);

  const specialties = useMemo(() => {
    const s = new Set<string>();
    docs.forEach((d) => d.specialty && s.add(d.specialty));
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [docs]);

  const years = useMemo(() => {
    const y = new Set<number>();
    docs.forEach((d) => typeof d.year === "number" && y.add(d.year));
    return ["all", ...Array.from(y).sort((a, b) => b - a).map(String)];
  }, [docs]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    let arr = docs.filter((d) => {
      const matchesQ =
        !nq ||
        normalize(d.title).includes(nq) ||
        normalize(d.specialty ?? "").includes(nq) ||
        normalize(d.issuer ?? "").includes(nq) ||
        normalize(d.decisionNo ?? "").includes(nq) ||
        normalize((d.tags ?? []).join(" ")).includes(nq);

      const matchesSpecialty = specialty === "all" || d.specialty === specialty;
      const matchesYear = year === "all" || String(d.year ?? "") === year;

      return matchesQ && matchesSpecialty && matchesYear;
    });

    arr = arr.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const ay = a.year ?? -1;
      const by = b.year ?? -1;
      return sort === "newest" ? by - ay : ay - by;
    });

    return arr;
  }, [docs, q, specialty, year, sort]);

  useEffect(() => {
    if (filtered.length === 0) return;
    const stillExists = filtered.some((d) => d.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => filtered.find((d) => d.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  // UI: danh sách tài liệu gọn -> dropdown
  const listOptions = useMemo(() => {
    return filtered.map((d) => ({
      id: d.id,
      label: [
        d.title,
        d.decisionNo ? `(${d.decisionNo})` : "",
        d.year ? `- ${d.year}` : "",
        d.specialty ? `- ${d.specialty}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }, [filtered]);

  return (
    // dùng flex column để phần nội dung ăn hết chiều cao
    <div style={{ padding: 16, height: "calc(100vh - 32px)", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* =========================
          DẢI TRÊN (COMPACT) - trong khung đỏ
         ========================= */}
      <section
        style={{
          border: "1px solid #EAECF0",
          borderRadius: 14,
          padding: 12,
          background: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 240 }}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>Tổng hợp hướng dẫn quy trình kĩ thuật của Bộ Y tế</div>
            <div style={{ color: "#667085", marginTop: 4, fontSize: 13 }}>Tìm nhanh theo chuyên khoa</div>
          </div>

          <div style={{ color: "#667085", fontSize: 13 }}>
            {filtered.length} tài liệu
          </div>
        </div>

        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 200px 140px 220px", gap: 10 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên / số quyết định / chuyên khoa…"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D0D5DD",
              width: "100%",
            }}
          />

          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D0D5DD",
              background: "white",
              width: "100%",
            }}
          >
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả chuyên khoa" : s}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D0D5DD",
              background: "white",
              width: "100%",
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === "all" ? "Tất cả năm" : y}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D0D5DD",
              background: "white",
              width: "100%",
            }}
          >
            <option value="newest">Mới → cũ (theo năm)</option>
            <option value="oldest">Cũ → mới (theo năm)</option>
            <option value="title">A → Z (theo tên)</option>
          </select>
        </div>

        {/* Dropdown chọn tài liệu (gọn thay vì list dài) */}
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={filtered.length === 0}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D0D5DD",
              background: "white",
              width: "100%",
            }}
          >
            {filtered.length === 0 ? (
              <option value="">Chưa có tài liệu hoặc không có kết quả phù hợp</option>
            ) : null}
            {listOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* =========================
          DẢI GIỮA (COMPACT) - trong khung đỏ
         ========================= */}
      <section
        style={{
          border: "1px solid #EAECF0",
          borderRadius: 14,
          padding: "10px 12px",
          background: "white",
        }}
      >
        {!selected ? (
          <div style={{ color: "#667085" }}>Chọn một tài liệu để xem nội dung.</div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            {/* Tóm tắt 1 dòng */}
            <div style={{ minWidth: 260 }}>
              <div style={{ fontWeight: 800, lineHeight: 1.25 }}>{selected.title}</div>
              <div style={{ marginTop: 3, color: "#667085", fontSize: 13, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {selected.decisionNo ? <span>{selected.decisionNo}</span> : null}
                {selected.issuedDate ? <span>Ngày: {selected.issuedDate}</span> : null}
                {selected.year ? <span>Năm: {selected.year}</span> : null}
                {selected.specialty ? <span>{selected.specialty}</span> : null}
              </div>
            </div>

            {/* Nút hành động */}
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <a
                href={selected.driveUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #D0D5DD",
                  textDecoration: "none",
                  color: "#111827",
                  background: "white",
                }}
              >
                Mở Drive
              </a>

              {selected.downloadUrl ? (
                <a
                  href={selected.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #D0D5DD",
                    textDecoration: "none",
                    color: "#111827",
                    background: "white",
                  }}
                >
                  Tải
                </a>
              ) : null}
            </div>
          </div>
        )}
      </section>

      {/* =========================
          NỘI DUNG (ĂN HẾT DIỆN TÍCH CÒN LẠI)
         ========================= */}
      <section
        style={{
          border: "1px solid #EAECF0",
          borderRadius: 14,
          background: "white",
          overflow: "hidden",
          flex: 1, // ✅ phần này ăn hết
          minHeight: 320,
        }}
      >
        {!selected ? (
          <div style={{ padding: 12, color: "#667085" }}>
            Chọn một tài liệu để xem nội dung.
          </div>
        ) : (
          <iframe
            title={selected.title}
            src={toPreviewUrl(selected.driveUrl)}
            style={{ width: "100%", height: "100%", border: 0 }}
            allow="autoplay"
          />
        )}
      </section>
    </div>
  );
}