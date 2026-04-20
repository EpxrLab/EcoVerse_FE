import { lazy, Suspense } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, Spin } from "antd";
import { Clock, School, Mail, LogOut } from "lucide-react";

// Lazy-loaded status steps content
const StatusSteps = lazy(() =>
  Promise.resolve({
    default: function StatusSteps() {
      return (
        <div className="bg-[#f9faf6] rounded-[2rem] p-8 space-y-6 border border-[#1f941f]/5">
          {/* Step 1 - Done */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#1f941f] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-green-900/20">
              <span className="text-white font-black text-sm">✓</span>
            </div>
            <div>
              <p className="font-black text-[#2e3430] font-greenhouse-heading">Đã gửi hồ sơ</p>
              <p className="text-sm text-[#5b605c] font-greenhouse-body">
                Thông tin trường đã được hệ thống ghi nhận.
              </p>
            </div>
          </div>

          {/* Step 2 - In progress */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#ffd97d] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-amber-900/10">
              <Clock className="w-4 h-4 text-[#765b07]" />
            </div>
            <div>
              <p className="font-black text-[#2e3430] font-greenhouse-heading">Đang kiểm duyệt</p>
              <p className="text-sm text-[#5b605c] font-greenhouse-body">
                Đội ngũ EcoVerse đang thẩm định dữ liệu.
              </p>
            </div>
          </div>

          {/* Step 3 - Pending */}
          <div className="flex items-start gap-4 opacity-40">
            <div className="w-8 h-8 rounded-full bg-[#f2f4f0] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#5b605c]/10">
              <span className="text-sm text-[#5b605c] font-black font-greenhouse-heading">03</span>
            </div>
            <div>
              <p className="font-black text-[#5b605c] font-greenhouse-heading">Kích hoạt</p>
              <p className="text-sm text-[#5b605c]/60 font-greenhouse-body">Chào mừng bạn gia nhập cộng đồng.</p>
            </div>
          </div>
        </div>
      );
    },
  }),
);

export default function SchoolPending() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/auth/school");
  };

  return (
    <div className="min-h-screen bg-[#f9faf6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#b1f0ce]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#ffd97d]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#1f941f 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1f941f] to-[#1f5e44] mb-4 shadow-xl shadow-green-900/10">
            <School className="w-8 h-8 text-white" />
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
          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 shadow-[0_32px_64px_rgba(45,106,79,0.1)] border border-white/50 overflow-hidden">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                  className="w-24 h-24 mx-auto rounded-[2rem] bg-[#ffd97d]/20 flex items-center justify-center mb-6 shadow-inner"
                >
                  <Clock className="w-10 h-10 text-[#765b07]" />
                </motion.div>
                <h2 className="text-3xl font-black text-[#2e3430] mb-2 font-greenhouse-heading">
                  Đang Chờ Duyệt
                </h2>
                <p className="text-[#5b605c] font-greenhouse-body font-medium">
                  Hồ sơ trường học đang được thẩm định
                </p>
              </div>

              {/* Status Steps - Lazy loaded */}
              <Suspense
                fallback={
                  <div className="flex justify-center py-12">
                    <Spin size="large" />
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
                className="flex items-center gap-4 p-5 rounded-[2rem] bg-[#b1f0ce]/10 border border-[#1f941f]/5"
              >
                <Mail className="w-5 h-5 text-[#1f941f] flex-shrink-0" />
                <p className="text-sm text-[#1f941f] font-medium font-greenhouse-body">
                  Chúng tôi sẽ gửi thông báo xác nhận qua email ngay khi hoàn tất.
                </p>
              </motion.div>

              {/* Processing time */}
              <p className="text-center text-xs font-bold text-[#5b605c] uppercase tracking-widest font-greenhouse-heading">
                Ước tính: 24h - 72h làm việc
              </p>

              {/* Logout Button */}
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
        </motion.div>
      </div>
    </div>
  );
}
