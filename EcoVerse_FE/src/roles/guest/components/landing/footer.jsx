import React from "react";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

// Custom Icons
const LeafIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C14 20 18 14 18 8c0-3-2-4-2-4s-2 1-2 4c0 4-2 6-4 8-2-2-2-4-2-6 0-3-2-4-2-4s-2 1-2 4c0 4.97 3.66 10 10 10 .34 0 .68-.02 1-.07l.95 2.3 1.89-.66C18.1 16.17 18 10 17 8z"
      fill="currentColor"
    />
  </svg>
);

const EarthIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      fill="currentColor"
    />
  </svg>
);

const Footer = () => {
  const footerLinks = {
    product: [
      { label: "Tính năng", href: "#features" },
      { label: "Bảng giá", href: "#pricing" },
      { label: "Dành cho trường học", href: "#schools" },
      { label: "Dành cho phụ huynh", href: "#parents" },
    ],
    support: [
      { label: "Hướng dẫn sử dụng", href: "#guide" },
      { label: "FAQ", href: "#faq" },
      { label: "Liên hệ", href: "#contact" },
      { label: "Chính sách bảo mật", href: "#privacy" },
    ],
  };

  const contactInfo = [
    { icon: MailOutlined, text: "contact@ecoverse.edu.vn" },
    { icon: PhoneOutlined, text: "1900 1234" },
    {
      icon: EnvironmentOutlined,
      text: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="grid md:grid-cols-4 gap-12 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <LeafIcon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold">EcoVerse</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nền tảng giáo dục môi trường gamified dành cho học sinh tiểu học.
              Học phân loại rác qua trò chơi thú vị.
            </p>
          </motion.div>

          {/* Product Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerLinks.product.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerLinks.support.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={index}
                    className="flex items-start gap-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="text-base mt-0.5 text-green-500" />
                    <span>{item.text}</span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <EarthIcon className="w-5 h-5 text-green-500" />
            <span>Cùng bảo vệ Trái Đất xanh</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 EcoVerse. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Decorative gradient */}
      <motion.div
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-green-600/5 rounded-full blur-3xl pointer-events-none"
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
    </footer>
  );
};

export default Footer;
