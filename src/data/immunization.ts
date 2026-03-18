// src/data/immunization.ts

export type VaccineCategory =
  | "Sơ sinh"
  | "Trẻ em"
  | "Thanh thiếu niên"
  | "Người lớn"
  | "Thai kỳ"
  | "Người cao tuổi"
  | "Nguy cơ cao"
  | "Du lịch";

export type TargetGroup =
  | "Sơ sinh"
  | "Nhũ nhi"
  | "Trẻ 1-5 tuổi"
  | "Trẻ 6-18 tuổi"
  | "Người lớn"
  | "Phụ nữ mang thai"
  | "Người cao tuổi"
  | "Nhân viên y tế"
  | "Bệnh nền"
  | "Suy giảm miễn dịch"
  | "Chuẩn bị du lịch";

export type IndicationTag =
  | "Tiêm chủng thường quy"
  | "Tiêm bắt kịp"
  | "Nhắc lại"
  | "Thai kỳ"
  | "Nguy cơ cao"
  | "Dự phòng sau phơi nhiễm"
  | "Du lịch";

export type ContraTag =
  | "Phản vệ với liều trước/thành phần"
  | "Suy giảm miễn dịch nặng"
  | "Đang sốt/bệnh cấp tính mức độ vừa-nặng"
  | "Có thai (một số vaccine sống)"
  | "Tuổi ngoài chỉ định"
  | "Tiền sử lồng ruột"
  | "Không rõ tình trạng miễn dịch";

export type VaccineAccess = "Tiêm chủng mở rộng" | "Dịch vụ";

export type VaccineKind =
  | "Sống giảm độc lực"
  | "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp"
  | "Khác";

export type VaccineScheduleItem = {
  label: string;
  when: string;
  note?: string;
};

export type VaccineProtocolSection = {
  kind: "routine" | "catchup" | "booster" | "special";
  title: string;
  summary?: string;
  items?: string[];
  note?: string;
};

export type VaccineReference = {
  title: string;
  year?: number;
  note?: string;
};

export type VaccineEntry = {
  id: string;
  name: string;
  shortName?: string;
  category: VaccineCategory;
  vaccineType: string;
  kind: VaccineKind;
  access: VaccineAccess;
  targetGroups: TargetGroup[];
  indications: IndicationTag[];
  contraindications: ContraTag[];
  indicationNotes?: string[];
  cautionNotes?: string[];
  keywords?: string[];
  scheduleSummary?: string[];
  schedule?: VaccineScheduleItem[];
  protocols?: VaccineProtocolSection[];
  references?: VaccineReference[];
};

