import { Loader2, Plus, Trash } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { authApis, endpoints } from "../config/api.config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { addToast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(endpoints.getProjects);
      if (response.data.code === 200) {
        setProjects(response.data.data);
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      addToast("Vui lòng nhập tên dự án", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await authApis().post(endpoints.createProject, {
        name: projectName.trim(),
      });

      if (response.data.code === 201) {
        addToast("Tạo dự án thành công!", "success");
        setIsModalOpen(false);
        setProjectName("");
        fetchProjects();
      } else {
        addToast(response.data.message || "Tạo dự án thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setDeleteLoading(true);
      await authApis().delete(endpoints.deleteProject(selectedProject.id));
      addToast("Xóa dự án thành công!", "success");
      setIsConfirmModalOpen(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteConfirm = (project) => {
    setSelectedProject(project);
    setIsConfirmModalOpen(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Dự án</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 w-fit cursor-pointer"
        >
          <Plus size={20} />
          Tạo dự án mới
        </Button>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProjectName("");
        }}
        title="Tạo dự án mới"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tên dự án
            </label>
            <Input
              type="text"
              placeholder="Nhập tên dự án..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setProjectName("");
              }}
              disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang tạo...
                </span>
              ) : (
                "Tạo dự án"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteProject}
        title="Xác nhận xóa dự án"
        message={`Bạn có chắc chắn muốn xóa dự án "${selectedProject?.name}"?`}
        confirmText="Xóa dự án"
        cancelText="Hủy"
        loading={deleteLoading}
        variant="danger"
      />

      {/* Projects Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Tên dự án
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
                  <td></td>
                  <td className="px-6 py-4 text-center text-slate-400 flex items-center justify-center gap-2 w-full">
                    <Loader2 className="animate-spin" size={20} />
                  </td>
                  <td></td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map((project, index) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      index === projects.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {project.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">
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
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(project);
                          }}
                          className="text-red-500 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-slate-400"
                  >
                    Bạn chưa có dự án nào. Vui lòng tạo dự án mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
