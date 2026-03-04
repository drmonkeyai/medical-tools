// src/data/bytProcedures.ts
export type BYTProcedureDoc = {
  id: string;              // "001" hoặc slug
  title: string;           // tên quy trình
  specialty?: string;      // chuyên khoa
  year?: number;           // năm
  issuer?: string;         // ví dụ "Bộ Y tế"
  driveUrl: string;        // link Google Drive (view)
  downloadUrl?: string;    // link tải trực tiếp (nếu có)
  tags?: string[];
};

export const BYT_PROCEDURES: BYTProcedureDoc[] = [
  // Bạn dán danh sách thật vào đây (từ file Word/list link bạn đã có)
  {
    id: "001",
    title: "Quy trình kỹ thuật ...",
    specialty: "Tim mạch",
    year: 2024,
    issuer: "Bộ Y tế",
    driveUrl: "https://drive.google.com/file/d/XXXX/view",
    downloadUrl: "https://drive.google.com/uc?export=download&id=XXXX",
    tags: ["quy trình", "kỹ thuật"],
  },
];