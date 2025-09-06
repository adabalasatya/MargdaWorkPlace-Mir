'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaEnvelope, FaChartLine, FaUsers, FaEye, FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
import { FiEye, FiTrash2, FiSearch, FiPlus, FiX, FiSend, FiRefreshCw, FiEdit, FiChevronLeft, FiChevronRight, FiCalendar, FiMail, FiList, FiServer, FiFileText } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useToast } from "@/app/component/customtoast/page";
import Loader from "@/app/component/Loader";
import Swal from "sweetalert2";

const EmailCampaign = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    credID: "",
    templateID: "",
    listID: "",
  });
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [esps, setEsps] = useState([]);
  const [lists, setLists] = useState([]);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const { addToast } = useToast();

  // State additions
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
      fetchCreds(userID);
    }
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, startDate, endDate]);

  const fetchData = async (userID) => {
    if (!userID) return;
    
    try {
      setLoading(true);
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
        console.log(data)
        setCampaigns(data.data || []);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      addToast("Failed to fetch campaigns", "error");
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
        addToast("Failed to fetch lists", "error");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      addToast("Failed to fetch lists", "error");
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
        const filter = templates.filter((template) => template.temptype === "E");
        setTemplates(filter);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    }
  };

  const fetchCreds = async (userID) => {
    if (!userID) return;
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/get-credentials",
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
        setEsps(data.data || []);
      } else {
        setEsps([]);
        addToast("Failed to fetch credentials", "error");
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      addToast("Failed to fetch credentials", "error");
      setEsps([]);
    }
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

  const handleSend = async (id) => {
    const result = await Swal.fire({
      title: "Send Campaign?",
      text: "Are you sure you want to send this email campaign?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Send Campaign",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3b82f6",
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
        "https://www.margda.in/miraj/work/email-campaign/start-campaign",
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

  const handleBack = () => {
    setIsModalOpen(false);
    router.back();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setCampaignForm({
      name: "",
      credID: "",
      templateID: "",
      listID: "",
    });
    setIsEditing(false);
    setEditingCampaignId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (
      !campaignForm.name.trim() ||
      !campaignForm.credID ||
      !campaignForm.templateID ||
      !campaignForm.listID
    ) {
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
        "https://www.margda.in/miraj/work/email-campaign/create-campaign",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: campaignForm.name.trim(),
            credID: campaignForm.credID,
            templateID: campaignForm.templateID,
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
          credID: "",
          templateID: "",
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

  const handleEdit = (campaign) => {
    setCampaignForm({
      name: campaign.campaign_name || "",
      credID: campaign.credID || "",
      templateID: campaign.templateID || "",
      listID: campaign.listID || "",
    });
    setEditingCampaignId(campaign.campaignID);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const updateCampaign = async () => {
    if (
      !editingCampaignId ||
      !campaignForm.name.trim() ||
      !campaignForm.credID ||
      !campaignForm.templateID ||
      !campaignForm.listID
    ) {
      addToast("Please fill all required fields", "error");
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/edit-campaign",
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            campaignID: editingCampaignId,
            name: campaignForm.name.trim(),
            credID: campaignForm.credID,
            templateID: campaignForm.templateID,
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
          credID: "",
          templateID: "",
          listID: "",
        });
        setIsEditing(false);
        setEditingCampaignId(null);
        return true;
      } else {
        addToast(data.message || "Failed to update campaign", "error");
        return false;
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      addToast("Unknown Error, try again later", "error");
      return false;
    } finally {
      setLoading(false);
    }
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

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/delete-campaign",
        {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ campaignID: id }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        await fetchData(userID);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      addToast("Unknown Error, try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!campaign) return false;
    
    const campaignDate = new Date(campaign.edate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const matchesSearch = campaign.campaign_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ?? false;
    
    const matchesDateRange = 
      (!start || campaignDate >= start) && 
      (!end || campaignDate <= end);

    return matchesSearch && matchesDateRange;
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

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-6 px-2">
      {loading && <Loader />}
      
      {/* Header Section */}
     <div className="max-w-7xl mx-auto mb-4">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="flex items-center gap-4">
      <button
        onClick={handleBack}
        className="flex items-center tex-md px-4 py-2 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
      >
        <FaArrowLeft className="mr-2" size={12} />
        Back
      </button>
    </div>

    {/* Centered Title with Icon */}
    <div className="flex items-center justify-center flex-1">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
        <FaEnvelope className="text-white text-xl" />
      </div>
      <h1 className="text-xl font-bold text-gray-800">Email Campaigns</h1>
    </div>

    <button
      onClick={toggleModal}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 text-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
    >
      <FiPlus className="mr-2" size={12} />
      Create Campaign
    </button>
  </div>

        
        {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 py-1 px-4 gap-4 mt-4">
  
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <FaChartLine className="text-blue-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Campaigns</p>
        <p className="text-lg font-bold text-gray-800">{campaigns.length}</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <FiMail className="text-green-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Sent</p>
        <p className="text-lg font-bold text-gray-800">
          {campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.emailsSent) || 0), 0).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <FaEye className="text-purple-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Opens</p>
        <p className="text-lg font-bold text-gray-800">
          {campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.emailsOpened) || 0), 0).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
        <FaUsers className="text-amber-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Open Rate</p>
        <p className="text-lg font-bold text-gray-800">
          {campaigns.length > 0 
            ? `${Math.round((campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.emailsOpened) || 0), 0) / campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.emailsSent) || 0), 0)) * 100) || 0}%`
            : '0%'}
        </p>
      </div>
    </div>
  </div>
</div>
      </div>

      {/* Modal for Campaign Form */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {isEditing ? "Edit Campaign" : "Create New Campaign"}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {isEditing ? "Update campaign details" : "Set up your email marketing campaign"}
                  </p>
                </div>
                <button
                  onClick={toggleModal}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                >
                  <IoMdClose className="text-blue-500 text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                
                {/* Campaign Name */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                    <h3 className="text-lg font-bold text-gray-800">Campaign Information</h3>
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
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter a descriptive campaign name"
                      required
                    />
                  </div>
                </div>

                {/* Configuration Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                    <h3 className="text-lg font-bold text-gray-800">Campaign Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* ESP Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FiServer className="inline mr-2" />
                        Email Service Provider <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={campaignForm.credID}
                          onChange={(e) =>
                            setCampaignForm({
                              ...campaignForm,
                              credID: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                          required
                        >
                          <option value="">Select ESP</option>
                          {esps.map((esp) => (
                            <option key={esp.credID} value={esp.credID}>
                              {esp.name}
                            </option>
                          ))}
                        </select>
                        {/* <button
                          type="button"
                          onClick={() => {
                            const esp = esps.find(
                              (e) => e.credID === parseInt(campaignForm.credID)
                            );
                            handleView(esp?.name || "No ESP selected", "ESP");
                          }}
                          className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          disabled={!campaignForm.credID}
                          title="View ESP Details"
                        >
                          <FiEye className="text-blue-600" />
                        </button> */}
                      </div>
                    </div>

                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FiFileText className="inline mr-2" />
                        Email Template <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={campaignForm.templateID}
                          onChange={(e) =>
                            setCampaignForm({
                              ...campaignForm,
                              templateID: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
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
                              (t) => t.tempID === parseInt(campaignForm.templateID)
                            );
                            handleView(
                              template?.matter || "No template selected",
                              "Template"
                            );
                          }}
                          className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          disabled={!campaignForm.templateID}
                          title="Preview Template"
                        >
                          <FiEye className="text-blue-600" />
                        </button>
                      </div>
                    </div>

                    {/* List Selection */}
                    <div className="lg:col-span-2">
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
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
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
                  className="flex-1 flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {(startDate || endDate) && (
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
              <div className="flex">
                <FiSearch className="relative left-6 top-5 transform -translate-y-1/3 text-blue-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all w-64"
                />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
                <span className="text-gray-600 font-medium">Loading campaigns...</span>
              </div>
            ) : paginatedCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns found</h3>
                <p className="text-gray-500 mb-6">
                  {filteredCampaigns.length === 0 && campaigns.length > 0
                    ? "Try adjusting your search or filters"
                    : "Create your first email campaign to get started"}
                </p>
                {filteredCampaigns.length === 0 && campaigns.length === 0 && (
                  <button
                    onClick={toggleModal}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
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
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <th className="px-6 py-4 text-left font-semibold">Date</th>
                        <th className="px-6 py-4 text-left font-semibold">Campaign</th>
                        {/* <th className="px-6 py-4 text-left font-semibold">ESP</th> */}
                        <th className="px-6 py-4 text-left font-semibold">Template</th>
                        <th className="px-6 py-4 text-left font-semibold">List</th>
                        <th className="px-6 py-4 text-center font-semibold">Sent</th>
                        <th className="px-6 py-4 text-center font-semibold">Opened</th>
                        {/* <th className="px-6 py-4 text-center font-semibold">Unsubscribe</th> */}
                        <th className="px-6 py-4 text-center font-semibold">Bounce</th> 
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCampaigns.map((campaign, index) => (
                        <tr key={campaign.campaignID || index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(campaign.edate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{campaign.campaign_name}</div>
                          </td>
                          {/* <td className="px-6 py-4 text-sm text-gray-600">
                            {campaign.credName || "N/A"}
                          </td> */}
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
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                              {campaign.emailsSent || "0"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                              {campaign.emailsOpened || "0"}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 font-medium">
                              {campaign.emailsUnsub || "0"}
                            </span>
                          </td> */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 font-medium">
                              {campaign.emailsBounced || "0"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleSend(campaign.campaignID)}
                                disabled={loading}
                                className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                                title="Send Campaign"
                              >
                                <FiSend className="text-green-600 text-sm" />
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
                  {paginatedCampaigns.map((campaign, index) => (
                    <div key={campaign.campaignID || index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">{campaign.campaign_name}</h3>
                          <p className="text-sm text-gray-500">{new Date(campaign.edate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSend(campaign.campaignID)}
                            disabled={loading}
                            className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FiSend className="text-green-600" />
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
                          <p className="text-xs text-gray-500 mb-1">ESP</p>
                          <p className="text-sm font-medium">{campaign.credName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">List</p>
                          <p className="text-sm font-medium">{campaign.listName || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Sent</p>
                            <p className="font-semibold text-blue-600">{campaign.emailsSent || "0"}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Opens</p>
                            <p className="font-semibold text-green-600">{campaign.emailsOpened || "0"}</p>
                          </div>
                          {/* <div className="text-center">
                            <p className="text-xs text-gray-500">Bounces</p>
                            <p className="font-semibold text-red-600">{campaign.bounce || "0"}</p>
                          </div> */}
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
                
                <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm">
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
    </div>
  );
};

export default EmailCampaign;
