import { Button } from "antd";
import {
  PlayCircleOutlined,
  ArrowRightOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Trường học", emoji: "🏫" },
  { value: "10,000+", label: "Học sinh", emoji: "👨‍🎓" },
  { value: "500K+", label: "Vật phẩm phân loại", emoji: "♻️" },
  { value: "85%", label: "Độ chính xác TB", emoji: "🎯" },
];

const floatingEmojis = [
  { emoji: "🌱", top: "12%", left: "6%", size: "text-5xl", duration: 4 },
  { emoji: "🍃", top: "25%", right: "8%", size: "text-4xl", duration: 5 },
  { emoji: "🌍", bottom: "30%", left: "8%", size: "text-5xl", duration: 6 },
  { emoji: "♻️", bottom: "15%", right: "6%", size: "text-6xl", duration: 5 },
  { emoji: "🌻", top: "55%", left: "3%", size: "text-3xl", duration: 7 },
  { emoji: "🦋", top: "18%", left: "30%", size: "text-2xl", duration: 4.5 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Floating emoji decoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingEmojis.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.size} opacity-30 select-none`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
            animate={{ y: [0, -16, 0] }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Static gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-8"
          >
            <StarOutlined className="text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Giáo dục môi trường qua trò chơi
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold mb-6"
          >
            <span className="text-gray-900">Học phân loại rác</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              thật vui & dễ dàng!
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10"
          >
            EcoVerse giúp học sinh tiểu học học về bảo vệ môi trường thông qua
            <span className="text-green-600 font-semibold">
              {" "}
              game tương tác
            </span>
            ,<span className="text-blue-600 font-semibold">
              {" "}
              quiz thú vị
            </span>{" "}
            và
            <span className="text-orange-600 font-semibold">
              {" "}
              phần thưởng hấp dẫn
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              className="h-14 px-8 text-lg font-semibold bg-green-600 hover:bg-green-700 border-none shadow-lg hover:shadow-xl transition-all"
            >
              Chơi thử ngay
              <ArrowRightOutlined className="ml-2" />
            </Button>
            <Button
              size="large"
              className="h-14 px-8 text-lg font-semibold bg-white/80 backdrop-blur-sm border-2 border-green-200 hover:border-green-400 text-gray-700 hover:text-green-700 shadow-md hover:shadow-lg transition-all"
            >
              Tìm hiểu thêm
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-gray-400/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-3 bg-gray-400/50 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
