import { useState } from "react";
import {
  Database,
  Info,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function DatabaseConnectionTab({ database, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Không thể sao chép", err);
    }
  };

  return (
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
                    copyToClipboard(database.credentialInfo.hostname, "host")
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    <strong>Lưu ý:</strong> Không chia sẻ thông tin kết nối này
                    với người khác. Giữ mật khẩu của bạn an toàn!
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
  );
}
