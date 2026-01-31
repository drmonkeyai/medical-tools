import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="app__main">
        <Topbar />
        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
