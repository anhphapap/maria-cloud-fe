import {
  LayoutGrid,
  FolderOpen,
  Database,
  Archive,
  Activity,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MyDispatchContext } from "../contexts/UserContext";
import { useContext, useState } from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const sidebarItems = [
    { icon: LayoutGrid, label: "Tổng quan", key: "dashboard" },
    { icon: FolderOpen, label: "Dự án", key: "projects" },
    { icon: Database, label: "Cơ sở dữ liệu", key: "databases" },
    { icon: Archive, label: "Sao lưu", key: "backups" },
    { icon: Activity, label: "Hoạt động", key: "logs" },
  ];
  const dispatch = useContext(MyDispatchContext);

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  const handleNavigate = (key) => {
    setActiveTab(key);
    navigate(`/${key}`);
  };

  return (
    <div className="bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="h-[74.4px] flex items-center justify-center w-full border-b border-slate-800 px-4">
        <div
          className={`flex items-center w-full ${
            isMenuOpen ? "justify-end" : "justify-center"
          }`}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="cursor-pointer text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            {!isMenuOpen ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isMenuOpen ? "p-4" : "p-2"}`}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.key)}
              className={`w-full flex items-center gap-3 rounded-lg mb-2 transition-colors ${
                isMenuOpen ? "flex-row px-4 py-3" : "flex-col p-2"
              } ${
                activeTab === item.key
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={isMenuOpen ? 20 : 24} />
              <span
                className={`font-medium ${
                  isMenuOpen ? "text-base" : "text-xs"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3  rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
            isMenuOpen ? "flex-row px-4 py-3" : "flex-col p-2"
          }`}
        >
          <LogOut size={isMenuOpen ? 20 : 24} />
          <span
            className={`font-medium ${isMenuOpen ? "text-base" : "text-xs"}`}
          >
            Đăng xuất
          </span>
        </button>
      </div>
    </div>
  );
}
