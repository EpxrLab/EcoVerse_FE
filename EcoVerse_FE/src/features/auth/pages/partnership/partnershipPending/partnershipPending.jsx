import { lazy, Suspense } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, Spin } from "antd";
import { Clock, Handshake, Mail, LogOut } from "lucide-react";

// Lazy-loaded status steps
const StatusSteps = lazy(() =>
  Promise.resolve({
    default: function StatusSteps() {
      return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          {/* Step 1 - Done */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-500">✓</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Đã gửi đăng ký</p>
              <p className="text-sm text-gray-500">
                Thông tin đối tác đã được ghi nhận
              </p>
            </div>
          </div>

          {/* Step 2 - In progress */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-3 h-3 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Đang xem xét</p>
              <p className="text-sm text-gray-500">
                Admin đang kiểm tra thông tin
              </p>
            </div>
          </div>

          {/* Step 3 - Pending */}
          <div className="flex items-start gap-3 opacity-40">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-gray-500 font-medium">3</span>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Kích hoạt tài khoản</p>
              <p className="text-sm text-gray-400">
                Sẵn sàng hợp tác cùng EcoVerse
              </p>
            </div>
          </div>
        </div>
      );
    },
  }),
);

export default function PartnershipPending() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: clear auth state/token here
    navigate("/auth/partnership");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4 shadow-md">
            <Handshake className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            EcoVerse
          </h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            className="border-0 shadow-2xl rounded-3xl overflow-hidden"
            bodyStyle={{ padding: "32px 28px" }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4 shadow-inner"
                >
                  <Clock className="w-10 h-10 text-orange-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Đang chờ duyệt
                </h2>
                <p className="text-gray-500">
                  Đơn đăng ký đối tác của bạn đang được xem xét
                </p>
              </div>

              {/* Status Steps - Lazy loaded */}
              <Suspense
                fallback={
                  <div className="flex justify-center py-6">
                    <Spin size="default" />
                  </div>
                }
              >
                <StatusSteps />
              </Suspense>

              {/* Email notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100"
              >
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Chúng tôi sẽ thông báo qua email khi đơn đăng ký được duyệt.
                </p>
              </motion.div>

              {/* Processing time */}
              <p className="text-center text-sm text-gray-400">
                Thời gian xử lý thường từ 1–3 ngày làm việc
              </p>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
