"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
} from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, url: "https://facebook.com", label: "Facebook" },
    { icon: <FaTwitter />, url: "https://twitter.com", label: "Twitter" },
    { icon: <FaInstagram />, url: "https://instagram.com", label: "Instagram" },
    {
      icon: <FaWhatsapp />,
      url: "https://wa.me/918130960040",
      label: "WhatsApp",
    },
    { icon: <FaLinkedinIn />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <AiOutlineMail />, url: "mailto:work@margda.com", label: "Email" },
  ];

  const quickLinks = [
    { text: "Feedback and Complaints", path: "" },
    { text: "Privacy Statement", path: "" },
    { text: "Terms of Service", path: "" },
    { text: "Refund Policy", path: "" },
    { text: "Pay Online", path: "" },
    { text: "Business Associates", path: "" },
  ];

  const contactItems = [
    { text: "🏠 C-67 NH Complex, Dwarka Mor Metro, New Delhi" },
    { text: "☎ 07965174000" },
    { text: "📞 8130960040" },
    { text: "✆ +918130960040" },
    { text: "✉️ work@margda.com" },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-800 pt-20 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 pb-12"
        >
          {/* Logo and Brand */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center justify-start"
            >
              <div className="p-1 rounded-lg">
                <Image
                  src="/margdalogo.png"
                  alt="Margda Workplace Logo"
                  width={220}
                  height={120}
                  priority
                />
              </div>
            </motion.div>
            <ul className="space-y-3 mt-2">
              {contactItems.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="text-gray-900 text-sm flex items-start"
                >
                  <span className="mr-2">{item.text.split(" ")[0]}</span>
                  <span>{item.text.split(" ").slice(1).join(" ")}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold text-custom-purple">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={link.path}
                    className="inline-flex items-center text-gray-900 hover:text-custom-purple transition-colors duration-300 group"
                  >
                    <HiOutlineArrowNarrowRight className="mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                    {link.text}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold text-custom-purple">
              Stay Updated
            </h3>
            <p className="text-gray-900 text-sm">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-custom-purple focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold transition-all"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>

          {/* Social Media */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold text-custom-purple">
              Connect With Us
            </h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-4 bg-white rounded-full transition-all duration-300 border border-gray-300"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-custom-purple text-lg">
                    {social.icon}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-6 border-t border-gray-200 text-center"
        >
          <p className="text-gray-700 font-semibold text-md">
            Copyright © {new Date().getFullYear()} Digital Softech. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
