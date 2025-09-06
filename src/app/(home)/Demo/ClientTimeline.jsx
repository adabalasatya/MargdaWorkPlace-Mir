'use client'

import React, { useEffect, useState, useRef } from "react";
import ReactAudioPlayer from "react-audio-player";
import { motion } from "framer-motion";
import {
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaSms,
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaRocket,
} from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import { HiPhoneOutgoing, HiPhoneIncoming } from "react-icons/hi";
import { FcMissedCall } from "react-icons/fc";
import { TbCancel } from "react-icons/tb";

// Animation variants for the glowing effect
const glowVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 0.4,
    scale: 1,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Animation variants for header elements
const headerVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const subHeaderVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2 } },
};

const descriptionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.4 } },
};

const ClientTimeline = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [leadData, setLeadData] = useState({});
  const [logsData, setLogsData] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocalData, setUserLocalData] = useState({});
  const [userName, setUserName] = useState("User");
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Dummy Data
  const dummyLogs = [
    {
      id: 1,
      type: "C",
      call_start: "2025-06-25T10:00:00",
      umobile: "1234567890",
      cmobile: "09****321",
      calltype: "I",
      duration: 120,
      call_url: "https://cloud.example.com/recording1.mp3",
      remarks: "Discussed project details",
      fdate: "2025-06-26T14:00:00",
    },
    {
      id: 2,
      type: "E",
      edate: "2025-06-24T09:00:00",
      from_mail: "sender@example.com",
      to_mail: "client***@example.com",
      subject: "Project Proposal",
      matter: "<p>Dear Client, here is the proposal...</p>",
      remarks: "Sent proposal email",
      fdate: "2025-06-27T10:00:00",
    },
    {
      id: 3,
      type: "W",
      edate: "2025-06-23T15:00:00",
      sender: "1234567890",
      receiver: "098******4321",
      message: "Please confirm the meeting time.",
      remarks: "Sent WhatsApp reminder",
    },
    {
      id: 4,
      type: "S",
      edate: "2025-06-22T12:00:00",
      sender: "1234567890",
      receiver: "09*****54321",
      message: "Meeting scheduled for tomorrow.",
      remarks: "Sent SMS confirmation",
    },
    {
      id: 5,
      type: "M",
      edate: "2025-06-21T11:00:00",
      source: "G",
      link_code: "abc-123-xyz",
      start_time: "2025-06-21T11:00:00",
      invitees: ["client1@example.com", "client2@example.com"],
      remarks: "Google Meet discussion",
    },
  ];

  useEffect(() => {
    // Handle client-side localStorage access
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      setUserLocalData(userData);
      setUserName(userData.user_data?.name || "User");
    }

    // Handle route params/state (you might need to pass data through URL params or other means)
    // Since Next.js doesn't have location.state, you'd need to handle this differently
    // For example, you could pass data through URL parameters or use a state management solution
    
    setLogsData(
      dummyLogs.sort(
        (a, b) =>
          new Date(b.edate || b.call_start) - new Date(a.edate || a.call_start)
      )
    );
    setFilteredLogs(
      dummyLogs.sort(
        (a, b) =>
          new Date(b.edate || b.call_start) - new Date(a.edate || a.call_start)
      )
    );
  }, []);

  useEffect(() => {
    const filtered = logsData.filter((event) => {
      const searchString = searchTerm.toLowerCase();
      return (
        event.remarks?.toLowerCase().includes(searchString) ||
        event.message?.toLowerCase().includes(searchString) ||
        event.subject?.toLowerCase().includes(searchString) ||
        event.from_mail?.toLowerCase().includes(searchString) ||
        event.to_mail?.toLowerCase().includes(searchString) ||
        event.link_code?.toLowerCase().includes(searchString)
      );
    });
    setFilteredLogs(filtered);
  }, [searchTerm, logsData]);

  // Updated Automatic scrolling logic for continuous forward and backward motion
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || filteredLogs.length === 0) return;

    const scrollSpeed = 2; // Increased speed for better visibility
    const scrollInterval = 16; // ~60fps (1000ms / 60)
    let direction = 1; // 1 for forward, -1 for backward

    const scroll = () => {
      if (!isPaused) {
        container.scrollLeft += scrollSpeed * direction;

        // Check if we've reached the end or beginning
        if (
          container.scrollLeft >=
          container.scrollWidth - container.clientWidth - 5
        ) {
          direction = -1; // Reverse direction to scroll backward
        } else if (container.scrollLeft <= 5) {
          direction = 1; // Reverse direction to scroll forward
        }
      }
    };

    const intervalId = setInterval(scroll, scrollInterval);

    return () => clearInterval(intervalId);
  }, [isPaused, filteredLogs.length]);

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "C":
        return <FaPhone className="text-white text-lg" />;
      case "E":
        return <FaEnvelope className="text-white text-lg" />;
      case "W":
        return <FaWhatsapp className="text-white text-lg" />;
      case "S":
        return <FaSms className="text-white text-lg" />;
      default:
        return <FaUsers className="text-white text-lg" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "C":
        return "bg-blue-500";
      case "E":
        return "bg-red-500";
      case "W":
        return "bg-green-500";
      case "S":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCallTypeIcon = (calltype) => {
    switch (calltype) {
      case "I":
        return <HiPhoneIncoming className="text-green-500" />;
      case "O":
        return <HiPhoneOutgoing className="text-blue-500" />;
      case "M":
        return <FcMissedCall className="text-red-500" />;
      case "R":
        return <TbCancel className="text-slate-500" />;
      default:
        return null;
    }
  };

  const blurSenderNumber = (number) => {
    if (!number) return "N/A";
    return number.slice(0, 2) + "****" + number.slice(-2);
  };

  return (
    <div className="py-4 px-4 sm:px-3 lg:px-4 font-sans">
      <div className="relative">
        <div className="text-center relative">
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 rounded-full blur-md"
          />
          <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-full text-sm font-medium inline-flex items-center">
            <FaRocket className="mr-2" /> Client Timeline Dashboard
          </div>
        </div>

        {/* Timeline Container */}
        <div>
          <div className="relative">
            {/* Horizontal Scrollable Events */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-6 pt-12 px-4 space-x-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{ scrollBehavior: "smooth" }}
            >
              {filteredLogs.map((event, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 relative"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {/* Horizontal Connecting Line Between Icons (except last card) */}
                  {index < filteredLogs.length - 1 && (
                    <div className="absolute -top-4 right-1 w-96 h-1 bg-orange-400 z-0 translate-x-1/2" />
                  )}

                  {/* Timeline Node */}
                  <div className="relative">
                    <motion.div
                      className={`absolute -top-8 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-white ${getEventTypeColor(
                        event.type
                      )}`}
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                    >
                      {getEventTypeIcon(event.type)}
                    </motion.div>
                  </div>

                  {/* Event Card */}
                  <div className="mt-6">
                    <div
                      className={`p-4 text-white font-medium ${getEventTypeColor(
                        event.type
                      )} rounded-t-xl`}
                    >
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt />
                          <span>
                            {new Date(
                              event.call_start || event.edate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <span>
                          {new Date(
                            event.call_start || event.edate
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 max-h-60 overflow-y-auto space-y-3 text-sm">
                      {event.type === "C" && (
                        <>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">
                              Your Mobile:
                            </span>
                            <span>{blurSenderNumber(event.umobile)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">
                              Client Mobile:
                            </span>
                            <div className="flex items-center gap-2">
                              <span>{event.cmobile}</span>
                              {getCallTypeIcon(event.calltype)}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">
                              Duration:
                            </span>
                            <span>{event.duration} sec</span>
                          </div>
                          {event.call_url && (
                            <div>
                              <span className="font-medium text-gray-600 block mb-1">
                                Recording:
                              </span>
                              {event.call_url.startsWith("https://cloud") ? (
                                <ReactAudioPlayer
                                  src={event.call_url}
                                  controls
                                  className="w-full"
                                />
                              ) : event.call_url.startsWith("https://drive") ? (
                                <iframe
                                  width="100%"
                                  height="60"
                                  className="rounded-lg border border-gray-200"
                                  sandbox="allow-same-origin allow-scripts allow-presentation"
                                  src={
                                    event.call_url.split("view")[0] + "preview"
                                  }
                                />
                              ) : (
                                <span className="text-gray-500 italic">
                                  No playable recording
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {event.type === "E" && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              From:
                            </span>
                            <span className="break-all">{event.from_mail}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              To:
                            </span>
                            <span className="break-all">{event.to_mail}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              Subject:
                            </span>
                            <span>{event.subject}</span>
                          </div>
                          {event.matter && (
                            <div>
                              <span className="font-medium text-gray-600 block">
                                Content:
                              </span>
                              <div
                                className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 max-h-20 overflow-y-auto"
                                dangerouslySetInnerHTML={{
                                  __html: event.matter,
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                      {(event.type === "W" || event.type === "S") && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              Sender:
                            </span>
                            <span>{blurSenderNumber(event.sender)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              Receiver:
                            </span>
                            <span>{event.receiver}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              Message:
                            </span>
                            <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                              {event.message}
                            </div>
                          </div>
                        </>
                      )}
                      {!["C", "E", "W", "S"].includes(event.type) && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600 block">
                              Meeting Type:
                            </span>
                            <span>
                              {event.source === "G"
                                ? "Google Meet"
                                : event.source === "Z"
                                ? "Zoom"
                                : event.source === "M"
                                ? "Microsoft Teams"
                                : event.source}
                            </span>
                          </div>
                          {event.link_code && (
                            <div>
                              <span className="font-medium text-gray-600 block">
                                Meeting Code:
                              </span>
                              <span className="break-all">
                                {event.link_code}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-600 block">
                              Start Time:
                            </span>
                            <span>
                              {new Date(event.start_time).toLocaleString()}
                            </span>
                          </div>
                          {event.invitees && event.invitees.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-600 block">
                                Attendees:
                              </span>
                              <div className="mt-1 space-y-1">
                                {event.invitees.map((attendee, i) => (
                                  <div
                                    key={i}
                                    className="py-1 border-b border-gray-100 last:border-0"
                                  >
                                    {attendee}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <div className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div>
                            <span className="font-medium text-gray-600">
                              Remarks:
                            </span>
                            <span className="ml-1 text-gray-700">
                              {event.remarks || "No remarks"}
                            </span>
                          </div>
                          {event.fdate && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Followup:</span>
                              <span className="ml-1">
                                {new Date(event.fdate).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTimeline;
