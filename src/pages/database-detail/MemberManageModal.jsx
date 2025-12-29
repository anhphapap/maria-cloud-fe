import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import {
  getRoleBadge,
  getInitials,
  getAvatarColor,
  roleOptions,
} from "./database.utils.jsx";

export default function MemberManageModal({
  isOpen,
  onClose,
  member,
  onUpdateRole,
  onRemoveMember,
  editRoleLoading,
  removeMemberLoading,
}) {
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (member) {
      setNewRole(member.role);
    }
  }, [member]);

  const handleClose = () => {
    setNewRole("");
    onClose();
  };

  const handleUpdateRole = async () => {
    await onUpdateRole(member, newRole);
  };

  const handleRemove = async () => {
    await onRemoveMember(member);
  };

  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quản lý thành viên">
      <div className="space-y-6">
        {/* Member Info */}
        <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div
            className={`w-12 h-12 rounded-full ${getAvatarColor(
              member.name
            )} flex items-center justify-center text-white font-semibold`}
          >
            {getInitials(member.name)}
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">{member.name}</div>
            <div className="text-slate-400 text-sm">{member.email}</div>
          </div>
          <div>{getRoleBadge(member.role)}</div>
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
            onClick={handleUpdateRole}
            disabled={
              editRoleLoading || removeMemberLoading || newRole === member.role
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
            onClick={handleRemove}
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
          onClick={handleClose}
          disabled={editRoleLoading || removeMemberLoading}
          className="w-full bg-slate-800 hover:bg-slate-700"
        >
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
