import React, { lazy } from "react";
import { Card } from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  SafetyOutlined,
  BarChartOutlined,
  TeamOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

// Custom Icons as SVG
const GamepadIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9h2v2H6V9zm0 4h2v2H6v-2zm10-4h2v2h-2V9zm0 4h2v2h-2v-2zm-4-8a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
      fill="currentColor"
    />
  </svg>
);

const features = [
  {
    icon: GamepadIcon,
    title: "Game Phân Loại Rác",
    description:
      "Kéo thả vật phẩm vào đúng thùng rác. 5 cấp độ từ dễ đến khó với hàng trăm loại rác thải.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: BookOutlined,
    title: "Quiz Kiến Thức",
    description:
      "Bộ câu hỏi đa dạng về môi trường. Nhà trường có thể tạo quiz riêng cho học sinh.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: TrophyOutlined,
    title: "Hệ Thống Phần Thưởng",
    description:
      "Tích coin, mở khóa huy hiệu, đổi quà thật. Marketplace đa dạng với quà ảo và thực.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    icon: BarChartOutlined,
    title: "Theo Dõi Tiến Độ",
    description:
      "Dashboard chi tiết cho học sinh, giáo viên và phụ huynh. Báo cáo tự động định kỳ.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: TeamOutlined,
    title: "Quản Lý Đa Cấp",
    description:
      "4 vai trò: Admin App, Admin Trường, Học sinh, Phụ huynh. Phân quyền rõ ràng.",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    icon: SafetyOutlined,
    title: "An Toàn & Bảo Mật",
    description:
      "Môi trường học tập an toàn cho trẻ em. Phụ huynh kiểm soát thời gian chơi.",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Gradient overlay top */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-100 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tính năng{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              nổi bật
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            EcoVerse kết hợp gamification và giáo dục để tạo ra trải nghiệm học
            tập thú vị, giúp học sinh yêu thích việc bảo vệ môi trường.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  hoverable
                  className="h-full border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 group"
                  bodyStyle={{ padding: "2rem" }}
                >
                  <motion.div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgColor} ${feature.color} mb-6`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {typeof Icon === "function" &&
                    Icon.name !== "BookOutlined" ? (
                      <Icon className="w-7 h-7" />
                    ) : (
                      <Icon style={{ fontSize: "28px" }} />
                    )}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-10 left-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-20 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </section>
  );
};

export default Features;
