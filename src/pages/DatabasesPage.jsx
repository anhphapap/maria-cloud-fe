import {
  CircleAlert,
  Database,
  EllipsisVertical,
  Loader2,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import ConnectionInfoModal from "../components/ui/ConnectionInfoModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../config/api.config";
import { useToast } from "../contexts/ToastContext";

export default function DatabasesPage() {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [dbFormData, setDbFormData] = useState({
    name: "",
    projectId: "",
  });
  const { addToast } = useToast();

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(endpoints.getDatabases);
      if (response.data.code === 200) {
        setDatabases(response.data.data);
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await authApis().get(endpoints.getProjects);
      if (response.data.code === 200) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!dbFormData.name.trim() || !dbFormData.projectId) {
      addToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    try {
      setCreateLoading(true);
      const response = await authApis().post(endpoints.createDatabase, {
        ...dbFormData,
        name: dbFormData.name.trim(),
      });

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Tạo database thành công!", "success");
        setIsCreateModalOpen(false);
        setDbFormData({
          name: "",
          projectId: "",
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
    fetchDatabases();
    fetchProjects();
  }, []);

  const handleDeleteDatabase = async () => {
    if (!selectedDatabase) return;

    try {
      setDeleteLoading(true);
      await authApis().delete(endpoints.deleteDatabase(selectedDatabase.id));
      addToast("Xóa database thành công!", "success");
      setIsConfirmModalOpen(false);
      setSelectedDatabase(null);
      fetchDatabases();
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const openDeleteConfirm = (database) => {
    setSelectedDatabase(database);
    setIsConfirmModalOpen(true);
  };

  const fetchDatabaseDetail = async (dbId) => {
    setConnectionLoading(true);
    try {
      const response = await authApis().get(endpoints.getDatabaseById(dbId));
      if (response.data.code === 200) {
        setConnectionInfo(response.data.data);
      } else {
        addToast(
          response.data.message || "Không thể lấy thông tin database",
          "error"
        );
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setConnectionLoading(false);
    }
  };

  const openConnectionInfo = (dbId) => {
    setIsConnectionModalOpen(true);
    fetchDatabaseDetail(dbId);
  };

  const filteredDatabases = databases.filter((db) => {
    const matchesSearch = db.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || db.status === statusFilter;
    const matchesProject =
      projectFilter === "all" || db.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-white">Databases</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 w-fit cursor-pointer"
          >
            <Plus size={20} />
            Tạo Database
          </Button>
        </div>
        <p className="text-slate-400">
          Quản lý databases và connection pools của bạn.
        </p>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedDatabase(null);
        }}
        onConfirm={handleDeleteDatabase}
        title="Xác nhận xóa database"
        message={`Bạn có chắc chắn muốn xóa database "${selectedDatabase?.name}"? Tất cả dữ liệu sẽ bị mất vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmText="Xóa database"
        cancelText="Hủy"
        loading={deleteLoading}
        variant="danger"
      />

      {/* Create Database Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setDbFormData({
            name: "",
            projectId: "",
          });
        }}
        title="Tạo Database Mới"
      >
        <form onSubmit={handleCreateDatabase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chọn Dự Án <span className="text-red-500">*</span>
            </label>
            <select
              value={dbFormData.projectId}
              onChange={(e) =>
                setDbFormData({ ...dbFormData, projectId: e.target.value })
              }
              disabled={createLoading}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Chọn dự án --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tên Database <span className="text-red-500">*</span>
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
              onClick={() => {
                setIsCreateModalOpen(false);
                setDbFormData({
                  name: "",
                  projectId: "",
                });
              }}
              disabled={createLoading}
              className="flex-1 bg-slate-800 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createLoading} className="flex-1">
              {createLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Đang tạo...
                </span>
              ) : (
                "Tạo Database"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Connection Info Modal */}
      <ConnectionInfoModal
        isOpen={isConnectionModalOpen}
        onClose={() => {
          setIsConnectionModalOpen(false);
          setConnectionInfo(null);
        }}
        dbInfo={connectionInfo}
        loading={connectionLoading}
      />

      {/* Databases Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Tên Database
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Dự Án
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
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
                    onClick={() => navigate(`/databases/${db.id}`)}
                    className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      index === filteredDatabases.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                          <Database size={16} className="text-emerald-500" />
                        </div>
                        <span className="text-white font-medium">
                          {db.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{db.projectName}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge("Healthy")}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">
                        {new Date(db.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openConnectionInfo(db.id);
                          }}
                          className="text-slate-400 hover:bg-slate-800/50 rounded-full p-2 cursor-pointer transition-colors"
                          title="Thông tin kết nối"
                        >
                          <CircleAlert size={20} className="text-green-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(db);
                          }}
                          className="text-red-500 hover:bg-slate-800/50 rounded-full p-2 cursor-pointer transition-colors"
                          title="Xóa database"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    {searchTerm ||
                    statusFilter !== "all" ||
                    projectFilter !== "all"
                      ? "Không tìm thấy database nào phù hợp"
                      : "Bạn chưa có database nào. Vui lòng tạo database mới!"}
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
              Hiển thị 1-{filteredDatabases.length} trong tổng số{" "}
              {databases.length} databases
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
    </div>
  );
}
