'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSms, FaChartLine, FaUsers, FaEye, FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
import {
  FiEye,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiX,
  FiSend,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiFilter,
  FiFileText,
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import Swal from "sweetalert2";

const SmsCampaign = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    tempID: "",
    listID: "",
  });

  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [lists, setLists] = useState([]);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/update-profile");
      return;
    } else {
      setUserData(storedUserData);
      const userID = storedUserData.userID;
      setUserID(userID);
      fetchData(userID);
      fetchLists(userID);
      fetchTemplates(userID);
    }
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, dateRange.from, dateRange.to]);

  const fetchData = async (userID) => {
  if (!userID) return;
  
  try {
    setLoading(true);
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
      setCampaigns(data.data || []);
      console.log(data)
    } else {
      setCampaigns([]);
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    setCampaigns([]);
  } finally {
    setLoading(false);
  }
};

  const fetchLists = async (userID) => {
    if (!userID) return;
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/get-lists",
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
        setLists(data.Lists || []);
      } else {
        setLists([]);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      setLists([]);
    }
  };

  const fetchTemplates = async (userID) => {
    if (!userID) return;
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/template/get-templates",
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
        const templates = data.Templates || [];
        const filter = templates.filter((template) => template.temptype === "S");
        setTemplates(filter);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearDates = () => {
    setDateRange({ from: "", to: "" });
  };

  const handleView = (content, type) => {
    if (typeof window !== 'undefined') {
      Swal.fire({
        title: `${type} Preview`,
        html: `<div style="text-align: left; max-height: 400px; overflow-y: auto;">${content}</div>`,
        width: '80%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-2xl',
          title: 'text-xl font-bold text-gray-800'
        }
      });
    }
  };

  // In the handleSend function for SMS campaigns, replace the current implementation with this:
