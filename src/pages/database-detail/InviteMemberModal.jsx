import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { roleOptions } from "./database.utils.jsx";

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  loading,
}) {
  const [formData, setFormData] = useState({
    email: "",
    role: "Analyst",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onInvite(formData);
  };

  const handleClose = () => {
    setFormData({ email: "", role: "Analyst" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Thêm thành viên">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="colleague@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Vai trò <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            disabled={loading}
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
            {formData.role === "ADMIN" &&
              "Full access to manage database and team members"}
            {formData.role === "READWRITE" &&
              "Can read and write data but cannot delete databases"}
            {formData.role === "READONLY" && "Read-only access to data"}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-slate-800 hover:bg-slate-700"
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
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
  );
}
