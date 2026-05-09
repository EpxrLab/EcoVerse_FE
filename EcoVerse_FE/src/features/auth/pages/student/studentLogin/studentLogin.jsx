import { useState } from "react";
import { motion } from "framer-motion";
import { Input, Button } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
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

  const validate = () => {
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fe = {};
      result.error.errors.forEach((e) => {
        fe[e.path[0]] = e.message;
      });
      setErrors(fe);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = {
        emailOrUsername: username,
        password: password,
      };
      const res = await loginFunction(payload);
      if (res && res?.data?.role === "STUDENT") {
        toast.success("Đăng nhập thành công! Chào mừng bạn đến với EcoVerse");
        sessionStorage.setItem("accessToken", res?.data?.accessToken);
        sessionStorage.setItem("refreshToken", res?.data?.refreshToken);
        sessionStorage.setItem("role", res.data.role);

        if (res.data.isFirstLogin) {
          navigate("/student/profile", { state: { showChangePassword: true } });
        } else {
          navigate("/student");
        }
      } else {
        toast.error(res?.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
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
    <div className="min-h-screen bg-[#f7fcf2] flex items-center justify-center p-4 relative overflow-x-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#8ed645]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#8ed645]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#8ed645 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.button
        onClick={() => navigate("/auth")}
        className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-3
                   bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(20,83,45,0.1)]
                   text-[#8ed645] font-black text-sm border border-white/50 transition-all group"
        whileHover={{ x: -4, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeftOutlined className="text-sm" />
        <span className="font-greenhouse-heading tracking-widest uppercase text-xs">QUAY LẠI</span>
      </motion.button>

      <motion.div
        className="w-full max-w-xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#8ed645] to-[#8ed645] mb-6 shadow-xl shadow-green-900/10">
            <SmileOutlined className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#2e3430] font-greenhouse-heading tracking-tight mb-2">
            EcoVerse
          </h1>
          <p className="text-[#5b605c] font-black text-sm uppercase tracking-widest font-greenhouse-heading opacity-60">
            Cổng đăng nhập Học Sinh
          </p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-[0_32px_64px_rgba(20,83,45,0.1)] border border-white/50 overflow-hidden relative">
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-[#2e3430] mb-2 font-greenhouse-heading">
                  Chào mừng học sinh!
                </h2>
                <p className="text-[#5b605c] font-greenhouse-body font-medium">
                  Bắt đầu hành trình giải cứu trái đất cùng EcoVerse
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#2e3430] uppercase tracking-widest font-greenhouse-heading ml-1">
                    TÊN ĐĂNG NHẬP
                  </label>
                  <Input
                    prefix={<UserOutlined className="text-[#8ed645]/40 mr-2" />}
                    placeholder="VD: hocsinh_ecoverse"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrors((p) => ({ ...p, username: "" }));
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-14 rounded-2xl bg-[#f9faf6]/50 border-white/50 focus:bg-white transition-all font-greenhouse-body text-base"
                    disabled={isLoading}
                    status={errors.username ? "error" : ""}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#2e3430] uppercase tracking-widest font-greenhouse-heading ml-1">
                    MẬT KHẨU
                  </label>
                  <Input.Password
                    prefix={<LockOutlined className="text-[#8ed645]/40 mr-2" />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: "" }));
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-14 rounded-2xl bg-[#f9faf6]/50 border-white/50 focus:bg-white transition-all font-greenhouse-body text-base"
                    disabled={isLoading}
                    status={errors.password ? "error" : ""}
                    iconRender={(v) =>
                      v ? <EyeOutlined className="text-[#8ed645]/40" /> : <EyeInvisibleOutlined className="text-[#8ed645]/40" />
                    }
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.password}</p>
                  )}
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-16 bg-gradient-to-r from-[#8ed645] to-[#8ed645] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/10 transition-all duration-300 font-greenhouse-heading flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <LoadingOutlined className="text-xl" />
                        <span>ĐANG XỬ LÝ...</span>
                      </div>
                    ) : (
                      "ĐĂNG NHẬP NGAY"
                    )}
                  </motion.button>
                </div>

                <div className="mt-8 p-6 bg-[#8ed645]/5 rounded-[2rem] border border-[#8ed645]/10">
                  <p className="text-sm text-[#5b605c] text-center font-greenhouse-body leading-relaxed">
                    <span className="font-black font-greenhouse-heading tracking-widest text-[10px] uppercase block mb-1 opacity-60">
                      💡 Mẹo nhỏ cho bạn
                    </span>
                    Sử dụng tên đăng nhập và mật khẩu được thầy cô giáo cung cấp để vào chơi game nhé!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button 
            onClick={() => navigate("/")}
            className="text-xs font-black text-[#5b605c] hover:text-[#8ed645] transition-all uppercase tracking-[0.2em] font-greenhouse-heading"
          >
            ← TRANG CHỦ ECOVERSE
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
