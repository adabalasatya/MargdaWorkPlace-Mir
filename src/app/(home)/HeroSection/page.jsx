"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";

function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const springScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
  });
  const widthProgress = useTransform(springScroll, [0, 1], ["0%", "100%"]);

  // Dynamic cursor spring
  const springX = useSpring(cursorPos.x, { stiffness: 300, damping: 20 });
  const springY = useSpring(cursorPos.y, { stiffness: 300, damping: 20 });

  // Typewriter effect with multiple phrases
  const phrases = [
    "Your Business Engine",
    "All-in-One Platform",
    "Growth Accelerator",
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [tagline, setTagline] = useState("");

  // Track if component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let i = 0;
    const typeWriter = setInterval(() => {
      if (i < phrases[currentPhraseIndex].length) {
        setTagline(phrases[currentPhraseIndex].slice(0, i + 1));
        i++;
      } else {
        setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTagline("");
        }, 2000);
        clearInterval(typeWriter);
      }
    }, 100);
    return () => clearInterval(typeWriter);
  }, [currentPhraseIndex]);

  // Cursor tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    if (isClient) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isClient]);

  // Feature rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Verified Data",
      description: "Accurate, curated data for better decisions",
      icon: "📊",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Unified Communication",
      description: "All channels in one powerful hub",
      icon: "💬",
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Smart Automation",
      description: "Streamline operations with tools",
      icon: "⚡",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  // Predefined particle configurations to avoid random values
  const particleConfigs = [
    { x: 100, y: 150, width: 4, height: 4, duration: 15, delay: 0 },
    { x: 300, y: 300, width: 6, height: 6, duration: 18, delay: 1 },
    { x: 500, y: 100, width: 3, height: 3, duration: 12, delay: 2 },
    { x: 700, y: 400, width: 5, height: 5, duration: 20, delay: 0.5 },
    { x: 200, y: 500, width: 7, height: 7, duration: 16, delay: 1.5 },
    { x: 800, y: 200, width: 4, height: 4, duration: 14, delay: 3 },
    { x: 150, y: 350, width: 8, height: 8, duration: 22, delay: 2.5 },
    { x: 600, y: 450, width: 3, height: 3, duration: 13, delay: 4 },
    { x: 400, y: 250, width: 6, height: 6, duration: 17, delay: 1.2 },
    { x: 750, y: 350, width: 5, height: 5, duration: 19, delay: 3.5 },
    { x: 250, y: 150, width: 4, height: 4, duration: 16, delay: 0.8 },
    { x: 550, y: 300, width: 7, height: 7, duration: 21, delay: 2.8 },
    { x: 350, y: 450, width: 3, height: 3, duration: 14, delay: 4.2 },
    { x: 650, y: 180, width: 6, height: 6, duration: 18, delay: 1.8 },
    { x: 450, y: 380, width: 5, height: 5, duration: 15, delay: 3.2 },
    { x: 180, y: 280, width: 4, height: 4, duration: 17, delay: 0.3 },
    { x: 680, y: 420, width: 8, height: 8, duration: 20, delay: 2.3 },
    { x: 380, y: 120, width: 3, height: 3, duration: 13, delay: 4.8 },
    { x: 580, y: 480, width: 6, height: 6, duration: 19, delay: 1.3 },
    { x: 280, y: 220, width: 5, height: 5, duration: 16, delay: 3.8 },
  ];

  // Predefined floating element configurations
  const floatingElementConfigs = [
    { width: 150, height: 80, x: 30, y: 20, rotate: 5 },
    { width: 180, height: 100, x: -20, y: 40, rotate: -8 },
    { width: 160, height: 90, x: 10, y: -30, rotate: 3 },
  ];

  return (
    <div className="relative bg-gradient-to-br from-purple-900 to-blue-600 overflow-hidden min-h-screen">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isClient && particleConfigs.map((config, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            initial={{
              x: config.x,
              y: config.y,
              width: config.width,
              height: config.height,
            }}
            animate={{
              y: [config.y, config.y + 50, config.y - 30, config.y],
              x: [config.x, config.x + 30, config.x - 20, config.x],
              opacity: [0.2, 0.8, 0.3, 0.2],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              repeatType: "loop",
              delay: config.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <section className="relative px-4 md:px-12 py-20 md:py-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between min-h-screen">
        {/* Left Content */}
        <div className="relative z-10 w-full md:w-1/2 space-y-10">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl sm:text-3xl md:text-6xl font-bold text-white mr-2 leading-tight">
              <motion.span
                className="inline-block bg-gradient-to-r from-white to-gray-300 p-2 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Business and Income Platform
              </motion.span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPhraseIndex}
                  className="block text-2xl md:text-3xl font-medium text-white/80 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {tagline}
                  <motion.span
                    className="ml-1 inline-block w-1 h-8 bg-white align-middle"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.span>
              </AnimatePresence>
            </h1>

            <motion.p
              className="text-lg md:text-xl text-white/70 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Margda Workplace integrates five core services into a single
              platform, reducing costs by 60% while increasing efficiency by
              150%.
            </motion.p>
          </motion.div>

          {/* Interactive Features */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Link href="/work/signup">
              <motion.button
                className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl overflow-hidden group"
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
                <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Right Image - 3D Floating Effect */}
        <motion.div
          className="relative w-full md:w-1/2 mt-16 md:mt-0"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <motion.div
              className="w-full max-w-xl mx-auto rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
              initial={{ y: 0, rotateY: 0 }}
              animate={{
                y: [0, 15, 0],
                rotateY: [0, 2, 0],
              }}
              transition={{
                y: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotateY: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Image
                src="https://margda.com/public/images/heroimage.png"
                alt="Margda Workplace Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
                onError={(e) => {
                  console.log('Image failed to load');
                }}
              />
            </motion.div>
            {/* Floating elements around the main image */}
            {isClient && floatingElementConfigs.map((config, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-xl border border-white/10 backdrop-blur-sm ${
                  i === 0
                    ? "bg-blue-500/20"
                    : i === 1
                    ? "bg-purple-500/20"
                    : "bg-emerald-500/20"
                }`}
                initial={{
                  width: config.width,
                  height: config.height,
                  x: config.x,
                  y: config.y,
                  rotate: config.rotate,
                }}
                animate={{
                  y: [config.y, config.y + 20, config.y - 10, config.y],
                  rotate: [config.rotate, config.rotate + 5, config.rotate - 3, config.rotate],
                }}
                transition={{
                  duration: 6 + i * 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{
                  zIndex: -1,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-sm text-white/50 mb-2">Scroll</span>
            <svg
              className="w-6 h-6 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 z-50"
        style={{ scaleX: widthProgress }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />

      {/* Custom Cursor */}
      {isClient && (
        <motion.div
          className="fixed w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm pointer-events-none z-50 border border-white/20"
          style={{
            x: springX,
            y: springY,
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 0.7 : 0.4,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );
}

export default HeroSection;
