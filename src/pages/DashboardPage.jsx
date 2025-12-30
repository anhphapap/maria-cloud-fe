import { useContext, useState, useEffect } from "react";
import { MyUserContext } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../config/api.config";
import {
  Loader2,
  FolderKanban,
  Database,
  Archive,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const user = useContext(MyUserContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDatabases: 0,
    totalBackups: 0,
  });
  const [projects, setProjects] = useState([]);
  const [databases, setDatabases] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats
        const dashboardResponse = await authApis().get(endpoints.dashboard);
        if (dashboardResponse.data.code === 200) {
          setStats(dashboardResponse.data.data);
        }

        // Fetch recent projects (limit 5)
        const projectsResponse = await authApis().get(
          `${endpoints.getProjects}`
        );
        if (projectsResponse.data.code === 200) {
          setProjects(projectsResponse.data.data || []);
        }

        // Fetch recent databases (limit 5)
        const databasesResponse = await authApis().get(
          `${endpoints.getDatabases}`
        );
        if (databasesResponse.data.code === 200) {
          setDatabases(databasesResponse.data.data || []);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        addToast(
          error.response?.data?.message || "Không thể tải dữ liệu dashboard",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Chào mừng trở lại, {user?.name || "User"}!
        </h1>
        <p className="text-slate-400">
          Đây là tổng quan hoạt động tài khoản của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Total Projects */}
        <Card
          className="hover:border-emerald-500/30 transition-colors cursor-pointer"
          onClick={() => navigate("/projects")}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Tổng Projects
              </p>
              <p className="text-3xl font-bold text-white">
                {stats.totalProjects}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FolderKanban className="text-blue-500" size={24} />
            </div>
          </div>
        </Card>

        {/* Total Databases */}
        <Card
          className="hover:border-emerald-500/30 transition-colors cursor-pointer"
          onClick={() => navigate("/databases")}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Tổng Databases
              </p>
              <p className="text-3xl font-bold text-white">
                {stats.totalDatabases}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Database className="text-emerald-500" size={24} />
            </div>
          </div>
        </Card>

        {/* Total Backups */}
        <Card
          className="hover:border-emerald-500/30 transition-colors cursor-pointer"
          onClick={() => navigate("/databases")}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Tổng Backups
              </p>
              <p className="text-3xl font-bold text-white">
                {stats.totalBackups}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Archive className="text-purple-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Projects */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Projects gần đây
            </h2>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors group"
            >
              <span>Xem tất cả</span>
              <ChevronRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FolderKanban className="text-blue-500" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate-400 truncate">
                        {new Date(project.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FolderKanban size={48} className="mb-4 text-slate-600" />
              <p className="text-lg font-medium">Chưa có project nào</p>
              <p className="text-sm">Tạo project đầu tiên của bạn</p>
            </div>
          )}
        </Card>

        {/* Recent Databases */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Databases gần đây
            </h2>
            <button
              onClick={() => navigate("/databases")}
              className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors group"
            >
              <span>Xem tất cả</span>
              <ChevronRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          {databases.length > 0 ? (
            <div className="space-y-3">
              {databases.map((db) => (
                <div
                  key={db.id}
                  onClick={() => navigate(`/databases/${db.id}`)}
                  className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Database className="text-emerald-500" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {db.name}
                      </h3>
                      <p className="text-sm text-slate-400 truncate">
                        {db.projectName || "No project"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Database size={48} className="mb-4 text-slate-600" />
              <p className="text-lg font-medium">Chưa có database nào</p>
              <p className="text-sm">Tạo database đầu tiên của bạn</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
