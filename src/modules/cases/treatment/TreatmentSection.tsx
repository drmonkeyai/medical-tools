import type { TreatmentItemView, TreatmentSectionData } from "./types";

type TreatmentSectionProps = {
  data: TreatmentSectionData | null | undefined;
};

function getStatusLabel(status: TreatmentItemView["status"]) {
  switch (status) {
    case "planned":
      return "Dự kiến";
    case "ongoing":
      return "Đang thực hiện";
    case "completed":
      return "Hoàn tất";
    case "stopped":
      return "Ngừng";
    default:
      return status;
  }
}

function TreatmentGroup({
  title,
  items,
}: {
  title: string;
  items: TreatmentItemView[];
}) {
  if (!items.length) return null;

  return (
    <section className="border-t border-slate-200 pt-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="border-b border-slate-100 pb-3 last:border-b-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900">
                  {index + 1}. {item.name}
                </div>

                {item.description ? (
                  <div className="mt-1 text-sm text-slate-700">{item.description}</div>
                ) : null}

                {item.doseOrFrequency ? (
                  <div className="mt-1 text-sm text-slate-700">
                    Liều / tần suất: {item.doseOrFrequency}
                  </div>
                ) : null}

                {item.duration ? (
                  <div className="mt-1 text-sm text-slate-700">
                    Thời gian: {item.duration}
                  </div>
                ) : null}

                {item.instructions ? (
                  <div className="mt-1 text-sm text-slate-700">
                    Hướng dẫn: {item.instructions}
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 text-xs text-slate-500">
                {getStatusLabel(item.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TreatmentSection({ data }: TreatmentSectionProps) {
  if (!data || !data.hasData) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-semibold text-slate-900">Treatment</h2>
        <p className="mt-2 text-sm text-slate-500">
          Chưa có dữ liệu điều trị cho lần đánh giá này.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-semibold text-slate-900">Treatment</h2>
      <p className="mt-2 text-sm text-slate-500">
        Điều trị của lần khám hiện tại
      </p>

      <div className="mt-4 space-y-4">
        <TreatmentGroup title="Thuốc" items={data.medications} />
        <TreatmentGroup title="Bài tập" items={data.exercises} />
        <TreatmentGroup title="Thủ thuật" items={data.procedures} />
        <TreatmentGroup title="Giáo dục sức khỏe" items={data.educations} />
        <TreatmentGroup title="Lối sống" items={data.lifestyles} />
        <TreatmentGroup title="Chuyển tuyến / Giới thiệu" items={data.referrals} />
      </div>
    </section>
  );
}