import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card } from "antd";
import { XCircle, School, LogOut, RefreshCw } from "lucide-react";

export default function SchoolRejected() {
  const navigate = useNavigate();
  // TODO: populate rejectionReason from your auth/API layer
  const [rejectionReason, setRejectionReason] = useState(null);

  const handleLogout = () => {
    navigate("/auth/school");
  };

  const handleReapply = () => {
    navigate("/school/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4 shadow-md">
            <School className="w-8 h-8 text-green-600" />
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
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 14,
                    delay: 0.2,
                  }}
                  className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4 shadow-inner"
                >
                  <XCircle className="w-10 h-10 text-red-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Đăng ký bị từ chối
                </h2>
                <p className="text-gray-500 text-sm">
                  Rất tiếc, đơn đăng ký của bạn không được chấp thuận
                </p>
              </div>

              {/* Rejection reason */}
              {rejectionReason && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <p className="font-semibold text-sm text-red-600 mb-1">
                    Lý do từ chối:
                  </p>
                  <p className="text-sm text-red-700">{rejectionReason}</p>
                </motion.div>
              )}

              {/* Info box */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Bạn có thể đăng ký lại với thông tin chính xác hơn hoặc liên
                  hệ với chúng tôi để được hỗ trợ.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReapply}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-all duration-200 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Đăng ký lại
                </motion.button>

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
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
