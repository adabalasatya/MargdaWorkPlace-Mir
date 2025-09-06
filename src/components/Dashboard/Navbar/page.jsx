"use client";

import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaDatabase,
  FaUserTie,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaDashcube,
  FaTachometerAlt,
  FaChartPie,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserProfile from "./UserProfile";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // State to track if component has mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loginUserID, setLoginUserID] = useState(null);

  useEffect(() => {
    // Set mounted to true after first render
    setIsMounted(true);

    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          setLoginUserID(parsedData?.user_data?.userID || null);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
    router.push("/");
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Show loading skeleton until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative flex items-center justify-between px-3 py-2  bg-white text-gray-800 shadow-md rounded-lg">
        {/* Mobile Menu Icon (Loading state) */}
        <div className="sm:hidden flex items-center">
          <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
            <span>Menu</span>
          </div>
        </div>

        {/* User Profile Icon (Loading state) */}
        <div className="sm:hidden flex items-center ml-auto">
          <div className="px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
          </div>
        </div>

        {/* Desktop version (Loading state) */}
        <div className="hidden sm:flex items-center w-full ml-10">
          <div className="flex justify-start w-full space-x-4 sm:space-x-8 whitespace-nowrap">
            <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-800  bg-white border-2 border-gray-300 rounded-lg shadow-md sm:px-4 sm:py-2 sm:text-sm">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
              <span>Contact List</span>
            </div>
          </div>

          {/* <div className="flex space-x-4 sm:space-x-8 ml-auto mr-16 whitespace-nowrap">
            <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white hover:bg-[#6247aa]  border-2 border-gray-300 rounded-lg shadow-md sm:px-4 sm:py-2 sm:text-sm">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
              <span>Team-Support</span>
            </div>
          </div> */}

          <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between px-6 py-2 bg-gradient-to-r from-white via-slate-50 to-white border border-gray-200/50 shadow-md rounded-2xl backdrop-blur-sm m-2 transition-all duration-300 hover:shadow-3xl">
      {/* Mobile Menu Icon (Visible only on mobile screens) */}
      <div className="sm:hidden flex items-center">
        <button
          onClick={toggleMenu}
          className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-orange-500 hover:text-white transition-colors duration-300 ease-in-out"
        >
          {isMenuOpen ? (
            <FaTimes className="mr-2" />
          ) : (
            <FaBars className="mr-2" />
          )}
          Menu
        </button>
      </div>

      {/* User Profile Icon (Visible only on mobile screens) */}
      <div className="sm:hidden flex items-center ml-auto">
        <div className="px-3 py-2">
          <UserProfile />
        </div>
      </div>

      {/* Mobile Menu (Visible only on mobile screens) */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex flex-col space-y-2 p-4">
            <Link
              href="/dashboard"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 to-blue-600  hover:text-white transition-colors duration-300 ease-in-out"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaChartPie className="mr-2" /> Dashboard
            </Link>
            <Link
              href="/ContactList"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 to-blue-600  hover:text-white transition-colors duration-300 ease-in-out"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaDatabase className="mr-2" /> Contact List
            </Link>

            {/* {loginUserID === 1 && (
              <Link 
                href="/all-users"
                className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-[#6247aa]  hover:text-white transition-colors duration-300 ease-in-out"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserTie className="mr-2" /> All Users
              </Link>
            )} */}
            {/* <Link 
              href="/work/mart"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-[#6247aa]  hover:text-white transition-colors duration-300 ease-in-out"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaShoppingCart className="mr-2" /> Mart
            </Link> */}
            {/* <Link
              href="/team-support"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 to-blue-600  hover:text-white transition-colors duration-300 ease-in-out"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUsers className="mr-2" /> Team-Support
            </Link> */}
          </div>
        </div>
      )}

      {/* Buttons (Visible on larger screens) */}
      <div className="hidden sm:flex items-center w-full ml-10">
        {/* Centered Nav Items */}
        <div className="flex justify-start w-full space-x-4 sm:space-x-8 whitespace-nowrap">
           <Link
            href="/dashboard"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 to-blue-600 hover:text-white transition-colors duration-300 ease-in-out sm:px-4 sm:py-2 sm:text-sm"
          >
            <FaChartPie className="mr-2" /> Dashboard
          </Link>

          <Link
            href="/ContactList"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 to-blue-600 hover:text-white transition-colors duration-300 ease-in-out sm:px-4 sm:py-2 sm:text-sm"
          >
            <FaDatabase className="mr-2" /> Contact List
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex space-x-4 sm:space-x-8 ml-auto mr-16 whitespace-nowrap">
          {/* <Link
            href="/team-support"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 to-blue-600  hover:text-white transition-colors duration-300 ease-in-out sm:px-4 sm:py-2 sm:text-sm"
          >
            <FaUsers className="mr-2" /> Team-Support
          </Link> */}
        </div>

        {/* Profile Section */}
        <UserProfile />
      </div>
    </div>
  );
};

export default Navbar;
