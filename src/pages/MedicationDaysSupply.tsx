import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type LoaiThuoc = "vien" | "thuoc-nuoc" | "binh-hit" | "insulin";

function congNgay(ngay: string, soNgay: number) {
  const d = new Date(ngay);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + soNgay);
  return d.toLocaleDateString("vi-VN");
}

function lamTronXuongAnToan(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function TruongNhap(props: { nhan: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{props.nhan}</div>
      {props.children}
    </div>
  );
}

function TheKetQua(props: { tieuDe: string; giaTri: string; ghiChu?: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 12,
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ fontWeight: 900 }}>{props.tieuDe}</div>
      <div style={{ marginTop: 8, fontSize: 20, fontWeight: 1000 }}>
        {props.giaTri}
      </div>
      {props.ghiChu ? (
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
          {props.ghiChu}
        </div>
      ) : null}
    </div>
  );
}

function TieuDeNhom(props: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 4, marginBottom: 8, fontWeight: 900 }}>
      {props.children}
    </div>
  );
}

function KhungNho(props: { tieuDe: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 12,
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 4 }}>{props.tieuDe}</div>
      {props.children}
    </div>
  );
}

const kieuNhap: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  outline: "none",
  background: "white",
};

const kieuNutChon = (dangChon: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: dangChon ? "rgba(29,78,216,0.10)" : "white",
  cursor: "pointer",
  fontWeight: dangChon ? 900 : 700,
});

