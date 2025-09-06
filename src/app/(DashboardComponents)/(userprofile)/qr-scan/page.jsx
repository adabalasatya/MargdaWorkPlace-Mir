'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiSmartphone, FiUser, FiCheckCircle, FiAlertCircle, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";

// Custom Image Component to handle both external and internal images
const CustomImage = ({ src, alt, className, width, height, onError, ...props }) => {
  const isExternalUrl = src?.startsWith('http');
  
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: `${width}px`, height: `${height}px` }}
        onError={onError}
        {...props}
      />
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={onError}
      {...props}
    />
  );
};

const QrScanPage = () => {
  const router = useRouter();
  const [instanceId, setInstanceId] = useState(null);
  const [qrCodeSrc, setQrCodeSrc] = useState(null);
  const [name, setName] = useState(null);
  const [getBtnText, setGetButtonText] = useState("Get QR Code");
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const userData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!userData || !userData.userID) {
      return router.push("/login");
    } else {
      setUserID(userData.userID);
      fetchProfiles(userData.userID);
    }
  }, [router]);

  const getInstance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/whatsapp/scan/get-instance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setInstanceId(data.instanceId);
        setQrCodeSrc(data.qrcode);
      } else {
        addToast(data.message, "error");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      addToast(error.message || "An error occurred", "error");
      console.log(error);
    }
  };

  const fetchProfiles = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/whatsapp/scan/get-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setProfile(data.Profile);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const removeAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/whatsapp/scan/delete-profile",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast("Account Logout successfully", "success");
        setProfile([]);
        setQrCodeSrc(null);
        await fetchProfiles(userID)
      } else {
        addToast(data.message, "error");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      addToast(error.message || "An error occurred", "error");
      console.log(error);
    }
  };

  const getQrCode = () => {
    getInstance();
  };

  return (
    <>
      {loading && <Loader />}
      <div className="h-screen overflow-hidden p-2 sm:p-2 lg:p-4">
        <div className="max-w-5xl mx-auto h-full">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Scan WhatsApp
            </h1>
            <p className="text-gray-600 text-md">
              Connect your WhatsApp account to get started
            </p>
          </div>

          {/* Main Content - Side by Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start h-full">
            
            {/* Left Side - QR Code Section */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6  border border-gray-100  hover:shadow-md transition-shadow duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <FiSmartphone className="w-6 h-6 text-green-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Scan QR Code
                </h2>
                
                <p className="text-gray-600 mb-4">
                  Open WhatsApp on your phone and scan the QR code to connect
                </p>

                {/* QR Code Display */}
                <div className="mb-4">
                  {qrCodeSrc ? (
                    <div className="relative inline-block">
                      <CustomImage
                        src={qrCodeSrc}
                        alt="QR Code"
                        width={192}
                        height={192}
                        className="w-48 h-48 mx-auto rounded-xl border-4 border-gray-200 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                        <FiSmartphone className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">Click to generate QR</p>
                    </div>
                  )}
                </div>

                {/* Generate QR Button */}
                <button
                  type="button"
                  onClick={getQrCode}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-md font-semibold rounded-xl  transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <FiRefreshCw className="mr-2" />
                  {getBtnText}
                </button>
              </div>
            </div>

            {/* Right Side - Profile Section */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6  border border-gray-100  hover:shadow-md transition-shadow duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <FiUser className="w-6 h-6 text-blue-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Connected Account
                </h2>
                
                {profile && Object.keys(profile).length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      Your WhatsApp account details
                    </p>

                    {/* Profile Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                      {/* Profile Image */}
                      <div className="relative inline-block mb-4">
                        <CustomImage
                          src={
                            profile.pic
                              ? profile.pic
                              : "https://static-00.iconduck.com/assets.00/whatsapp-icon-256x256-1ysn3lnm.png"
                          }
                          alt={profile.name || "Profile Pic"}
                          width={64}
                          height={64}
                          onError={(e) => {
                            e.target.src =
                              "https://static-00.iconduck.com/assets.00/whatsapp-icon-256x256-1ysn3lnm.png";
                          }}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {/* Status Indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                          profile.active ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {profile.active ? (
                            <FiCheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <FiAlertCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {profile.name || "Unknown User"}
                          </h3>
                          <p className="text-gray-600 font-medium text-sm">
                            {profile.mobile || "No phone number"}
                          </p>
                        </div>

                        {/* Status Badge */}
                        {profile.active ? (
                          <div className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            <FiCheckCircle className="mr-1 w-3 h-3" />
                            Connected & Active
                          </div>
                        ) : (
                          <button
                            onClick={getQrCode}
                            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors duration-200 cursor-pointer"
                          >
                            <FiAlertCircle className="mr-1 w-3 h-3" />
                            Reconnect Required
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Remove Account Button */}
                   {profile && Object.keys(profile).length > 0 && (
                <button
                onClick={removeAccount}
                disabled={!profile.active}
                className={`w-full py-3 px-4 text-white text-md font-semibold rounded-xl transform transition-all duration-200 shadow-lg flex items-center justify-center ${
                  profile.active 
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 hover:shadow-xl cursor-pointer" 
                   : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-70"
                  }`}
                  >
                  <FiTrash2 className="mr-2" />
                {profile.active ? "Logout Account" : "Account Not Connected"}
                </button>
                  )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      No account connected yet
                    </p>
                    
                    {/* Empty State */}
                    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiUser className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-md font-semibold text-gray-600 mb-2">
                          No Profile Found
                        </h3>
                        <p className="text-gray-500 text-xs">
                          Scan the QR code to connect your WhatsApp account
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QrScanPage;