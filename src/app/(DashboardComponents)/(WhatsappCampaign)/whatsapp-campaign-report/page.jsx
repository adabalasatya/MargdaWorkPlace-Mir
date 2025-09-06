"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiArrowLeft, FiSend, FiFilter, FiCalendar, FiMessageSquare, FiPhone } from "react-icons/fi";
import { FaTimes, FaUserCircle, FaWhatsapp, FaImage, FaFileAlt, FaVideo, FaVolumeUp, FaCheckDouble, FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Loader from "@/app/component/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import AddToTask from "@/app/(DashboardComponents)/(WhatsappCampaign)/addtotaskwhatapp/page";

const WhatsappReport = () => {
  const router = useRouter();
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [lists, setLists] = useState([]);
  const [chats, setChats] = useState([]);
  const [addToListCon, setShowAddToListCon] = useState(false);
  const [selectedList, setSelectedList] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const conversationsListRef = useRef(null);
  const chatDetailsRef = useRef(null);
  const [conversationsScroll, setConversationsScroll] = useState(0);
  const [chatDetailsScroll, setChatDetailsScroll] = useState(0);
  const [userWMobile, setUserWMobile] = useState("919515432936");
  const [listContacts, setListContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignID, setSelectedCampaignID] = useState("");
  const [userID, setUserID] = useState("");
  const [selectedDataID, setSelectedDataID] = useState("");
  const [showAddToTask, setShowAddToTask] = useState(false);

  // Add a ref to store the interval ID
  const intervalRef = useRef(null);

  // Safe sessionStorage access
  const getUserData = () => {
    if (typeof window !== "undefined") {
      const userData = sessionStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  };

  useEffect(() => {
    const userData = getUserData();
    if (!userData || !userData.pic) {
      return router.push("/update-profile");
    } else {
      const userID = userData.userID;
      setUserID(userID);
      fetchData(userID);
      fetchCampaigns(userID);
    }
  }, []);

  // New useEffect for periodic data fetching
  useEffect(() => {
    if (userID) {
      // Set up interval to fetch data every 3 seconds
      intervalRef.current = setInterval(() => {
        fetchData(userID);
      }, 3000);
      
      // Clean up the interval on component unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [userID]); // Run when userID changes

  // Update the fetchData function to prevent unnecessary state updates
  const fetchData = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/whatsapp-campaign/get-report",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Only update state if data has actually changed
        setChats(prevChats => {
          // Simple comparison - you might want a more robust comparison
          if (JSON.stringify(prevChats) !== JSON.stringify(data.data)) {
            return data.data;
          }
          return prevChats;
        });
        
        processContactsFromChats(data.data);
      }
    } catch (error) {
      console.log(error);
      // Don't show toast for interval fetches to avoid spam
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, chats]);

  useEffect(() => {
    if (conversationsListRef.current) {
      conversationsListRef.current.scrollTop = conversationsScroll;
    }
    if (chatDetailsRef.current) {
      chatDetailsRef.current.scrollTop = chatDetailsScroll;
    }
  }, [conversationsScroll, chatDetailsScroll]);

  const fetchCampaigns = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/get-campaigns",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const processContactsFromChats = (chatData) => {
    const contactsMap = new Map();

    const getConversationId = (sender, receiver) => {
      const numbers = [sender, receiver].sort();
      return numbers.join("_");
    };

    chatData.forEach((chat) => {
      const conversationId = getConversationId(chat.sender, chat.receiver);
      
      if (!contactsMap.has(conversationId)) {
        const otherParticipant = chat.sender === userWMobile ? chat.receiver : chat.sender;
        
        contactsMap.set(conversationId, {
          conversationId,
          phoneNumber: otherParticipant,
          profilePic: "",
          unread: 0,
          lastMessageDate: chat.edate,
          lastMessage: chat,
          // NEW: Track last outgoing message separately
          lastOutgoingMessage: chat.sender === userWMobile ? chat : null
        });
      } else {
        const existing = contactsMap.get(conversationId);
        if (new Date(chat.edate) > new Date(existing.lastMessageDate)) {
          existing.lastMessageDate = chat.edate;
          existing.lastMessage = chat;
        }
        // NEW: Update last outgoing message if this is outgoing and newer
        if (chat.sender === userWMobile) {
          if (!existing.lastOutgoingMessage || new Date(chat.edate) > new Date(existing.lastOutgoingMessage.edate)) {
            existing.lastOutgoingMessage = chat;
          }
        }
      }
    });
    
    setAllContacts(Array.from(contactsMap.values()));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "Unknown";
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    } else if (cleaned.length === 12) {
      return cleaned;
    }
    return phoneNumber;
  };

  const getFilteredContacts = () => {
    let filtered = allContacts;
    if (selectedList) {
      const listContactsNumbers = listContacts
        .filter((contact) => contact.listID === selectedList)
        .map((contact) => contact.phoneNumber);
      filtered = filtered.filter((contact) =>
        listContactsNumbers.includes(contact.phoneNumber)
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((contact) =>
        contact.phoneNumber.toLowerCase().includes(query)
      );
    }
    if (selectedCampaignID) {
      const campaignContacts = chats
        .filter((chat) => chat.campaignID == selectedCampaignID)
        .map((chat) => {
          const conversationId = getConversationId(chat.sender, chat.receiver);
          const contact = allContacts.find(c => c.conversationId === conversationId);
          return contact ? contact.phoneNumber : null;
        })
        .filter(Boolean);
      
      filtered = filtered.filter((contact) =>
        campaignContacts.includes(contact.phoneNumber)
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
    );
  };

  const getConversationId = (sender, receiver) => {
    const numbers = [sender, receiver].sort();
    return numbers.join("_");
  };

  const getFilteredMessages = () => {
    if (!selectedChat) return [];
    
    let messages = chats.filter((message) => {
      const messageConversationId = getConversationId(message.sender, message.receiver);
      return messageConversationId === selectedChat.conversationId;
    });

    if (fromDate || toDate) {
      messages = messages.filter((message) => {
        const messageDate = new Date(message.edate);
        const from = fromDate ? new Date(fromDate) : null;
        if (from) from.setHours(0, 0, 0, 0);
        const to = toDate ? new Date(toDate) : null;
        if (to) to.setHours(23, 59, 59, 999);
        const isAfterFrom = !from || messageDate >= from;
        const isBeforeTo = !to || messageDate <= to;
        return isAfterFrom && isBeforeTo;
      });
    }

    return messages.sort((a, b) => new Date(a.edate) - new Date(b.edate));
  };

  const sendMessage = async () => {

    // Find the last outgoing message to get the correct dataID
  const lastOutgoingMessage = chats
    .filter(message => {
      const messageConversationId = getConversationId(message.sender, message.receiver);
      return messageConversationId === selectedChat.conversationId && 
             message.sender === userWMobile;
    })
    .sort((a, b) => new Date(b.edate) - new Date(a.edate))[0];

  const dataIDToUse = lastOutgoingMessage ? lastOutgoingMessage.dataID : 
                     (selectedChat.lastMessage && selectedChat.lastMessage.dataID);
    if (!newMessage.trim() || !selectedChat || !dataIDToUse) {
    toast.error("Cannot send message: Missing required data");
    return;
  }

    try {
      const messageData = {
        userID,
        dataID: dataIDToUse,
        message: newMessage,
      };

      const response = await fetch(
        "https://www.margda.in/miraj/work/data/whatsapp/simple-message",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const newChat = {
          whatsID: Date.now(),
          sender: userWMobile,
          receiver: selectedChat.phoneNumber,
          message: newMessage,
          edate: new Date().toISOString(),
          direction: "O",
          campaignID: selectedCampaignID || null,
        };

        setChats((prev) => [...prev, newChat]);
        setNewMessage("");
        toast.success("Message sent!");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearDates = () => {
    setFromDate("");
    setToDate("");
  };

  const selectChat = (conv) => {
    if (conversationsListRef.current) {
      setConversationsScroll(conversationsListRef.current.scrollTop);
    }
    if (chatDetailsRef.current) {
      setChatDetailsScroll(chatDetailsRef.current.scrollTop);
    }
    setSelectedChat(conv);
  };

  const handleAddToListClick = (conv) => {
  // The dataID should come from the last outgoing message of the conversation
  if (conv && conv.lastOutgoingMessage && conv.lastOutgoingMessage.dataID) {
    setSelectedDataID(conv.lastOutgoingMessage.dataID);
    setShowAddToTask(true);
  } else {
    toast.error("Cannot add to task: Missing message data");
  }
};

  const closeMessagePopup = () => {
    setSelectedMessage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getLastMessagePreview = (conv) => {
    const lastMessage = conv.lastMessage;
    if (!lastMessage) return "No messages";
    if (lastMessage.message) {
      return lastMessage.message.length > 30
        ? `${lastMessage.message.substring(0, 30)}...`
        : lastMessage.message;
    }
    if (lastMessage.pic_url) return "📷 Photo";
    if (lastMessage.doc_url) return "📄 Document";
    if (lastMessage.video_url) return "🎥 Video";
    if (lastMessage.audio_url) return "🔊 Audio";
    return "No message content";
  };

  const getMediaIcon = (message) => {
    if (message.pic_url) return <FaImage className="text-blue-500" />;
    if (message.doc_url) return <FaFileAlt className="text-red-500" />;
    if (message.video_url) return <FaVideo className="text-purple-500" />;
    if (message.audio_url) return <FaVolumeUp className="text-orange-500" />;
    return null;
  };

  const filteredContacts = getFilteredContacts();
  const filteredMessages = getFilteredMessages();

  return (
    <div className="min-h-[100px] overflow-hidden flex flex-col">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
      {loading && <Loader />}

      {/* Main Content Container */}
      <div className="w-full fixed max-w-6xl mx-2 p-3 h-[calc(92vh-20px)] flex flex-col gap-4">
        
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-100 p-2"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FaWhatsapp className="text-md text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  WhatsApp Reports
                </h1>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Date Filters */}
              <div className="flex items-center gap-3 p-2 bg-gray-50/80 rounded-xl border border-gray-200/50">
                <FiCalendar className="text-gray-500" />
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>
                {(fromDate || toDate) && (
                  <button
                    onClick={clearDates}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Campaign Filter */}
              <div className="flex items-center gap-2 p-2 bg-gray-50/80 rounded-xl border border-gray-200/50">
                <FiFilter className="text-gray-500" />
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white min-w-[150px]"
                  value={selectedCampaignID}
                  onChange={(e) => setSelectedCampaignID(e.target.value)}
                >
                  <option value="">All Campaigns</option>
                  {/* {campaigns.map((campaign) => (
                    <option key={campaign.campaignID} value={campaign.campaignID}>
                      {campaign.campaign_name}
                    </option>
                  ))} */}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col lg:flex-row bg-white/90 backdrop-blur-xl rounded-2xl shadow-md border border-gray-100  flex-1 overflow-hidden"
        >
          
          {/* Enhanced Conversations List */}
          <div
            className={`lg:w-1/3 flex flex-col border-r border-gray-200/50 ${
              selectedChat && !addToListCon ? "hidden lg:flex" : "flex"
            }`}
            ref={conversationsListRef}
          >
            
            {/* Search Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white/80 backdrop-blur-sm"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 text-lg" />
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <FiMessageSquare className="text-green-500" />
                  {filteredContacts.length} conversations
                </span>
                {selectedCampaignID && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Campaign Filter Active
                  </span>
                )}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <AnimatePresence>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((conv, index) => (
                    <motion.div
                      key={conv.conversationId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => selectChat(conv)}
                      className={`p-4 border-b border-gray-100/50 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 ${
                        selectedChat?.conversationId === conv.conversationId
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-l-green-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          {conv.profilePic ? (
                            <img
                              src={conv.profilePic}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
                              <FaUserCircle className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <FaUserCircle
                            className="w-12 h-12 text-gray-400 absolute top-0 rounded-full"
                            style={{ display: "none" }}
                          />
                          {conv.unread > 0 && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md"
                            >
                              {conv.unread}
                            </motion.span>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800 truncate">
                              {formatPhoneNumber(conv.phoneNumber) || "Unknown"}
                            </p>
                            <FiPhone className="text-green-500 text-xs" />
                          </div>
                          <div className="flex items-center gap-2">
                            {getMediaIcon(conv.lastMessage)}
                            <p className="text-sm text-gray-600 truncate">
                              {getLastMessagePreview(conv)}
                            </p>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500 mb-2">
                            {formatDate(conv.lastMessageDate)}
                          </p>
                          {/* MODIFIED: Use lastOutgoingMessage.taskName instead of lastMessage.taskName */}
                          {conv.lastOutgoingMessage && conv.lastOutgoingMessage.taskName ? (
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                              {conv.lastOutgoingMessage.taskName}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToListClick(conv);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all duration-200 font-medium border border-blue-200 hover:border-blue-300"
                            >
                              + Add Task
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full p-4 text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <FaWhatsapp className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No conversations found
                    </h3>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Enhanced Chat Details */}
          <div
            className={`flex-1 flex flex-col h-full ${
              selectedChat && !addToListCon ? "flex" : "hidden lg:flex"
            }`}
            ref={chatDetailsRef}
          >
            {selectedChat ? (
              <>
                {/* Enhanced Chat Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 flex items-center justify-between text-white sticky top-0 z-20 shadow-md">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="lg:hidden hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                    >
                      <FiArrowLeft size={20} />
                    </button>
                    
                    <div className="relative">
                      {selectedChat.profilePic ? (
                        <img
                          src={selectedChat.profilePic}
                          alt="Profile"
                          className="w-11 h-11 rounded-full object-cover border-2 border-white/50"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                          <FaUserCircle className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <FaUserCircle
                        className="w-11 h-11 text-white/80 absolute top-0"
                        style={{ display: "none" }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">
                        {formatPhoneNumber(selectedChat.phoneNumber) || "Unknown"}
                      </h3>
                      <p className="text-sm text-white/80 flex items-center gap-1">
                        <FiMessageSquare className="text-xs" />
                        {selectedChat.listName || "Click here for contact info"}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                {/* Enhanced Messages Area */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-green-50/30 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 space-y-4"
                  >
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((message, index, arr) => {
                        const showDateSeparator =
                          index === 0 ||
                          new Date(message.edate).toDateString() !==
                            new Date(arr[index - 1].edate).toDateString();
                        const isSent = message.sender === userWMobile;

                        return (
                          <React.Fragment key={message.whatsID}>
                            {showDateSeparator && (
                              <div className="flex justify-center my-6">
                                <motion.span 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white/80 backdrop-blur-sm text-[12px] text-gray-600 px-4 py-2 rounded-full shadow-md border border-gray-200"
                                >
                                  {new Date(message.edate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long", 
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </motion.span>
                              </div>
                            )}
                            
                            <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-3`}>
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`max-w-[75%] p-4 rounded-2xl shadow-lg relative ${
                                  isSent
                                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                                }`}
                                style={{
                                  wordWrap: "break-word",
                                  wordBreak: "break-word",
                                }}
                              >
                                {message.message && (
                                  <p className="text-[12px] whitespace-pre-wrap leading-relaxed">
                                    {message.message}
                                  </p>
                                )}
                                
                                {/* Enhanced Media Display */}
                                {(message.pic_url || message.doc_url || message.video_url || message.audio_url) && (
                                  <div className="mt-3 mb-2">
                                    {message.pic_url && (
                                      <a
                                        href={message.pic_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block group"
                                      >
                                        <div className="relative overflow-hidden rounded-xl">
                                          <img
                                            src={message.pic_url}
                                            alt="Attachment"
                                            className="max-w-full h-auto rounded-xl border-2 border-white/20 cursor-pointer group-hover:scale-105 transition-transform duration-200"
                                            style={{ maxHeight: "250px" }}
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                              e.target.nextSibling.style.display = "block";
                                            }}
                                          />
                                          <div
                                            className="bg-gray-100 p-4 rounded-xl text-sm text-gray-700 text-center border-2 border-dashed border-gray-300"
                                            style={{ display: "none" }}
                                          >
                                            <FaImage className="mx-auto mb-2 text-2xl text-gray-400" />
                                            Image not available
                                          </div>
                                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">Click to view</span>
                                          </div>
                                        </div>
                                      </a>
                                    )}
                                    
                                    {(message.doc_url || message.video_url || message.audio_url) && (
                                      <a
                                        href={message.doc_url || message.video_url || message.audio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
                                      >
                                        <div className="p-2 rounded-lg bg-gray-100">
                                          {message.doc_url && <FaFileAlt className="text-red-500 text-lg" />}
                                          {message.video_url && <FaVideo className="text-purple-500 text-lg" />}
                                          {message.audio_url && <FaVolumeUp className="text-orange-500 text-lg" />}
                                        </div>
                                        <div className="flex-1">
                                          <span className="text-sm font-medium text-gray-800">
                                            {message.doc_url && "Document"}
                                            {message.video_url && "Video"}
                                            {message.audio_url && "Audio"}
                                          </span>
                                          <p className="text-xs text-gray-500 mt-0.5">Click to view</p>
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                )}
                                
                                {/* Enhanced Message Meta */}
                                <div className="flex justify-end items-center gap-2 mt-2">
                                  <p className={`text-xs ${isSent ? 'text-white/80' : 'text-gray-500'}`}>
                                    {formatMessageTime(message.edate)}
                                  </p>
                                  {isSent && (
                                    <FaCheckDouble className="text-xs text-blue-200" />
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full p-12 text-center"
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                          <FaWhatsapp className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-3">
                          No messages found
                        </h3>
                        <p className="text-sm text-gray-400">
                          No messages in the selected date range
                        </p>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </motion.div>
                </div>

                {/* Enhanced Message Input */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 p-2">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none text-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                        rows="1"
                        style={{
                          minHeight: "40px",
                          maxHeight: "56px",
                          lineHeight: "1.5",
                        }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(e.target.scrollHeight, 56) + "px";
                        }}
                      />
                    </div>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl disabled:shadow-md"
                    >
                      <FiSend size={18} />
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-gray-500 p-12 bg-gradient-to-br from-gray-50 via-white to-green-50/30"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-8 shadow-lg">
                  <FaWhatsapp className="text-5xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  Welcome to WhatsApp Business
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
                  Select a conversation from the list to view messages and start engaging with your customers
                </p>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Ready to connect
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Message Popup */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaWhatsapp className="text-green-600" />
                  </div>
                  Message Details
                </h3>
                <button
                  onClick={closeMessagePopup}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message || "N/A"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-blue-600 font-semibold text-sm mb-1">Sender</p>
                    <p className="text-gray-800 font-medium">{selectedMessage.sender || "Unknown"}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-green-600 font-semibold text-sm mb-1">Receiver</p>
                    <p className="text-gray-800 font-medium">{selectedMessage.receiver || "Unknown"}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-purple-600 font-semibold text-sm mb-1">Date</p>
                    <p className="text-gray-800 font-medium">
                      {selectedMessage.edate
                        ? new Date(selectedMessage.edate).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-orange-600 font-semibold text-sm mb-1">Campaign</p>
                    <p className="text-gray-800 font-medium">{selectedMessage.campaignName || "Not assigned"}</p>
                  </div>
                </div>
                
                {(selectedMessage.pic_url || selectedMessage.doc_url || selectedMessage.video_url || selectedMessage.audio_url) && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 font-semibold mb-3">Attachment</p>
                    <a
                      href={selectedMessage.pic_url || selectedMessage.doc_url || selectedMessage.video_url || selectedMessage.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FiArrowLeft className="rotate-45" />
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={closeMessagePopup}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add To Task Modal */}
      {showAddToTask && selectedDataID && (
        <AddToTask
          setClose={setShowAddToTask}
          item={selectedDataID}
          userID={userID}
          fetchData={fetchData}
        />
      )}
    </div>
  );
};

export default WhatsappReport;