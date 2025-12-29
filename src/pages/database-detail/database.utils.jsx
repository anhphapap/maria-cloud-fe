// Helper functions for database detail page
import { Plus, Trash2, Edit3, Activity } from "lucide-react";

export const roleOptions = [
  { value: "OWNER", permission: "Full Access", color: "emerald" },
  { value: "ADMIN", permission: "Full Access", color: "blue" },
  { value: "READWRITE", permission: "Read & Write", color: "purple" },
  { value: "READONLY", permission: "Read-only", color: "slate" },
];

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name) => {
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

export const getRoleBadge = (role) => {
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

export const getPermissionBadge = (role) => {
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

export const getActionLabel = (action) => {
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

export const getActionColor = (action) => {
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

export const getActionIcon = (action) => {
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

export const formatLogDetails = (log) => {
  try {
    const details = JSON.parse(log.details || "{}");
    const action = log.action;

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
