import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { appRoutes } from "./appRoutes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes}
        {appRoutes}
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}