import { motion } from "framer-motion";

// Simplified features without icons
const features = [
  {
    number: "01",
    title: "Trò Chơi Tương Tác",
    description:
      "Kéo thả vật phẩm vào đúng thùng rác qua các cấp độ từ dễ đến khó, giúp các em hào hứng học tập.",
    accent: "from-[#2d6a4f] to-[#1f5e44]",
    lightAccent: "bg-[#b1f0ce]/30",
  },
  {
    number: "02",
    title: "Quiz Kiến Thức",
    description:
      "Thử thách bản thân với bộ câu hỏi đa dạng về môi trường và các loài sinh vật.",
    accent: "from-[#1f5e44] to-[#2d6a4f]",
    lightAccent: "bg-[#b5f7d2]/30",
  },
  {
    number: "03",
    title: "Phần Thưởng Hấp Dẫn",
    description:
      "Tích điểm, mở khóa huy hiệu Hiệp sĩ Môi trường và đổi những món quà ý nghĩa.",
    accent: "from-[#765b07] to-[#ffd97d]/50",
    lightAccent: "bg-[#ffd97d]/20",
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
    <section className="py-32 bg-[#f2f4f0] relative overflow-hidden">
      {/* Visual textures */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#2d6a4f 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-black mb-8 font-greenhouse-heading tracking-tight text-[#2e3430]">
            Cách Thức{" "}
            <span className="bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] bg-clip-text text-transparent">
              Hoạt Động
            </span>
          </h2>
          <p className="text-xl text-[#5b605c] font-greenhouse-body leading-relaxed">
            EcoVerse kết hợp công nghệ và giáo dục để tạo ra một không gian 
            <span className="text-[#2d6a4f] font-bold"> học mà chơi </span> đầy cảm hứng cho các em học sinh.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            return (
              <motion.div key={index} variants={itemVariants}>
                <div
                  className="h-full relative bg-white/60 backdrop-blur-md rounded-[3rem] p-12 shadow-[0_8px_32px_rgba(45,106,79,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(45,106,79,0.15)] transition-all duration-500 overflow-hidden group"
                >
                  {/* Background Number Decal */}
                  <div className="absolute top-10 right-10 text-9xl font-black text-[#2d6a4f]/5 select-none transition-all duration-700 group-hover:text-[#2d6a4f]/10 group-hover:-translate-y-4">
                    {feature.number}
                  </div>

                  <div className="relative z-10">
                    <div className={`w-12 h-1 bg-gradient-to-r ${feature.accent} rounded-full mb-10 opacity-30 group-hover:opacity-100 group-hover:w-24 transition-all duration-500`} />
                    
                    <h3 className="text-3xl font-black mb-6 text-[#2e3430] font-greenhouse-heading leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-xl text-[#5b605c] font-greenhouse-body leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative dot */}
                  <div className={`absolute bottom-10 right-10 w-2 h-2 rounded-full ${feature.lightAccent} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                </div>
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