const handleSend = async (id) => {
  const result = await Swal.fire({
    title: "Send SMS Campaign?",
    text: "Are you sure you want to send this SMS campaign?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Send Campaign",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#8b5cf6",
    cancelButtonColor: "#6b7280",
    customClass: {
      popup: 'rounded-2xl',
      confirmButton: 'rounded-xl',
      cancelButton: 'rounded-xl'
    }
  });
  
  if (!result.isConfirmed) return; 
  
  setLoading(true);
  try {
    const response = await fetch(
      "https://www.margda.in/miraj/work/sms-campaign/start-campaign",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ campaignID: id, userID }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      addToast(data.message, "success");
      await fetchData(userID);
      window.location.reload();
    } else {
      addToast(data.message, "error");
    }
  } catch (error) {
    console.error("Error sending campaign:", error);
    addToast("Unknown Error, try again later", "error");
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (campaign) => {
    setCampaignForm({
      id: campaign.campaignID,
      name: campaign.name,
      tempID: campaign.templateID || "",
      listID: campaign.listID || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Campaign?",
      text: "This action cannot be undone. Are you sure you want to delete this campaign?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    });
    
    if (!result.isConfirmed) return; 

    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/delete-campaign",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ campaignID: id }),
        }
      );
      
      if (response.ok) {
        addToast("Campaign deleted successfully", "success");
        await fetchData(userID);
      } else {
        addToast("Failed to delete campaign", "error");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      addToast("Error deleting campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setIsModalOpen(false);
    router.back();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setIsEditing(false);
      setCampaignForm({
        name: "",
        tempID: "",
        listID: "",
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!campaignForm.name.trim() || !campaignForm.tempID || !campaignForm.listID) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (isEditing) {
      await updateCampaign();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/create-campaign",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: campaignForm.name.trim(),
            tempID: campaignForm.tempID,
            listID: campaignForm.listID,
            userID,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        await fetchData(userID);
        setIsModalOpen(false);
        setCampaignForm({
          name: "",
          tempID: "",
          listID: "",
        });
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      addToast("Unknown Error, try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/edit-campaign",
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            campaignID: campaignForm.id,
            name: campaignForm.name.trim(),
            templateID: campaignForm.tempID,
            listID: campaignForm.listID,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast(data.message || "Campaign updated successfully", "success");
        await fetchData(userID);
        setIsModalOpen(false);
        setCampaignForm({
          name: "",
          tempID: "",
          listID: "",
        });
        setIsEditing(false);
      } else {
        addToast(data.message || "Failed to update campaign", "error");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      addToast("Unknown Error, try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!campaign) return false;
    
    let match = true;

    if (searchQuery && campaign.name) {
      if (!campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        match = false;
      }
    }

    if (match && dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const campaignDate = new Date(campaign.edate);
      if (campaignDate < fromDate) match = false;
    }
    if (match && dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      const campaignDate = new Date(campaign.edate);
      if (campaignDate > toDate) match = false;
    }

    return match;
  });

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startEntry = filteredCampaigns.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(
    currentPage * itemsPerPage,
    filteredCampaigns.length
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const totalSuccess = campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.success) || 0), 0);
  const avgSuccess = totalCampaigns > 0 ? (totalSuccess / totalCampaigns).toFixed(1) : 0;

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4">
      {loading && <Loader />}
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
       <div className="flex items-center justify-between w-full">
  {/* Back Button */}
  <button
    onClick={handleBack}
    className="flex items-center px-4 py-2 text-sm bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
  >
    <FaArrowLeft className="mr-2" size={12} />
    Back
  </button>

  {/* Centered Title with Icon */}
  <div className="flex items-center justify-center gap-3">
    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
      <FaSms className="text-white text-md" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800">SMS Campaigns</h1>
  </div>

  {/* Create Campaign Button */}
  <button
    onClick={toggleModal}
    disabled={loading}
    className="inline-flex items-center px-5 py-2 text-md bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
  >
    <FiPlus className="mr-2" size={12} />
    Create Campaign
  </button>
</div>


       {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
        <FaChartLine className="text-purple-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Campaigns</p>
         <p className="text-lg font-bold text-gray-800">{campaigns.length}</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
        <FiMessageSquare className="text-blue-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Messages Sent</p>
       {campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.sms_sent) || 0), 0).toLocaleString()}
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
        <FiCheckCircle className="text-green-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Success Rate</p>
        {campaigns.length > 0 
            ? `${Math.round((campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.sms_sent) || 0), 0) / campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.sms_sent) || 0), 0)) * 100) || 0}%`
            : '0%'}
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
        <FiFileText className="text-amber-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Active Templates</p>
        <p className="text-lg font-semibold text-gray-800">{templates.length}</p>
      </div>
    </div>
  </div>
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
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all"
                  >
                    {[10, 20, 50].map((val) => (
                      <option key={val} value={val}>
                        {val}
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
                    name="from"
                    value={dateRange.from}
                    onChange={handleDateChange}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">To</label>
                  <input
                    type="date"
                    name="to"
                    value={dateRange.to}
                    onChange={handleDateChange}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                {(dateRange.from || dateRange.to) && (
                  <button
                    type="button"
                    onClick={handleClearDates}
                    title="Clear date filters"
                    className="flex items-center text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-full px-3 py-1 transition-colors"
                  >
                    <FiX className="mr-1" size={14} />
                    Clear
                  </button>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex">
                <FiSearch className="relative left-8 top-5 transform -translate-y-1/3 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all w-64"
                />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mr-4"></div>
                <span className="text-gray-600 font-medium">Loading campaigns...</span>
              </div>
            ) : paginatedCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSms className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns found</h3>
                <p className="text-gray-500 mb-6">
                  {filteredCampaigns.length === 0 && campaigns.length > 0
                    ? "Try adjusting your search or filters"
                    : "Create your first SMS campaign to get started"}
                </p>
                {filteredCampaigns.length === 0 && campaigns.length === 0 && (
                  <button
                    onClick={toggleModal}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                  >
                    <FiPlus className="mr-2" />
                    Create Your First Campaign
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                        <th className="px-6 py-4 text-left font-semibold">Date</th>
                        <th className="px-6 py-4 text-left font-semibold">Campaign</th>
                        <th className="px-6 py-4 text-left font-semibold">Template</th>
                        <th className="px-6 py-4 text-left font-semibold">List</th>
                        <th className="px-6 py-4 text-center font-semibold">Success</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCampaigns.map((campaign) => (
                        <tr key={campaign.campaignID} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(campaign.edate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{campaign.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">{campaign.templateName || "N/A"}</span>
                              {campaign.matter && (
                                <button
                                  onClick={() => handleView(campaign.matter, "Template")}
                                  className="ml-2 w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                                  title="Preview Template"
                                >
                                  <FiEye className="text-blue-600 text-xs" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">{campaign.listName || "N/A"}</span>
                              {campaign.listName && (
                                <button
                                  onClick={() => handleView(campaign.listName, "List")}
                                  className="ml-2 w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                                  title="View List"
                                >
                                  <FiEye className="text-blue-600 text-xs" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium">
                              {campaign.sms_sent || "0"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleSend(campaign.campaignID)}
                                disabled={loading}
                                className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                                title="Send Campaign"
                              >
                                <FiSend className="text-purple-600 text-sm" />
                              </button>
                              <button
                                onClick={() => handleEdit(campaign)}
                                className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                                title="Edit Campaign"
                              >
                                <FiEdit className="text-blue-600 text-sm" />
                              </button>
                              <button
                                onClick={() => handleDelete(campaign.campaignID)}
                                className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all"
                                title="Delete Campaign"
                              >
                                <FiTrash2 className="text-red-600 text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {paginatedCampaigns.map((campaign) => (
                    <div key={campaign.campaignID} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">{campaign.name}</h3>
                          <p className="text-sm text-gray-500">{new Date(campaign.edate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSend(campaign.campaignID)}
                            disabled={loading}
                            className="w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FiSend className="text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FiEdit className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.campaignID)}
                            className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FiTrash2 className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Template</p>
                          <p className="text-sm font-medium">{campaign.templateName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">List</p>
                          <p className="text-sm font-medium">{campaign.listName || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Success</p>
                          <p className="font-semibold text-purple-600">{campaign.sms_sent || "0"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredCampaigns.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {startEntry} to {endEntry} of {filteredCampaigns.length} campaigns
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="mr-2" />
                  Previous
                </button>
                
                <div className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm">
                  {currentPage}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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

      {/* Modal for Campaign Form */}
      {isModalOpen && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {isEditing ? "Edit SMS Campaign" : "Create New SMS Campaign"}
                  </h2>
                  <p className="text-purple-100 mt-1">
                    {isEditing ? "Update campaign details" : "Set up your SMS marketing campaign"}
                  </p>
                </div>
                <button
                  onClick={toggleModal}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                >
                  <IoMdClose className="text-purple-500 text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                
                {/* Campaign Name */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                    <h3 className="text-md font-bold text-gray-800">Campaign Information</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={campaignForm.name}
                      onChange={(e) =>
                        setCampaignForm({ ...campaignForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter a descriptive campaign name"
                      required
                    />
                  </div>
                </div>

                {/* Configuration Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                    <h3 className="text-md font-bold text-gray-800">Campaign Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FiFileText className="inline mr-2" />
                        SMS Template <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={campaignForm.tempID}
                          onChange={(e) =>
                            setCampaignForm({
                              ...campaignForm,
                              tempID: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all duration-200"
                          required
                        >
                          <option value="">Select Template</option>
                          {templates.map((template) => (
                            <option key={template.tempID} value={template.tempID}>
                              {template.template}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const template = templates.find(
                              (t) => t.tempID === parseInt(campaignForm.tempID)
                            );
                            handleView(
                              template?.matter || "No template selected",
                              "Template"
                            );
                          }}
                          className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          disabled={!campaignForm.tempID}
                          title="Preview Template"
                        >
                          <FiEye className="text-blue-600" />
                        </button>
                      </div>
                    </div>

                    {/* List Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FiList className="inline mr-2" />
                        Recipient List <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={campaignForm.listID}
                          onChange={(e) =>
                            setCampaignForm({
                              ...campaignForm,
                              listID: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:outline-none transition-all duration-200"
                          required
                        >
                          <option value="">Select List</option>
                          {lists.map((list) => (
                            <option key={list.listID} value={list.listID}>
                              {list.name}
                            </option>
                          ))}
                        </select>
                        {/* <button
                          type="button"
                          onClick={() => {
                            const list = lists.find(
                              (l) => l.listID === parseInt(campaignForm.listID)
                            );
                            handleView(list?.name || "No list selected", "List");
                          }}
                          className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          disabled={!campaignForm.listID}
                          title="View List Details"
                        >
                          <FiEye className="text-blue-600" />
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={toggleModal}
                  disabled={loading}
                  className="flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-8 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      {isEditing ? "Update Campaign" : "Create Campaign"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsCampaign;
