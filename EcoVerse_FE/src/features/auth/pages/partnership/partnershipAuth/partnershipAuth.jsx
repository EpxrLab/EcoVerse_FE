import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, Card, Tabs, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const { TabPane } = Tabs;

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export default function PartnershipAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("login");

  const [registerStep, setRegisterStep] = useState("credentials");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [devModeOtp, setDevModeOtp] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
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
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Đăng nhập thành công!");
      navigate("/partnership");
    } catch {
      toast.error("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const mockOtp = "123456";
      setDevModeOtp(mockOtp);
      message.success(`Dev Mode – Mã OTP: ${mockOtp}`);
      setRegisterStep("verify");
      setResendCountdown(60);
    } catch {
      message.error("Đã xảy ra lỗi khi gửi mã xác thực");
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
      await new Promise((r) => setTimeout(r, 1500));
      toast.success(
        "Xác thực thành công! Đang chuyển đến trang đăng ký thông tin đối tác...",
      );
      navigate("/auth/partnership/register");
    } catch {
      toast.error("Đã xảy ra lỗi khi xác thực");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setIsResending(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      message.success(`Đã gửi lại mã xác thực đến ${email}`);
      setResendCountdown(60);
      setOtpCode(["", "", "", "", "", ""]);
    } catch {
      message.error("Đã xảy ra lỗi khi gửi lại mã");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToCredentials = () => {
    setRegisterStep("credentials");
    setOtpCode(["", "", "", "", "", ""]);
    setDevModeOtp(null);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpCode];
    next[index] = value.slice(-1);
    setOtpCode(next);
    if (value && index < 5)
      document.getElementById(`otp-p-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0)
      document.getElementById(`otp-p-${index - 1}`)?.focus();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Back button — fixed top-left, same as SchoolAuth */}
      <motion.button
        onClick={() => console.log("navigate /auth")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2
                   bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg
                   text-gray-600 hover:text-blue-600 transition-colors group"
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
            <TeamOutlined className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EcoVerse</h1>
          <p className="text-gray-600 mt-2">Cổng đăng ký dành cho Đối tác</p>
        </motion.div>

        {/* Card */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-xl">
            <Tabs
              activeKey={activeTab}
              onChange={(k) => {
                setActiveTab(k);
                setRegisterStep("credentials");
              }}
              centered
              className="w-full"
              tabBarStyle={{ marginBottom: "24px" }}
            >
              {/* ── Login ── */}
              <TabPane tab="Đăng nhập" key="login">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Chào mừng trở lại!
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Đăng nhập để quản lý hợp tác của bạn
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      type="email"
                      placeholder="partner@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((p) => ({ ...p, email: "" }));
                      }}
                      size="large"
                      disabled={isLoading}
                      status={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
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
                      size="large"
                      disabled={isLoading}
                      status={errors.password ? "error" : ""}
                      iconRender={(v) =>
                        v ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleLogin}
                    loading={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 mt-6"
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                  </Button>
                </div>
              </TabPane>

              {/* ── Register ── */}
              <TabPane
                tab="Đăng ký"
                key="register"
                disabled={registerStep === "verify"}
              >
                <AnimatePresence mode="wait">
                  {registerStep === "credentials" ? (
                    <motion.div
                      key="credentials"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                          Đăng ký tài khoản
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          Nhập email để nhận mã xác thực 6 số
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <Input
                          prefix={<MailOutlined className="text-gray-400" />}
                          type="email"
                          placeholder="partner@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((p) => ({ ...p, email: "" }));
                          }}
                          size="large"
                          disabled={isLoading}
                          status={errors.email ? "error" : ""}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Mật khẩu
                        </label>
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Ít nhất 6 ký tự"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((p) => ({ ...p, password: "" }));
                          }}
                          size="large"
                          disabled={isLoading}
                          status={errors.password ? "error" : ""}
                          iconRender={(v) =>
                            v ? <EyeOutlined /> : <EyeInvisibleOutlined />
                          }
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleSendOTP}
                        loading={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 mt-6"
                      >
                        {isLoading ? "Đang gửi mã..." : "Gửi mã xác thực"}
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        Bằng việc đăng ký, bạn đồng ý với{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Điều khoản sử dụng
                        </a>{" "}
                        và{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Chính sách bảo mật
                        </a>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={handleBackToCredentials}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-4"
                      >
                        <ArrowLeftOutlined className="text-xs" />
                        Quay lại
                      </button>

                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                          <KeyOutlined className="text-xl text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          Nhập mã xác thực
                        </h2>
                        <p className="text-gray-600 text-sm mt-2">
                          {devModeOtp ? (
                            <>Chế độ Dev - Nhập mã bên dưới</>
                          ) : (
                            <>
                              Nhập mã 6 số đã gửi đến
                              <br />
                              <span className="font-medium text-gray-800">
                                {email}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {devModeOtp && (
                        <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-center mb-4">
                          <p className="text-xs text-amber-600 mb-2 font-medium">
                            🔧 DEV MODE - Mã OTP của bạn:
                          </p>
                          <p className="text-2xl font-mono font-bold text-amber-700 tracking-widest">
                            {devModeOtp}
                          </p>
                          <p className="text-xs text-amber-600/70 mt-2">
                            (Email không được gửi trong chế độ dev)
                          </p>
                        </div>
                      )}

                      <div className="flex justify-center gap-2 py-4">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-p-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            disabled={isLoading}
                            className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                          />
                        ))}
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleVerifyOTP}
                        loading={isLoading}
                        disabled={otpCode.join("").length !== 6}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading
                          ? "Đang xác thực..."
                          : "Xác thực và tiếp tục"}
                      </Button>

                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Không nhận được mã?
                        </p>
                        <Button
                          type="link"
                          size="small"
                          onClick={handleResendOTP}
                          disabled={isResending || resendCountdown > 0}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {isResending ? (
                            <>
                              <LoadingOutlined className="mr-2" />
                              Đang gửi...
                            </>
                          ) : resendCountdown > 0 ? (
                            `Gửi lại sau ${resendCountdown}s`
                          ) : (
                            "Gửi lại mã"
                          )}
                        </Button>
                      </div>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        Mã có hiệu lực trong 10 phút. Kiểm tra cả thư mục spam.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-sm text-gray-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a href="/" className="hover:text-blue-600 transition-colors">
            ← Quay về trang chủ
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
