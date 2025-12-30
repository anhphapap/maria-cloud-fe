import {
  Download,
  HardDrive,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useState, useEffect } from "react";
import { authApis, endpoints } from "../../config/api.config";
import { useToast } from "../../contexts/ToastContext";

export default function DatabaseBackupTab({ dbId, databaseName }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const { addToast } = useToast();

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Fetch backups
  const fetchBackups = async (page = 0) => {
    setLoading(true);
    try {
      const response = await authApis().get(
        `${endpoints.databaseBackups(dbId)}?page=${page}&size=20`
      );
      if (response.data.code === 200) {
        setBackups(response.data.data.content || []);
        setPagination({
          pageNumber: response.data.data.number,
          pageSize: response.data.data.size,
          totalPages: response.data.data.totalPages,
          totalElements: response.data.data.totalElements,
        });
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  // Create backup
  const handleCreateBackup = async () => {
    try {
      setCreateLoading(true);
      const response = await authApis().post(endpoints.createBackup(dbId));

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Tạo backup thành công!", "success");
        setIsCreateModalOpen(false);
        fetchBackups(pagination.pageNumber); // Refresh current page
      } else {
        addToast(response.data.message || "Tạo backup thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    if (dbId) {
      fetchBackups();
    }
  }, [dbId]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchBackups(newPage);
  };

  const handleDownloadBackup = async (backupId, fileName) => {
    try {
      setDownloadLoading(true);

      // Gọi API với responseType là blob để nhận file
      const response = await authApis().get(
        endpoints.downloadBackup(dbId, backupId),
        {
          responseType: "blob", // Quan trọng: phải set responseType là blob
        }
      );

      // Tạo blob URL từ response
      const blob = new Blob([response.data], { type: "application/sql" });
      const url = window.URL.createObjectURL(blob);

      // Tạo element <a> để trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `backup_${backupId}.sql`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast("Tải xuống backup thành công!", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      setRestoreLoading(true);
      const response = await authApis().post(
        endpoints.restoreBackup(dbId, selectedBackup.id)
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Khôi phục backup thành công!", "success");
        setIsRestoreModalOpen(false);
        setSelectedBackup(null);
      } else {
        addToast(response.data.message || "Khôi phục backup thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setRestoreLoading(false);
    }
  };

  // Open restore modal
  const handleOpenRestoreModal = (backup) => {
    setSelectedBackup(backup);
    setIsRestoreModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Sao lưu Database</h3>
          <p className="text-slate-400 text-sm mt-1">
            Quản lý các bản sao lưu của database
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => fetchBackups(pagination.pageNumber)}
            className="flex items-center gap-2 w-fit cursor-pointer bg-slate-700 hover:bg-slate-600"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Làm mới
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 w-fit cursor-pointer"
            disabled={createLoading}
          >
            <Plus size={18} />
            Tạo Backup Mới
          </Button>
        </div>
      </div>

      {/* Confirm Create Backup Modal */}
      <ConfirmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateBackup}
        title="Xác nhận tạo backup"
        message={`Bạn có chắc chắn muốn tạo bản sao lưu cho database "${databaseName}"? Quá trình này có thể mất vài phút.`}
        confirmText="Tạo backup"
        cancelText="Hủy"
        loading={createLoading}
        variant="primary"
      />

      {/* Confirm Restore Backup Modal */}
      <ConfirmModal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setSelectedBackup(null);
        }}
        onConfirm={handleRestoreBackup}
        title="Xác nhận khôi phục backup"
        message={
          <>
            <p className="mb-3">
              Bạn có chắc chắn muốn khôi phục database từ backup này?
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
              <p className="text-sm text-slate-300">
                <span className="text-slate-400">File:</span>{" "}
                <span className="font-medium">{selectedBackup?.fileName}</span>
              </p>
              <p className="text-sm text-slate-300">
                <span className="text-slate-400">Ngày tạo:</span>{" "}
                <span className="font-medium">
                  {selectedBackup &&
                    new Date(selectedBackup.createdAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                </span>
              </p>
            </div>
            <p className="mt-3 text-red-400 text-sm font-medium">
              ⚠️ Cảnh báo: Toàn bộ dữ liệu hiện tại sẽ bị ghi đè. Hành động này
              không thể hoàn tác!
            </p>
          </>
        }
        confirmText="Khôi phục"
        cancelText="Hủy"
        loading={restoreLoading}
        variant="danger"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <HardDrive size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Tổng số backup</p>
              <p className="text-xl font-bold text-white">
                {pagination.totalElements}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <RefreshCw size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Backup gần nhất</p>
              <p className="text-sm font-semibold text-white">
                {backups.length > 0
                  ? new Date(backups[0].createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Chưa có"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <HardDrive size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Tổng dung lượng</p>
              <p className="text-sm font-semibold text-white">
                {backups.length > 0
                  ? formatFileSize(
                      backups.reduce((acc, b) => acc + b.fileSize, 0)
                    )
                  : "0 Bytes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tên file
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Kích thước
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Người tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : backups.length > 0 ? (
                backups.map((backup, index) => (
                  <tr
                    key={backup.id}
                    className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                      index === backups.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-slate-400 font-mono text-sm">
                        #{backup.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                          <HardDrive size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-white text-sm font-medium">
                          {backup.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-300 text-sm">
                        {formatFileSize(backup.fileSize)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-300 text-sm">
                        {backup.userName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-400 text-sm">
                        {new Date(backup.createdAt).toLocaleDateString(
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenRestoreModal(backup)}
                          className="text-blue-500 hover:bg-slate-700/50 rounded-full p-2 cursor-pointer transition-colors"
                          title="Khôi phục"
                          disabled={restoreLoading}
                        >
                          {restoreLoading &&
                          selectedBackup?.id === backup.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadBackup(backup.id, backup.fileName)
                          }
                          className="text-emerald-500 hover:bg-slate-700/50 rounded-full p-2 cursor-pointer transition-colors"
                          title="Tải xuống"
                          disabled={downloadLoading}
                        >
                          {downloadLoading ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Chưa có bản sao lưu nào. Vui lòng tạo backup mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && backups.length > 0 && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Hiển thị{" "}
              <span className="font-medium text-white">
                {pagination.pageNumber * pagination.pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-medium text-white">
                {Math.min(
                  (pagination.pageNumber + 1) * pagination.pageSize,
                  pagination.totalElements
                )}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-medium text-white">
                {pagination.totalElements}
              </span>{" "}
              backup
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={pagination.pageNumber === 0 || loading}
                className="px-3 py-2 text-sm cursor-pointer bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </Button>
              <span className="text-sm text-slate-400">
                Trang {pagination.pageNumber + 1} / {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={
                  pagination.pageNumber >= pagination.totalPages - 1 || loading
                }
                className="px-3 py-2 text-sm cursor-pointer bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
