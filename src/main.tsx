// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import ToolPlaceholder from "./pages/ToolPlaceholder";
import DoseAdjust from "./pages/DoseAdjust";
import DrugInteractions from "./pages/DrugInteractions";
import ICD10 from "./pages/ICD10";
import Contact from "./pages/Contact";

import Immunization from "./pages/Immunization";

import CaseDetail from "./pages/CaseDetail";
import CaseSummary from "./pages/CaseSummary";

import SymptomsIndex from "./pages/symptoms/index";

import Sot from "./pages/symptoms/sot";
import MetMoi from "./pages/symptoms/met-moi-ue-oai";
import CanNang from "./pages/symptoms/sut-can-tang-can-khong-ro-nguyen-nhan";

import DauNguc from "./pages/symptoms/dau-nguc";
import KhoTho from "./pages/symptoms/kho-tho";
import HoiHop from "./pages/symptoms/hoi-hop-danh-trong-nguc";
import PhuChan from "./pages/symptoms/phu-chan";

import DauDau from "./pages/symptoms/dau-dau";
import ChongMat from "./pages/symptoms/chong-mat-choang-vang";
import MatNgu from "./pages/symptoms/mat-ngu";
import TamTrang from "./pages/symptoms/buon-chan-lo-au";

import DauBung from "./pages/symptoms/dau-bung";
import RoiLoanTieuHoa from "./pages/symptoms/roi-loan-tieu-hoa";
import BuonNon from "./pages/symptoms/buon-non-non";
import VangDa from "./pages/symptoms/vang-da";

import TieuBuot from "./pages/symptoms/tieu-buot-tieu-rat";
import TieuMau from "./pages/symptoms/tieu-mau";

import DauLung from "./pages/symptoms/dau-lung";
import DauKhop from "./pages/symptoms/dau-khop";

import DaLieu from "./pages/symptoms/ngua-ton-thuong-da";

import { CasesProvider } from "./context/CasesContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <CasesProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolPlaceholder />} />

          <Route path="/dose-adjust" element={<DoseAdjust />} />
          <Route path="/drug-interactions" element={<DrugInteractions />} />

          <Route path="/immunization" element={<Immunization />} />

          {/* Tiếp cận theo chứng */}
          <Route path="/symptoms" element={<SymptomsIndex />} />
          <Route path="/symptoms/sot" element={<Sot />} />
          <Route path="/symptoms/met-moi-ue-oai" element={<MetMoi />} />
          <Route
            path="/symptoms/sut-can-tang-can-khong-ro-nguyen-nhan"
            element={<CanNang />}
          />

          <Route path="/symptoms/dau-nguc" element={<DauNguc />} />
          <Route path="/symptoms/kho-tho" element={<KhoTho />} />
          <Route path="/symptoms/hoi-hop-danh-trong-nguc" element={<HoiHop />} />
          <Route path="/symptoms/phu-chan" element={<PhuChan />} />

          <Route path="/symptoms/dau-dau" element={<DauDau />} />
          <Route path="/symptoms/chong-mat-choang-vang" element={<ChongMat />} />
          <Route path="/symptoms/mat-ngu" element={<MatNgu />} />
          <Route path="/symptoms/buon-chan-lo-au" element={<TamTrang />} />

          <Route path="/symptoms/dau-bung" element={<DauBung />} />
          <Route path="/symptoms/roi-loan-tieu-hoa" element={<RoiLoanTieuHoa />} />
          <Route path="/symptoms/buon-non-non" element={<BuonNon />} />
          <Route path="/symptoms/vang-da" element={<VangDa />} />

          <Route path="/symptoms/tieu-buot-tieu-rat" element={<TieuBuot />} />
          <Route path="/symptoms/tieu-mau" element={<TieuMau />} />

          <Route path="/symptoms/dau-lung" element={<DauLung />} />
          <Route path="/symptoms/dau-khop" element={<DauKhop />} />

          <Route path="/symptoms/ngua-ton-thuong-da" element={<DaLieu />} />

          <Route path="/icd10" element={<ICD10 />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/case-summary" element={<CaseSummary />} />
          <Route path="/cases/:caseId" element={<CaseDetail />} />
        </Route>
      </Routes>
    </CasesProvider>
  </BrowserRouter>
);
