"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FiEye,
  FiCalendar,
  FiFilter,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiInbox,
  FiTrash2 
} from "react-icons/fi";
import { FaEnvelope, FaChartLine, FaEye, FaUsers, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoMdClose } from "react-icons/io";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import AddToTask from "@/app/(DashboardComponents)/(EmailCampaign)/addtotaskemail/page";


const EmailReport = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selectedCampaignID, setSelectedCampaignID] = useState("");
  const [emailsPerPage, setEmailsPerPage] = useState(10);
  const [userID, setUserID] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddToTaskCon, setShowAddToTaskCon] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const { addToast } = useToast();

  // Function to strip HTML tags and convert HTML entities
  const stripHtmlAndDecode = (html) => {
    if (!html) return "";
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    const decodedText = textContent
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    
    return decodedText.trim();
  };

  // Function to truncate text and add "read more"
  const TruncatedMessage = ({ message, maxLength = 30 }) => {
    const cleanMessage = stripHtmlAndDecode(message);
    
    if (!cleanMessage) return <span className="text-gray-400">N/A</span>;
    
    if (cleanMessage.length <= maxLength) {
      return <span className="text-gray-700">{cleanMessage}</span>;
    }
    
    return (
      <div className="flex flex-col">
  <span className="text-gray-700">
    {cleanMessage.substring(0, maxLength)}...
  </span>
  <button
    onClick={() => {
      setSelectedMessage(message);
      setShowMessageModal(true);
    }}
    className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-all mt-1 w-fit"
  >
    <FiEye size={12} className="mr-1" />
    Read More
  </button>
</div>

    );
  };

  // Enhanced Message Modal Component
  const MessageModal = () => {
    if (!showMessageModal) return null;

    const cleanMessage = stripHtmlAndDecode(selectedMessage);

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Email Message</h2>
                <p className="text-blue-100 mt-1">Full message content and details</p>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="w-10 h-10 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
              >
                <IoMdClose className="text-white text-xl" />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
            {selectedSubject && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">S</div>
                  <h3 className="text-lg font-semibold text-gray-800">Subject</h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-gray-800 font-medium">{selectedSubject}</p>
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">M</div>
                <h3 className="text-lg font-semibold text-gray-800">Message Content</h3>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {cleanMessage}
                </div>
                
                {/* Original HTML collapsible section */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center">
                    <FiEye className="mr-2" />
                    View Original HTML Source
                  </summary>
                  <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                    <pre className="text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">
                      {selectedMessage}
                    </pre>
                  </div>
                </details>
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      if (!userData || !userData.pic) {
        return router.push("/update-profile");
      } else {
        const userID = userData.userID;
        setUserID(userID);
        fetchData(userID);
        fetchCampaigns(userID);
      }
    }
  }, [router]);

  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchQuery, emailsPerPage, fromDate, toDate, selectedCampaignID]);

  const fetchData = async (userID) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/get-report",
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
        setEmails(data.data);
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

  const handleDelete = async (emailID) => {

  try {
    setLoading(true);
    const response = await fetch(
      "https://www.margda.in/miraj/work/email-campaign/delete-report",
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emailIDs:[emailID] }),
      }
    );

    const data = await response.json();

  
    console.log(data)

    if (response.ok) {
      // remove from state without reloading
      setEmails((prev) => prev.filter((email) => email.emailsID !== emailID));
      addToast("Report deleted successfully!", "success");
    } else {
      console.log("Failed to delete report.", "error");
    }
  } catch (error) {
    console.error(error);
    addToast("Something went wrong.", "error");
  } finally {
    setLoading(false);
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
    setEmailsPerPage(Number(e.target.value));
    setCurrentTablePage(1);
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.replyto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate =
      (!fromDate || email.edate >= fromDate) &&
      (!toDate || email.edate <= toDate);
    const matchCampaignID = selectedCampaignID
      ? email.campaignID == selectedCampaignID
      : true;
    return matchesSearch && matchesDate && matchCampaignID;
  });

  const indexOfLastEmail = currentTablePage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

  const paginate = (pageNumber) => setCurrentTablePage(pageNumber);

  // Calculate stats
  const totalEmails = emails.length;
  const successfulEmails = emails.filter(email => email.success).length;
  const failedEmails = totalEmails - successfulEmails;
  const totalOpens = emails.reduce((sum, email) => sum + (parseInt(email.open_count) || 0), 0);
  const openRate = totalEmails > 0 ? ((totalOpens / totalEmails) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen  py-8 px-4">
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
      <div className="max-w-7xl mx-auto mb-4">
       <div className="flex items-center justify-center mb-4">
  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg mr-3">
    <FaEnvelope className="text-white text-md" />
  </div>
  <h1 className="text-2xl font-bold text-gray-800">Email Reports</h1>
</div>

       {/* Stats Cards */}
{/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
        <FaEnvelope className="text-blue-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Emails</p>
        <p className="text-lg font-semibold text-gray-800">
          {totalEmails.toLocaleString()}
        </p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
        <FaCheckCircle className="text-green-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Successful</p>
        <p className="text-lg font-semibold text-gray-800">
          {successfulEmails.toLocaleString()}
        </p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
        <FaEye className="text-purple-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Opens</p>
        <p className="text-lg font-semibold text-gray-800">
          {totalOpens.toLocaleString()}
        </p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
        <FaChartLine className="text-amber-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Open Rate</p>
        <p className="text-lg font-semibold text-gray-800">{openRate}%</p>
      </div>
    </div>
  </div>
</div> */}

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
                    value={emailsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
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
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
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
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all w-64"
                  />
                </div>

                <div className="flex">
                 <div className="relative w-full">
                  <FiFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                   <select
                    className="pl-6 pr-10 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all bg-white cursor-pointer min-w-[180px]"
                    value={selectedCampaignID}
                    onChange={(e) => setSelectedCampaignID(e.target.value)}
                  >
                    <option value="">All Campaigns</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.campaignID} value={campaign.campaignID}>
                        {campaign.campaign_name}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
                <span className="text-gray-600 font-medium">Loading email reports...</span>
              </div>
            ) : currentEmails.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No emails found</h3>
                <p className="text-gray-500">
                  {filteredEmails.length === 0 && emails.length > 0
                    ? "Try adjusting your search or filters"
                    : "No email reports available"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <th className="px-4 py-3 text-left font-semibold text-sm">Task</th>
                        <th className="px-4 py-4 text-left font-semibold text-sm">Sender</th>
                        <th className="px-4 py-4 text-left font-semibold text-sm">Receiver</th>
                        <th className="px-4 py-4 text-left font-semibold text-sm">Subject</th>
                        <th className="px-4 py-4 text-left font-semibold text-sm min-w-[200px]">Message</th>
                        <th className="px-4 py-4 text-left font-semibold text-sm">Date</th>
                        <th className="px-4 py-4 text-left font-semibold text-sm">Campaign</th>
                        <th className="px-4 py-4 text-center font-semibold text-sm">Opens</th>
                        <th className="px-4 py-4 text-center font-semibold text-sm">Status</th>
                        <th className="px-4 py-4 text-center font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEmails.map((email) => (
                        <tr
                          key={email.emailsID}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="px-4 py-4 text-sm">
                            {email.dataID &&
                              (email.taskName ? (
                                <div className="font-semibold text-gray-800">{email.taskName}</div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowAddToTaskCon(true);
                                    setSelectedItem(email);
                                  }}
                                  className="bg-blue-600 text-white py-1 px-2 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                                >
                                  Add to Task
                                </button>
                              ))}
                          </td>
                          <td className="px-4 py-4 text-[12px] text-gray-700">{email.sender}</td>
                          <td className="px-4 py-4 text-[12px] text-gray-700">{email.receiver}</td>
                          <td className="px-4 py-4 text-[12px] text-gray-700">{email.subject || "N/A"}</td>
                          <td className="px-4 py-4 text-[12px]">
                            <TruncatedMessage message={email.matter} maxLength={30} />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {email.edate ? new Date(email.edate).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{email.campaignName || "N/A"}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {email.open_count || "0"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                email.success
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {email.success ? (
                                <>
                                  <FiCheckCircle className="mr-1" size={12} />
                                </>
                              ) : (
                                <>
                                  <FiXCircle className="mr-1" size={12} />
                                </>
                              )}
                            </span>
                          </td>

                           {/* Delete Action */}
      <td className="px-4 py-4 text-center">
        <button
          onClick={() => handleDelete(email.emailsID)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Delete Report"
        >
          <FiTrash2 size={18} />
        </button>
      </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {currentEmails.map((email) => (
                    <div key={email.emailsID} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{email.subject || "No Subject"}</h3>
                          <p className="text-sm text-gray-600">{email.sender} → {email.receiver}</p>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              email.success
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {email.success ? (
                              <>
                                <FiCheckCircle className="mr-1" size={12} />
                                Success
                              </>
                            ) : (
                              <>
                                <FiXCircle className="mr-1" size={12} />
                                Failed
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <TruncatedMessage message={email.matter} maxLength={80} />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{email.edate ? new Date(email.edate).toLocaleDateString() : "N/A"}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <FiEye className="mr-1" size={12} />
                            {email.open_count || "0"} opens
                          </span>
                          {email.dataID && !email.taskName && (
                            <button
                              onClick={() => {
                                setShowAddToTaskCon(true);
                                setSelectedItem(email);
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                            >
                              Add to Task
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredEmails.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {filteredEmails.length === 0 ? 0 : indexOfFirstEmail + 1} to{" "}
                {Math.min(indexOfLastEmail, filteredEmails.length)} of{" "}
                {filteredEmails.length} emails
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
                
                <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm">
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

export default EmailReport;
