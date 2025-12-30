import { Clock, Loader2, ChevronLeft, ChevronRight, Table } from "lucide-react";
import {
  getActionColor,
  getActionIcon,
  getActionLabel,
  formatLogDetails,
} from "./database.utils.jsx";

const LogDescription = ({ log }) => {
  const description = formatLogDetails(log);
  
  // Parse table name from details if available
  try {
    const details = JSON.parse(log.details || "{}");
    if (details.tableName) {
      // Highlight table name in description
      const parts = description.split(`"${details.tableName}"`);
      if (parts.length > 1) {
        return (
          <>
            {parts[0]}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 text-emerald-400 rounded font-medium">
              <Table size={12} />
              {details.tableName}
            </span>
            {parts[1]}
          </>
        );
      }
    }
  } catch (error) {
    // Fall through to default
  }
  
  return <>{description}</>;
};

export default function DatabaseLogsTab({
  logs,
  logsLoading,
  logsPage,
  logsTotalPages,
  onPageChange,
}) {
  return (
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
                        <div className="text-sm text-slate-300">
                          <LogDescription log={log} />
                        </div>
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
                onClick={() => onPageChange(logsPage - 1)}
                disabled={logsPage === 0 || logsLoading}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => onPageChange(logsPage + 1)}
                disabled={logsPage >= logsTotalPages - 1 || logsLoading}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
