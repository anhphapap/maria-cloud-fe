import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, Loader2, ArrowLeft, Home } from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { authApis, endpoints } from "../config/api.config";
import { useToast } from "../contexts/ToastContext";
import { MyUserContext } from "../contexts/UserContext";

// Import các component đã tách
import DatabaseConnectionTab from "./database-detail/DatabaseConnectionTab";
import DatabaseMembersTab from "./database-detail/DatabaseMembersTab";
import DatabaseLogsTab from "./database-detail/DatabaseLogsTab";
import DatabaseBackupTab from "./database-detail/DatabaseBackupTab";
import DatabaseTablesTab from "./database-detail/DatabaseTablesTab";
import InviteMemberModal from "./database-detail/InviteMemberModal";
import MemberManageModal from "./database-detail/MemberManageModal";

export default function DatabaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useContext(MyUserContext);

  const [activeTab, setActiveTab] = useState("connection");
  const [database, setDatabase] = useState(null);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMemberManageModalOpen, setIsMemberManageModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);

  const tabs = [
    { id: "connection", name: "Kết nối" },
    { id: "tables", name: "Bảng dữ liệu" },
    { id: "members", name: "Thành viên" },
    { id: "logs", name: "Hoạt động" },
    { id: "backups", name: "Sao lưu" },
  ];

  // Fetch database details
  const fetchDatabaseDetail = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(endpoints.getDatabaseById(id));
      if (response.data.code === 200) {
        setDatabase(response.data.data);
      } else {
        addToast(
          response.data.message || "Không thể lấy thông tin database",
          "error"
        );
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch database members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(endpoints.getDatabaseMembers(id));
      if (response.data.code === 200) {
        setMembers(response.data.data || []);
      } else {
        addToast(
          response.data.message || "Không thể lấy danh sách members",
          "error"
        );
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch database logs
  const fetchLogs = async (page = 0) => {
    setLogsLoading(true);
    try {
      const response = await authApis().get(
        `${endpoints.getDatabaseLogs(id)}?page=${page}&size=10`
      );
      if (response.data.code === 200) {
        setLogs(response.data.data.content || []);
        setLogsPage(response.data.data.number || 0);
        setLogsTotalPages(response.data.data.totalPages || 0);
      } else {
        addToast(response.data.message || "Không thể lấy hoạt động", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  // Handle invite member
  const handleInviteMember = async (formData) => {
    if (!formData.email.trim()) {
      addToast("Vui lòng nhập email", "error");
      return;
    }

    try {
      setInviteLoading(true);
      const response = await authApis().post(
        endpoints.inviteDatabaseMember(id),
        formData
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Mời thành viên thành công!", "success");
        setIsInviteModalOpen(false);
        fetchMembers();
      } else {
        addToast(response.data.message || "Mời thành viên thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle update member role
  const handleUpdateMemberRole = async (member, newRole) => {
    if (!member || !newRole || newRole === member.role) {
      addToast("Vui lòng chọn vai trò mới", "error");
      return;
    }

    try {
      setEditRoleLoading(true);
      const response = await authApis().patch(
        endpoints.updateDatabaseMember(id, member.id),
        { role: newRole }
      );

      if (response.data.code === 200) {
        addToast("Cập nhật vai trò thành công!", "success");
        setIsMemberManageModalOpen(false);
        setSelectedMember(null);
        fetchMembers();
      } else {
        addToast(response.data.message || "Cập nhật thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setEditRoleLoading(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (member) => {
    if (!member) {
      addToast("Không tìm thấy thành viên", "error");
      return;
    }

    if (!member.id) {
      addToast("ID thành viên không hợp lệ", "error");
      return;
    }

    try {
      setRemoveMemberLoading(true);
      const response = await authApis().delete(
        endpoints.deleteDatabaseMember(id, member.id)
      );

      if (
        response.status === 200 ||
        response.status === 204 ||
        response.data?.code === 200 ||
        response.data?.code === 204
      ) {
        addToast("Xóa thành viên thành công!", "success");
        setIsMemberManageModalOpen(false);
        setIsConfirmRemoveModalOpen(false);
        setSelectedMember(null);
        setMemberToRemove(null);
        fetchMembers();
      } else {
        addToast(response.data?.message || "Xóa thành viên thất bại", "error");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      addToast(
        error.response?.data?.message ||
          error.message ||
          "Đã có lỗi xảy ra khi xóa thành viên",
        "error"
      );
    } finally {
      setRemoveMemberLoading(false);
    }
  };

  // Open member manage modal
  const openMemberManageModal = (member) => {
    setSelectedMember(member);
    setIsMemberManageModalOpen(true);
  };

  // Open confirm remove modal
  const openConfirmRemoveModal = (member) => {
    setMemberToRemove(member);
    setIsConfirmRemoveModalOpen(true);
  };

  // Confirm remove member
  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    await handleRemoveMember(memberToRemove);
  };

  useEffect(() => {
    fetchDatabaseDetail();
    if (activeTab === "members") {
      fetchMembers();
    }
    if (activeTab === "logs") {
      fetchLogs(0);
    }
  }, [id, activeTab]);

  if (!loading && database === null) {
    return (
      <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-4">
        <span className="text-red-500">
          Database không tồn tại hoặc bạn không có quyền truy cập!!!
        </span>
        <Button
          onClick={() => navigate("/databases")}
          className="w-fit bg-slate-800 hover:bg-slate-700 text-white cursor-pointer justify-center items-center flex"
        >
          <ArrowLeft size={16} className="mr-2" strokeWidth={3} />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link
          to="/dashboard"
          className="text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <button
          onClick={() => navigate("/databases")}
          className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          Cơ sở dữ liệu
        </button>
        <ChevronRight size={16} />
        <span className="text-white font-medium">
          {database?.name || "prod-db-01"}
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {database?.name || "prod-db-01"}
        </h1>
        <p className="text-slate-400">
          Quản lý thông tin của database bao gồm thông tin kết nối, bảng dữ
          liệu, API và thành viên.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === tab.id
                  ? "text-emerald-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "connection" && (
        <DatabaseConnectionTab database={database} loading={loading} />
      )}

      {activeTab === "members" && (
        <DatabaseMembersTab
          members={members}
          loading={loading}
          currentUserEmail={user?.email}
          onInviteMember={() => setIsInviteModalOpen(true)}
          onManageMember={openMemberManageModal}
          onRemoveMember={openConfirmRemoveModal}
        />
      )}

      {activeTab === "logs" && (
        <DatabaseLogsTab
          logs={logs}
          logsLoading={logsLoading}
          logsPage={logsPage}
          logsTotalPages={logsTotalPages}
          onPageChange={fetchLogs}
        />
      )}

      {activeTab === "backups" && (
        <DatabaseBackupTab dbId={id} databaseName={database?.name} />
      )}

      {activeTab === "tables" && (
        <DatabaseTablesTab dbId={id} databaseName={database?.name} />
      )}

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
        loading={inviteLoading}
      />

      <MemberManageModal
        isOpen={isMemberManageModalOpen}
        onClose={() => {
          setIsMemberManageModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onUpdateRole={handleUpdateMemberRole}
        onRemoveMember={handleRemoveMember}
        editRoleLoading={editRoleLoading}
        removeMemberLoading={removeMemberLoading}
      />

      <ConfirmModal
        isOpen={isConfirmRemoveModalOpen}
        onClose={() => {
          setIsConfirmRemoveModalOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Xác nhận xóa thành viên"
        message={`Bạn có chắc chắn muốn xóa "${memberToRemove?.name}" khỏi database này? Thành viên sẽ mất toàn bộ quyền truy cập. Hành động này không thể hoàn tác.`}
        confirmText="Xóa thành viên"
        cancelText="Hủy"
        loading={removeMemberLoading}
        variant="danger"
      />
    </div>
  );
}
