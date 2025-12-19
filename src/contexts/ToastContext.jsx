import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertCircle } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-600/80 border-emerald-500/50";
      case "error":
        return "bg-red-600/80 border-red-500/50";
      case "warning":
        return "bg-yellow-600/80 border-yellow-500/50";
      default:
        return "bg-slate-800/80 border-slate-700/50";
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "warning":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-1/2 translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md ${getToastStyles(
              toast.type
            )} animate-slideInRight`}
          >
            <span className="text-white">{getToastIcon(toast.type)}</span>
            <span className="font-medium text-white">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
