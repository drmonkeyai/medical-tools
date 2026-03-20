import { createRoot } from "react-dom/client";
import "./styles/index.css";

import { AuthProvider } from "./context/AuthContext";
import { CasesProvider } from "./context/CasesContext";
import AppRouter from "./app/router/AppRouter";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <CasesProvider>
      <AppRouter />
    </CasesProvider>
  </AuthProvider>
);