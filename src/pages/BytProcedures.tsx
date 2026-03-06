// src/pages/BytProcedures.tsx
import { useEffect, useMemo, useState } from "react";

type BYTProcedureDoc = {
  id: string;
  filename?: string;
  title: string;
  issuedDate?: string;
  decisionNo?: string;
  specialty?: string;
  year?: number;
  driveUrl: string;
  downloadUrl?: string;
  previewUrl?: string;
  issuer?: string;
  updatedAt?: string;
};

const LS_KEY = "byt_procedures_v1";
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbyXuexD2ldSpOPkobos62Uiu8vgiKG08cxZXWUr5Z5NisYPx1w4z6Kf1LeLsyI0n9sZHg/exec";

function normalize(s: string) {
  return String(s || "")
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
  const m = String(url || "").match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m?.[1]) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}

function mapApiItems(items: any[]): BYTProcedureDoc[] {
  return items
    .filter(
      (x) =>
        x &&
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        typeof x.driveUrl === "string"
    )
    .map((x) => ({
      id: String(x.id),
      filename: x.filename ? String(x.filename) : undefined,
      title: String(x.title),
      issuedDate: x.issuedDate ? String(x.issuedDate) : undefined,
      decisionNo: x.decisionNo ? String(x.decisionNo) : undefined,
      specialty: x.specialty ? String(x.specialty) : undefined,
      year:
        typeof x.year === "number"
          ? x.year
          : x.year
          ? Number(x.year)
          : undefined,
      driveUrl: String(x.driveUrl),
      downloadUrl: x.downloadUrl ? String(x.downloadUrl) : undefined,
      previewUrl: x.previewUrl ? String(x.previewUrl) : undefined,
      issuer: x.issuer ? String(x.issuer) : "Bộ Y tế",
      updatedAt: x.updatedAt ? String(x.updatedAt) : undefined,
    }));
}

function formatDateVN(iso?: string) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function buildSafeDownloadUrl(doc: BYTProcedureDoc | null) {
  if (!doc) return "";
  if (doc.downloadUrl) return doc.downloadUrl;
  if (doc.id) {
    return `https://drive.google.com/uc?export=download&id=${doc.id}`;
  }
  return "";
}

export default function BytProcedures() {
  const [docs, setDocs] = useState<BYTProcedureDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function loadFromApi() {
    const url = `${GAS_URL}?t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json?.ok || !Array.isArray(json.items)) {
      throw new Error(json?.error || "API trả về dữ liệu không hợp lệ");
    }

    const nextDocs = dedupeById(mapApiItems(json.items));
    localStorage.setItem(LS_KEY, JSON.stringify(nextDocs));
    return nextDocs;
  }

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    const cached = raw ? dedupeById(safeParseDocs(raw)) : [];

    if (cached.length > 0) {
      setDocs(cached);
      setSelectedId(cached[0].id);
    }

    setIsLoading(true);
    loadFromApi()
      .then((nextDocs) => {
        setDocs(nextDocs);
        setLoadError("");
        if (nextDocs.length > 0) {
          setSelectedId((prev) =>
            nextDocs.some((d) => d.id === prev) ? prev : nextDocs[0].id
          );
        }
      })
      .catch((e: any) => {
        if (cached.length === 0) {
          setLoadError(`Không tải được dữ liệu: ${e?.message || String(e)}`);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const specialties = useMemo(() => {
    const s = new Set<string>();
    docs.forEach((d) => d.specialty && s.add(d.specialty));
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b, "vi"))];
  }, [docs]);

  const years = useMemo(() => {
    const y = new Set<number>();
    docs.forEach((d) => typeof d.year === "number" && y.add(d.year));
    return ["all", ...Array.from(y).sort((a, b) => b - a).map(String)];
  }, [docs]);

  const filtered = useMemo(() => {
    const nq = normalize(q);

    return docs.filter((d) => {
      const matchesQ =
        !nq ||
        normalize(d.title).includes(nq) ||
        normalize(d.specialty ?? "").includes(nq) ||
        normalize(d.issuer ?? "").includes(nq) ||
        normalize(d.decisionNo ?? "").includes(nq) ||
        normalize(d.filename ?? "").includes(nq);

      const matchesSpecialty = specialty === "all" || d.specialty === specialty;
      const matchesYear = year === "all" || String(d.year ?? "") === year;

      return matchesQ && matchesSpecialty && matchesYear;
    });
  }, [docs, q, specialty, year]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId("");
      return;
    }
    const stillExists = filtered.some((d) => d.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => filtered.find((d) => d.id === selectedId) ?? null,
    [filtered, selectedId]
  );

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

  const safeDownloadUrl = buildSafeDownloadUrl(selected);

  return (
    <div
      style={{
        padding: 12,
        height: "calc(100vh - 24px)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <section
        style={{
          border: "1px solid #EAECF0",
          borderRadius: 14,
          padding: 10,
          background: "white",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 210px 140px 1.2fr auto auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên / số quyết định / chuyên khoa..."
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
              <option value="">Chưa có tài liệu phù hợp</option>
            ) : null}
            {listOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <div
            style={{
              color: "#667085",
              fontSize: 13,
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            {isLoading ? "Đang tải..." : `${filtered.length} tài liệu`}
          </div>

          <a
            href={selected?.driveUrl || "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #1D4ED8",
              background: selected ? "#2563EB" : "#94A3B8",
              color: "white",
              fontWeight: 700,
              whiteSpace: "nowrap",
              textDecoration: "none",
              pointerEvents: selected ? "auto" : "none",
            }}
          >
            Xem toàn bộ
          </a>

          <a
            href={safeDownloadUrl || "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: safeDownloadUrl ? "#111827" : "#94A3B8",
              color: "white",
              fontWeight: 700,
              whiteSpace: "nowrap",
              textDecoration: "none",
              pointerEvents: safeDownloadUrl ? "auto" : "none",
            }}
          >
            Tải về
          </a>
        </div>

        {(selected || loadError) && (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                minWidth: 260,
                color: loadError ? "#B42318" : "#667085",
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={
                loadError
                  ? loadError
                  : selected
                  ? `${selected.title} • ${selected.decisionNo || ""} • ${
                      selected.specialty || ""
                    } • ${selected.issuedDate ? formatDateVN(selected.issuedDate) : ""}`
                  : ""
              }
            >
              {loadError
                ? loadError
                : selected
                ? `${selected.title}${
                    selected.decisionNo ? ` • ${selected.decisionNo}` : ""
                  }${
                    selected.specialty ? ` • ${selected.specialty}` : ""
                  }${
                    selected.issuedDate
                      ? ` • ${formatDateVN(selected.issuedDate)}`
                      : ""
                  }`
                : ""}
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          border: "1px solid #EAECF0",
          borderRadius: 14,
          background: "white",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
        }}
      >
        {!selected ? (
          <div style={{ padding: 12, color: "#667085" }}>
            Chọn một tài liệu để xem nội dung.
          </div>
        ) : (
          <iframe
            title={selected.title}
            src={selected.previewUrl || toPreviewUrl(selected.driveUrl)}
            style={{ width: "100%", height: "100%", border: 0 }}
            allow="autoplay"
          />
        )}
      </section>
    </div>
  );
}