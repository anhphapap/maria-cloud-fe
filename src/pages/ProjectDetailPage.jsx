import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Database,
  EllipsisVertical,
  Home,
  Loader2,
  Plus,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { authApis, endpoints } from "../config/api.config";
import { useToast } from "../contexts/ToastContext";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("databases");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbFormData, setDbFormData] = useState({
    name: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchProject = async () => {
    // try {
    //   const response = await authApis().get(`${endpoints.getProjects}/${id}`);
    //   if (response.data.code === 200) {
    //     setProject(response.data.data);
    //   }
    // } catch (error) {
    //   addToast("Không thể tải thông tin dự án", "error");
    //   navigate("/projects");
    // }
    setProject({
      id: id,
      name: "Project 1",
      description: "Description 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(
        endpoints.getDatabasesByProjectId(id)
      );
      if (response.data.code === 200) {
        setDatabases(response.data.data || []);
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!dbFormData.name.trim()) {
      addToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    try {
      setCreateLoading(true);
      const response = await authApis().post(endpoints.createDatabase, {
        name: dbFormData.name.trim(),
        projectId: project?.id,
      });

      if (response.data.code === 201) {
        addToast("Tạo database thành công!", "success");
        setIsModalOpen(false);
        setDbFormData({
          name: "",
        });
        fetchDatabases();
      } else {
        addToast(response.data.message || "Tạo database thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchDatabases();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      Healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      Maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      Stopped: "bg-red-500/10 text-red-500 border-red-500/30",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          statusStyles[status] || statusStyles.Healthy
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
        {status}
      </span>
    );
  };

  const filteredDatabases = databases.filter((db) =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: "overview", label: "Tổng quan" },
    { key: "databases", label: "Databases" },
    { key: "auth", label: "Xác thực" },
    { key: "storage", label: "Lưu trữ" },
    { key: "api-keys", label: "API Keys" },
  ];

  if (!project) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link
          to="/dashboard"
          className="text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <Home size={16} />
        </Link>
        <span className="text-slate-500">/</span>
        <Link
          to="/projects"
          className="text-slate-400 hover:text-emerald-500 transition-colors"
        >
          Projects
        </Link>
        <span className="text-slate-500">/</span>
        <span className="text-slate-300">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              {project.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Production Active
              </span>
              <span className="text-slate-400 text-sm">us-east-1</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? "text-emerald-500 border-emerald-500"
                    : "text-slate-400 border-transparent hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Databases Tab Content */}
      {activeTab === "databases" && (
        <>
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="relative w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Tìm kiếm databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 w-fit cursor-pointer"
            >
              <Plus size={20} />
              Tạo Database Mới
            </Button>
          </div>

          {/* Create Database Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setDbFormData({
                name: "",
              });
            }}
            title="Tạo Database Mới"
          >
            <form onSubmit={handleCreateDatabase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dự Án
                </label>
                <Input
                  value={project?.name}
                  disabled={true}
                  className="cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên Database
                </label>
                <Input
                  type="text"
                  placeholder="Nhập tên database..."
                  value={dbFormData.name}
                  onChange={(e) =>
                    setDbFormData({ ...dbFormData, name: e.target.value })
                  }
                  disabled={createLoading}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createLoading}
                  className="flex-1 bg-slate-800 hover:bg-slate-700"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleCreateDatabase}
                >
                  Tạo
                </Button>
              </div>
            </form>
          </Modal>

          {/* Databases Table */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Tên Database
                    </th>
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Host
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Port
                    </th> */}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          <Loader2 className="animate-spin" size={20} />
                          <span>Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDatabases.length > 0 ? (
                    filteredDatabases.map((db, index) => (
                      <tr
                        key={db.id}
                        className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                          index === filteredDatabases.length - 1
                            ? "border-b-0"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                              <Database
                                size={16}
                                className="text-emerald-500"
                              />
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {db.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {db.type || "MariaDB"}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4">
                          <span className="text-slate-400 text-sm font-mono">
                            {db.host}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400">{db.port}</span>
                        </td> */}
                        <td className="px-6 py-4">
                          {getStatusBadge(db.status || "Healthy")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400">
                            {new Date(db.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center">
                          <button className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer hover:bg-slate-800/50 rounded-full p-1">
                            <EllipsisVertical size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        {searchTerm
                          ? "Không tìm thấy database nào phù hợp"
                          : "Chưa có database nào. Tạo database đầu tiên!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {/* {filteredDatabases.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Showing 1 to {filteredDatabases.length} of {databases.length}{" "}
                  results
                </span>
                <div className="flex gap-2">
                  <button
                    disabled
                    className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-800/50 rounded-lg cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-800/50 rounded-lg cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </>
      )}

      {/* Other Tabs */}
      {activeTab !== "databases" && (
        <div className="text-center py-12 text-slate-400">
          Tab "{activeTab}" đang được phát triển...
        </div>
      )}
    </div>
  );
}
