import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, message } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const OptionPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const roles = [
    {
      id: "student",
      title: "Học sinh",
      description: "Tham gia các hoạt động học tập và trò chơi vui nhộn",
      icon: UserOutlined,
      path: "/auth/student",
      gradient: "from-blue-400 to-cyan-400",
      shadowColor: "shadow-blue-300",
      bgPattern: "🎒📚✏️🎨",
    },
    {
      id: "school",
      title: "Trường học",
      description: "Quản lý học sinh và theo dõi tiến độ học tập",
      icon: HomeOutlined,
      path: "/auth/school",
      gradient: "from-green-400 to-emerald-400",
      shadowColor: "shadow-green-300",
      bgPattern: "🏫🌳📖🎓",
    },
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <motion.button
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full 
                 bg-white/80 backdrop-blur-md shadow-lg text-green-700 
                 font-semibold hover:bg-green-100 transition-all"
      >
        <HomeOutlined className="text-lg" />
        <span>Trang chủ</span>
      </motion.button>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-6xl opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          🌈
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-5xl opacity-20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ⭐
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 text-7xl opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          🌻
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-10 text-6xl opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🦋
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-10 text-5xl opacity-20"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🌸
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-5xl">🌍</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Chào mừng đến EcoVerse! 🎉
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Bạn là ai trong thế giới của chúng ta?
          </motion.p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            const isHovered = hoveredCard === role.id;

            return (
              <motion.div
                key={role.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredCard(role.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card
                  hoverable
                  className={`relative overflow-hidden border-0 shadow-2xl transition-all duration-300 cursor-pointer h-full ${
                    isHovered ? role.shadowColor : "shadow-lg"
                  }`}
                  onClick={() => handleRoleSelect(role.path)}
                  style={{
                    borderRadius: "24px",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5 text-6xl flex flex-wrap gap-4 p-4 overflow-hidden">
                    {role.bgPattern
                      .repeat(20)
                      .split("")
                      .map((emoji, idx) => (
                        <span key={idx}>{emoji}</span>
                      ))}
                  </div>

                  {/* Gradient Header */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${role.gradient}`}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center p-8">
                    {/* Icon */}
                    <motion.div
                      variants={floatingVariants}
                      animate="float"
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <Icon className="text-5xl text-white" />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      {role.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-base mb-6 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Action Button */}
                    <motion.div
                      className={`flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${role.gradient} text-white font-semibold shadow-lg`}
                      whileHover={{ gap: "12px" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span>Chọn vai trò</span>
                      <ArrowRightOutlined />
                    </motion.div>

                    {/* Hover Effect Glow */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-10 rounded-3xl`}
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 text-sm">
            🌱 Cùng nhau xây dựng tương lai xanh cho thế hệ mai sau! 🌱
          </p>
        </motion.div>
      </div>

      {/* Floating Circles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "10%", right: "10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "50%", left: "50%" }}
        />
      </div>
    </div>
  );
};

export default OptionPage;
