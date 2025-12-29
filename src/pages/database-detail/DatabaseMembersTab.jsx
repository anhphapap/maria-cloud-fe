import { Loader2, EllipsisVertical, Trash, UserRoundPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  getRoleBadge,
  getPermissionBadge,
  getInitials,
  getAvatarColor,
} from "./database.utils.jsx";

export default function DatabaseMembersTab({
  members,
  loading,
  currentUserEmail,
  onInviteMember,
  onManageMember,
  onRemoveMember,
}) {
  const ownerEmail = members.find((m) => m.role === "OWNER")?.email;
  const adminEmail = members.find((m) => m.role === "ADMIN")?.email;
  const isOwner = currentUserEmail === ownerEmail;
  const isAdmin = currentUserEmail === adminEmail;

  return (
    <div>
      {/* Invite Button */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={onInviteMember}
          className="flex items-center gap-2 w-fit cursor-pointer"
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
                    <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
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
                      {isOwner && member.role !== "OWNER" && (
                        <button
                          onClick={() => onManageMember(member)}
                          className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg p-2 transition-colors cursor-pointer"
                        >
                          <EllipsisVertical size={18} />
                        </button>
                      )}
                      {isAdmin &&
                        member.role !== "OWNER" &&
                        member.role !== "ADMIN" && (
                          <button
                            onClick={() => onRemoveMember(member)}
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
  );
}
