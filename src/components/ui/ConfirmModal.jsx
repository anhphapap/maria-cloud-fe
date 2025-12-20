import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
  confirmText = "Xóa",
  cancelText = "Hủy",
  loading = false,
  variant = "danger", // danger, warning, info
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-4">
            <div
              className={`w-12 h-12 rounded-full ${styles.bg} border ${styles.border} flex items-center justify-center flex-shrink-0`}
            >
              <AlertTriangle size={24} className={styles.icon} />
            </div>
            <div className="flex-1">
              <p className="text-slate-300 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 ${styles.button}`}
            >
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
                  Đang xóa...
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

