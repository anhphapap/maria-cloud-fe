import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Loader2, X } from "lucide-react";
import Button from "./Button";

export default function ConnectionInfoModal({
  isOpen,
  onClose,
  dbInfo,
  loading,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const InfoField = ({ label, value, fieldName, isPassword = false }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          value={value || ""}
          readOnly
          className="w-full px-4 py-2 pr-24 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
              title={showPassword ? "Ẩn password" : "Hiện password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => copyToClipboard(value, fieldName)}
            className={`relative p-1.5 rounded transition-all ${
              copiedField === fieldName
                ? "text-emerald-500 bg-emerald-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
            }`}
            title={copiedField === fieldName ? "Đã copy!" : "Copy"}
          >
            {copiedField === fieldName ? (
              <Check size={16} className="animate-in zoom-in duration-200" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Thông tin kết nối</h2>
            {dbInfo && (
              <p className="text-sm text-slate-400 mt-1">
                Database:{" "}
                <span className="text-emerald-500 font-bold">
                  {dbInfo.name}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : dbInfo?.credentialInfo ? (
            <div className="space-y-4">
              <InfoField
                label="Host"
                value={dbInfo.credentialInfo.hostname}
                fieldName="host"
              />

              <InfoField
                label="Port"
                value={dbInfo.credentialInfo.port?.toString()}
                fieldName="port"
              />

              <InfoField
                label="Username"
                value={dbInfo.credentialInfo.username}
                fieldName="username"
              />

              <InfoField
                label="Password"
                value={dbInfo.credentialInfo.password}
                fieldName="password"
                isPassword={true}
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Connection String
                </label>
                <div className="relative">
                  <textarea
                    value={dbInfo.credentialInfo.connectionString || ""}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-2 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        dbInfo.credentialInfo.connectionString,
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

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-500">
                  <strong>Lưu ý:</strong> Không chia sẻ thông tin kết nối này
                  với người khác. Giữ mật khẩu của bạn an toàn!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Không có thông tin kết nối
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
