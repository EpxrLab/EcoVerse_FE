import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  ArrowRightOutlined,
  GlobalOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const roles = [
  {
    id: "student",
    title: "Học sinh",
    description: "Tham gia các hoạt động học tập và trò chơi vui nhộn",
    icon: UserOutlined,
    path: "/auth/student",
    gradient: "from-blue-400 to-cyan-400",
    hoverBg: "hover:bg-blue-50",
    hoverBorder: "hover:border-blue-300",
    iconBg: "bg-gradient-to-br from-blue-400 to-cyan-400",
    btnBg: "bg-gradient-to-r from-blue-400 to-cyan-400",
    accent: "text-blue-600",
  },
  {
    id: "school",
    title: "Trường học",
    description: "Quản lý học sinh và theo dõi tiến độ học tập",
    icon: HomeOutlined,
    path: "/auth/school",
    gradient: "from-green-400 to-emerald-400",
    hoverBg: "hover:bg-green-50",
    hoverBorder: "hover:border-green-300",
    iconBg: "bg-gradient-to-br from-green-400 to-emerald-400",
    btnBg: "bg-gradient-to-r from-green-400 to-emerald-400",
    accent: "text-green-600",
  },
  {
    id: "partnership",
    title: "Đối tác",
    description: "Tổ chức chiến dịch, sự kiện và kết nối các trường tham gia",
    icon: GlobalOutlined,
    path: "/auth/partnership",
    gradient: "from-orange-400 to-red-400",
    hoverBg: "hover:bg-orange-50",
    hoverBorder: "hover:border-orange-300",
    iconBg: "bg-gradient-to-br from-orange-400 to-red-400",
    btnBg: "bg-gradient-to-r from-orange-400 to-red-400",
    accent: "text-orange-600",
  },
  {
    id: "admin",
    title: "Quản trị viên",
    description: "Quản lý hệ thống, người dùng và cấu hình nền tảng",
    icon: LockOutlined,
    path: "/auth/admin",
    gradient: "from-purple-500 to-indigo-500",
    hoverBg: "hover:bg-purple-50",
    hoverBorder: "hover:border-purple-300",
    iconBg: "bg-gradient-to-br from-purple-500 to-indigo-500",
    btnBg: "bg-gradient-to-r from-purple-500 to-indigo-500",
    accent: "text-purple-600",
  },
];

// Stagger animation only for initial mount — no continuous loops
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function OptionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Back to home button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full
                   bg-white/80 backdrop-blur-md shadow-lg text-green-700
                   font-semibold hover:bg-green-100 transition-all"
      >
        <HomeOutlined className="text-lg" />
        <span>Trang chủ</span>
      </motion.button>

      {/* Static decorative blobs — no animation to save perf */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"
          style={{ top: "10%", left: "10%" }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"
          style={{ bottom: "10%", right: "10%" }}
        />
        <div
          className="absolute w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-15"
          style={{ top: "50%", left: "50%" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Header — single entrance animation only */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl shadow-2xl mb-5">
            <span className="text-5xl">🌍</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chào mừng đến EcoVerse! 🎉
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium">
            Bạn là ai trong thế giới của chúng ta?
          </p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(role.path)}
                  className={`
                    relative overflow-hidden border-2 border-transparent
                    ${role.hoverBg} ${role.hoverBorder}
                    shadow-lg hover:shadow-xl
                    transition-all duration-250 cursor-pointer h-full
                    bg-white/90 backdrop-blur-sm
                  `}
                  style={{ borderRadius: "20px" }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Top accent bar */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${role.gradient}`}
                  />

                  <div className="flex flex-col items-center text-center p-7">
                    {/* Icon */}
                    <div
                      className={`w-20 h-20 rounded-full ${role.iconBg} flex items-center justify-center mb-5 shadow-md`}
                    >
                      <Icon className="text-4xl text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {role.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      {role.description}
                    </p>

                    {/* CTA */}
                    <div
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${role.btnBg} text-white font-semibold text-sm shadow-md`}
                    >
                      <span>Chọn vai trò</span>
                      <ArrowRightOutlined />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-12 text-gray-500 text-sm"
        >
          🌱 Cùng nhau xây dựng tương lai xanh cho thế hệ mai sau! 🌱
        </motion.p>
      </div>
    </div>
  );
}
