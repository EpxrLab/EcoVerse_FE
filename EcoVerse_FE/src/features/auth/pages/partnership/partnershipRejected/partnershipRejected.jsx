import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card } from "antd";
import { XCircle, Handshake, LogOut, RefreshCw } from "lucide-react";

export default function PartnershipRejected() {
  const navigate = useNavigate();
  // TODO: populate rejectionReason from your auth/API layer
  const [rejectionReason, setRejectionReason] = useState(null);

  const handleLogout = () => {
    // TODO: clear auth state/token here
    navigate("/auth/partnership");
  };

  const handleReapply = () => {
    // TODO: delete old registration via your API, then redirect
    navigate("/partnership/register");
  };

  return (
    <div className="min-h-screen bg-[#f9faf6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#1db1d1]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#b1f0ce]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#1db1d1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1db1d1] to-[#1db1d1] mb-4 shadow-xl shadow-amber-900/10">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[#2e3430] font-greenhouse-heading tracking-tight">
            EcoVerse
          </h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 shadow-[0_32px_64px_rgba(118,91,7,0.1)] border border-white/50 overflow-hidden">
            <div className="space-y-8">
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
                  className="w-24 h-24 mx-auto rounded-[2rem] bg-red-100/50 flex items-center justify-center mb-6 shadow-inner"
                >
                  <XCircle className="w-12 h-12 text-red-500" />
                </motion.div>
                <h2 className="text-3xl font-black text-[#2e3430] mb-2 font-greenhouse-heading">
                  Hồ Sơ Bị Từ Chối
                </h2>
                <p className="text-[#5b605c] font-greenhouse-body font-medium">
                  Rất tiếc, đơn đăng ký đối tác chưa được chấp thuận
                </p>
              </div>

              {/* Rejection reason */}
              {rejectionReason && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50/50 border border-red-200/50 rounded-[2rem] p-6"
                >
                  <p className="font-black text-xs text-red-600 mb-2 uppercase tracking-widest font-greenhouse-heading">
                    Lý do cụ thể:
                  </p>
                  <p className="text-sm text-red-700 font-greenhouse-body leading-relaxed">{rejectionReason}</p>
                </motion.div>
              )}

              {/* Info box */}
              <div className="bg-[#f9faf6] rounded-[2rem] p-6 border border-[#1db1d1]/5 text-center">
                <p className="text-sm text-[#5b605c] leading-relaxed font-greenhouse-body">
                  Bạn có thể chuẩn bị lại hồ sơ với thông tin chính xác hơn hoặc liên hệ quản trị viên để được hỗ trợ cụ thể.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReapply}
                  className="w-full h-14 bg-gradient-to-r from-[#1db1d1] to-[#1db1d1] text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-900/20 transition-all duration-300 font-greenhouse-heading flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-4 h-4" />
                  GỬI LẠI ĐƠN ĐĂNG KÝ
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-[#5b605c]/10 text-[#5b605c] font-black text-sm hover:bg-[#f2f4f0] hover:border-[#5b605c]/20 transition-all duration-300 font-greenhouse-heading"
                >
                  <LogOut className="w-4 h-4" />
                  ĐĂNG XUẤT TÀI KHOẢN
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
