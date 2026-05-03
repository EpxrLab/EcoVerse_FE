import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, Tabs, message } from "antd";
import {
  HomeOutlined,
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
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
  const [activeTab, setActiveTab] = useState("login");
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

  const validate = () => {
    const result = loginSchema.safeParse({ email, password });
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
        emailOrUsername: email,
        password: password,
      };
      const res = await loginFunction(payload);

      if (res && res?.data?.role === "PARTNERSHIP_SCHOOL") {
        toast.success("Đăng nhập thành công!");
        sessionStorage.setItem("accessToken", res?.data?.accessToken);
        sessionStorage.setItem("refreshToken", res?.data?.refreshToken);
        sessionStorage.setItem("role", res.data.role);
        navigate("/school");
      } else {
        toast.error(res?.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await sendOTPVerification({ email });

      if (res) {
        message.success(
          "Vui lòng nhập mã xác thực gồm 6 chữ số được gửi qua Email bạn vừa đăng ký!",
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
        toast.success(
          "Xác thực thành công! Đang chuyển đến trang đăng ký hồ sơ trường học...",
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
      toast.error(error.response.data.message);
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
      const nextInput = document.getElementById(`otp-s-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-s-${index - 1}`);
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
    <div className="min-h-screen bg-[#f1f9f1] flex items-center justify-center p-4 relative overflow-x-hidden">
      {/* Organic background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#1f941f]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#1f941f]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#1f941f 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.button
        onClick={() => navigate("/auth")}
        className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-3
                   bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(20,83,45,0.1)]
                   text-[#1f941f] font-black text-sm border border-white/50 transition-all group"
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#1f941f] to-[#1f941f] mb-6 shadow-xl shadow-green-900/10">
            <HomeOutlined className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#2e3430] font-greenhouse-heading tracking-tight mb-2">
            EcoVerse
          </h1>
          <p className="text-[#5b605c] font-black text-sm uppercase tracking-widest font-greenhouse-heading opacity-60">
            Cổng thông tin Trường học
          </p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-[0_32px_64px_rgba(20,83,45,0.1)] border border-white/50 overflow-hidden relative">
            <Tabs
              activeKey={activeTab}
              onChange={(k) => {
                setActiveTab(k);
                setRegisterStep("credentials");
              }}
              centered
              className="greenhouse-tabs"
              tabBarStyle={{ marginBottom: "40px", border: "none" }}
            >
              {/* ── Login ── */}
              <TabPane
                tab={
                  <span className="font-greenhouse-heading font-black text-sm uppercase tracking-widest px-4">
                    ĐĂNG NHẬP
                  </span>
                }
                key="login"
              >
                <div className="space-y-8">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-[#2e3430] mb-2 font-greenhouse-heading">
                      Chào mừng trở lại!
                    </h2>
                    <p className="text-[#5b605c] font-greenhouse-body font-medium">
                      Tiếp tục hành trình kiến tạo tương lai xanh
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[#2e3430] uppercase tracking-widest font-greenhouse-heading ml-1">
                        EMAIL TRƯỜNG HỌC
                      </label>
                      <Input
                        prefix={<MailOutlined className="text-[#1f941f]/40 mr-2" />}
                        type="email"
                        placeholder="school@ecoverse.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((p) => ({ ...p, email: "" }));
                        }}
                        className="h-14 rounded-2xl bg-[#f9faf6]/50 border-white/50 focus:bg-white transition-all font-greenhouse-body text-base"
                        disabled={isLoading}
                        status={errors.email ? "error" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-xs font-black text-[#2e3430] uppercase tracking-widest font-greenhouse-heading ml-1">
                          MẬT KHẨU
                        </label>
                        <Button
                          type="link"
                          size="small"
                          className="text-[#1f941f]/60 hover:text-[#1f941f] p-0 h-auto font-black text-[10px] uppercase tracking-tighter font-greenhouse-heading transition-all"
                          onClick={() => navigate("/auth/forgot-password")}
                        >
                          Quên mật khẩu?
                        </Button>
                      </div>
                      <Input.Password
                        prefix={<LockOutlined className="text-[#1f941f]/40 mr-2" />}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((p) => ({ ...p, password: "" }));
                        }}
                        className="h-14 rounded-2xl bg-[#f9faf6]/50 border-white/50 focus:bg-white transition-all font-greenhouse-body text-base"
                        disabled={isLoading}
                        status={errors.password ? "error" : ""}
                        iconRender={(v) =>
                          v ? <EyeOutlined className="text-[#1f941f]/40" /> : <EyeInvisibleOutlined className="text-[#1f941f]/40" />
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
                        className="w-full h-16 bg-gradient-to-r from-[#1f941f] to-[#1f941f] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/10 transition-all duration-300 font-greenhouse-heading flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </div>
                </div>
              </TabPane>

              {/* ── Register ── */}
              <TabPane
                tab={
                  <span className="font-greenhouse-heading font-black text-sm uppercase tracking-widest px-4">
                    ĐĂNG KÝ
                  </span>
                }
                key="register"
                disabled={registerStep === "verify"}
              >
                <AnimatePresence mode="wait">
                  {registerStep === "credentials" ? (
                    <motion.div
                      key="credentials"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-[#2e3430] mb-2 font-greenhouse-heading">
                          Tài Khoản Mới
                        </h2>
                        <p className="text-[#5b605c] font-greenhouse-body font-medium">
                          Bắt đầu hành trình hợp tác tuyệt vời hôm nay
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-xs font-black text-[#2e3430] uppercase tracking-widest font-greenhouse-heading ml-1">
                            EMAIL ĐẠI DIỆN
                          </label>
                          <Input
                            prefix={<MailOutlined className="text-[#1f941f]/40 mr-2" />}
                            type="email"
                            placeholder="school@ecoverse.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setErrors((p) => ({ ...p, email: "" }));
                            }}
                            className="h-14 rounded-2xl bg-[#f9faf6]/50 border-white/50 focus:bg-white transition-all font-greenhouse-body text-base"
                            disabled={isLoading}
                            status={errors.email ? "error" : ""}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs font-bold font-greenhouse-body ml-1">{errors.email}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-black text-[#2e3430] uppercase tracking-widest font-greenhouse-heading ml-1">
                            MẬT KHẨU
                          </label>
                          <Input.Password
                            prefix={<LockOutlined className="text-[#1f941f]/40 mr-2" />}
                            placeholder="Ít nhất 8 ký tự"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setErrors((p) => ({ ...p, password: "" }));
                            }}
                            className="h-14 rounded-2xl bg-[#f9faf6]/50 border-white/50 focus:bg-white transition-all font-greenhouse-body text-base"
                            disabled={isLoading}
                            status={errors.password ? "error" : ""}
                            iconRender={(v) =>
                              v ? <EyeOutlined className="text-[#1f941f]/40" /> : <EyeInvisibleOutlined className="text-[#1f941f]/40" />
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
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            className="w-full h-16 bg-gradient-to-r from-[#1f941f] to-[#1f941f] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/10 transition-all duration-300 font-greenhouse-heading flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-3">
                                <LoadingOutlined className="text-xl" />
                                <span>ĐANG GỬI MÃ...</span>
                              </div>
                            ) : (
                              "NHẬN MÃ XÁC THỰC"
                            )}
                          </motion.button>

                          <div className="text-center mt-6">
                            <p className="text-[10px] text-[#5b605c] uppercase tracking-wider font-black font-greenhouse-heading leading-tight mx-8">
                              Bằng việc tiếp tục, bạn đồng ý với{" "}
                              <a href="#" className="text-[#1f941f] hover:underline decoration-2 underline-offset-2">ĐIỀU KHOẢN</a>{" "}
                              và{" "}
                              <a href="#" className="text-[#1f941f] hover:underline decoration-2 underline-offset-2">CHÍNH SÁCH</a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-start mb-6">
                        <button
                          onClick={handleBackToCredentials}
                          className="flex items-center gap-2 text-xs font-black text-[#5b605c] hover:text-[#1f941f] transition-all uppercase tracking-widest font-greenhouse-heading group"
                        >
                          <ArrowLeftOutlined className="text-[10px] group-hover:-translate-x-1 transition-transform" />
                          QUAY LẠI
                        </button>
                      </div>

                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-[#1f941f]/20 mb-6 shadow-inner">
                          <KeyOutlined className="text-4xl text-[#1f941f]" />
                        </div>
                        <h2 className="text-3xl font-black text-[#2e3430] mb-2 font-greenhouse-heading">
                          Xác Thực Trường Học
                        </h2>
                        <p className="text-[#5b605c] font-greenhouse-body font-medium leading-relaxed">
                          Nhập mã 6 chữ số đã được gửi đến<br />
                          <span className="text-[#1f941f] font-black">{email}</span>
                        </p>
                      </div>

                      <div className="flex justify-center gap-3 py-6">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-s-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            disabled={isLoading}
                            className="w-14 h-16 text-center text-2xl font-black bg-[#f9faf6]/80 border-2 border-[#1f941f]/5 rounded-2xl focus:border-[#1f941f] focus:bg-white focus:outline-none transition-all font-greenhouse-heading disabled:opacity-50 shadow-sm"
                          />
                        ))}
                      </div>

                      <div className="space-y-6">
                        <motion.button
                          whileHover={{ scale: 1.01, translateY: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleVerifyOTP}
                          disabled={isLoading || otpCode.join("").length !== 6}
                          className="w-full h-16 bg-gradient-to-r from-[#1f941f] to-[#1f941f] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/10 transition-all duration-300 font-greenhouse-heading flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-3">
                              <LoadingOutlined className="text-xl" />
                              <span>ĐANG XÁC THỰC...</span>
                            </div>
                          ) : (
                            "XÁC THỰC VÀ TIẾP TỤC"
                          )}
                        </motion.button>

                        <div className="text-center">
                          <p className="text-sm font-medium text-[#5b605c] mb-3 font-greenhouse-body">
                            Không nhận được mã?
                          </p>
                          <Button
                            type="link"
                            size="small"
                            onClick={handleResendOTP}
                            disabled={isResending || resendCountdown > 0}
                            className="text-[#1f941f] hover:text-[#1f941f]/80 font-black text-xs uppercase tracking-widest font-greenhouse-heading h-auto p-0"
                          >
                            {isResending ? (
                              <span className="flex items-center gap-2">
                                <LoadingOutlined /> ĐANG GỬI...
                              </span>
                            ) : resendCountdown > 0 ? (
                              `Gửi lại sau ${resendCountdown}S`
                            ) : (
                              "GỬI LẠI MÃ NGAY"
                            )}
                          </Button>
                        </div>
                      </div>

                      <p className="text-[10px] text-center text-[#5b605c]/60 font-black uppercase tracking-widest font-greenhouse-heading mt-8 border-t border-[#1f941f]/5 pt-6">
                        Mã có hiệu lực trong 10 phút.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabPane>
            </Tabs>
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
            className="text-xs font-black text-[#5b605c] hover:text-[#1f941f] transition-all uppercase tracking-[0.2em] font-greenhouse-heading"
          >
            ← TRANG CHỦ ECOVERSE
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
