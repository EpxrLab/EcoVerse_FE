import React, { useState, lazy, Suspense } from "react";
import { Steps, Card, Button, Form, Input, message, Result } from "antd";
import {
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { resetPassword, sendOtpResetPass, verifyOTP } from "../../services";
import toast from "react-hot-toast";

// Lazy load các bước để tối ưu dung lượng bundle
const StepEmail = lazy(() => Promise.resolve({ default: EmailStep }));
const StepOTP = lazy(() => Promise.resolve({ default: OTPStep }));
const StepReset = lazy(() => Promise.resolve({ default: ResetStep }));

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");

  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(currentStep - 1);

  const steps = [
    { title: "Email", icon: <MailOutlined /> },
    { title: "Xác thực", icon: <SafetyCertificateOutlined /> },
    { title: "Mật khẩu mới", icon: <KeyOutlined /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Nút quay lại */}
      <Button
        icon={<ArrowLeftOutlined />}
        className="fixed top-6 left-6 border-none shadow-md rounded-full h-10"
        onClick={() => navigate(-1)}
      >
        Quay lại đăng nhập
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="p-4 md:p-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-800">
                Khôi phục mật khẩu
              </h1>
              <p className="text-gray-500 mt-2">
                Dành cho Trường học & Đối tác EcoVerse
              </p>
            </div>

            {/* Progress Bar */}
            <Steps
              current={currentStep}
              items={steps}
              className="mb-12 custom-steps"
              responsive={false}
            />

            {/* Nội dung các bước */}
            <div className="min-h-[300px]">
              <Suspense
                fallback={
                  <div className="flex justify-center py-10">
                    <Button loading type="text" />
                  </div>
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 0 && (
                      <StepEmail
                        onNext={(val) => {
                          setEmail(val);
                          next();
                        }}
                      />
                    )}
                    {currentStep === 1 && (
                      <StepOTP email={email} onNext={next} onPrev={prev} />
                    )}
                    {currentStep === 2 && (
                      <StepReset onNext={() => setCurrentStep(3)} />
                    )}
                    {currentStep === 3 && (
                      <Result
                        status="success"
                        title="Đổi mật khẩu thành công!"
                        subTitle="Bây giờ bạn có thể đăng nhập bằng mật khẩu mới."
                        extra={[
                          <Button
                            type="primary"
                            key="login"
                            onClick={() => navigate("/auth/school")}
                            className="bg-green-600 rounded-lg h-10 px-8"
                          >
                            Đăng nhập ngay
                          </Button>,
                        ]}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function EmailStep({ onNext }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const value = await form.getFieldValue("email");
      const payload = {
        email: value,
      };

      const res = await sendOtpResetPass(payload);

      if (res) {
        toast.success("Đã gửi mã OTP về mail, vui lòng kiểm tra!");
        onNext(value);
      } else {
        toast.error("Gửi OTP thất bại, vui lòng thử lại sau!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={(v) => onNext(v.email)}>
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Vui lòng nhập Email tài khoản của bạn để nhận mã OTP.
        </p>
      </div>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            type: "email",
            message: "Vui lòng nhập đúng định dạng Email!",
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="school-partner@example.com"
          size="large"
          className="rounded-xl h-12"
        />
      </Form.Item>
      <Button
        type="primary"
        block
        size="large"
        htmlType="submit"
        className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl mt-4 font-bold"
        onClick={handleSendOtp}
        loading={loading}
      >
        {loading ? "Đang gửi mã..." : "Tiếp theo"}
      </Button>
    </Form>
  );
}

function OTPStep({ email, onNext, onPrev }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const otp = await form.getFieldValue("otp");
      const payload = {
        email: email,
        otp: otp,
      };
      const res = await verifyOTP(payload);

      if (res) {
        toast.success("Xác thực OTP thành công!");
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("otp", otp);
        onNext();
      } else {
        toast.error("Xác thực OTP thất bại!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleVerifyOtp}
      disabled={loading}
    >
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Mã xác thực đã được gửi đến{" "}
          <span className="font-bold text-gray-800">{email}</span>
        </p>
      </div>
      <Form.Item
        name="otp"
        rules={[
          { required: true, len: 6, message: "Mã OTP phải có 6 chữ số!" },
        ]}
      >
        <Input.OTP size="large" className="justify-center" length={6} />
      </Form.Item>
      <div className="flex gap-4 mt-8">
        <Button onClick={onPrev} block size="large" className="rounded-xl h-12">
          Quay lại
        </Button>
        <Button
          type="primary"
          block
          size="large"
          htmlType="submit"
          className="bg-blue-600 h-12 rounded-xl font-bold"
          onClick={handleVerifyOtp}
        >
          Xác thực
        </Button>
      </div>
    </Form>
  );
}

function ResetStep({ onNext }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const password = await form.getFieldValue("password");
      const email = sessionStorage.getItem("email");
      const otp = sessionStorage.getItem("otp");
      const payload = {
        email: email,
        password: password,
        otp: otp,
      };
      const res = await resetPassword(payload);

      if (res) {
        toast.success("Thay đổi mật khẩu thành công!");
        sessionStorage.clear();
        onNext();
      } else {
        toast.error("Thay đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleResetPassword}>
      <Form.Item
        label="Mật khẩu mới"
        name="password"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu mới!" },
          {
            pattern: passwordRegex,
            message:
              "Mật khẩu phải có 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt!",
          },
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="••••••••"
          size="large"
          className="rounded-xl"
        />
      </Form.Item>
      <Form.Item
        label="Xác nhận mật khẩu"
        name="confirm"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value)
                return Promise.resolve();
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<CheckCircleOutlined />}
          placeholder="••••••••"
          size="large"
          className="rounded-xl"
        />
      </Form.Item>
      <Button
        type="primary"
        block
        size="large"
        htmlType="submit"
        className="bg-green-600 h-12 rounded-xl font-bold mt-4 shadow-lg shadow-green-100"
      >
        Hoàn tất đổi mật khẩu
      </Button>
    </Form>
  );
}