export const vaccines: VaccineEntry[] = [
  {
    id: "bcg",
    name: "Vắc xin phòng lao",
    shortName: "BCG",
    category: "Sơ sinh",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Sơ sinh", "Nhũ nhi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["bcg", "lao", "tb"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng, tiêm 1 lần cho trẻ trong vòng 1 tháng sau sinh.",
    ],
    cautionNotes: [
      "Không dùng như vaccine nhắc lại thường quy.",
      "Thận trọng hoặc tránh ở người suy giảm miễn dịch nặng.",
    ],
    scheduleSummary: ["1 liều trong vòng 1 tháng sau sinh"],
    schedule: [{ label: "Liều 1", when: "Trong vòng 1 tháng sau sinh" }],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ cơ bản",
        items: ["Tiêm 1 liều duy nhất trong giai đoạn sau sinh sớm."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "hep-b",
    name: "Vắc xin viêm gan B",
    shortName: "HepB",
    category: "Sơ sinh",
    vaccineType: "Vắc xin bất hoạt / tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Tiêm chủng mở rộng",
    targetGroups: [
      "Sơ sinh",
      "Nhũ nhi",
      "Trẻ 1-5 tuổi",
      "Trẻ 6-18 tuổi",
      "Người lớn",
      "Nhân viên y tế",
      "Bệnh nền",
    ],
    indications: [
      "Tiêm chủng thường quy",
      "Tiêm bắt kịp",
      "Nguy cơ cao",
      "Dự phòng sau phơi nhiễm",
    ],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["hepb", "hbv", "viêm gan b"],
    indicationNotes: [
      "Liều sơ sinh trong chương trình tiêm chủng mở rộng: tiêm trong vòng 24 giờ sau sinh.",
      "Thành phần viêm gan B tiếp tục có trong vaccine phối hợp ở các mốc sau.",
    ],
    cautionNotes: [
      "Trường hợp nguy cơ cao cần đối chiếu thêm hướng dẫn chuyên môn hiện hành.",
    ],
    scheduleSummary: ["Sơ sinh trong 24 giờ", "2 - 3 - 4 tháng"],
    schedule: [
      { label: "Liều sơ sinh", when: "Trong vòng 24 giờ sau sinh" },
      { label: "Liều phối hợp 1", when: "2 tháng tuổi" },
      { label: "Liều phối hợp 2", when: "Ít nhất 1 tháng sau lần 1" },
      { label: "Liều phối hợp 3", when: "Ít nhất 1 tháng sau lần 2" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: [
          "1 liều sơ sinh trong 24 giờ đầu.",
          "Các liều tiếp theo nằm trong vaccine phối hợp theo lịch chương trình.",
        ],
      },
      {
        kind: "catchup",
        title: "Tiêm bắt kịp",
        items: [
          "Nếu bỏ lỡ lịch, hoàn tất các liều còn thiếu theo tuổi hiện tại.",
          "Không cần tiêm lại từ đầu nếu đã có liều trước đó.",
        ],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "dtap-ipv-hib-hepb",
    name: "Vắc xin phối hợp 6 trong 1",
    shortName: "DTaP-IPV-Hib-HepB",
    category: "Trẻ em",
    vaccineType: "Vắc xin phối hợp bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["6 trong 1", "hexaxim", "infanrix hexa"],
    indicationNotes: [
      "Vaccine dịch vụ thường dùng để bao phủ nhiều thành phần cùng lúc.",
    ],
    cautionNotes: ["Lịch cụ thể phụ thuộc loại vaccine và tuổi chỉ định."],
    scheduleSummary: ["2 - 3 - 4 tháng hoặc 2 - 4 - 6 tháng"],
    schedule: [
      { label: "Liều 1", when: "2 tháng tuổi" },
      { label: "Liều 2", when: "3 hoặc 4 tháng tuổi" },
      { label: "Liều 3", when: "4 hoặc 6 tháng tuổi" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: [
          "Một số lịch dùng 2 - 3 - 4 tháng.",
          "Một số lịch dùng 2 - 4 - 6 tháng.",
        ],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "dtap-ipv-hib",
    name: "Vắc xin phối hợp 5 trong 1",
    shortName: "DTaP-IPV-Hib",
    category: "Trẻ em",
    vaccineType: "Vắc xin phối hợp bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["5 trong 1", "pentaxim"],
    indicationNotes: ["Vaccine dịch vụ phối hợp, thường áp dụng cho lịch cơ bản ở trẻ nhỏ."],
    cautionNotes: ["Cần tính thêm thành phần viêm gan B nếu không nằm trong vaccine này."],
    scheduleSummary: ["2 - 3 - 4 tháng hoặc 2 - 4 - 6 tháng"],
    schedule: [
      { label: "Liều 1", when: "2 tháng tuổi" },
      { label: "Liều 2", when: "3 hoặc 4 tháng tuổi" },
      { label: "Liều 3", when: "4 hoặc 6 tháng tuổi" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["3 liều cơ bản trong nhũ nhi."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "dtap-ipv",
    name: "Vắc xin phối hợp 4 trong 1",
    shortName: "DTaP-IPV",
    category: "Trẻ em",
    vaccineType: "Vắc xin phối hợp bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 1-5 tuổi", "Trẻ 6-18 tuổi"],
    indications: ["Nhắc lại", "Tiêm bắt kịp"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["4 trong 1", "dtap ipv", "tetraxim"],
    indicationNotes: [
      "Thường dùng trong các lịch nhắc lại hoặc bắt kịp có thành phần bạch hầu, uốn ván, ho gà và bại liệt.",
    ],
    cautionNotes: ["Tuổi chỉ định phụ thuộc từng sản phẩm."],
    scheduleSummary: ["thường dùng trong mũi nhắc lại"],
    schedule: [{ label: "Lịch", when: "Theo tuổi chỉ định và tiền sử tiêm" }],
    protocols: [
      {
        kind: "booster",
        title: "Lịch tham khảo",
        items: ["Dùng trong các mũi nhắc lại khi phù hợp với lứa tuổi và sản phẩm."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "dtwp",
    name: "Vắc xin phối hợp có thành phần bạch hầu - ho gà - uốn ván",
    shortName: "DTP",
    category: "Trẻ em",
    vaccineType: "Vắc xin phối hợp bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy", "Nhắc lại"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["dtp", "bạch hầu", "ho gà", "uốn ván"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng, thành phần bạch hầu, ho gà, uốn ván được tiêm lúc trẻ đủ 2 tháng, sau đó cách ít nhất 1 tháng, và nhắc lại lúc 18 tháng.",
    ],
    cautionNotes: [
      "Đây là mục đại diện giúp tra cứu nhóm bệnh trong TCMR.",
    ],
    scheduleSummary: ["2 tháng", "sau 1 tháng", "sau 1 tháng", "nhắc 18 tháng"],
    schedule: [
      { label: "Liều 1", when: "2 tháng tuổi" },
      { label: "Liều 2", when: "Ít nhất 1 tháng sau lần 1" },
      { label: "Liều 3", when: "Ít nhất 1 tháng sau lần 2" },
      { label: "Nhắc lại", when: "18 tháng tuổi" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: [
          "Chuỗi cơ bản 3 liều trong năm đầu đời.",
          "1 liều nhắc lại lúc 18 tháng.",
        ],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "opv",
    name: "Vắc xin bại liệt uống đa giá",
    shortName: "OPV",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực đường uống",
    kind: "Sống giảm độc lực",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["opv", "bại liệt uống"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng: lần 1 khi trẻ đủ 2 tháng, lần 2 ít nhất 1 tháng sau lần 1, lần 3 ít nhất 1 tháng sau lần 2.",
    ],
    cautionNotes: [
      "Cần đối chiếu thực hành địa phương nếu có thay đổi chiến lược OPV/IPV.",
    ],
    scheduleSummary: ["2 tháng", "sau 1 tháng", "sau 1 tháng"],
    schedule: [
      { label: "Lần 1", when: "2 tháng tuổi" },
      { label: "Lần 2", when: "Ít nhất 1 tháng sau lần 1" },
      { label: "Lần 3", when: "Ít nhất 1 tháng sau lần 2" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: ["3 liều uống trong năm đầu đời theo lịch chương trình."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "ipv",
    name: "Vắc xin bại liệt tiêm đa giá",
    shortName: "IPV",
    category: "Trẻ em",
    vaccineType: "Vắc xin bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["ipv", "bại liệt tiêm", "polio"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng: mũi 1 khi trẻ đủ 5 tháng, mũi 2 khi trẻ đủ 9 tháng.",
    ],
    cautionNotes: [],
    scheduleSummary: ["5 tháng", "9 tháng"],
    schedule: [
      { label: "Mũi 1", when: "5 tháng tuổi" },
      { label: "Mũi 2", when: "9 tháng tuổi" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: ["2 mũi IPV trong năm đầu đời theo lịch hiện hành."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "rota",
    name: "Vắc xin Rotavirus",
    shortName: "Rota",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực đường uống",
    kind: "Sống giảm độc lực",
    access: "Dịch vụ",
    targetGroups: ["Nhũ nhi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Tiền sử lồng ruột",
      "Suy giảm miễn dịch nặng",
      "Tuổi ngoài chỉ định",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["rota", "rotavirus", "tiêu chảy", "uống"],
    indicationNotes: ["Khởi đầu sớm theo cửa sổ tuổi được phép của từng sản phẩm."],
    cautionNotes: ["Bắt buộc kiểm tra tuổi tối đa để bắt đầu và hoàn tất lịch."],
    scheduleSummary: ["2 hoặc 3 liều", "khởi đầu sớm", "có giới hạn tuổi"],
    schedule: [
      { label: "Liều 1", when: "Từ 6 tuần tuổi" },
      { label: "Các liều tiếp", when: "Cách nhau tối thiểu 4 tuần" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ cơ bản",
        items: [
          "Tùy sản phẩm: 2 liều hoặc 3 liều.",
          "Bắt đầu từ khoảng 6 tuần tuổi.",
        ],
      },
      {
        kind: "special",
        title: "Lưu ý đặc biệt",
        items: [
          "Không dùng nếu đã vượt quá tuổi chỉ định bắt đầu/hoàn tất.",
          "Chống chỉ định khi có tiền sử lồng ruột.",
        ],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "measles",
    name: "Vắc xin sởi đơn giá",
    shortName: "Sởi",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Có thai (một số vaccine sống)",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
      "Phản vệ với liều trước/thành phần",
    ],
    keywords: ["sởi", "measles"],
    indicationNotes: ["Trong chương trình tiêm chủng mở rộng: tiêm khi trẻ đủ 9 tháng tuổi."],
    cautionNotes: ["Nếu bỏ lỡ lịch, cần đối chiếu lịch bắt kịp theo hướng dẫn hiện hành."],
    scheduleSummary: ["1 liều lúc 9 tháng"],
    schedule: [{ label: "Liều 1", when: "9 tháng tuổi" }],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: ["1 liều sởi đơn giá ở 9 tháng tuổi."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "mr",
    name: "Vắc xin phối hợp có chứa thành phần sởi / rubella",
    shortName: "MR",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Trẻ 1-5 tuổi", "Trẻ 6-18 tuổi"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Có thai (một số vaccine sống)",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
      "Phản vệ với liều trước/thành phần",
    ],
    keywords: ["mr", "sởi rubella", "rubella"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng, vaccine phối hợp có chứa thành phần sởi và rubella được tiêm khi trẻ đủ 18 tháng tuổi.",
    ],
    cautionNotes: [],
    scheduleSummary: ["18 tháng"],
    schedule: [{ label: "Liều phối hợp", when: "18 tháng tuổi" }],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: ["Tiêm vaccine phối hợp có chứa thành phần sởi/rubella lúc 18 tháng."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "mmr",
    name: "Vắc xin sởi - quai bị - rubella",
    shortName: "MMR",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Dịch vụ",
    targetGroups: [
      "Trẻ 1-5 tuổi",
      "Trẻ 6-18 tuổi",
      "Người lớn",
      "Nhân viên y tế",
      "Chuẩn bị du lịch",
    ],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp", "Du lịch"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Có thai (một số vaccine sống)",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
      "Phản vệ với liều trước/thành phần",
    ],
    keywords: ["mmr", "sởi", "quai bị", "rubella"],
    indicationNotes: [
      "Đây là vaccine dịch vụ thường dùng trong thực hành ngoài chương trình mở rộng.",
    ],
    cautionNotes: ["Tránh dùng trong thai kỳ."],
    scheduleSummary: ["2 liều"],
    schedule: [
      { label: "Liều 1", when: "Theo tuổi chỉ định" },
      { label: "Liều 2", when: "Nhắc lại theo lịch sản phẩm" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Thường dùng 2 liều."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "mmrv",
    name: "Vắc xin sởi - quai bị - rubella - thủy đậu",
    shortName: "MMRV",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 1-5 tuổi", "Trẻ 6-18 tuổi"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Có thai (một số vaccine sống)",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
      "Phản vệ với liều trước/thành phần",
    ],
    keywords: ["mmrv", "sởi quai bị rubella thủy đậu"],
    indicationNotes: [
      "Vaccine phối hợp dịch vụ bao phủ đồng thời MMR và thủy đậu.",
    ],
    cautionNotes: ["Cần cân nhắc theo độ tuổi và sản phẩm cho phép."],
    scheduleSummary: ["2 liều"],
    schedule: [
      { label: "Liều 1", when: "Theo tuổi chỉ định" },
      { label: "Liều 2", when: "Nhắc lại theo lịch" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Có thể dùng theo lịch 2 liều nếu phù hợp sản phẩm."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "hib",
    name: "Vắc xin Haemophilus influenzae týp b",
    shortName: "Hib",
    category: "Trẻ em",
    vaccineType: "Vắc xin liên hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["hib", "haemophilus influenzae týp b"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng: lần 1 khi trẻ đủ 2 tháng, lần 2 ít nhất 1 tháng sau lần 1, lần 3 ít nhất 1 tháng sau lần 2.",
    ],
    cautionNotes: [],
    scheduleSummary: ["2 tháng", "sau 1 tháng", "sau 1 tháng"],
    schedule: [
      { label: "Lần 1", when: "2 tháng tuổi" },
      { label: "Lần 2", when: "Ít nhất 1 tháng sau lần 1" },
      { label: "Lần 3", when: "Ít nhất 1 tháng sau lần 2" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: ["3 liều cơ bản trong năm đầu đời."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "pcv",
    name: "Vắc xin phế cầu liên hợp",
    shortName: "PCV",
    category: "Trẻ em",
    vaccineType: "Vắc xin liên hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Nhũ nhi", "Trẻ 1-5 tuổi", "Người cao tuổi", "Bệnh nền"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["pcv", "phế cầu", "pneumococcal"],
    indicationNotes: ["Lịch phụ thuộc tuổi khởi đầu và loại vaccine phế cầu."],
    cautionNotes: [
      "Cần phân biệt vaccine liên hợp và vaccine polysaccharide ở người lớn/nguy cơ cao.",
    ],
    scheduleSummary: ["2+1 hoặc 3+1", "catch-up theo tuổi"],
    schedule: [
      { label: "Ví dụ lịch 2+1", when: "2 - 4 - 12 tháng" },
      { label: "Ví dụ lịch 3+1", when: "2 - 4 - 6 - 12/15 tháng" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ cơ bản",
        items: ["Có thể theo lịch 2+1 hoặc 3+1 tùy sản phẩm/chương trình."],
      },
      {
        kind: "catchup",
        title: "Bắt kịp",
        items: ["Số liều phụ thuộc tuổi bắt đầu."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "ppsv23",
    name: "Vắc xin phế cầu polysaccharide 23 týp",
    shortName: "PPSV23",
    category: "Người lớn",
    vaccineType: "Vắc xin polysaccharide",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Người lớn", "Người cao tuổi", "Bệnh nền"],
    indications: ["Nguy cơ cao", "Nhắc lại"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["ppsv23", "phế cầu 23"],
    indicationNotes: [
      "Chủ yếu dùng ở người lớn tuổi và nhóm nguy cơ cao theo chiến lược phế cầu người lớn.",
    ],
    cautionNotes: ["Cần xét cùng PCV nếu xây dựng lịch phế cầu hoàn chỉnh."],
    scheduleSummary: ["theo tuổi / nguy cơ"],
    schedule: [{ label: "Lịch", when: "Theo chỉ định người lớn / nguy cơ cao" }],
    protocols: [
      {
        kind: "special",
        title: "Người lớn / nguy cơ cao",
        items: [
          "Khoảng cách và chỉ định phụ thuộc tiền sử PCV, tuổi và bệnh nền.",
        ],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "japanese-encephalitis",
    name: "Vắc xin viêm não Nhật Bản B",
    shortName: "JE",
    category: "Trẻ em",
    vaccineType: "Vắc xin bất hoạt hoặc sống giảm độc lực tùy sản phẩm",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Trẻ 1-5 tuổi"],
    indications: ["Tiêm chủng thường quy"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["je", "viêm não nhật bản", "japanese encephalitis"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng: lần 1 khi trẻ đủ 1 tuổi, lần 2 sau 1 - 2 tuần, lần 3 sau 1 năm kể từ lần 2.",
    ],
    cautionNotes: ["Cần lưu ý đúng loại vaccine đang sử dụng tại cơ sở."],
    scheduleSummary: ["1 tuổi", "1 - 2 tuần sau", "1 năm sau"],
    schedule: [
      { label: "Lần 1", when: "1 tuổi" },
      { label: "Lần 2", when: "1 - 2 tuần sau lần 1" },
      { label: "Lần 3", when: "1 năm sau lần 2" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ trong TCMR",
        items: ["3 liều cơ bản theo lịch 1 tuổi, 1 - 2 tuần, 1 năm."],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "tt",
    name: "Vắc xin uốn ván",
    shortName: "TT",
    category: "Thai kỳ",
    vaccineType: "Vắc xin giải độc tố",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Tiêm chủng mở rộng",
    targetGroups: ["Phụ nữ mang thai", "Người lớn"],
    indications: ["Thai kỳ", "Tiêm bắt kịp", "Dự phòng sau phơi nhiễm"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["tt", "uốn ván", "thai kỳ"],
    indicationNotes: [
      "Trong chương trình tiêm chủng mở rộng có vaccine uốn ván đơn giá cho phụ nữ có thai.",
      "Lịch tiêm phụ thuộc tiền sử đã tiêm trước đó.",
    ],
    cautionNotes: [
      "Đây là nhóm dữ liệu dài; popup chi tiết sẽ phù hợp hơn card ngoài.",
    ],
    scheduleSummary: ["Thai kỳ theo tiền sử tiêm uốn ván"],
    schedule: [
      { label: "Chưa tiêm / không rõ tiền sử", when: "Lịch 5 mũi theo thai kỳ" },
      { label: "Đã đủ 3 mũi cơ bản", when: "Lịch 3 mũi theo thai kỳ" },
      { label: "Đã đủ 3 mũi + 1 nhắc", when: "Lịch 2 mũi theo thai kỳ" },
    ],
    protocols: [
      {
        kind: "special",
        title: "Thai kỳ chưa tiêm hoặc không rõ tiền sử",
        items: [
          "Lần 1: tiêm sớm khi có thai lần đầu.",
          "Lần 2: ít nhất 1 tháng sau lần 1.",
          "Lần 3: ít nhất 6 tháng sau lần 2 hoặc kỳ có thai lần sau.",
          "Lần 4: ít nhất 1 năm sau lần 3 hoặc kỳ có thai lần sau.",
          "Lần 5: ít nhất 1 năm sau lần 4 hoặc kỳ có thai lần sau.",
        ],
      },
      {
        kind: "special",
        title: "Đã tiêm đủ 3 mũi cơ bản",
        items: [
          "Lần 1: tiêm sớm khi có thai lần đầu.",
          "Lần 2: ít nhất 1 tháng sau lần 1.",
          "Lần 3: ít nhất 1 năm sau lần 2.",
        ],
      },
      {
        kind: "special",
        title: "Đã đủ 3 mũi cơ bản và 1 liều nhắc lại",
        items: [
          "Lần 1: tiêm sớm khi có thai lần đầu.",
          "Lần 2: ít nhất 1 năm sau lần 1.",
        ],
      },
    ],
    references: [{ title: "Chương trình tiêm chủng mở rộng Việt Nam" }],
  },

  {
    id: "influenza",
    name: "Vắc xin cúm mùa",
    shortName: "Influenza",
    category: "Người lớn",
    vaccineType: "Vắc xin bất hoạt hoặc sống giảm độc lực tùy sản phẩm",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: [
      "Nhũ nhi",
      "Trẻ 1-5 tuổi",
      "Trẻ 6-18 tuổi",
      "Người lớn",
      "Phụ nữ mang thai",
      "Người cao tuổi",
      "Nhân viên y tế",
      "Bệnh nền",
    ],
    indications: ["Tiêm chủng thường quy", "Nhắc lại", "Thai kỳ", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
      "Có thai (một số vaccine sống)",
    ],
    keywords: ["influenza", "cúm", "flu"],
    indicationNotes: ["Khuyến cáo tiêm hằng năm, đặc biệt ở nhóm nguy cơ cao."],
    cautionNotes: ["Trẻ nhỏ lần đầu tiêm có thể cần 2 liều trong cùng mùa."],
    scheduleSummary: ["1 liều mỗi năm"],
    schedule: [{ label: "Liều thường quy", when: "Mỗi năm / mỗi mùa cúm" }],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Tiêm nhắc hằng năm."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "hpv",
    name: "Vắc xin HPV",
    shortName: "HPV",
    category: "Thanh thiếu niên",
    vaccineType: "Vắc xin tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 6-18 tuổi", "Người lớn"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["hpv", "ung thư cổ tử cung", "papilloma"],
    indicationNotes: ["Hiệu quả tối ưu khi tiêm trước phơi nhiễm HPV."],
    cautionNotes: ["Số liều phụ thuộc tuổi bắt đầu."],
    scheduleSummary: ["2 liều hoặc 3 liều tùy tuổi bắt đầu"],
    schedule: [
      { label: "Lịch 2 liều", when: "0 và 6 - 12 tháng" },
      { label: "Lịch 3 liều", when: "0 - 1/2 - 6 tháng" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: [
          "Bắt đầu sớm hơn: thường 2 liều.",
          "Bắt đầu muộn hơn: thường 3 liều.",
        ],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "varicella",
    name: "Vắc xin thủy đậu",
    shortName: "Varicella",
    category: "Trẻ em",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 1-5 tuổi", "Trẻ 6-18 tuổi", "Người lớn", "Nhân viên y tế"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp", "Nguy cơ cao"],
    contraindications: [
      "Suy giảm miễn dịch nặng",
      "Có thai (một số vaccine sống)",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
      "Phản vệ với liều trước/thành phần",
    ],
    keywords: ["varicella", "thủy đậu"],
    indicationNotes: ["Người chưa mắc bệnh/chưa có miễn dịch nên được cân nhắc tiêm đủ liều."],
    cautionNotes: ["Không dùng trong thai kỳ."],
    scheduleSummary: ["2 liều"],
    schedule: [
      { label: "Liều 1", when: "Từ 12 tháng tuổi" },
      { label: "Liều 2", when: "Theo lịch nhắc lại" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Thông thường 2 liều."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "hepa",
    name: "Vắc xin viêm gan A",
    shortName: "HepA",
    category: "Trẻ em",
    vaccineType: "Vắc xin bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 1-5 tuổi", "Trẻ 6-18 tuổi", "Người lớn", "Chuẩn bị du lịch", "Bệnh nền"],
    indications: ["Tiêm chủng thường quy", "Tiêm bắt kịp", "Du lịch", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["hepa", "viêm gan a", "hav"],
    indicationNotes: ["Cân nhắc cho trẻ em, người du lịch hoặc người có nguy cơ."],
    cautionNotes: [],
    scheduleSummary: ["2 liều"],
    schedule: [
      { label: "Liều 1", when: "Theo tuổi chỉ định" },
      { label: "Liều 2", when: "Theo khoảng cách sản phẩm" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Thường 2 liều."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "hepa-hepb-combo",
    name: "Vắc xin phối hợp viêm gan A + B",
    shortName: "HepA + HepB",
    category: "Người lớn",
    vaccineType: "Vắc xin bất hoạt / tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Người lớn", "Chuẩn bị du lịch", "Bệnh nền", "Nhân viên y tế"],
    indications: ["Tiêm chủng thường quy", "Du lịch", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["hepa hepb", "viêm gan a b phối hợp"],
    indicationNotes: ["Hữu ích khi cần bảo vệ cả HAV và HBV."],
    cautionNotes: ["Lịch tùy sản phẩm, thường 3 liều; có thể có lịch tăng tốc."],
    scheduleSummary: ["thường 3 liều", "có thể có lịch tăng tốc"],
    schedule: [{ label: "Lịch", when: "Theo sản phẩm phối hợp" }],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ cơ bản",
        items: ["Thường 3 liều theo sản phẩm."],
      },
      {
        kind: "special",
        title: "Du lịch / cần bảo vệ nhanh",
        items: ["Một số sản phẩm có lịch tăng tốc và cần liều hoàn tất sau đó."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "tdap-td",
    name: "Vắc xin bạch hầu - uốn ván - ho gà giảm liều / uốn ván - bạch hầu",
    shortName: "Tdap / Td",
    category: "Người lớn",
    vaccineType: "Vắc xin giải độc tố / bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 6-18 tuổi", "Người lớn", "Phụ nữ mang thai"],
    indications: ["Nhắc lại", "Thai kỳ", "Tiêm bắt kịp"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["tdap", "td", "uốn ván", "ho gà", "bạch hầu"],
    indicationNotes: ["Thường dùng trong tiêm nhắc người lớn và một số tình huống đặc biệt."],
    cautionNotes: ["Cần tính theo tiền sử tiêm trước đó."],
    scheduleSummary: ["1 liều Tdap, sau đó nhắc định kỳ"],
    schedule: [
      { label: "Tdap", when: "1 liều" },
      { label: "Nhắc lại", when: "Theo lịch định kỳ" },
    ],
    protocols: [
      {
        kind: "booster",
        title: "Nhắc lại",
        items: ["Dùng trong lịch nhắc người lớn theo chỉ định."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "rabies",
    name: "Vắc xin dại",
    shortName: "Rabies",
    category: "Nguy cơ cao",
    vaccineType: "Vắc xin bất hoạt",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Người lớn", "Trẻ 6-18 tuổi", "Trẻ 1-5 tuổi", "Chuẩn bị du lịch", "Nhân viên y tế"],
    indications: ["Dự phòng sau phơi nhiễm", "Nguy cơ cao", "Du lịch"],
    contraindications: ["Phản vệ với liều trước/thành phần"],
    keywords: ["rabies", "dại"],
    indicationNotes: ["Sau phơi nhiễm là chỉ định cấp cứu, không trì hoãn."],
    cautionNotes: ["Có thể cần phối hợp miễn dịch thụ động theo phân loại phơi nhiễm."],
    scheduleSummary: ["PEP / PrEP theo tình huống"],
    schedule: [
      { label: "Sau phơi nhiễm", when: "Bắt đầu ngay" },
      { label: "Trước phơi nhiễm", when: "Theo nhóm nguy cơ" },
    ],
    protocols: [
      {
        kind: "special",
        title: "Dự phòng sau phơi nhiễm",
        items: ["Rửa vết thương ngay.", "Bắt đầu vaccine càng sớm càng tốt."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "covid19",
    name: "Vắc xin COVID-19",
    shortName: "COVID-19",
    category: "Người lớn",
    vaccineType: "Vắc xin mRNA / protein / vector tùy sản phẩm",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: [
      "Người lớn",
      "Người cao tuổi",
      "Bệnh nền",
      "Nhân viên y tế",
      "Phụ nữ mang thai",
      "Trẻ 6-18 tuổi",
    ],
    indications: ["Tiêm chủng thường quy", "Nhắc lại", "Nguy cơ cao", "Thai kỳ"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["covid", "covid-19", "sars-cov-2"],
    indicationNotes: ["Lịch thay đổi theo khuyến cáo cập nhật."],
    cautionNotes: ["Không nên hard-code chi tiết nếu app không có cơ chế cập nhật thường xuyên."],
    scheduleSummary: ["theo khuyến cáo cập nhật"],
    schedule: [{ label: "Lịch", when: "Theo hướng dẫn hiện hành" }],
    protocols: [
      {
        kind: "special",
        title: "Khuyến cáo cập nhật",
        items: ["Cần cập nhật định kỳ theo cơ quan y tế."],
      },
    ],
    references: [{ title: "Khuyến cáo cập nhật của cơ quan y tế" }],
  },

  {
    id: "zoster",
    name: "Vắc xin zona",
    shortName: "Zoster",
    category: "Người cao tuổi",
    vaccineType: "Vắc xin tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Người cao tuổi", "Người lớn", "Bệnh nền"],
    indications: ["Tiêm chủng thường quy", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["zona", "zoster"],
    indicationNotes: ["Áp dụng chủ yếu cho người lớn tuổi và nhóm nguy cơ cao."],
    cautionNotes: [],
    scheduleSummary: ["2 liều"],
    schedule: [
      { label: "Liều 1", when: "Theo tuổi / nguy cơ" },
      { label: "Liều 2", when: "Theo khoảng cách sản phẩm" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Thường 2 liều."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "rsv-older-adult",
    name: "Vắc xin RSV cho người lớn tuổi",
    shortName: "RSV",
    category: "Người cao tuổi",
    vaccineType: "Vắc xin protein / tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Người cao tuổi", "Người lớn", "Bệnh nền"],
    indications: ["Tiêm chủng thường quy", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["rsv", "virus hợp bào hô hấp"],
    indicationNotes: [
      "Áp dụng theo tuổi và nguy cơ; khuyến cáo có thể thay đổi theo hướng dẫn cập nhật.",
    ],
    cautionNotes: ["Nên cập nhật theo sản phẩm và khuyến cáo hiện hành."],
    scheduleSummary: ["thường 1 liều theo khuyến cáo hiện hành"],
    schedule: [{ label: "Lịch", when: "Theo khuyến cáo cập nhật" }],
    protocols: [
      {
        kind: "special",
        title: "Người lớn tuổi / nguy cơ cao",
        items: ["Tiêm theo khuyến cáo hiện hành của cơ quan chuyên môn và sản phẩm sử dụng."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "rsv-maternal",
    name: "Vắc xin RSV trong thai kỳ",
    shortName: "Maternal RSV",
    category: "Thai kỳ",
    vaccineType: "Vắc xin protein tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Phụ nữ mang thai"],
    indications: ["Thai kỳ"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["rsv thai kỳ", "maternal rsv"],
    indicationNotes: ["Phụ thuộc thời điểm thai kỳ và khuyến cáo hiện hành."],
    cautionNotes: ["Cần cập nhật theo hướng dẫn sản phẩm và quốc gia."],
    scheduleSummary: ["theo khuyến cáo thai kỳ hiện hành"],
    schedule: [{ label: "Lịch", when: "Theo giai đoạn thai kỳ được khuyến cáo" }],
    protocols: [
      {
        kind: "special",
        title: "Thai kỳ",
        items: ["Chỉ dùng trong khung thai kỳ được phê duyệt hoặc khuyến cáo."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "meningococcal-acwy",
    name: "Vắc xin não mô cầu ACWY",
    shortName: "MenACWY",
    category: "Thanh thiếu niên",
    vaccineType: "Vắc xin liên hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 6-18 tuổi", "Người lớn", "Chuẩn bị du lịch", "Bệnh nền"],
    indications: ["Tiêm chủng thường quy", "Nhắc lại", "Nguy cơ cao", "Du lịch"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["menacwy", "não mô cầu", "acwy"],
    indicationNotes: ["Áp dụng cho thanh thiếu niên hoặc nhóm nguy cơ cao tùy chỉ định."],
    cautionNotes: [],
    scheduleSummary: ["1 liều, có thể nhắc lại nếu nguy cơ cao"],
    schedule: [
      { label: "Liều cơ bản", when: "Theo nhóm tuổi / nguy cơ" },
      { label: "Nhắc lại", when: "Nếu thuộc nhóm nguy cơ cao" },
    ],
    protocols: [
      {
        kind: "routine",
        title: "Phác đồ tham khảo",
        items: ["Tùy nhóm nguy cơ và độ tuổi."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "meningococcal-b",
    name: "Vắc xin não mô cầu nhóm B",
    shortName: "MenB",
    category: "Thanh thiếu niên",
    vaccineType: "Vắc xin tái tổ hợp",
    kind: "Bất hoạt / giải độc tố / tái tổ hợp / liên hợp",
    access: "Dịch vụ",
    targetGroups: ["Trẻ 6-18 tuổi", "Người lớn", "Bệnh nền"],
    indications: ["Nguy cơ cao", "Tiêm chủng thường quy"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["menb", "não mô cầu b"],
    indicationNotes: ["Chỉ định phụ thuộc tuổi, yếu tố nguy cơ và loại vaccine."],
    cautionNotes: ["Lịch 2 hoặc 3 liều tùy sản phẩm và nguy cơ."],
    scheduleSummary: ["2 hoặc 3 liều tùy sản phẩm"],
    schedule: [{ label: "Lịch", when: "Theo sản phẩm và nhóm nguy cơ" }],
    protocols: [
      {
        kind: "special",
        title: "Nguy cơ cao / thanh thiếu niên",
        items: [
          "Lịch có thể gồm 2 hoặc 3 liều tùy vaccine.",
          "Xem kỹ loại MenB được dùng để tính khoảng cách.",
        ],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "typhoid",
    name: "Vắc xin thương hàn",
    shortName: "Typhoid",
    category: "Du lịch",
    vaccineType: "Vắc xin polysaccharide hoặc sống uống tùy sản phẩm",
    kind: "Khác",
    access: "Dịch vụ",
    targetGroups: ["Người lớn", "Trẻ 6-18 tuổi", "Chuẩn bị du lịch"],
    indications: ["Du lịch", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Có thai (một số vaccine sống)",
      "Suy giảm miễn dịch nặng",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["typhoid", "thương hàn"],
    indicationNotes: ["Chủ yếu cho du lịch hoặc nguy cơ phơi nhiễm."],
    cautionNotes: ["Lịch phụ thuộc dạng vaccine tiêm hay uống."],
    scheduleSummary: ["theo sản phẩm", "có thể cần nhắc lại"],
    schedule: [{ label: "Lịch", when: "Theo loại vaccine thương hàn sử dụng" }],
    protocols: [
      {
        kind: "special",
        title: "Du lịch / nguy cơ nghề nghiệp",
        items: ["Tiêm trước khi phơi nhiễm đủ thời gian tạo miễn dịch."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "cholera",
    name: "Vắc xin tả",
    shortName: "Cholera",
    category: "Du lịch",
    vaccineType: "Vắc xin uống hoặc bất hoạt tùy sản phẩm",
    kind: "Khác",
    access: "Dịch vụ",
    targetGroups: ["Người lớn", "Trẻ 6-18 tuổi", "Chuẩn bị du lịch"],
    indications: ["Du lịch", "Nguy cơ cao"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["cholera", "tả"],
    indicationNotes: ["Dùng trong một số tình huống du lịch hoặc nguy cơ dịch tễ."],
    cautionNotes: ["Lịch khác nhau giữa các loại vaccine."],
    scheduleSummary: ["theo sản phẩm và nguy cơ"],
    schedule: [{ label: "Lịch", when: "Theo vaccine và nguy cơ dịch tễ" }],
    protocols: [
      {
        kind: "special",
        title: "Du lịch / vùng dịch",
        items: ["Cân nhắc khi đến vùng dịch hoặc nơi nguy cơ cao."],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },

  {
    id: "yellow-fever",
    name: "Vắc xin sốt vàng",
    shortName: "Yellow fever",
    category: "Du lịch",
    vaccineType: "Vắc xin sống giảm độc lực",
    kind: "Sống giảm độc lực",
    access: "Dịch vụ",
    targetGroups: ["Người lớn", "Trẻ 6-18 tuổi", "Chuẩn bị du lịch"],
    indications: ["Du lịch"],
    contraindications: [
      "Phản vệ với liều trước/thành phần",
      "Suy giảm miễn dịch nặng",
      "Có thai (một số vaccine sống)",
      "Đang sốt/bệnh cấp tính mức độ vừa-nặng",
    ],
    keywords: ["yellow fever", "sốt vàng"],
    indicationNotes: ["Chủ yếu cho du lịch đến quốc gia hoặc vùng có yêu cầu hoặc nguy cơ."],
    cautionNotes: ["Có thể liên quan yêu cầu giấy chứng nhận quốc tế."],
    scheduleSummary: ["1 liều trước du lịch nếu có chỉ định"],
    schedule: [{ label: "Liều", when: "Trước chuyến đi theo thời gian yêu cầu" }],
    protocols: [
      {
        kind: "special",
        title: "Du lịch quốc tế",
        items: [
          "Chỉ định phụ thuộc nước đến và nguy cơ dịch tễ.",
          "Kiểm tra yêu cầu chứng nhận tiêm chủng quốc tế nếu cần.",
        ],
      },
    ],
    references: [{ title: "Khung thực hành lâm sàng thường dùng" }],
  },
];