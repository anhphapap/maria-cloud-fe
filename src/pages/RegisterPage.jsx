import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useToast } from "../contexts/ToastContext";
import Apis, { endpoints } from "../config/api.config";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.name.trim() ||
      !formData.email.trim()
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const response = await Apis.post(endpoints.register, {
        username: formData.username.trim(),
        password: formData.password,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      if (response.data.code === 201) {
        addToast("Đăng ký thành công! Vui lòng đăng nhập", "success");
        navigate("/login");
      } else {
        setError(response.data.message || "Đăng ký thất bại!");
        addToast(response.data.message || "Đăng ký thất bại!", "error");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra!";
      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
            <span className="text-3xl font-bold text-emerald-500">€</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Đăng ký</h1>
          <p className="text-slate-400">
            CloudBase - Quản lý database của bạn trên cloud
          </p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên hiển thị
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Nhập tên hiển thị"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên đăng nhập
              </label>
              <Input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="mt-6" disabled={loading}>
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
                  Đang đăng ký...
                </span>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-emerald-500 hover:text-emerald-400 font-medium"
            >
              Đăng nhập
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
