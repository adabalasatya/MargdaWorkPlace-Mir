'use client';
import { useState, useRef, useEffect } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaUserCheck,
  FaRegHandPointRight,
  FaDatabase,
  FaFilter,
  FaUsers,
  FaMapMarkedAlt,
} from "react-icons/fa";

const CRMSection = ({
  selectedRows,
  addToast,
  setShowCallSend,
  setShowSendWhatsapp,
  setShowEmailSend,
  setShowSmsSend,
  setShowReportCon,
  setShowGoogleDataCon,
  dataFilter, // Receive dataFilter as prop
  setDataFilter, // Receive setDataFilter as prop
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Handle outside clicks and scroll/resize for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    const handleScroll = () => {
      if (showFilterDropdown) {
        setShowFilterDropdown(false);
      }
    };

    const handleResize = () => {
      if (showFilterDropdown) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showFilterDropdown]);

  return (
    <div className="bg-white z-20 border-2 border-gray-200 m-2 shadow-md rounded-xl px-3 py-2 mt-3">
      <div className="flex items-center justify-between space-x-4 flex-wrap gap-y-4">
        {/* Left side: Action buttons */}
        <div className="flex items-center space-x-4 flex-wrap gap-y-4">
          <button
            onClick={() => {
              if (selectedRows.length !== 1) {
                addToast("Select one data", "error");
                return;
              }
              setShowCallSend(true);
            }}
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaPhone className="mr-2 text-sm" /> Call
          </button>
          <button
            onClick={() => {
              if (selectedRows.length === 0) {
                addToast("Select at least one data", "error");
                return;
              }
              setShowSendWhatsapp(true);
            }}
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaWhatsapp className="mr-2 text-sm" /> WhatsApp
          </button>
          <button
            onClick={() => {
              if (selectedRows.length === 0) {
                addToast("Select at least one data", "error");
                return;
              }
              setShowEmailSend(true);
            }}
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaEnvelope className="mr-2 text-sm" /> Email
          </button>
          <button
            onClick={() => {
              if (selectedRows.length === 0) {
                addToast("Select at least one data", "error");
                return;
              }
              setShowSmsSend(true);
            }}
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaUserCheck className="mr-2 text-sm" /> SMS
          </button>

          {/* Keeping commented functionality for reference */}
          <button
            onClick={() =>
              addToast("Meet functionality not implemented", "info")
            }
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaUsers className="mr-2 text-sm" /> Meet
          </button>
          <button
            onClick={() =>
              addToast("Visit functionality not implemented", "info")
            }
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaMapMarkedAlt className="mr-2 text-sm" /> Visit
          </button>

          <button
            onClick={() => setShowReportCon(true)}
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaRegHandPointRight className="mr-2 text-sm" /> Work Report
          </button>
          <button
            onClick={() => setShowGoogleDataCon(true)}
            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaDatabase className="mr-2 text-sm" /> Google Data
          </button>
        </div>

        {/* Right side: Filter dropdown */}
        <div className="relative ">
          <button
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <FaFilter className="mr-2" />
            {dataFilter === "all" && "All Data"}
            {dataFilter === "contact" && "Contact Data"}
            {dataFilter === "listid" && "List ID Data"}
          </button>
          
          {showFilterDropdown && (
            <div 
              ref={filterDropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30"
            >
              <button
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                  dataFilter === "all" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => {
                  setDataFilter("all");
                  setShowFilterDropdown(false);
                }}
              >
                All Data
              </button>
              <button
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                  dataFilter === "contact" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => {
                  setDataFilter("contact");
                  setShowFilterDropdown(false);
                }}
              >
                Contact Data (No ListID)
              </button>
              <button
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                  dataFilter === "listid" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => {
                  setDataFilter("listid");
                  setShowFilterDropdown(false);
                }}
              >
                List ID Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMSection;