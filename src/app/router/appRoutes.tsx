import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../shells/AppShell";
import MyCases from "../../pages/MyCases";
import CaseDetailPage from "../../features/cases/pages/CaseDetailPage";
import CaseAssessmentRedirectPage from "../../features/cases/pages/CaseAssessmentRedirectPage";

export const appRoutes = (
  <Route
    path="/app"
    element={
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="/app/cases" replace />} />
    <Route path="cases" element={<MyCases />} />
    <Route path="cases/:caseId" element={<CaseAssessmentRedirectPage />} />
    <Route
      path="cases/:caseId/assessments/:assessmentId"
      element={<CaseDetailPage />}
    />
  </Route>
);