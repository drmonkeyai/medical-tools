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

import CaseDetail from "./pages/CaseDetail";
// (CaseSummary nếu còn dùng thì giữ, không thì bỏ)
import CaseSummary from "./pages/CaseSummary";

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
          <Route path="/icd10" element={<ICD10 />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/case-summary" element={<CaseSummary />} />
          <Route path="/cases/:caseId" element={<CaseDetail />} />
        </Route>
      </Routes>
    </CasesProvider>
  </BrowserRouter>
);
