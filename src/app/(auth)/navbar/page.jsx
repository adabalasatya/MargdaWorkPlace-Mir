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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
    <>
      {/* Navbar - INCREASED Z-INDEX */}
      <motion.nav
        ref={navRef}
        className="fixed w-full top-0 z-[100] bg-white/90 backdrop-blur-md shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo (Left Side) */}
            <div className="flex ml-10 items-center">
              <Link href="/">
                <motion.div
                  className="group relative mt-2 px-1 py-1 flex items-center"
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
                  <motion.span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </Link>
            </div>

            {/* Desktop Navigation (Right Side) */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/login">
                <motion.button
                  className="group relative px-6 py-2 font-medium rounded-xl shadow-2xl overflow-hidden flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <span className="relative z-10 flex items-center">
                    <FaUser className="mr-2" />
                    Login
                  </span>
                  <motion.span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  className="relative px-6 py-2 font-medium rounded-xl shadow-2xl overflow-hidden group bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
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
                  <motion.span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
            </div>

            {/* Mobile menu button (Right Side) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none text-gray-800 relative z-[101]"
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
      </motion.nav>

      {/* Mobile menu - MOVED TO PORTAL-LIKE POSITION WITH HIGHEST Z-INDEX */}
      <AnimatePresence>
        {menuOpen && (
          <div className="md:hidden">
            {/* Backdrop with HIGHEST z-index */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              style={{ zIndex: 999999 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu Panel with HIGHEST z-index */}
            <motion.div
              className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl"
              style={{ zIndex: 999999 }}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
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
                    <Link href="/register" onClick={() => setMenuOpen(false)}>
                      <motion.button
                        className="relative w-full px-6 py-3 font-medium rounded-xl shadow-2xl overflow-hidden group bg-white text-blue-600 hover:bg-blue-50 shadow-md border border-blue-600"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          Register
                          <motion.span
                            className="ml-2 inline-block"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </span>
                        <motion.span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/30" />
                      </motion.button>
                    </Link>
                  </motion.div>

                   <motion.div variants={navItemVariants} custom={3}>
                    <Link
                      href="/forget-passcode"
                      className="block w-full text-center px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Forget Password
                    </Link>
                  </motion.div>

                  
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Nav;
