import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Database,
  ArrowRight,
  Shield,
  Clock,
  Globe,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useToast } from "../contexts/ToastContext";
import Apis, { authApis, endpoints } from "../config/api.config";
import { MyUserContext, MyDispatchContext } from "../contexts/UserContext";

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const currentUser = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);

  const [invitationInfo, setInvitationInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [emailMismatch, setEmailMismatch] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ hoặc không tồn tại");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        setError("Lời mời đã hết hạn");
        return;
      }

      setInvitationInfo(decoded);

      const currentEmail = currentUser?.email || currentUser?.sub;
      if (
        currentEmail &&
        decoded.email &&
        currentEmail.toLowerCase() !== decoded.email.toLowerCase()
      ) {
        setEmailMismatch(true);
      }

      const updateTimeRemaining = () => {
        const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
        if (timeLeft <= 0) {
          setError("Lời mời đã hết hạn");
          return;
        }

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);

        if (hours > 0) {
          setTimeRemaining(`${hours} giờ ${minutes} phút`);
        } else {
          setTimeRemaining(`${minutes} phút`);
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000);

      return () => clearInterval(interval);
    } catch (err) {
      setError("Token không hợp lệ");
    }
  }, [token, currentUser]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      const response = await authApis().post(endpoints.acceptInvitation, {
        dbId: invitationInfo.dbId,
        email: invitationInfo.email,
        role: invitationInfo.role,
      });

      if (response.data.code === 200) {
        addToast("Chấp nhận lời mời thành công!", "success");
        navigate(`/databases/${invitationInfo.dbId}`);
      } else {
        addToast(response.data.message || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      addToast(
        error.response?.data?.message || "Không thể chấp nhận lời mời",
        "error"
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    addToast("Đã từ chối lời mời", "info");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    dispatch({ type: "logout" });
    addToast("Đã đăng xuất. Vui lòng đăng nhập bằng tài khoản đúng.", "info");
  };

  const getRoleInfo = (role) => {
    const roles = {
      ADMIN: {
        label: "Admin",
        description: "Toàn quyền quản lý schema và dữ liệu.",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
      },
      READONLY: {
        label: "Read Only",
        description: "Chỉ có quyền xem dữ liệu.",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
      },
      READWRITE: {
        label: "Read & Write",
        description: "Có quyền đọc và ghi dữ liệu.",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
      },
    };
    return roles[role] || roles.READONLY;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 backdrop-blur-sm max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Lời mời không hợp lệ
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Quay lại trang chủ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!invitationInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(invitationInfo.role);

  return (
    <div className="bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Lời mời tham gia database
          </h1>
          <p className="text-slate-400">
            Bạn đã được mời tham gia vào database{" "}
            <span className="text-emerald-400 font-medium">
              {invitationInfo.dbName}
            </span>{" "}
            bởi{" "}
            <span className="text-emerald-400 font-medium">
              {invitationInfo.inviterName}
            </span>
            .
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
          {/* Invitation Visual */}
          <div className="flex items-center justify-center gap-6 mb-8 pb-8 border-b border-slate-800">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {invitationInfo.inviterName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-6 h-6 text-slate-600" />

            {/* Database Icon */}
            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Database className="w-10 h-10 text-emerald-500" />
            </div>
          </div>

          {/* Database Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Mời tham gia vào database {invitationInfo.dbName}
            </h2>
            <p className="text-slate-400 mb-4">
              Bởi{" "}
              <span className="text-emerald-400 font-medium">
                {invitationInfo.inviterName}
              </span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-400">
                Chờ xác nhận
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Assigned Role */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${roleInfo.bgColor} border ${roleInfo.borderColor}`}
                >
                  <Shield className={`w-5 h-5 ${roleInfo.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">VAI TRÒ</p>
                  <p className={`font-semibold ${roleInfo.color} mb-1`}>
                    {roleInfo.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {roleInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Invitation Expires */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">HẠN XÁC NHẬN</p>
                  <p className="font-semibold text-yellow-400 mb-1">
                    {timeRemaining}
                  </p>
                  <p className="text-xs text-slate-500">
                    Xác nhận trước{" "}
                    {new Date(invitationInfo.exp * 1000).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Permissions */}
          {/* {invitationInfo.role === "ADMIN" && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 mb-6">
              <p className="text-sm font-medium text-slate-300 mb-3">
                Quyền của Admin bao gồm:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Tạo, sửa, và xóa bảng dữ liệu</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Quản lý người dùng và API keys</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Xem log hiệu suất truy vấn thời gian thực</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Cấu hình backup và replication</span>
                </div>
              </div>
            </div>
          )} */}

          {/* Footer */}
          <div className="pt-6 border-t border-slate-800">
            {/* Email Mismatch Warning */}
            {emailMismatch ? (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-400 font-semibold mb-2">
                      Sai tài khoản!
                    </h3>
                    <p className="text-sm text-slate-300 mb-3">
                      Lời mời này dành cho{" "}
                      <span className="font-medium text-red-400">
                        {invitationInfo.email}
                      </span>
                      , nhưng bạn đang đăng nhập bằng tài khoản khác. Vui lòng
                      đăng xuất và đăng nhập bằng tài khoản đúng để chấp nhận
                      lời mời.
                    </p>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="border-red-500/50 hover:bg-red-500/10 text-red-400 cursor-pointer"
                    >
                      Đăng xuất và đăng nhập lại
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={loading}
                  className="flex-1 border-slate-700 hover:bg-slate-800 cursor-pointer"
                >
                  Từ chối lời mời
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={loading || emailMismatch}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
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
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Chấp nhận lời mời
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
