import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import ToolPlaceholder from "./pages/ToolPlaceholder";
import DrugInteractions from "./pages/DrugInteractions";
import ICD10 from "./pages/ICD10";
import Contact from "./pages/Contact";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolPlaceholder />} />
          <Route path="/drug-interactions" element={<DrugInteractions />} />
          <Route path="/icd10" element={<ICD10 />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
  );
