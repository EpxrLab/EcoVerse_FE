import { useState } from "react";
import { motion } from "framer-motion";
import { Input, Button, Card, message } from "antd";
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
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
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
          "Đăng nhập thành công! Chào mừng bạn đến với EcoVerse 🌱",
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
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-5xl opacity-20"
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          🌳
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-4xl opacity-20"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          📚
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 text-6xl opacity-20"
          animate={{ scale: [1, 1.1, 1], rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          🎒
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-10 text-5xl opacity-20"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          ✏️
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-10 text-4xl opacity-20"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          🌈
        </motion.div>
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/auth")}
          className="fixed top-6 left-6 z-50 
             flex items-center gap-2 
             text-gray-600 hover:text-green-600 
             transition-colors group
             bg-white/80 backdrop-blur-md 
             px-4 py-2 rounded-full shadow-lg"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftOutlined className="text-lg" />
          <span className="font-medium">Quay lại</span>
        </motion.button>

        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl">
              <SmileOutlined className="text-4xl text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold text-primary">
            EcoVerse
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Chào bạn nhỏ! 🌱</p>
          <p className="text-gray-500 text-sm">
            Đăng nhập để khám phá thế giới xanh
          </p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="border-0 shadow-2xl overflow-hidden"
            style={{
              borderRadius: "24px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Gradient Header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary/40" />

            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Đăng nhập học sinh 🎓
                </h2>
                <p className="text-gray-600 text-sm">
                  Nhập tài khoản do trường cung cấp
                </p>
              </div>

              <div className="space-y-4">
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập
                  </label>
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="VD: nguyenvana"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="large"
                    disabled={isLoading}
                    status={errors.username ? "error" : ""}
                    className="rounded-xl"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="large"
                    disabled={isLoading}
                    status={errors.password ? "error" : ""}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    className="rounded-xl"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Login Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleLogin}
                    loading={isLoading}
                    className="bg-primary hover:bg-emerald-600 border-0 h-12 rounded-xl font-semibold text-base shadow-lg mt-6"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập 🚀"}
                  </Button>
                </motion.div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-medium text-green-700">
                      💡 Lưu ý:
                    </span>{" "}
                    Tài khoản được cung cấp bởi giáo viên của bạn
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-600 text-sm mb-2">
            Quên mật khẩu?{" "}
            <a
              href="#"
              className="text-green-600 hover:text-green-700 font-medium hover:underline"
            >
              Hỏi giáo viên
            </a>
          </p>
          <p className="text-gray-500 text-xs">
            🌍 Cùng nhau bảo vệ môi trường 🌍
          </p>
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
