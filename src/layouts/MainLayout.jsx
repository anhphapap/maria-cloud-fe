import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Detect current route and set active tab
  useEffect(() => {
    const path = location.pathname.split("/")[1]; // Get first part of path
    if (
      path &&
      ["dashboard", "projects", "databases", "backups", "logs"].includes(path)
    ) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ activeTab, setActiveTab }} />
        </main>
      </div>
    </div>
  );
}
