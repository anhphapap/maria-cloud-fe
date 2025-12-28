import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Plus,
  EllipsisVertical,
  Loader2,
  UserPlus,
  X,
  Info,
  Home,
  UserRoundPlus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Database,
  Trash2,
  Edit3,
  Trash,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ArrowLeft,
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import ConfirmModal from "../components/ui/ConfirmModal";
import { authApis, endpoints } from "../config/api.config";
import { useToast } from "../contexts/ToastContext";
import { MyUserContext } from "../contexts/UserContext";

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
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    role: "Analyst",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isMemberManageModalOpen, setIsMemberManageModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);
  const [newRole, setNewRole] = useState("");

  const tabs = [
    { id: "connection", name: "Kết nối" },
    { id: "tables", name: "Bảng dữ liệu" },
    { id: "members", name: "Thành viên" },
    { id: "logs", name: "Hoạt động" },
  ];

  const roleOptions = [
    { value: "OWNER", permission: "Full Access", color: "emerald" },
    { value: "ADMIN", permission: "Full Access", color: "blue" },
    { value: "READWRITE", permission: "Read & Write", color: "purple" },
    { value: "READONLY", permission: "Read-only", color: "slate" },
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
        `${endpoints.getDatabaseLogs(id)}?page=${page}&size=20`
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
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteFormData.email.trim()) {
      addToast("Vui lòng nhập email", "error");
      return;
    }

    try {
      setInviteLoading(true);
      const response = await authApis().post(
        endpoints.inviteDatabaseMember(id),
        inviteFormData
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Mời thành viên thành công!", "success");
        setIsInviteModalOpen(false);
        setInviteFormData({ email: "", role: "Analyst" });
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

  useEffect(() => {
    fetchDatabaseDetail();
    if (activeTab === "members") {
      fetchMembers();
    }
    if (activeTab === "logs") {
      fetchLogs(0);
    }
  }, [id, activeTab]);

  const getRoleBadge = (role) => {
    const roleConfig =
      roleOptions.find((r) => r.value === role) || roleOptions[2];
    const colorStyles = {
      emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      purple: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      slate: "bg-slate-500/10 text-slate-500 border-slate-500/30",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          colorStyles[roleConfig.color]
        }`}
      >
        {role}
      </span>
    );
  };

  const getPermissionBadge = (role) => {
    const permissionConfig =
      roleOptions.find((r) => r.value === role) || roleOptions[2];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border text-${permissionConfig.color}-500`}
      >
        {permissionConfig.permission}
      </span>
    );
  };
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getActionLabel = (action) => {
    const actionLabels = {
      CREATE_DATABASE: "Tạo database",
      DELETE_DATABASE: "Xóa database",
      UPDATE_DATABASE: "Cập nhật database",
      INVITE_MEMBER: "Mời thành viên",
      UPDATE_MEMBER_ROLE: "Cập nhật vai trò",
      REMOVE_MEMBER: "Xóa thành viên",
      CREATE_TABLE: "Tạo bảng",
      DELETE_TABLE: "Xóa bảng",
      UPDATE_TABLE: "Cập nhật bảng",
    };
    return actionLabels[action] || action;
  };

  const getActionColor = (action) => {
    if (action.includes("CREATE") || action.includes("INVITE")) {
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    }
    if (action.includes("DELETE") || action.includes("REMOVE")) {
      return "text-red-500 bg-red-500/10 border-red-500/30";
    }
    if (action.includes("UPDATE")) {
      return "text-blue-500 bg-blue-500/10 border-blue-500/30";
    }
    return "text-slate-500 bg-slate-500/10 border-slate-500/30";
  };

  const getActionIcon = (action) => {
    if (action.includes("CREATE") || action.includes("INVITE")) {
      return <Plus size={16} />;
    }
    if (action.includes("DELETE") || action.includes("REMOVE")) {
      return <Trash2 size={16} />;
    }
    if (action.includes("UPDATE")) {
      return <Edit3 size={16} />;
    }
    return <Activity size={16} />;
  };

  const formatLogDetails = (log) => {
    try {
      const details = JSON.parse(log.details || "{}");
      const action = log.action;

      // Format theo từng loại action
      if (action === "UPDATE_MEMBER_ROLE") {
        return `Cập nhật vai trò thành viên (ID: ${details.memberId})`;
      }
      if (action === "INVITE_MEMBER") {
        return `Mời thành viên mới vào database`;
      }
      if (action === "REMOVE_MEMBER") {
        return `Xóa thành viên (ID: ${details.memberId})`;
      }
      if (action === "CREATE_DATABASE") {
        return `Tạo database "${log.dbName}"`;
      }
      if (action === "DELETE_DATABASE") {
        return `Xóa database "${log.dbName}"`;
      }

      return details.description || "Không có mô tả";
    } catch (error) {
      return "Không có thông tin chi tiết";
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      addToast("Đã sao chép vào clipboard!", "success");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      addToast("Không thể sao chép", "error");
    }
  };

  const openMemberManageModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setIsMemberManageModalOpen(true);
  };

  const openConfirmRemoveModal = (member) => {
    setMemberToRemove(member);
    setIsConfirmRemoveModalOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    await handleRemoveMember(memberToRemove);
    setIsConfirmRemoveModalOpen(false);
    setMemberToRemove(null);
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember || !newRole || newRole === selectedMember.role) {
      addToast("Vui lòng chọn vai trò mới", "error");
      return;
    }

    try {
      setEditRoleLoading(true);
      const response = await authApis().patch(
        endpoints.updateDatabaseMember(id, selectedMember.id),
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

  const handleRemoveMember = async (member) => {
    const targetMember = member || selectedMember;

    if (!targetMember) {
      addToast("Không tìm thấy thành viên", "error");
      return;
    }

    if (!targetMember.id) {
      addToast("ID thành viên không hợp lệ", "error");
      return;
    }

    try {
      setRemoveMemberLoading(true);
      const response = await authApis().delete(
        endpoints.deleteDatabaseMember(id, targetMember.id)
      );

      // Check both status code and response data
      if (
        response.status === 200 ||
        response.status === 204 ||
        response.data?.code === 200 ||
        response.data?.code === 204
      ) {
        addToast("Xóa thành viên thành công!", "success");
        setIsMemberManageModalOpen(false);
        setSelectedMember(null);
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

      {/* Connection Tab Content */}
      {activeTab === "connection" && (
        <div className="space-y-6">
          {/* Connection Info Card */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Database className="text-emerald-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Thông tin kết nối
                </h3>
                <p className="text-sm text-slate-400">
                  Chi tiết cấu hình để kết nối đến database
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang tải...</span>
                </div>
              </div>
            ) : database?.credentialInfo ? (
              <div className="space-y-4">
                {/* Host */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Host
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={database.credentialInfo.hostname || ""}
                      readOnly
                      className="w-full px-4 py-2 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          database.credentialInfo.hostname,
                          "host"
                        )
                      }
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all ${
                        copiedField === "host"
                          ? "text-emerald-500 bg-emerald-500/20"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                      title={copiedField === "host" ? "Đã copy!" : "Copy"}
                    >
                      {copiedField === "host" ? (
                        <Check
                          size={16}
                          className="animate-in zoom-in duration-200"
                        />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Port */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Port
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={database.credentialInfo.port?.toString() || ""}
                      readOnly
                      className="w-full px-4 py-2 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          database.credentialInfo.port?.toString(),
                          "port"
                        )
                      }
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all ${
                        copiedField === "port"
                          ? "text-emerald-500 bg-emerald-500/20"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                      title={copiedField === "port" ? "Đã copy!" : "Copy"}
                    >
                      {copiedField === "port" ? (
                        <Check
                          size={16}
                          className="animate-in zoom-in duration-200"
                        />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={database.credentialInfo.username || ""}
                      readOnly
                      className="w-full px-4 py-2 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          database.credentialInfo.username,
                          "username"
                        )
                      }
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all ${
                        copiedField === "username"
                          ? "text-emerald-500 bg-emerald-500/20"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                      title={copiedField === "username" ? "Đã copy!" : "Copy"}
                    >
                      {copiedField === "username" ? (
                        <Check
                          size={16}
                          className="animate-in zoom-in duration-200"
                        />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={database.credentialInfo.password || ""}
                      readOnly
                      className="w-full px-4 py-2 pr-24 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                        title={showPassword ? "Ẩn password" : "Hiện password"}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            database.credentialInfo.password,
                            "password"
                          )
                        }
                        className={`p-1.5 rounded transition-all ${
                          copiedField === "password"
                            ? "text-emerald-500 bg-emerald-500/20"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                        }`}
                        title={copiedField === "password" ? "Đã copy!" : "Copy"}
                      >
                        {copiedField === "password" ? (
                          <Check
                            size={16}
                            className="animate-in zoom-in duration-200"
                          />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connection String */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Connection String
                  </label>
                  <div className="relative">
                    <textarea
                      value={database.credentialInfo.connectionString || ""}
                      readOnly
                      rows={3}
                      className="w-full px-4 py-2 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          database.credentialInfo.connectionString,
                          "connectionString"
                        )
                      }
                      className={`absolute right-2 top-2 p-1.5 rounded transition-all ${
                        copiedField === "connectionString"
                          ? "text-emerald-500 bg-emerald-500/20"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                      title={
                        copiedField === "connectionString" ? "Đã copy!" : "Copy"
                      }
                    >
                      {copiedField === "connectionString" ? (
                        <Check
                          size={16}
                          className="animate-in zoom-in duration-200"
                        />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Warning Notice */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="text-yellow-500 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-yellow-500">
                        <strong>Lưu ý:</strong> Không chia sẻ thông tin kết nối
                        này với người khác. Giữ mật khẩu của bạn an toàn!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Không có thông tin kết nối
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab Content */}
      {activeTab === "members" && (
        <div>
          {/* Invite Button */}
          <div className={`mb-6 flex justify-end `}>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 w-fit cursor-pointer "
            >
              <UserRoundPlus size={20} strokeWidth={2.5} />
              Thêm thành viên
            </Button>
          </div>

          {/* Members Table */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tên người dùng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Quyền
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tham gia
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          <Loader2 className="animate-spin" size={20} />
                          <span>Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : members.length > 0 ? (
                    members.map((member, index) => (
                      <tr
                        key={member.id || index}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                          index === members.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full ${getAvatarColor(
                                member.name
                              )} flex items-center justify-center text-white font-semibold text-sm`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {member.name}
                              </div>
                              <div className="text-slate-400 text-sm">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="px-6 py-4">
                          {getPermissionBadge(member.role)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400 text-sm">
                            {member.createdAt
                              ? new Date(member.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "Vừa xong"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user?.email ===
                            members.find((m) => m.role === "OWNER")?.email &&
                            member.role !== "OWNER" && (
                              <button
                                onClick={() => openMemberManageModal(member)}
                                className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg p-2 transition-colors cursor-pointer"
                              >
                                <EllipsisVertical size={18} />
                              </button>
                            )}
                          {user?.email ===
                            members.find((m) => m.role === "ADMIN")?.email &&
                            member.role !== "OWNER" &&
                            member.role !== "ADMIN" && (
                              <button
                                onClick={() => openConfirmRemoveModal(member)}
                                className="text-red-400 hover:text-red-500 hover:bg-slate-800/50 rounded-lg p-2 transition-colors cursor-pointer"
                                title="Xóa thành viên"
                              >
                                <Trash size={18} />
                              </button>
                            )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        Chưa có thành viên nào. Mời thành viên đầu tiên!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab Content */}
      {activeTab === "logs" && (
        <div>
          {/* Logs Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="text-purple-500" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Nhật ký hoạt động
                </h2>
                <p className="text-sm text-slate-400">
                  Lịch sử các thay đổi và hoạt động trên database
                </p>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang tải nhật ký...</span>
                </div>
              </div>
            ) : logs.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {logs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-6 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${getActionColor(
                          log.action
                        )}`}
                      >
                        {getActionIcon(log.action)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {/* User and Action Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-semibold">
                                {log.userName}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getActionColor(
                                  log.action
                                )}`}
                              >
                                {getActionIcon(log.action)}
                                {getActionLabel(log.action)}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-300">
                              {formatLogDetails(log)}
                            </p>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs whitespace-nowrap shrink-0">
                            <Clock size={14} />
                            <span>
                              {new Date(log.createdAt).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock size={48} className="mb-4 text-slate-600" />
                <p className="text-lg font-medium">Chưa có hoạt động nào</p>
                <p className="text-sm">Các hoạt động sẽ được ghi lại ở đây</p>
              </div>
            )}

            {/* Pagination */}
            {logs.length > 0 && logsTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-800/30">
                <span className="text-sm text-slate-400">
                  Trang {logsPage + 1} / {logsTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(logsPage - 1)}
                    disabled={logsPage === 0 || logsLoading}
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => fetchLogs(logsPage + 1)}
                    disabled={logsPage >= logsTotalPages - 1 || logsLoading}
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Remove Member Modal */}
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

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteFormData({ email: "", role: "Analyst" });
        }}
        title="Thêm thành viên"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={inviteFormData.email}
              onChange={(e) =>
                setInviteFormData({ ...inviteFormData, email: e.target.value })
              }
              disabled={inviteLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              value={inviteFormData.role}
              onChange={(e) =>
                setInviteFormData({ ...inviteFormData, role: e.target.value })
              }
              disabled={inviteLoading}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Chọn vai trò --</option>
              {roleOptions.slice(1, 4).map((role) => (
                <option key={role.value} value={role.value}>
                  {role.value}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2">
              {inviteFormData.role === "ADMIN" &&
                "Full access to manage database and team members"}
              {inviteFormData.role === "READWRITE" &&
                "Can read and write data but cannot delete databases"}
              {inviteFormData.role === "READONLY" && "Read-only access to data"}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsInviteModalOpen(false);
                setInviteFormData({ email: "", role: "Analyst" });
              }}
              disabled={inviteLoading}
              className="flex-1 bg-slate-800 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={inviteLoading} className="flex-1">
              {inviteLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Gửi...
                </span>
              ) : (
                "Gửi lời mời"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Management Modal */}
      <Modal
        isOpen={isMemberManageModalOpen}
        onClose={() => {
          setIsMemberManageModalOpen(false);
          setSelectedMember(null);
          setNewRole("");
        }}
        title="Quản lý thành viên"
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Member Info */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div
                className={`w-12 h-12 rounded-full ${getAvatarColor(
                  selectedMember.name
                )} flex items-center justify-center text-white font-semibold`}
              >
                {getInitials(selectedMember.name)}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  {selectedMember.name}
                </div>
                <div className="text-slate-400 text-sm">
                  {selectedMember.email}
                </div>
              </div>
              <div>{getRoleBadge(selectedMember.role)}</div>
            </div>

            {/* Edit Role Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vai trò mới
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  disabled={editRoleLoading || removeMemberLoading}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {roleOptions.slice(1, 4).map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.value} - {role.permission}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleUpdateMemberRole}
                disabled={
                  editRoleLoading ||
                  removeMemberLoading ||
                  newRole === selectedMember.role
                }
                className="w-full"
              >
                {editRoleLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Đang cập nhật...
                  </span>
                ) : (
                  "Cập nhật vai trò"
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700"></div>

            {/* Remove Member Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 size={18} />
                <h3 className="font-semibold">Xóa thành viên</h3>
              </div>
              <p className="text-sm text-slate-400">
                Thành viên này sẽ mất quyền truy cập vào database. Hành động này
                không thể hoàn tác.
              </p>
              <Button
                onClick={() => handleRemoveMember(selectedMember)}
                disabled={editRoleLoading || removeMemberLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {removeMemberLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Đang xóa...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 size={18} />
                    Xóa thành viên
                  </span>
                )}
              </Button>
            </div>

            {/* Cancel Button */}
            <Button
              onClick={() => {
                setIsMemberManageModalOpen(false);
                setSelectedMember(null);
                setNewRole("");
              }}
              disabled={editRoleLoading || removeMemberLoading}
              className="w-full bg-slate-800 hover:bg-slate-700"
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
