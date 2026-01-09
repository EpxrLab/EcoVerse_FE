import React, { lazy, Suspense } from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

// Custom Icons
const LeafIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.30C14 20 18 14 18 8c0-3-2-4-2-4s-2 1-2 4c0 4-2 6-4 8-2-2-2-4-2-6 0-3-2-4-2-4s-2 1-2 4c0 4.97 3.66 10 10 10 .34 0 .68-.02 1-.07l.95 2.3 1.89-.66C18.1 16.17 18 10 17 8z" fill="currentColor"/>
  </svg>
);

const RecycleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.77 7.15L7.2 4.78l1.03-.39-1.39 2.76L5 8.46l-.23-1.31zm15.95 5.82l-1.6-2.77-3.46 2L18 14.6l2.72-1.63zM16 21h2l-1.73-3H14l2 3zm-2-10l-1.73 3 3.73 2.15 1.6-2.77-3.6-2.38zM2.77 11.42l3.6 2.38 1.73-3-3.46-2-1.87 2.62zM7 21l2-3H6.73L5 21h2zm7.5-12.54l-1.3-2.35-2.23.01-1.06.57 2.31 1.26L13 9.67l1.5-1.21zM4.34 15.88l2.23.01 1.06.57-2.31-1.26-.78-1.72-1.5 1.21 1.3 1.19z" fill="currentColor"/>
  </svg>
);

const EarthIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
  </svg>
);

const Hero = () => {
  const stats = [
    { value: '50+', label: 'Trường học' },
    { value: '10,000+', label: 'Học sinh' },
    { value: '500K+', label: 'Vật phẩm phân loại' },
    { value: '85%', label: 'Độ chính xác TB' },
  ];

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-green-500/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <LeafIcon className="w-24 h-24" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-emerald-500/20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <LeafIcon className="w-16 h-16" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-blue-500/20"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <EarthIcon className="w-20 h-20" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-green-500/20"
          animate={{ y: [0, -20, 0], rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <RecycleIcon className="w-28 h-28" />
        </motion.div>
        
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-8">
            <StarOutlined className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Giáo dục môi trường qua trò chơi</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="text-gray-900">Học phân loại rác</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              thật vui & dễ dàng!
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            EcoVerse giúp học sinh tiểu học học về bảo vệ môi trường thông qua 
            <span className="text-green-600 font-semibold"> game tương tác</span>, 
            <span className="text-blue-600 font-semibold"> quiz thú vị</span> và 
            <span className="text-orange-600 font-semibold"> phần thưởng hấp dẫn</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              className="h-14 px-8 text-lg font-semibold bg-green-600 hover:bg-green-700 border-none shadow-lg hover:shadow-xl transition-all group"
            >
              Chơi thử ngay
              <ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="large"
              className="h-14 px-8 text-lg font-semibold bg-white/80 backdrop-blur-sm border-2 border-green-200 hover:border-green-400 text-gray-700 hover:text-green-700 shadow-md hover:shadow-lg transition-all"
            >
              Tìm hiểu thêm
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
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