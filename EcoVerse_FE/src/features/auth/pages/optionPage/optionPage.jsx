import { motion } from "framer-motion";
import {
  HomeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const roles = [
  {
    id: "student",
    number: "01",
    title: "Học sinh",
    description: "Tham gia các hoạt động học tập và trò chơi vui nhộn cùng Ecoverse.",
    path: "/auth/student",
    accent: "from-[#2d6a4f] to-[#1f5e44]",
    lightAccent: "bg-[#b1f0ce]/30",
  },
  {
    id: "school",
    number: "02",
    title: "Trường học",
    description: "Quản lý dữ liệu học sinh và theo dõi tiến độ giáo dục môi trường.",
    path: "/auth/school",
    accent: "from-[#1f5e44] to-[#2d6a4f]",
    lightAccent: "bg-[#b5f7d2]/30",
  },
  {
    id: "partnership",
    number: "03",
    title: "Đối tác",
    description: "Khởi tạo chiến dịch xanh và kết nối cộng đồng nhà trường.",
    path: "/auth/partnership",
    accent: "from-[#765b07] to-[#ffd97d]/50",
    lightAccent: "bg-[#ffd97d]/20",
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
    <div className="min-h-screen bg-[#f9faf6] relative overflow-hidden">
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Organic background shapes */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#b1f0ce]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-[#ffd97d]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-[#2d6a4f]/5 rounded-full blur-[80px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#2d6a4f 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Header — single entrance animation only */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2d6a4f] to-[#1f5e44] rounded-[2rem] shadow-2xl shadow-green-900/20 mb-8">
            <span className="text-3xl font-black text-white font-greenhouse-heading">E</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 font-greenhouse-heading tracking-tight text-[#2e3430]">
            Chào Mừng Đến{" "}
            <span className="bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] bg-clip-text text-transparent">
              Ecoverse
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#5b605c] font-greenhouse-body leading-relaxed max-w-2xl mx-auto">
            Lựa chọn vai trò của bạn để cùng chúng tôi kiến tạo không gian xanh.
          </p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full"
        >
          {roles.map((role) => {
            return (
              <motion.div
                key={role.id}
                variants={cardVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(role.path)}
                className="group relative h-full bg-white/60 backdrop-blur-md rounded-[3rem] p-10 shadow-[0_8px_32px_rgba(45,106,79,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(45,106,79,0.15)] transition-all duration-500 overflow-hidden cursor-pointer"
              >
                {/* Background Number Decal */}
                <div className="absolute top-10 right-10 text-9xl font-black text-[#2d6a4f]/5 select-none transition-all duration-700 group-hover:text-[#2d6a4f]/10 group-hover:-translate-y-4 font-greenhouse-heading">
                  {role.number}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-1 bg-gradient-to-r ${role.accent} rounded-full mb-10 opacity-30 group-hover:opacity-100 group-hover:w-24 transition-all duration-500`} />
                  
                  <h3 className="text-3xl font-black mb-6 text-[#2e3430] font-greenhouse-heading leading-tight">
                    {role.title}
                  </h3>
                  <p className="text-lg text-[#5b605c] font-greenhouse-body leading-relaxed mb-auto">
                    {role.description}
                  </p>

                  <div className="mt-8 flex items-center gap-3 text-[#2d6a4f] font-bold font-greenhouse-heading group-hover:gap-5 transition-all">
                    <span>Truy cập</span>
                    <ArrowRightOutlined />
                  </div>
                </div>

                {/* Decorative dot */}
                <div className={`absolute bottom-10 right-10 w-2 h-2 rounded-full ${role.lightAccent} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-20 text-[#5b605c] text-sm font-bold uppercase tracking-[0.3em] font-greenhouse-body"
        >
          Cùng nhau xây dựng tương lai xanh
        </motion.p>
      </div>
    </div>
  );
}
