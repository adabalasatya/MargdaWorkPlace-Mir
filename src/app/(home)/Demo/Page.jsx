"use client";

import React from "react";
import {
  FaDatabase,
  FaComments,
  FaUsers,
  FaCog,
  FaBullhorn,
  FaTarget,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import ClientTimeline from "./ClientTimeline";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

// New animation variants for images
const imageFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const Demo = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden font-sans">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Service 1: Verified Data */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center mb-20 group"
        >
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <div className="flex items-start mb-6">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="p-3 bg-blue-100 rounded-lg mr-5"
              >
                <FaDatabase className="w-6 h-6 text-blue-600" />
              </motion.div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Verified Data:
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Access to need-based, worldwide data of individuals and
                  businesses for marketing, sales, recruitment, and other
                  purposes.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Real-time updated information
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Advanced filtering and segmentation
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    GDPR-compliant data handling
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageFromRight}
            className="order-1 lg:order-2 transform group-hover:scale-[1.02] transition-transform duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl border border-blue-200"
            >
              <Image
                src="/dashboard.png"
                alt="Verified Data Dashboard"
                fill
                className="object-fit"
                sizes="(max-width: 768px) 120vw, 50vw"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Service 2: Unified Communication */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="flex items-start mb-6">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="p-3 bg-green-100 rounded-lg mr-5"
            >
              <FaComments className="w-6 h-6 text-green-600" />
            </motion.div>
            <div className="w-full">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Unified Communication:
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Browser-integrated SIM+API-based multichannel communication like
                Calls, WhatsApp, SMS, Email, Virtual Meetings, and Visit
                Tracking with clients' timelines.
              </p>
              {/* Embed ClientTimeline Component */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl p-6 border border-green-200"
              >
                <ClientTimeline />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Service 3: Service Exchange */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center mb-20 group"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-start mb-6">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="p-3 bg-purple-100 rounded-lg mr-5"
              >
                <FaUsers className="w-6 h-6 text-purple-600" />
              </motion.div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Service Exchange
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A network of industry-specific, on-demand service providers,
                  commission-based professionals and work/projects available.
                </p>
                <motion.div
                  className="mt-6 flex flex-wrap gap-3"
                  variants={containerVariants}
                >
                  {[
                    "On-demand service providers",
                    "Commission-based professionals",
                    "Work Available",
                  ].map((item, index) => (
                    <motion.span
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {item}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageFromLeft}
            className="transform group-hover:scale-[1.02] transition-transform duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl border border-purple-200"
            >
              <Image
                src="/serviceexchnage.png"
                alt="Service Exchange Network"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Service 4: Process Automation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center mb-20 group"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageFromRight}
            className="transform group-hover:scale-[1.02] transition-transform duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative w-full h-[550px] lg:h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-orange-200"
            >
              <Image
                src="/Careerchoice.png"
                alt="Process Automation Illustration"
                fill
                className="object-fit"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="flex items-start mb-6">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-4 bg-orange-50 rounded-xl mr-5"
              >
                <FaCog className="w-8 h-8 text-orange-500" />
              </motion.div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                  Process Automation:
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  For Career Counselling, Psychometric Assessment, Recruitment,
                  Marketing, Sales, Training, etc.
                </p>
                <motion.div
                  className="mt-8 space-y-5"
                  variants={containerVariants}
                >
                  {[
                    {
                      title: "Career Counselling",
                      desc: "AI-powered guidance with personalized career path recommendations",
                    },
                    {
                      title: "Psychometric Assessment",
                      desc: "Automated behavioral and skill evaluations for precise insights",
                    },
                    {
                      title: "Recruitment",
                      desc: "Seamless candidate sourcing, screening, and onboarding",
                    },
                    {
                      title: "Marketing Automation",
                      desc: "Data-driven campaigns with real-time analytics and targeting",
                    },
                    {
                      title: "Sales",
                      desc: "Automated lead nurturing and sales funnel management",
                    },
                    {
                      title: "Training",
                      desc: "Customized learning experiences with progress tracking",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      }}
                      className="p-3 bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300"
                    >
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Service 5: Digital Media */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center mb-8 group"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-start mb-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-4 bg-pink-50 rounded-xl mr-5"
              >
                <FaBullhorn className="w-8 h-8 text-pink-500" />
              </motion.div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                  Digital Media:
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Comprehensive solutions for online reputation management
                  (ORM), digital and social media marketing (SMM), business
                  branding, and lead generation.
                </p>
                <motion.div
                  className="mt-8 grid md:grid-cols-2 gap-5"
                  variants={containerVariants}
                >
                  {[
                    {
                      icon: "🌐",
                      title: "Online Reputation Management",
                      desc: "Build and maintain a positive online presence",
                    },
                    {
                      icon: "📣",
                      title: "Social Media Marketing",
                      desc: "Engaging campaigns to boost brand visibility",
                    },
                    {
                      icon: "🎨",
                      title: "Business Branding",
                      desc: "Craft a memorable and authentic brand identity",
                    },
                    {
                      icon: "🚀",
                      title: "Lead Generation",
                      desc: "Targeted strategies to drive quality leads",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      }}
                      className="p-5 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-300"
                    >
                      <span className="text-3xl mb-3 block">{item.icon}</span>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageFromLeft}
            className="transform group-hover:scale-[1.02] transition-transform duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative w-full h-[550px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
            >
              <Image
                src="/post.png"
                alt="Digital Media Solutions Illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Demo;
