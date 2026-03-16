import { useState } from "react";
import { motion } from "framer-motion";
import { Input, Button, Card, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { loginFunction } from "../../../services";
import { pass } from "three/src/nodes/TSL.js";

const validateForm = (email, password) => {
  const errors = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Email không hợp lệ";
  }
  if (!password || password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }
  return errors;
};

export default function AdminAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const errs = validateForm(email, password);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const payload = {
        emailOrUsername: email,
        password: password,
      };
      const res = await loginFunction(payload);

      if (res && res.data.role === "ADMINISTRATOR") {
        message.success("Đăng nhập thành công!");
        sessionStorage.setItem("accessToken", res.data.accessToken);
        sessionStorage.setItem("refreshToken", res.data.refreshToken);
        sessionStorage.setItem("role", res.data.role);
        navigate("/admin");
      } else {
        message.error("Đăng nhập thất bại!");
      }
    } catch {
      message.error("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Back button */}
      <motion.button
        onClick={() => navigate("/auth")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2
                   bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg
                   text-gray-600 hover:text-violet-600 transition-colors"
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeftOutlined className="text-lg" />
        <span className="font-medium">Quay lại</span>
      </motion.button>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 mb-4 shadow-md">
            <CrownOutlined className="text-3xl text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EcoVerse</h1>
          <p className="text-gray-500 mt-2">Cổng quản trị hệ thống</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card
            className="border-0 shadow-2xl rounded-3xl overflow-hidden"
            bodyStyle={{ padding: "32px 28px" }}
          >
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  Chào mừng, Admin!
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Đăng nhập để truy cập bảng điều khiển
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  type="email"
                  placeholder="admin@ecoverse.vn"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                  onKeyDown={handleKeyDown}
                  size="large"
                  disabled={isLoading}
                  status={errors.email ? "error" : ""}
                  className="rounded-lg"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  onKeyDown={handleKeyDown}
                  size="large"
                  disabled={isLoading}
                  status={errors.password ? "error" : ""}
                  iconRender={(v) =>
                    v ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  className="rounded-lg"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end -mt-1">
                <button className="text-xs text-violet-600 hover:underline">
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleLogin}
                loading={isLoading}
                className="bg-violet-600 hover:bg-violet-700 border-violet-600 hover:border-violet-700 rounded-xl h-11 font-semibold"
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              {/* Security notice */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 border border-violet-100">
                <span className="text-base">🔐</span>
                <p className="text-xs text-violet-600">
                  Khu vực dành riêng cho quản trị viên. Mọi truy cập đều được
                  ghi lại.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Cần hỗ trợ?{" "}
          <a href="#" className="text-violet-600 hover:underline">
            Liên hệ với chúng tôi
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
