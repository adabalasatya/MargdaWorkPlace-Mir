"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  FaPhone, 
  FaTicketAlt, 
  FaRupeeSign, 
  FaUsers,
  FaArrowDown,
  FaArrowUp
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

// Define header variants for animation
const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DownArrow = () => (
  <div className="flex justify-center my-8">
    <FaArrowDown className="w-8 h-8 text-gray-600 animate-bounce" />
  </div>
);

const UpArrow = () => (
  <div className="flex justify-center my-8">
    <FaArrowUp className="w-8 h-8 text-gray-600 animate-bounce" />
  </div>
);

const TeamSupport = () => {
  const { addToast } = useToast();
  const [localUserData, setLocalUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refered, setRefered] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [associate, setAssociate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Client-side only localStorage access
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setLocalUserData(parsedUserData);
      setAccessToken(parsedUserData.access_token);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchTeamDetails();
    }
  }, [accessToken]);

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/user/team/team-details",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        if (data.Refered && data.Refered.length > 0) {
          setRefered(data.Refered);
        }
        if (data.mentor) {
          setMentor(data.mentor);
        }
        if (data.associate) {
          setAssociate(data.associate);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openSupportTicket = () => {
    router.push("/support-ticket");
  };

  const handleCallClick = async (phoneNumber) => {
    if (!localUserData || !accessToken) return;

    if (phoneNumber) {
      try {
        const response = await fetch(
          "https://www.margda.in/api/cloud_telephony/initiate_call_to_lead",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              agent_number: localUserData.user_data.mobile,
              destination_number: phoneNumber,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "Call initiated successfully.");
        } else {
          if (response.status === 400 || response.status === 402) {
            return router.push("/shop");
          }
          toast.error(data.message || "Failed to initiate call.");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message || "An error occurred");
      }
    } else {
      toast.error("This team member hadn't added mobile number yet");
    }
  };

  // Early return if user data is not loaded
  if (!localUserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4">
      {/* Header Section */}
      <motion.header
        className="bg-gray-50"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-12 h-12"
            >
              <Image
                src="/assets/logoicon.png"
                alt="Logo"
                width={48}
                height={48}
                className="rounded-lg shadow-md"
              />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%"],
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{
                background:
                  "linear-gradient(to right, purple, blue, cyan, purple)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                MozBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              Team Support
            </motion.h1>
          </div>
        </div>
      </motion.header>
      <br />
      
      {/* Support Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-1">
        {/* Support Call */}
        <div className="flex flex-col items-center group">
          <div className="w-[360px] h-28 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-400 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-400 transition-all duration-300">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-28 h-28"
              >
                <Image
                  src="/assets/support.jpg"
                  alt="Support Call"
                  width={112}
                  height={112}
                  className="rounded-full border-4 border-white shadow-md"
                />
              </motion.div>
            </div>
          </div>
          <button
            onClick={() => handleCallClick("7965174000")}
            className="flex items-center bg-blue-900 text-white px-8 py-2 rounded-md hover:bg-purple-700 transition-colors mt-6 shadow-md hover:shadow-lg"
          >
            <FaPhone className="mr-2" /> Support Call
          </button>
        </div>
        
        {/* Support Ticket */}
        <div className="flex flex-col items-center group">
          <div className="w-[360px] h-28 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-400 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-400 transition-all duration-300">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-28 h-28"
              >
                <Image
                  src="/assets/support1.jpg"
                  alt="Support Ticket"
                  width={112}
                  height={112}
                  className="rounded-full border-4 border-white shadow-md"
                />
              </motion.div>
            </div>
          </div>
          <button
            onClick={openSupportTicket}
            className="flex items-center bg-blue-900 text-white px-8 py-2 rounded-md hover:bg-purple-700 transition-colors mt-6 shadow-md hover:shadow-lg"
          >
            <FaTicketAlt className="mr-2" /> Support Ticket
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-16">
        <div className="flex flex-row justify-around px-6 items-center">
          {associate && (
            <div className="flex flex-col items-center group">
              <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative w-28 h-28"
                  >
                    <Image
                      src={associate.pic_url}
                      alt={associate.name}
                      width={112}
                      height={112}
                      className="rounded-full border-4 border-white shadow-md"
                    />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-12 text-gray-800">
                Associate
              </h3>
              <p className="text-gray-600">{associate.name}</p>
              <button
                onClick={() => handleCallClick(associate.mobile)}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <FaPhone className="mr-2" /> Click to Call
              </button>
            </div>
          )}
          
          {mentor && (
            <div className="flex flex-col items-center group">
              <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative w-28 h-28"
                  >
                    <Image
                      src={mentor.pic_url}
                      alt={mentor.name}
                      width={112}
                      height={112}
                      className="rounded-full border-4 border-white shadow-md"
                    />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-12 text-gray-800">
                Mentor
              </h3>
              <p className="text-gray-600">{mentor.name}</p>
              <button
                onClick={() => handleCallClick(mentor.mobile)}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <FaPhone className="mr-2" /> Click to Call
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team Leaders */}
      <div className="">
        <UpArrow />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            Support TEAM
          </h2>
          <div className="flex flex-col items-center group">
            <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative w-28 h-28"
                >
                  <Image
                    src={localUserData.user_data.pic_url}
                    alt={localUserData.user_data.name}
                    width={112}
                    height={112}
                    className="rounded-full border-4 border-white shadow-md"
                  />
                </motion.div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-12 text-gray-800">
              {localUserData.user_data.name}
            </h3>
          </div>
        </div>

        <DownArrow />

        <div className="text-center pb-9">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            Business Associates
          </h2>

          {refered.length > 0 ? (
            <div className="flex flex-row flex-wrap w-full gap-3">
              {refered.map((item, index) => (
                <div
                  className="flex flex-col items-center group mb-9"
                  key={index}
                >
                  <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative w-28 h-28"
                      >
                        <Image
                          src={
                            item.pic_url ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4uQmq5l06DIuhNUDihsvATgceMTbyKNBzT4Rharp2hacekLEJHq9eaKF1LPaT9_iRpA&usqp=CAU"
                          }
                          alt={item.name}
                          width={112}
                          height={112}
                          className="rounded-full border-4 border-white shadow-md"
                        />
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mt-12 text-gray-800">
                    {item.name}
                  </h3>
                  <div>
                    {item.district && `${item.district} `}
                    {item.pincode && item.pincode}
                  </div>
                  <button
                    onClick={() => handleCallClick(item.mobile)}
                    className="flex flex-col items-center bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center">
                      <FaPhone className="mr-2" /> Click to Call
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>{/* You didn't refer any advisor yet. */}</div>
          )}
        </div>

        {/* Social Icons Section (Example of how converted icons would look) */}
        {/* <ul className="social flex justify-center space-x-6 mt-6">
          <li>
            <a
              onClick={() => callWeb(9289572711)}
              title="Click to call"
              className="flex items-center text-gray-700 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <FaPhone className="text-xl mr-2" />
            </a>
          </li>

          <li>
            <a
              href="#"
              className="flex items-center text-gray-700 hover:text-green-600 transition-colors relative group"
            >
              <FaRupeeSign className="text-xl mr-2" />
              <span className="font-semibold">0</span>

              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Current Balance
              </span>
            </a>
          </li>

          <li>
            <a
              href="https://margdarshak.org/team-support/4584"
              className="flex items-center text-gray-700 hover:text-purple-500 transition-colors relative"
            >
              <FaUsers className="text-xl mr-2" />
              <span>Users</span>
              <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs rounded-full px-2">
                3
              </span>
            </a>
          </li>
        </ul> */}
      </div>

      {/* Copyright Footer */}
      {/* <footer className="mt-5 p-4 text-custom-purple text-md font-bold text-center">
        <p>
          © {new Date().getFullYear()} Digital Softech. All Rights Reserved.
        </p>
      </footer> */}
    </div>
  );
};

export default TeamSupport;
