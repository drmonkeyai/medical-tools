import { Fragment } from "react";
import { Route, Navigate } from "react-router-dom";
import PublicShell from "../shells/PublicShell";

import Home from "../../pages/Home";
import Tools from "../../pages/Tools";
import ToolPlaceholder from "../../pages/ToolPlaceholder";
import DoseAdjust from "../../pages/DoseAdjust";
import MedicationDaysSupply from "../../pages/MedicationDaysSupply";
import DrugInteractions from "../../pages/DrugInteractions";
import Immunization from "../../pages/Immunization";
import ICD10 from "../../pages/ICD10";
import Contact from "../../pages/Contact";
import BytProcedures from "../../pages/BytProcedures";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import PatientMonitoringPortalPage from "../../pages/public/PatientMonitoringPortalPage";

import SymptomsIndex from "../../pages/symptoms/index";
import Sot from "../../pages/symptoms/sot";
import MetMoi from "../../pages/symptoms/met-moi-ue-oai";
import CanNang from "../../pages/symptoms/sut-can-tang-can-khong-ro-nguyen-nhan";
import DauNguc from "../../pages/symptoms/dau-nguc";
import KhoTho from "../../pages/symptoms/kho-tho";
import HoiHop from "../../pages/symptoms/hoi-hop-danh-trong-nguc";
import Ho from "../../pages/symptoms/ho";
import PhuChan from "../../pages/symptoms/phu-chan";
import DauDau from "../../pages/symptoms/dau-dau";
import ChongMat from "../../pages/symptoms/chong-mat-choang-vang";
import MatNgu from "../../pages/symptoms/mat-ngu";
import TamTrang from "../../pages/symptoms/buon-chan-lo-au";
import DauBung from "../../pages/symptoms/dau-bung";
import RoiLoanTieuHoa from "../../pages/symptoms/roi-loan-tieu-hoa";
import BuonNon from "../../pages/symptoms/buon-non-non";
import VangDa from "../../pages/symptoms/vang-da";
import TieuBuot from "../../pages/symptoms/tieu-buot-tieu-rat";
import TieuMau from "../../pages/symptoms/tieu-mau";
import DauLung from "../../pages/symptoms/dau-lung";
import DauKhop from "../../pages/symptoms/dau-khop";
import DaLieu from "../../pages/symptoms/ngua-ton-thuong-da";

import GeriatricAssessmentCalculator from "../../calculators/GeriatricAssessmentCalculator";
import KatzADL from "../../calculators/KatzADL";
import LawtonIADL from "../../calculators/LawtonIADL";
import GaitSpeed from "../../calculators/GaitSpeed";
import GripStrength from "../../calculators/GripStrength";
import MMSE from "../../calculators/MMSE";
import MoCA from "../../calculators/MoCA";

export const publicRoutes = (
  <Fragment>
    <Route
      path="/p/:token/monitoring"
      element={<PatientMonitoringPortalPage />}
    />

    <Route element={<PublicShell />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/tools" element={<Tools />} />
      <Route path="/tools/:slug" element={<ToolPlaceholder />} />

      <Route
        path="/calculators/geriatric-assessment"
        element={<GeriatricAssessmentCalculator />}
      />
      <Route path="/calculators/katz-adl" element={<KatzADL />} />
      <Route path="/calculators/lawton-iadl" element={<LawtonIADL />} />
      <Route path="/calculators/gait-speed" element={<GaitSpeed />} />
      <Route path="/calculators/grip-strength" element={<GripStrength />} />
      <Route path="/calculators/mmse" element={<MMSE />} />
      <Route path="/calculators/moca" element={<MoCA />} />

      <Route path="/dose-adjust" element={<DoseAdjust />} />
      <Route path="/medication/days-supply" element={<MedicationDaysSupply />} />
      <Route path="/drug-interactions" element={<DrugInteractions />} />
      <Route path="/immunization" element={<Immunization />} />
      <Route path="/icd10" element={<ICD10 />} />
      <Route path="/byt-procedures" element={<BytProcedures />} />
      <Route path="/contact" element={<Contact />} />

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
      <Route path="/symptoms/ho" element={<Ho />} />
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

      <Route
        path="/case-summary"
        element={<Navigate to="/app/cases" replace />}
      />
      <Route path="/my-cases" element={<Navigate to="/app/cases" replace />} />
    </Route>
  </Fragment>
);