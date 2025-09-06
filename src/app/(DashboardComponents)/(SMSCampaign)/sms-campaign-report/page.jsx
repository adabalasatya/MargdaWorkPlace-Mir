'use client';

import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiArrowLeft,
  FiEdit,
  FiRefreshCw,
  FiX,
  FiMaximize2,
  FiCalendar,
  FiFilter,
  FiMessageSquare,
  FiInbox,
  FiEye,
  FiTrash2
} from "react-icons/fi";
import { FaSms, FaChartLine, FaUsers, FaCheckCircle, FaClock } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import AddToTask from "@/app/(DashboardComponents)/(SMSCampaign)/addtotasksms/page";
import Swal from 'sweetalert2'; 

const SmsReport = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [sms, setSms] = useState([]);
  const [selectedCampaignID, setSelectedCampaignID] = useState("");
  const [smsPerPage, setSmsPerPage] = useState(10);
  const [userID, setUserID] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddToTaskCon, setShowAddToTaskCon] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  
  const { addToast } = useToast();

  // Function to strip HTML tags and clean message
  const stripHtmlTags = (html) => {
    if (!html) return "";
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    let text = tempDiv.textContent || tempDiv.innerText || "";
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  // Function to limit message length for table display
  const getLimitedMessage = (message, limit = 30) => {
    if (!message) return "N/A";
    
    const cleanMessage = stripHtmlTags(message);
    
    if (cleanMessage.length <= limit) {
      return cleanMessage;
    }
    
    return cleanMessage.substring(0, limit) + "...";
  };

  // Function to handle read more click
  const handleReadMore = (message) => {
    setSelectedMessage(stripHtmlTags(message));
    setShowMessageModal(true);
  };

  // Function to handle delete SMS
  const handleDeleteSms = async (smsID) => {

  try {
    setLoading(true);
    const response = await fetch(
      "https://www.margda.in/miraj/work/sms-campaign/delete-report",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ smsIDs:[smsID] }), // ✅ send only smsID
      }
    );

    if (response.ok) {
      setSms((prev) => prev.filter((sms) => sms.smsID !== smsID));
      addToast("SMS deleted successfully", "success");
    } else {
      addToast("Failed to delete SMS", "error");
    }
  } catch (error) {
    console.error(error);
    addToast("Error deleting SMS", "error");
  } finally {
    setLoading(false);
  }
};

  // Enhanced Message Modal Component
  const MessageModal = () => {
    if (!showMessageModal) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-200">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">SMS Message</h2>
                <p className="text-purple-100 mt-1">Full message content</p>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
              >
                <IoMdClose className="text-white text-xl" />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">M</div>
                <h3 className="text-lg font-semibold text-gray-800">Message Content</h3>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage}
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setShowMessageModal(false)}
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Safe sessionStorage access
  const getUserData = () => {
    if (typeof window !== 'undefined') {
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

  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchQuery, smsPerPage, fromDate, toDate, selectedCampaignID]);

  const fetchData = async (userID) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/get-report",
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
        setSms(data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/get-campaigns",
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

  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentTablePage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setSmsPerPage(Number(e.target.value));
    setCurrentTablePage(1);
  };

  const filteredSms = sms.filter((smsItem) => {
    const cleanMessage = stripHtmlTags(smsItem.message);
    const matchesSearch =
      smsItem.receiver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      smsItem.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cleanMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate =
      (!fromDate || smsItem.edate >= fromDate) && (!toDate || smsItem.edate <= toDate);
    const matchCampaignID = selectedCampaignID
      ? smsItem.campaignID == selectedCampaignID
      : true;
    return matchesSearch && matchesDate && matchCampaignID;
  });

  const indexOfLastSms = currentTablePage * smsPerPage;
  const indexOfFirstSms = indexOfLastSms - smsPerPage;
  const currentSms = filteredSms.slice(indexOfFirstSms, indexOfLastSms);
  const totalPages = Math.ceil(filteredSms.length / smsPerPage);

  const paginate = (pageNumber) => setCurrentTablePage(pageNumber);

  // Calculate stats
  const totalSms = sms.length;
  const totalCampaigns = campaigns.length;
  const deliveredSms = sms.filter(s => s.status === 'delivered' || s.success).length;
  const deliveryRate = totalSms > 0 ? ((deliveredSms / totalSms) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        className="mt-16"
      />
      {loading && <Loader />}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl shadow-lg">
            <FaSms className="text-white text-md" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SMS Reports</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* Controls Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Left Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Show</label>
                  <select
                    value={smsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all"
                  >
                    {[10, 20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-semibold text-gray-700">records</span>
                </div>

                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-500" />
                  <label className="text-sm font-semibold text-gray-700">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                {(fromDate || toDate) && (
                  <button
                    onClick={clearDateFilters}
                    className="flex items-center text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-full px-3 py-1 transition-colors"
                    title="Clear date filters"
                  >
                    <FiX className="mr-1" size={14} />
                    Clear
                  </button>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search SMS..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all w-64"
                  />
                </div>

                <div className="flex">
                  <div className="relative w-full">
                    <FiFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <select
                    className="pl-6 pr-8 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all bg-white cursor-pointer min-w-[180px]"
                    value={selectedCampaignID}
                    onChange={(e) => setSelectedCampaignID(e.target.value)}
                  >
                    <option value="">All Campaigns</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.campaignID} value={campaign.campaignID}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mr-4"></div>
                <span className="text-gray-600 font-medium">Loading SMS reports...</span>
              </div>
            ) : currentSms.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No SMS found</h3>
                <p className="text-gray-500">
                  {filteredSms.length === 0 && sms.length > 0
                    ? "Try adjusting your search or filters"
                    : "No SMS reports available"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="bg-gradient-to-r from-violet-500 to-violet-700 text-white">
                        <th className="w-32 px-4 py-4 text-left font-semibold text-sm">Task</th>
                        <th className="w-32 px-4 py-4 text-left font-semibold text-sm">Sender</th>
                        <th className="w-32 px-4 py-4 text-left font-semibold text-sm">Receiver</th>
                        <th className="w-48 px-4 py-4 text-left font-semibold text-sm">Message</th>
                        <th className="w-28 px-4 py-4 text-left font-semibold text-sm">Date</th>
                        <th className="w-36 px-4 py-4 text-left font-semibold text-sm">Campaign</th>
                        <th className="w-20 px-4 py-4 text-left font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSms.map((smsItem) => {
                        const limitedMessage = getLimitedMessage(smsItem.message);
                        const fullMessage = stripHtmlTags(smsItem.message);
                        const hasMoreContent = fullMessage.length > 30;

                        return (
                          <tr
                            key={smsItem.smsID}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-4 py-4 text-sm">
                              {smsItem.dataID &&
                                (smsItem.taskName ? (
                                  <div className="font-semibold text-gray-800 truncate" title={smsItem.taskName}>
                                    {smsItem.taskName}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setShowAddToTaskCon(true);
                                      setSelectedItem(smsItem);
                                    }}
                                    className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition-colors"
                                  >
                                    Add to Task
                                  </button>
                                ))}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 truncate" title={smsItem.sender}>
                              {smsItem.sender}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 truncate" title={smsItem.receiver}>
                              {smsItem.receiver}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="flex flex-col gap-1">
                                <span className="text-gray-700 break-words">
                                  {limitedMessage}
                                </span>
                                {hasMoreContent && (
                                  <button
                                    onClick={() => handleReadMore(smsItem.message)}
                                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-xs bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full transition-all whitespace-nowrap self-start"
                                    title="Read full message"
                                  >
                                    <FiEye size={12} className="mr-1" />
                                    Read More
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {smsItem.edate ? new Date(smsItem.edate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 truncate" title={smsItem.campaignName}>
                              {smsItem.campaignName || "N/A"}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <button
                                onClick={() => handleDeleteSms(smsItem.smsID)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Delete SMS"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {currentSms.map((smsItem) => {
                    const limitedMessage = getLimitedMessage(smsItem.message, 60);
                    const fullMessage = stripHtmlTags(smsItem.message);
                    const hasMoreContent = fullMessage.length > 60;

                    return (
                      <div key={smsItem.smsID} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{smsItem.sender} → {smsItem.receiver}</h3>
                            <p className="text-sm text-gray-600">{smsItem.edate ? new Date(smsItem.edate).toLocaleDateString() : "N/A"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {smsItem.dataID && !smsItem.taskName && (
                              <button
                                onClick={() => {
                                  setShowAddToTaskCon(true);
                                  setSelectedItem(smsItem);
                                }}
                                className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition-colors"
                              >
                                Add to Task
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSms(smsItem.smsID)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete SMS"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-gray-700 break-words">
                              {limitedMessage}
                            </span>
                            {hasMoreContent && (
                              <button
                                onClick={() => handleReadMore(smsItem.message)}
                                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-xs bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full transition-all whitespace-nowrap self-start"
                                title="Read full message"
                              >
                                <FiEye size={12} className="mr-1" />
                                Read More
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Campaign: {smsItem.campaignName || "N/A"}</span>
                          {smsItem.taskName && (
                            <span className="font-medium text-purple-600">Task: {smsItem.taskName}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredSms.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {filteredSms.length === 0 ? 0 : indexOfFirstSms + 1} to{" "}
                {Math.min(indexOfLastSms, filteredSms.length)} of{" "}
                {filteredSms.length} total records
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentTablePage > 1 ? currentTablePage - 1 : 1)}
                  disabled={currentTablePage === 1}
                  className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="mr-2" />
                  Previous
                </button>
                
                <div className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm">
                  {currentTablePage}
                </div>
                
                <button
                  onClick={() =>
                    paginate(
                      currentTablePage < totalPages ? currentTablePage + 1 : totalPages
                    )
                  }
                  disabled={currentTablePage === totalPages || totalPages === 0}
                  className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <FiChevronRight className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal />

      {showAddToTaskCon && (
        <AddToTask
          setClose={setShowAddToTaskCon}
          userID={userID}
          item={selectedItem}
          fetchData={() => fetchData(userID)}
        />
      )}
    </div>
  );
};

export default SmsReport;
