import { useContext } from "react";
import { MyUserContext } from "../contexts/UserContext";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const stats = [
    { label: "Total Projects", value: "12", href: "/projects" },
    { label: "Active Databases", value: "8", href: "/databases" },
    { label: "Recent Backups", value: "3", href: "/backups" },
    {
      label: "Database Status",
      value: "All Systems Operational",
      status: true,
      href: "/databases",
    },
  ];

  const projects = [
    {
      name: "E-commerce API",
      type: "PostgreSQL",
      status: "Active",
      region: "US-East-1",
    },
    {
      name: "Analytics Dashboard",
      type: "MySQL",
      status: "Active",
      region: "EU-West-2",
    },
    {
      name: "Mobile App Backend",
      type: "PostgreSQL",
      status: "Sleeping",
      region: "AP-South-1",
    },
  ];

  const chartData = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 52 },
    { day: "Wed", value: 48 },
    { day: "Thu", value: 65 },
    { day: "Fri", value: 72 },
    { day: "Sat", value: 68 },
    { day: "Sun", value: 80 },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="p-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Chào mừng trở lại, {user?.name || "User"}!
        </h1>
        <p className="text-slate-400">
          Đây là tổng quan hoạt động tài khoản của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover:border-emerald-500/30 transition-colors cursor-pointer"
            onClick={() => navigate(stat.href)}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              {stat.status && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-emerald-500 font-medium">
                    All Systems Operational
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Projects</h2>
            <a
              href="#"
              className="text-sm text-emerald-500 hover:text-emerald-400 font-medium"
            >
              View All
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Project Name
                  </th>
                  <th className="pb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Database Type
                  </th>
                  <th className="pb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="pb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Region
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="py-4 text-white font-medium">
                      {project.name}
                    </td>
                    <td className="py-4 text-slate-300">{project.type}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{project.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Database Access Chart */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-6">
            Database Access (Last 7 Days)
          </h2>

          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">{item.day}</span>
                  <span className="text-slate-300">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
