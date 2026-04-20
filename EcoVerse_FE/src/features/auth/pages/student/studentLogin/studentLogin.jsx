import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { z } from "zod";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { loginFunction } from "../../../services";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" }),
  password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
});

export default function StudentLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "username") fieldErrors.username = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        emailOrUsername: username,
        password: password,
      };
      const res = await loginFunction(payload);
      if (res && res.data.role === "STUDENT") {
        toast.success(
          "Đăng nhập thành công! Chào mừng bạn đến với EcoVerse",
        );
        sessionStorage.setItem("accessToken", res?.data?.accessToken);
        sessionStorage.setItem("refreshToken", res?.data?.refreshToken);
        sessionStorage.setItem("role", res.data.role);
        navigate("/student");
      } else {
        toast.error("Đăng nhập thất bại!");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#f7fcf2] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#8ed645]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#8ed645]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#8ed645 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        className="w-full max-w-xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/auth")}
          className="fixed top-8 left-8 z-50 flex items-center gap-3
                     bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(56,176,0,0.1)]
                     text-[#1f2b11] font-black text-sm border border-white/50 transition-all group"
          whileHover={{ x: -4, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeftOutlined className="text-sm" />
          <span className="font-greenhouse-heading tracking-widest uppercase text-xs">QUAY LẠI</span>
        </motion.button>

        <motion.div variants={cardVariants}>
          <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 shadow-[0_48px_96px_-12px_rgba(142,214,69,0.15)] border border-white/60 relative overflow-hidden">
            {/* Internal polish blurs */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#8ed645]/10 rounded-full blur-3xl" />
            
            <div className="relative space-y-12">
              <div className="text-center">
                <motion.div
                  className="inline-block relative mb-8"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#f7fcf2] to-[#8ed645] rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#8ed645]/20">
                    <SmileOutlined className="text-4xl text-white" />
                  </div>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1f2b11] font-greenhouse-heading tracking-tight mb-3">
                  EcoVerse <span className="text-[#8ed645]">!</span>
                </h1>
                <p className="text-[#3c5221] font-black text-xs uppercase tracking-[0.25em] font-greenhouse-heading">
                  Dành cho Học Sinh
                </p>
              </div>

              <div className="space-y-6">
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#1f2b11] uppercase tracking-widest font-greenhouse-heading ml-1">
                    TÊN ĐĂNG NHẬP
                  </label>
                  <Input
                    prefix={<UserOutlined className="text-[#8ed645]/60 mr-2" />}
                    placeholder="VD: hocsinh_ecoverse"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 rounded-2xl bg-[#f7fcf2]/50 border-[#8ed645]/20 focus:bg-white transition-all font-greenhouse-body text-base"
                    disabled={isLoading}
                    status={errors.username ? "error" : ""}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.username}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#1f2b11] uppercase tracking-widest font-greenhouse-heading ml-1">
                    MẬT KHẨU
                  </label>
                  <Input.Password
                    prefix={<LockOutlined className="text-[#8ed645]/60 mr-2" />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-2xl bg-[#f7fcf2]/50 border-[#8ed645]/20 focus:bg-white transition-all font-greenhouse-body text-base"
                    disabled={isLoading}
                    status={errors.password ? "error" : ""}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined className="text-[#8ed645]/60" /> : <EyeInvisibleOutlined className="text-[#8ed645]/60" />
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
                    className="w-full h-16 bg-gradient-to-r from-[#8ed645] to-[#7bc23a] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#8ed645]/20 transition-all duration-300 font-greenhouse-heading flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP NGAY"}
                  </motion.button>
                </div>

                {/* Help Text */}
                <div className="mt-8 p-6 bg-[#8ed645]/10 rounded-[2rem] border border-[#8ed645]/10">
                  <p className="text-sm text-[#1f2b11] text-center font-greenhouse-body leading-relaxed">
                    <span className="font-black font-greenhouse-heading tracking-widest text-xs uppercase block mb-1">
                      💡 Mẹo nhỏ cho bạn
                    </span>
                    Sử dụng tên đăng nhập và mật khẩu được thầy cô giáo cung cấp để vào chơi game nhé!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-10 text-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[#5b605c] font-black text-xs uppercase tracking-widest font-greenhouse-heading opacity-40">
            🌍 CÙNG NHAU BẢO VỆ MÔI TRƯỜNG 🌍
          </p>

          <button 
            onClick={() => navigate("/")}
            className="text-xs font-black text-[#5b605c] hover:text-[#8ed645] transition-all uppercase tracking-[0.2em] font-greenhouse-heading block w-full"
          >
            ← TRANG CHỦ ECOVERSE
          </button>
        </motion.div>
      </motion.div>

      {/* Floating Circles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "10%", left: "5%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "10%", right: "5%" }}
        />
      </div>
    </div>
  );
}
