interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UsePreviousLabResultDialog({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lấy kết quả từ lần trước</h3>
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">
            Đóng
          </button>
        </div>

        <div className="rounded-xl border p-4 text-sm text-slate-500">
          TODO: hiển thị lịch sử cùng bệnh nhân và cho phép chọn kết quả để copy vào assessment hiện tại.
        </div>
      </div>
    </div>
  );
}