export default function TinhNgayHetThuoc() {
  const navigate = useNavigate();

  const homNay = new Date();
  const nam = homNay.getFullYear();
  const thang = String(homNay.getMonth() + 1).padStart(2, "0");
  const ngay = String(homNay.getDate()).padStart(2, "0");
  const ngayHomNay = `${nam}-${thang}-${ngay}`;

  const [loaiThuoc, setLoaiThuoc] = useState<LoaiThuoc>("vien");
  const [ngayCapThuoc, setNgayCapThuoc] = useState(ngayHomNay);

  // Viên / nang
  const [soLuongCap, setSoLuongCap] = useState(30);
  const [soDonViMoiLanDung, setSoDonViMoiLanDung] = useState(1);
  const [soLanDungMoiNgay, setSoLanDungMoiNgay] = useState(2);
  const [dungKhiCan, setDungKhiCan] = useState(false);
  const [soLanDungToiDaMoiNgay, setSoLanDungToiDaMoiNgay] = useState(3);

  // Thuốc nước
  const [tongTheTichMl, setTongTheTichMl] = useState(60);
  const [soMlMoiLanDung, setSoMlMoiLanDung] = useState(5);

  // Bình hít
  const [soBinhDuocCap, setSoBinhDuocCap] = useState(1);
  const [soNhanMoiBinh, setSoNhanMoiBinh] = useState(200);
  const [soNhanMoiLanDung, setSoNhanMoiLanDung] = useState(2);
  const [soLanHitMoiNgay, setSoLanHitMoiNgay] = useState(2);

  // Insulin - ô trên: người dùng nhập chính
  const [soButHoacLo, setSoButHoacLo] = useState(1);
  const [soLanTiemMoiNgay, setSoLanTiemMoiNgay] = useState(2);
  const [soDonViMoiLanTiem, setSoDonViMoiLanTiem] = useState(10);

  // Insulin - ô dưới: thông số chi tiết / mặc định
  const [dungTichMoiButHoacLoMl, setDungTichMoiButHoacLoMl] = useState(3);
  const [nongDoUnitsMoiMl, setNongDoUnitsMoiMl] = useState(100);
  const [primingMoiLanTiem, setPrimingMoiLanTiem] = useState(2);
  const [soNgaySuDungSauMoNap, setSoNgaySuDungSauMoNap] = useState(28);
  const [nhacTaiCapTruocMayNgay, setNhacTaiCapTruocMayNgay] = useState(3);

  const ketQuaTinh = useMemo(() => {
    let mucDungMoiNgay = 0;
    let soNgayDuThuoc = 0;
    let dienGiai = "";

    if (loaiThuoc === "vien") {
      const soLanThucTeMoiNgay = dungKhiCan
        ? soLanDungToiDaMoiNgay
        : soLanDungMoiNgay;

      mucDungMoiNgay = soDonViMoiLanDung * soLanThucTeMoiNgay;
      soNgayDuThuoc =
        mucDungMoiNgay > 0
          ? lamTronXuongAnToan(soLuongCap / mucDungMoiNgay)
          : 0;

      dienGiai = `Dạng viên / nang: ${soLuongCap} / (${soDonViMoiLanDung} × ${soLanThucTeMoiNgay})`;
    }

    if (loaiThuoc === "thuoc-nuoc") {
      const soLanThucTeMoiNgay = dungKhiCan
        ? soLanDungToiDaMoiNgay
        : soLanDungMoiNgay;

      mucDungMoiNgay = soMlMoiLanDung * soLanThucTeMoiNgay;
      soNgayDuThuoc =
        mucDungMoiNgay > 0
          ? lamTronXuongAnToan(tongTheTichMl / mucDungMoiNgay)
          : 0;

      dienGiai = `Thuốc nước: ${tongTheTichMl} mL / (${soMlMoiLanDung} mL × ${soLanThucTeMoiNgay})`;
    }

    if (loaiThuoc === "binh-hit") {
      const tongSoNhan = soBinhDuocCap * soNhanMoiBinh;
      mucDungMoiNgay = soNhanMoiLanDung * soLanHitMoiNgay;
      soNgayDuThuoc =
        mucDungMoiNgay > 0
          ? lamTronXuongAnToan(tongSoNhan / mucDungMoiNgay)
          : 0;

      dienGiai = `Bình hít: ${tongSoNhan} nhát / (${soNhanMoiLanDung} × ${soLanHitMoiNgay})`;
    }

    if (loaiThuoc === "insulin") {
      const tongSoUnits =
        soButHoacLo * dungTichMoiButHoacLoMl * nongDoUnitsMoiMl;

      const tongLieuDieuTriMoiNgay = soDonViMoiLanTiem * soLanTiemMoiNgay;
      const haoHutDoPrimingMoiNgay = primingMoiLanTiem * soLanTiemMoiNgay;

      mucDungMoiNgay = tongLieuDieuTriMoiNgay + haoHutDoPrimingMoiNgay;

      const soNgayTinhTheoTongUnits =
        mucDungMoiNgay > 0
          ? lamTronXuongAnToan(tongSoUnits / mucDungMoiNgay)
          : 0;

      soNgayDuThuoc =
        soNgaySuDungSauMoNap > 0
          ? Math.min(soNgayTinhTheoTongUnits, soNgaySuDungSauMoNap)
          : soNgayTinhTheoTongUnits;

      dienGiai =
        `Insulin: tổng ${tongSoUnits} units; ` +
        `dùng mỗi ngày = (${soDonViMoiLanTiem} × ${soLanTiemMoiNgay}) + ` +
        `priming (${primingMoiLanTiem} × ${soLanTiemMoiNgay})`;
    }

    return {
      mucDungMoiNgay,
      soNgayDuThuoc,
      dienGiai,
    };
  }, [
    loaiThuoc,
    soLuongCap,
    soDonViMoiLanDung,
    soLanDungMoiNgay,
    dungKhiCan,
    soLanDungToiDaMoiNgay,
    tongTheTichMl,
    soMlMoiLanDung,
    soBinhDuocCap,
    soNhanMoiBinh,
    soNhanMoiLanDung,
    soLanHitMoiNgay,
    soButHoacLo,
    soLanTiemMoiNgay,
    soDonViMoiLanTiem,
    dungTichMoiButHoacLoMl,
    nongDoUnitsMoiMl,
    primingMoiLanTiem,
    soNgaySuDungSauMoNap,
  ]);

  const ngayDungLieuCuoi = useMemo(() => {
    if (!ngayCapThuoc) return "";
    if (ketQuaTinh.soNgayDuThuoc <= 0) return congNgay(ngayCapThuoc, 0);
    return congNgay(ngayCapThuoc, ketQuaTinh.soNgayDuThuoc - 1);
  }, [ngayCapThuoc, ketQuaTinh.soNgayDuThuoc]);

  const ngayHetThuoc = useMemo(() => {
    if (!ngayCapThuoc) return "";
    return congNgay(ngayCapThuoc, ketQuaTinh.soNgayDuThuoc);
  }, [ngayCapThuoc, ketQuaTinh.soNgayDuThuoc]);

  const ngayNenTaiCap = useMemo(() => {
    if (!ngayCapThuoc) return "";
    const soNgayLech = Math.max(
      ketQuaTinh.soNgayDuThuoc - nhacTaiCapTruocMayNgay,
      0
    );
    return congNgay(ngayCapThuoc, soNgayLech);
  }, [ngayCapThuoc, ketQuaTinh.soNgayDuThuoc, nhacTaiCapTruocMayNgay]);

  const tenLoaiThuoc =
    loaiThuoc === "vien"
      ? "Viên / nang"
      : loaiThuoc === "thuoc-nuoc"
      ? "Thuốc nước"
      : loaiThuoc === "binh-hit"
      ? "Bình hít"
      : "Insulin";

  const tongLieuDieuTriInsulinMoiNgay =
    soDonViMoiLanTiem * soLanTiemMoiNgay;

  const haoHutPrimingInsulinMoiNgay =
    primingMoiLanTiem * soLanTiemMoiNgay;

  return (
    <div className="page">
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Tính ngày hết thuốc</h2>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>
              Hỗ trợ ước tính số ngày đủ thuốc, ngày dùng liều cuối, ngày hết
              thuốc và ngày nên tái cấp.
            </div>
          </div>

          <button
            onClick={() => navigate("/dose-adjust")}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ← Quay lại Điều chỉnh liều thuốc
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            border: "1px solid var(--line)",
            borderRadius: 16,
            background: "white",
            padding: 14,
          }}
        >
          <TieuDeNhom>Chọn loại thuốc</TieuDeNhom>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setLoaiThuoc("vien")}
              style={kieuNutChon(loaiThuoc === "vien")}
            >
              Viên / nang
            </button>

            <button
              type="button"
              onClick={() => setLoaiThuoc("thuoc-nuoc")}
              style={kieuNutChon(loaiThuoc === "thuoc-nuoc")}
            >
              Thuốc nước
            </button>

            <button
              type="button"
              onClick={() => setLoaiThuoc("binh-hit")}
              style={kieuNutChon(loaiThuoc === "binh-hit")}
            >
              Bình hít
            </button>

            <button
              type="button"
              onClick={() => setLoaiThuoc("insulin")}
              style={kieuNutChon(loaiThuoc === "insulin")}
            >
              Insulin
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "minmax(300px, 440px) 1fr",
          }}
        >
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "white",
              padding: 14,
            }}
          >
            <TieuDeNhom>Dữ liệu đầu vào</TieuDeNhom>

            <TruongNhap nhan="Ngày cấp thuốc">
              <input
                type="date"
                value={ngayCapThuoc}
                onChange={(e) => setNgayCapThuoc(e.target.value)}
                style={kieuNhap}
              />
            </TruongNhap>

            {loaiThuoc === "vien" ? (
              <>
                <TruongNhap nhan="Số lượng được cấp (viên)">
                  <input
                    type="number"
                    min={0}
                    value={soLuongCap}
                    onChange={(e) => setSoLuongCap(Number(e.target.value))}
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số viên mỗi lần dùng">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={soDonViMoiLanDung}
                    onChange={(e) =>
                      setSoDonViMoiLanDung(Number(e.target.value))
                    }
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số lần dùng mỗi ngày">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={soLanDungMoiNgay}
                    onChange={(e) =>
                      setSoLanDungMoiNgay(Number(e.target.value))
                    }
                    style={kieuNhap}
                    disabled={dungKhiCan}
                  />
                </TruongNhap>

                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 700,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={dungKhiCan}
                      onChange={(e) => setDungKhiCan(e.target.checked)}
                    />
                    Dùng khi cần
                  </label>
                </div>

                {dungKhiCan ? (
                  <TruongNhap nhan="Số lần dùng tối đa mỗi ngày">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={soLanDungToiDaMoiNgay}
                      onChange={(e) =>
                        setSoLanDungToiDaMoiNgay(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>
                ) : null}
              </>
            ) : null}

            {loaiThuoc === "thuoc-nuoc" ? (
              <>
                <TruongNhap nhan="Tổng lượng thuốc được cấp (mL)">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={tongTheTichMl}
                    onChange={(e) => setTongTheTichMl(Number(e.target.value))}
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số mL mỗi lần dùng">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={soMlMoiLanDung}
                    onChange={(e) => setSoMlMoiLanDung(Number(e.target.value))}
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số lần dùng mỗi ngày">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={soLanDungMoiNgay}
                    onChange={(e) =>
                      setSoLanDungMoiNgay(Number(e.target.value))
                    }
                    style={kieuNhap}
                    disabled={dungKhiCan}
                  />
                </TruongNhap>

                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 700,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={dungKhiCan}
                      onChange={(e) => setDungKhiCan(e.target.checked)}
                    />
                    Dùng khi cần
                  </label>
                </div>

                {dungKhiCan ? (
                  <TruongNhap nhan="Số lần dùng tối đa mỗi ngày">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={soLanDungToiDaMoiNgay}
                      onChange={(e) =>
                        setSoLanDungToiDaMoiNgay(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>
                ) : null}
              </>
            ) : null}

            {loaiThuoc === "binh-hit" ? (
              <>
                <TruongNhap nhan="Số bình được cấp">
                  <input
                    type="number"
                    min={0}
                    value={soBinhDuocCap}
                    onChange={(e) => setSoBinhDuocCap(Number(e.target.value))}
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số nhát mỗi bình">
                  <input
                    type="number"
                    min={0}
                    value={soNhanMoiBinh}
                    onChange={(e) => setSoNhanMoiBinh(Number(e.target.value))}
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số nhát mỗi lần dùng">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={soNhanMoiLanDung}
                    onChange={(e) =>
                      setSoNhanMoiLanDung(Number(e.target.value))
                    }
                    style={kieuNhap}
                  />
                </TruongNhap>

                <TruongNhap nhan="Số lần dùng mỗi ngày">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={soLanHitMoiNgay}
                    onChange={(e) => setSoLanHitMoiNgay(Number(e.target.value))}
                    style={kieuNhap}
                  />
                </TruongNhap>
              </>
            ) : null}

            {loaiThuoc === "insulin" ? (
              <>
                <KhungNho tieuDe="Thông tin chính">
                  <TruongNhap nhan="Số bút / lọ được cấp">
                    <input
                      type="number"
                      min={0}
                      value={soButHoacLo}
                      onChange={(e) => setSoButHoacLo(Number(e.target.value))}
                      style={kieuNhap}
                    />
                  </TruongNhap>

                  <TruongNhap nhan="Số lần tiêm mỗi ngày">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={soLanTiemMoiNgay}
                      onChange={(e) =>
                        setSoLanTiemMoiNgay(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>

                  <TruongNhap nhan="Số đơn vị mỗi lần tiêm (units)">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={soDonViMoiLanTiem}
                      onChange={(e) =>
                        setSoDonViMoiLanTiem(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>
                </KhungNho>

                <KhungNho tieuDe="Thông số chi tiết insulin">
                  <TruongNhap nhan="Dung tích mỗi bút / lọ (mL)">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={dungTichMoiButHoacLoMl}
                      onChange={(e) =>
                        setDungTichMoiButHoacLoMl(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>

                  <TruongNhap nhan="Nồng độ (units/mL)">
                    <input
                      type="number"
                      min={0}
                      value={nongDoUnitsMoiMl}
                      onChange={(e) =>
                        setNongDoUnitsMoiMl(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>

                  <TruongNhap nhan="Priming mỗi lần tiêm (units)">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={primingMoiLanTiem}
                      onChange={(e) =>
                        setPrimingMoiLanTiem(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>

                  <TruongNhap nhan="Số ngày dùng được sau mở nắp">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={soNgaySuDungSauMoNap}
                      onChange={(e) =>
                        setSoNgaySuDungSauMoNap(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>

                  <TruongNhap nhan="Nhắc tái cấp trước bao nhiêu ngày">
                    <input
                      type="number"
                      min={0}
                      value={nhacTaiCapTruocMayNgay}
                      onChange={(e) =>
                        setNhacTaiCapTruocMayNgay(Number(e.target.value))
                      }
                      style={kieuNhap}
                    />
                  </TruongNhap>
                </KhungNho>
              </>
            ) : null}

            {loaiThuoc !== "insulin" ? (
              <TruongNhap nhan="Nhắc tái cấp trước bao nhiêu ngày">
                <input
                  type="number"
                  min={0}
                  value={nhacTaiCapTruocMayNgay}
                  onChange={(e) =>
                    setNhacTaiCapTruocMayNgay(Number(e.target.value))
                  }
                  style={kieuNhap}
                />
              </TruongNhap>
            ) : null}
          </div>

          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "white",
              padding: 14,
            }}
          >
            <TieuDeNhom>Kết quả</TieuDeNhom>

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <TheKetQua tieuDe="Loại thuốc" giaTri={tenLoaiThuoc} />
              <TheKetQua
                tieuDe="Số ngày đủ thuốc"
                giaTri={`${ketQuaTinh.soNgayDuThuoc} ngày`}
              />
              <TheKetQua
                tieuDe="Ngày dùng liều cuối"
                giaTri={ngayDungLieuCuoi || "—"}
              />
              <TheKetQua
                tieuDe="Ngày hết thuốc"
                giaTri={ngayHetThuoc || "—"}
              />
              <TheKetQua
                tieuDe="Ngày nên tái cấp"
                giaTri={ngayNenTaiCap || "—"}
                ghiChu={`Nhắc trước ${nhacTaiCapTruocMayNgay} ngày`}
              />
              <TheKetQua
                tieuDe="Mức sử dụng mỗi ngày"
                giaTri={`${ketQuaTinh.mucDungMoiNgay || 0}`}
              />
            </div>

            <div
              style={{
                marginTop: 12,
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ fontWeight: 900 }}>Diễn giải</div>

              <div style={{ marginTop: 6, color: "var(--muted)" }}>
                {ketQuaTinh.dienGiai || "Chưa có dữ liệu để tính."}
              </div>

              {(loaiThuoc === "vien" || loaiThuoc === "thuoc-nuoc") &&
              dungKhiCan ? (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                  Với thuốc dùng khi cần, công cụ tính theo mức dùng tối đa mỗi
                  ngày để tránh ước tính quá dài số ngày còn thuốc.
                </div>
              ) : null}

              {loaiThuoc === "insulin" ? (
                <div style={{ marginTop: 8, color: "var(--muted)" }}>
                  <div>
                    Tổng liều điều trị mỗi ngày:{" "}
                    <b>{tongLieuDieuTriInsulinMoiNgay}</b> units
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Hao hụt do priming mỗi ngày:{" "}
                    <b>{haoHutPrimingInsulinMoiNgay}</b> units
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    Số ngày đủ thuốc sẽ bị giới hạn bởi số ngày dùng được sau mở
                    nắp nếu giá trị này ngắn hơn số ngày tính theo tổng lượng
                    insulin.
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
              Lưu ý: Công cụ này hỗ trợ ước tính nhanh. Luôn đối chiếu hướng dẫn
              sử dụng thực tế, hao hụt trong quá trình dùng, chỉ định dùng khi
              cần và quy định tái cấp thuốc tại cơ sở.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}