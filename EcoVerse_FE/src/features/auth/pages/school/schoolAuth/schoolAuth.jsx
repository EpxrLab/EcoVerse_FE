import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, Card, Tabs, message } from "antd";
import {
  HomeOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.button
        onClick={() => navigate("/auth")}
        className="fixed top-6 left-6 z-50
               flex items-center gap-2
               bg-white/80 backdrop-blur-md
               px-4 py-2 rounded-full shadow-lg
               text-gray-600 hover:text-green-600
               transition-colors group"
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
            <HomeOutlined className="text-3xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EcoVerse</h1>
          <p className="text-gray-600 mt-2">Cổng đăng ký dành cho Trường học</p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-xl">
            <Tabs
              defaultActiveKey="login"
              centered
              className="w-full"
              tabBarStyle={{ marginBottom: "24px" }}
            >
              {/* Login Tab */}
              <TabPane tab="Đăng nhập" key="login">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Chào mừng trở lại!
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Đăng nhập để quản lý trường học của bạn
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      type="email"
                      placeholder="school@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
                      size="large"
                      disabled={isLoading}
                      status={errors.password ? "error" : ""}
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
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
                    className="bg-green-600 hover:bg-green-700 mt-6"
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                  </Button>
                </div>
              </TabPane>

              {/* Register Tab */}
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
                          placeholder="school@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          placeholder="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          size="large"
                          disabled={isLoading}
                          status={errors.password ? "error" : ""}
                          iconRender={(visible) =>
                            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
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
                        className="bg-green-600 hover:bg-green-700 mt-6"
                      >
                        {isLoading ? "Đang gửi mã..." : "Gửi mã xác thực"}
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        Mã xác thực 6 số sẽ được gửi đến email của bạn. Sau khi
                        xác thực, bạn sẽ điền thông tin trường học.
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
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                          <KeyOutlined className="text-xl text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          Nhập mã xác thực
                        </h2>
                        <p className="text-gray-600 text-sm mt-2">
                          Nhập mã 6 số đã gửi đến
                          <br />
                          <span className="font-medium text-gray-800">
                            {email}
                          </span>
                        </p>
                      </div>

                      {/* OTP Input */}
                      <div className="flex justify-center gap-2 py-4">
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
                            className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors disabled:bg-gray-100"
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
                        className="bg-green-600 hover:bg-green-700"
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
                          className="text-green-600 hover:text-green-700"
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
          Cần hỗ trợ?{" "}
          <a href="#" className="text-green-600 hover:underline">
            Liên hệ với chúng tôi
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
