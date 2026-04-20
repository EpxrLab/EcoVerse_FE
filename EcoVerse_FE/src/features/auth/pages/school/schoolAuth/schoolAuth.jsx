import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Tabs, message } from "antd";
import {
  HomeOutlined,
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { z } from "zod";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  loginFunction,
  sendOTPVerification,
  verifyOTP,
} from "../../../services";

const { TabPane } = Tabs;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)",
    ),
});

export default function SchoolAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Email verification state
  const [registerStep, setRegisterStep] = useState("credentials");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const infor = {
        emailOrUsername: email,
        password: password,
      };
      const res = await loginFunction(infor);

      if (res && res.data.role === "PARTNERSHIP_SCHOOL") {
        toast.success("Đăng nhập thành công!");
        sessionStorage.setItem("accessToken", res?.data?.accessToken);
        sessionStorage.setItem("refreshToken", res?.data?.refreshToken);
        sessionStorage.setItem("role", res.data.role);
        navigate("/school");
      } else {
        toast.error("Đăng nhập thất bại!");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOTPVerification({ email });

      if (res) {
        message.success(
          "Vui lòng nhập mã xác thực gồm 6 chữ số được gửi qua Email bạn vừa đăng ky!",
        );
        setRegisterStep("verify");
        setResendCountdown(60);
      } else {
        message.error("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    } catch (error) {
      message.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      message.error("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      const info = {
        email: email,
        otp: String(code),
      };
      const res = await verifyOTP(info);
      if (res) {
        message.success(
          "Xác thực thành công! Đang chuyển đến trang đăng ký...",
        );
        sessionStorage.setItem("otpCode", code);
        sessionStorage.setItem("mail", email);
        sessionStorage.setItem("pass", password);
        navigate("/auth/school/register");
      } else {
        message.error(
          "Xác thực thất bại! Vui lòng kiểm tra lại mã được gửi trong mail của bạn.",
        );
      }
    } catch (error) {
      message.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(`Đã gửi lại mã xác thực đến ${email}`);
      setResendCountdown(60);
      setOtpCode(["", "", "", "", "", ""]);
    } catch (error) {
      message.error("Đã xảy ra lỗi khi gửi lại mã xác thực");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToCredentials = () => {
    setRegisterStep("credentials");
    setOtpCode(["", "", "", "", "", ""]);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
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
    <div className="min-h-screen bg-[#f1f9f1] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Organic background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#1f941f]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#1f941f]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#1f941f 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.button
        onClick={() => navigate("/auth")}
        className="fixed top-8 left-8 z-50
               flex items-center gap-2
               bg-white/80 backdrop-blur-md
               px-5 py-2.5 rounded-full shadow-lg shadow-green-900/5
               text-[#1f941f] hover:text-[#1f5e44]
               transition-all group border border-white/50"
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeftOutlined className="text-lg" />
        <span className="font-bold font-greenhouse-heading">Quay lại</span>
      </motion.button>

      <motion.div
        className="w-full max-w-lg relative z-10"
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#1f941f] to-[#1f5e44] mb-6 shadow-2xl shadow-green-900/20">
            <HomeOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#2e3430] font-greenhouse-heading tracking-tight">
            EcoVerse
          </h1>
          <p className="text-[#5b605c] mt-3 font-greenhouse-body font-medium">Cổng đăng ký dành cho Trường học</p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 shadow-[0_32px_64px_rgba(45,106,79,0.1)] border border-white/50">
            <Tabs
              defaultActiveKey="login"
              centered
              className="greenhouse-tabs w-full"
              tabBarStyle={{ marginBottom: "32px", borderBottom: 'none' }}
            >
              {/* Login Tab */}
              <TabPane tab={<span className="font-greenhouse-heading text-lg px-4">Đăng nhập</span>} key="login">
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2e3430] font-greenhouse-heading ml-1">
                      Email Trường Học
                    </label>
                    <Input
                      prefix={<MailOutlined className="text-[#1f941f] mr-2" />}
                      type="email"
                      placeholder="school@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="greenhouse-input-premium"
                      disabled={isLoading}
                      status={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs font-medium ml-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2e3430] font-greenhouse-heading ml-1">
                      Mật khẩu
                    </label>
                    <Input.Password
                      prefix={<LockOutlined className="text-[#1f941f] mr-2" />}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="greenhouse-input-premium"
                      disabled={isLoading}
                      status={errors.password ? "error" : ""}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs font-medium ml-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      className="text-sm font-bold text-[#1f941f] hover:text-[#1f5e44] transition-colors font-greenhouse-heading"
                      onClick={() => navigate("/auth/forgot-password")}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 bg-gradient-to-r from-[#1f941f] to-[#1f5e44] hover:from-[#1f5e44] hover:to-[#1f941f] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 transition-all duration-300 disabled:opacity-50 font-greenhouse-heading flex items-center justify-center gap-3"
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingOutlined /> : "Đăng nhập ngay"}
                  </motion.button>
                </form>
              </TabPane>

              {/* Register Tab */}
              <TabPane
                tab={<span className="font-greenhouse-heading text-lg px-4">Đăng ký</span>}
                key="register"
                disabled={registerStep === "verify"}
              >
                <AnimatePresence mode="wait">
                  {registerStep === "credentials" ? (
                    <motion.form
                      key="credentials"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                      onSubmit={handleSendOTP}
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#2e3430] font-greenhouse-heading ml-1">
                          Email Đại Diện
                        </label>
                        <Input
                          prefix={<MailOutlined className="text-[#1f941f] mr-2" />}
                          type="email"
                          placeholder="school@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="greenhouse-input-premium"
                          disabled={isLoading}
                          status={errors.email ? "error" : ""}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs font-medium ml-1">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#2e3430] font-greenhouse-heading ml-1">
                          Thiết lập mật khẩu
                        </label>
                        <Input.Password
                          prefix={<LockOutlined className="text-[#1f941f] mr-2" />}
                          placeholder="Ít nhất 8 ký tự, bao gồm chữ hoa & số"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="greenhouse-input-premium"
                          disabled={isLoading}
                          status={errors.password ? "error" : ""}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-xs font-medium ml-1">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-gradient-to-r from-[#1f941f] to-[#1f5e44] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 transition-all duration-300 disabled:opacity-50 font-greenhouse-heading mt-4 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? <LoadingOutlined /> : "Gửi mã xác thực"}
                      </motion.button>

                      <p className="text-xs text-center text-[#5b605c] font-medium leading-relaxed px-4">
                        Mã xác thực sẽ được gửi đến email của bạn. Đây là bước đầu để khởi tạo hồ sơ trường học trên EcoVerse.
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <button
                        onClick={handleBackToCredentials}
                        className="flex items-center gap-2 text-sm font-bold text-[#1f941f] hover:text-[#1f5e44] transition-all mb-4 font-greenhouse-heading"
                      >
                        <ArrowLeftOutlined className="text-xs" />
                        Trở lại thiết lập
                      </button>

                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f9faf6] mb-4 shadow-inner">
                          <KeyOutlined className="text-2xl text-[#1f941f]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#2e3430] font-greenhouse-heading">
                          Xác thực tài khoản
                        </h2>
                        <p className="text-[#5b605c] text-sm mt-2 font-greenhouse-body">
                          EcoVerse đã gửi mã số đến:
                          <br />
                          <span className="font-black text-[#1f941f]">
                            {email}
                          </span>
                        </p>
                      </div>

                      {/* OTP Input */}
                      <div className="flex justify-center gap-3 py-4">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            disabled={isLoading}
                            className="w-12 h-16 text-center text-2xl font-black text-[#1f941f] bg-white border-2 border-transparent border-b-[#1f941f]/20 rounded-xl focus:border-b-[#1f941f] focus:bg-[#f9faf6] focus:outline-none transition-all disabled:opacity-50 font-greenhouse-heading"
                          />
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerifyOTP}
                        disabled={isLoading || otpCode.join("").length !== 6}
                        className="w-full h-14 bg-gradient-to-r from-[#1f941f] to-[#1f5e44] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 transition-all duration-300 disabled:opacity-50 font-greenhouse-heading"
                      >
                        {isLoading ? <LoadingOutlined /> : "Xác thực danh tính"}
                      </motion.button>

                      <div className="text-center mt-6">
                        <p className="text-sm text-[#5b605c] mb-2 font-medium">
                          Chưa nhận được mã?
                        </p>
                        <button
                          onClick={handleResendOTP}
                          disabled={isResending || resendCountdown > 0}
                          className="text-[#1f941f] font-black text-sm hover:underline disabled:opacity-50 font-greenhouse-heading"
                        >
                          {isResending ? (
                            <LoadingOutlined className="mr-2" />
                          ) : resendCountdown > 0 ? (
                            `Gửi lại sau ${resendCountdown}s`
                          ) : (
                            "Gửi lại mã mới"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabPane>
            </Tabs>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-sm font-bold text-[#5b605c] mt-10 font-greenhouse-heading uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Hướng dẫn & Hỗ trợ?{" "}
          <a href="#" className="text-[#1f941f] hover:underline">
            Trung tâm trợ giúp
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
