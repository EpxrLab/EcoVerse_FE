import React, { useState, useEffect } from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const LeafIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
      fill="currentColor"
    />
    <path
      d="M12 6c-3.3 0-6 2.7-6 6 0 1.7.7 3.2 1.9 4.3.5-1.1 1.4-2 2.5-2.6-.6-.6-1-1.4-1-2.3 0-1.8 1.5-3.3 3.3-3.3S16 9.6 16 11.4c0 .9-.4 1.7-1 2.3 1.1.6 2 1.5 2.5 2.6 1.2-1.1 1.9-2.6 1.9-4.3 0-3.3-2.7-6-6-6z"
      fill="currentColor"
    />
  </svg>
);

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Tính năng", href: "#features" },
    { label: "Vai trò", href: "#roles" },
    { label: "Chơi thử", href: "#demo" },
    { label: "Liên hệ", href: "#contact" },
  ];

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#f9faf6]/80 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(45,106,79,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-[#2d6a4f] to-[#1f5e44] flex items-center justify-center shadow-lg shadow-green-900/10"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <LeafIcon className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-extrabold tracking-tight text-[#2e3430] font-greenhouse-heading">EcoVerse</span>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-base font-semibold text-[#5b605c] hover:text-[#2d6a4f] transition-all duration-300 relative group/link font-greenhouse-body"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {link.label}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2d6a4f] rounded-full"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              type="text"
              size="large"
              onClick={() => handleNavigate("/auth")}
              className="font-bold text-[#5b605c] hover:text-[#2d6a4f] font-greenhouse-heading"
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => handleNavigate("/")}
              className="h-12 px-8 bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] hover:from-[#1f5e44] hover:to-[#2d6a4f] border-none font-bold rounded-full shadow-lg shadow-green-900/20 transform transition-all active:scale-95 font-greenhouse-heading"
            >
              Bắt đầu ngay
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-900"
            size="large"
          />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 border-t border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Button
                    type="text"
                    size="large"
                    onClick={() => handleNavigate("/auth")}
                    className="w-full font-medium"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => handleNavigate("/")}
                    className="w-full bg-green-600 hover:bg-green-700 border-none font-medium"
                  >
                    Bắt đầu ngay
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default NavBar;
