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
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
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

      if (res && res?.data?.role === "ADMINISTRATOR") {
        message.success("Đăng nhập thành công!");
        sessionStorage.setItem("accessToken", res.data.accessToken);
        sessionStorage.setItem("refreshToken", res.data.refreshToken);
        sessionStorage.setItem("role", res.data.role);
        navigate("/admin");
      } else {
        message.error(res?.message || "Đăng nhập thất bại!");
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
    <div className="min-h-screen bg-[#0f1110] flex items-center justify-center p-4 relative overflow-x-hidden">
      {/* High-security background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1db1d1]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#b1f0ce]/20 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#1db1d1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

        <motion.button
          onClick={() => navigate("/auth")}
          className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-3
                     bg-white/5 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10
                     text-white font-black text-xs tracking-widest transition-all group hover:bg-white/10"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeftOutlined className="text-sm" />
          <span className="font-greenhouse-heading uppercase">QUAY LẠI</span>
        </motion.button>

      <motion.div
        className="w-full max-w-xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1db1d1] to-[#1db1d1] mb-6 shadow-2xl shadow-[#1db1d1]/40">
            <CrownOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white font-greenhouse-heading tracking-tight mb-2">
            EcoVerse
          </h1>
          <p className="text-[#1db1d1] font-black text-xs uppercase tracking-[0.3em] font-greenhouse-heading">
            BẢO MẬT HỆ THỐNG
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-[0_64px_128px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative">
            {/* Subtle glow edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#1db1d1]/50 to-transparent shadow-[0_0_20px_rgba(29,177,209,0.3)]" />
            
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2 font-greenhouse-heading">
                  Chào Quản Trị Viên
                </h2>
                <p className="text-white/40 font-greenhouse-body font-medium">
                  Vui lòng cung cấp danh tính để truy cập bảng điều khiển
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-white/40 uppercase tracking-widest font-greenhouse-heading ml-1">
                    ĐỊA CHỈ EMAIL
                  </label>
                  <Input
                    variant="borderless"
                    prefix={<MailOutlined className="text-[#1db1d1]/50 mr-2" />}
                    type="email"
                    placeholder="admin@ecoverse.systems"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-14 rounded-2xl !bg-white/5 border border-white/10 text-white placeholder:text-white/20 hover:!bg-white/10 focus:!bg-white/10 transition-all font-greenhouse-body text-base"
                    disabled={isLoading}
                    status={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-white/40 uppercase tracking-widest font-greenhouse-heading ml-1">
                    MẬT KHẨU CẤP CAO
                  </label>
                  <Input.Password
                    variant="borderless"
                    prefix={<LockOutlined className="text-[#1db1d1]/50 mr-2" />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: "" }));
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-14 rounded-2xl !bg-white/5 border border-white/10 text-white placeholder:text-white/20 hover:!bg-white/10 focus:!bg-white/10 transition-all font-greenhouse-body text-base"
                    disabled={isLoading}
                    status={errors.password ? "error" : ""}
                    iconRender={(v) =>
                      v ? <EyeOutlined className="text-[#1db1d1]/50" /> : <EyeInvisibleOutlined className="text-[#1db1d1]/50" />
                    }
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.password}</p>
                  )}
                </div>

                {/* Login Button */}
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-16 bg-gradient-to-r from-[#1db1d1] to-[#1db1d1] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#1db1d1]/20 transition-all duration-300 font-greenhouse-heading flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? "XÁC MINH DANH TÍNH..." : "ĐĂNG NHẬP HỆ THỐNG"}
                  </motion.button>
                </div>

                {/* Security notice */}
                <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-[#1db1d1]/10 border border-[#1db1d1]/20">
                  <span className="text-xl">🔐</span>
                  <p className="text-xs text-[#1db1d1] font-bold font-greenhouse-body leading-relaxed">
                    HỆ THỐNG GIÁM SÁT: Mọi truy cập trái phép hoặc khả nghi sẽ được tự động báo cáo cho ban quản lý.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-xs font-black text-white/40 uppercase tracking-[0.2em] mt-10 font-greenhouse-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          © 2024 ECOVERSE SECURITY LAYER
        </motion.p>
      </motion.div>
    </div>
  );
}
