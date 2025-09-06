"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaMobileAlt,
  FaRocket,
  FaSignInAlt,
  FaUser,
  FaTools,
  FaBriefcase,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Nav({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const menuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      opacity: 0,
      x: "100%",
      transition: {
        ease: "easeInOut",
        duration: 0.2,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.nav
      ref={navRef}
      className={`fixed w-full top-0 z-[9999] transition-colors duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo (Left Side with Download Button Styling) */}
          <div className="flex ml-10 items-center">
            <Link href="/">
              <motion.div
                className={`group relative mt-2 px-1 py-1 rounded-xl overflow-hidden flex items-center ${
                  isScrolled
                    ? "text-white"
                    : "bg-white text-black shadow-md border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Image
                  src="/margdalogo.png"
                  alt="Margdarshakendra Logo"
                  width={220}
                  height={120}
                  priority
                />
                <motion.span
                  className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isScrolled ? "" : ""
                  }`}
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation (Right Side) */}
          <div className="hidden md:flex items-center space-x-6">
            {/* New Workplace Tools Button */}
            {/* <Link href="/work/workplace-tools">
              <motion.button
                className={`group relative px-4 py-2 font-medium rounded-xl shadow-2xl overflow-hidden flex items-center gap-2 ${
                  isScrolled
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "bg-white text-black shadow-md border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <span className="relative z-10 flex items-center">
                  <FaTools className="text-lg mr-2" />
                  Workplace Tools
                </span>
                <motion.span
                  className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isScrolled ? "" : ""
                  }`}
                />
                <FaRocket className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10" />
              </motion.button>
            </Link> */}

            {/* Service Exchange Button */}
            {/* <Link href="/work/demo-service-exchange">
              <motion.button
                className={`group relative px-4 py-2 font-medium rounded-xl shadow-2xl overflow-hidden flex items-center gap-2 ${
                  isScrolled
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "bg-white text-black shadow-md border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <span className="relative z-10 flex items-center">
                  <FaBriefcase className="text-lg mr-2" />
                  Service Exchange
                </span>
                <motion.span
                  className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isScrolled ? "" : ""
                  }`}
                />
                <FaRocket className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10" />
              </motion.button>
            </Link> */}

            {/* <Link href="/work/margda-app">
              <motion.button
                className={`group relative px-4 py-2 font-medium rounded-xl shadow-2xl overflow-hidden flex items-center gap-2 ${
                  isScrolled
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "bg-white text-black shadow-md border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <span className="relative z-10 flex items-center">
                  <FaMobileAlt className="text-lg mr-2" />
                  Margda App
                </span>
                <motion.span
                  className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isScrolled ? "" : ""
                  }`}
                />
                <FaRocket className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10" />
              </motion.button>
            </Link> */}

            <Link href="/login">
              <motion.button
                className={`group relative px-6 py-2 font-medium rounded-xl shadow-2xl overflow-hidden flex items-center ${
                  isScrolled
                    ? " bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "bg-white text-black shadow-md border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <span className="relative z-10 flex items-center">
                  <FaUser className="mr-2" />
                  Login
                </span>
                <motion.span
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isScrolled ? "" : ""
                  }`}
                />
              </motion.button>
            </Link>

            <Link href="/register">
              <motion.button
                className={`relative px-6 py-2 font-medium rounded-xl shadow-2xl overflow-hidden group ${
                  isScrolled
                    ? " bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "bg-white text-black shadow-md border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <motion.span
                    className="ml-2 inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.span
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isScrolled ? "" : ""
                  }`}
                />
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu button (Right Side) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
              aria-label="Main menu"
            >
              {menuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[99999]"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl z-[99999]"
              variants={menuVariants}
            >
              <div className="h-full flex flex-col py-6 px-4 overflow-y-auto">
                <div className="flex items-center justify-between px-4 mb-8">
                  <Link href="/" onClick={() => setMenuOpen(false)}>
                    <Image
                      src="/margdalogo.png"
                      alt="Logo"
                      width={220}
                      height={56}
                      className="h-14 w-auto"
                    />
                  </Link>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <motion.div
                  className="flex-1 flex flex-col space-y-6 px-4"
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  {/* New Workplace Tools Menu Item */}
                  {/* <motion.div variants={navItemVariants} custom={2}>
                    <Link
                      href="/work/workplace-tools"
                      className="group relative flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <FaTools className="text-xl" />
                        <span>Workplace Tools</span>
                      </div>
                      <FaRocket className="text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div> */}

                  {/* Mobile Service Exchange Button */}
                  {/* <Link
                    href="/work/demo-service-exchange"
                    className="group relative flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <FaBriefcase className="text-xl" />
                      <span>Service Exchange</span>
                    </div>
                    <FaRocket className="text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                  </Link> */}

                  {/* <motion.div variants={navItemVariants} custom={1}>
                    <Link
                      href="/work/margda-app"
                      className="group relative flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <FaMobileAlt className="text-xl" />
                        <span>Margda App</span>
                      </div>
                      <FaRocket className="text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div> */}

                  <motion.div variants={navItemVariants} custom={3}>
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>

                  <motion.div variants={navItemVariants} custom={4}>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                    >
                      <motion.button
                        className={`relative w-full px-6 py-3 font-medium rounded-xl shadow-2xl overflow-hidden group ${
                          isScrolled
                            ? "bg-white text-black hover:bg-gray-100 shadow-md border border-white"
                            : "bg-white text-blue-600 hover:bg-blue-50 shadow-md border border-white/20"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          Get Started
                          <motion.span
                            className="ml-2 inline-block"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </span>
                        <motion.span
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                            isScrolled ? "bg-gray-100" : "bg-white/30"
                          }`}
                        />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Nav;
