import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [sbOpen, setSbOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar isOpen={sbOpen} onClose={() => setSbOpen(false)} />

      <div className="app__main">
        <Topbar onToggleSidebar={() => setSbOpen((v) => !v)} />
        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
