import { Button } from "antd";
import {
  PlayCircleOutlined,
  ArrowRightOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Trường học đối tác", accent: "bg-[#2d6a4f]" },
  { value: "10,000+", label: "Học sinh tham gia", accent: "bg-[#ffd97d]" },
  { value: "500K+", label: "Rác được phân loại", accent: "bg-[#b1f0ce]" },
  { value: "85%", label: "Tỉ lệ chính xác", accent: "bg-[#1f5e44]" },
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f9faf6]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle geometric particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#2d6a4f]/10"
            style={{
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Organic background shapes */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#b1f0ce]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#ffd97d]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-[#2d6a4f]/5 rounded-full blur-[80px]" />
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
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#b1f0ce]/30 text-[#2d6a4f] mb-8 font-greenhouse-body font-bold"
          >
            <StarOutlined />
            <span className="text-sm">
              Ứng dụng giáo dục môi trường hàng đầu
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight font-greenhouse-heading"
          >
            <span className="text-[#2e3430]">Phân Loại Rác Tại Ecoverse</span>
            <br />
            <span className="bg-gradient-to-r from-[#2d6a4f] via-[#1f5e44] to-[#2d6a4f] bg-clip-text text-transparent">
              Gieo Mầm Xanh Cho Tương Lai
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-[#5b605c] max-w-3xl mx-auto mb-12 font-greenhouse-body leading-relaxed"
          >
            Ecoverse giúp các em học sinh tiểu học rèn luyện thói quen 
            <span className="text-[#2d6a4f] font-bold"> bảo vệ môi trường </span>
            thông qua trải nghiệm 
            <span className="text-[#2d6a4f] font-bold"> game tương tác </span>
            vô cùng độc đáo và hấp dẫn.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] hover:scale-105 border-none shadow-[0_20px_40px_-12px_rgba(45,106,79,0.3)] transition-all rounded-full font-greenhouse-heading"
            >
              Bắt đầu ngay
              <ArrowRightOutlined className="ml-2" />
            </Button>
            <Button
              size="large"
              className="h-16 px-10 text-lg font-bold bg-white/50 backdrop-blur-md border-none text-[#2e3430] hover:text-[#2d6a4f] shadow-xl shadow-gray-200/50 hover:bg-[#f2f4f0] transition-all rounded-full font-greenhouse-heading"
            >
              Tìm hiểu thêm
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 shadow-[0_4px_24px_rgba(45,106,79,0.04)] border-none hover:shadow-[0_24px_48px_rgba(45,106,79,0.08)] transition-all overflow-hidden"
                whileHover={{ y: -8 }}
              >
                {/* Minimal accent line */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 ${stat.accent} rounded-b-full opacity-50 group-hover:w-24 group-hover:h-1.5 transition-all duration-500`} />
                
                <div className="relative z-10">
                  <div className="text-5xl font-black text-[#2e3430] mb-3 font-greenhouse-heading tracking-tighter leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs font-black text-[#5b605c] uppercase tracking-[0.2em] leading-relaxed">
                    {stat.label}
                  </div>
                </div>
                
                {/* Subtle texture inside */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#2d6a4f]/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
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
