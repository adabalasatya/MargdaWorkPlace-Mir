'use client';
import React, { useEffect, useState, useMemo } from "react";
import { Eye, EyeOff, ArrowLeft, Edit, MailIcon, Trash2, Plus, Server, Shield, Settings } from "lucide-react";
import { FaEnvelope, FaServer, FaAws, FaMicrosoft, FaGoogle, FaCog, FaTrash, FaEdit, FaEye, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineBusinessCenter } from "react-icons/md";
import Swal from "sweetalert2";
import Loader from "@/app/component/Loader";

const SOURCE_PROVIDERS = {
  G: { 
    name: "Gmail", 
    host: "smtp.gmail.com", 
    port: "465",
    icon: FaGoogle,
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  A: { 
    name: "AWS (Amazon SES)",
    icon: FaAws,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  O: { 
    name: "Outlook", 
    host: "smtp.office365.com", 
    port: "587",
    icon: FaMicrosoft,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  C: { 
    name: "Custom Domain", 
    host: "", 
    port: "",
    icon: FaServer,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
};

const EmailCredentials = () => {
  const router = useRouter();
  const initialFormData = {
    name: "",
    from_name: "",
    from_email: "",
    reply_email: "",
    source: "G",
    aws_region: "",
    aws_id: "",
    aws_secret: "",
    smtp_host: SOURCE_PROVIDERS.G.host,
    smtp_port: SOURCE_PROVIDERS.G.port,
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editCredentialId, setEditCredentialId] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userID, setUserID] = useState("");
  // New state for form visibility
  const [showForm, setShowForm] = useState(false);

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
      router.push("/update-profile");
    } else {
      setUserID(userData.userID);
      fetchData(userData.userID);
    }
  }, []);

  const fetchData = async (currentUserID) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/get-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID: currentUserID }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setCredentials(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch credentials.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      if (name === "source") {
        const provider = SOURCE_PROVIDERS[value];
        if (provider?.host) {
          newFormData.smtp_host = provider.host;
          newFormData.smtp_port = provider.port;
        } else {
          newFormData.smtp_host = "";
          newFormData.smtp_port = "";
        }
      }
      return newFormData;
    });
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.from_name.trim()) errors.from_name = "From name is required";
    if (!formData.from_email || !emailRegex.test(formData.from_email))
      errors.from_email = "Valid from email is required";
    if (!formData.reply_email || !emailRegex.test(formData.reply_email))
      errors.reply_email = "Valid reply email is required";

    if (formData.source === "A") {
      if (!formData.aws_id.trim()) errors.aws_id = "AWS ID is required";
      if (!formData.aws_secret.trim()) errors.aws_secret = "AWS Secret is required";
    } else if (["G", "O", "C"].includes(formData.source)) {
      if (!formData.smtp_host.trim()) errors.smtp_host = "SMTP Host is required";
      const port = parseInt(formData.smtp_port);
      if (isNaN(port) || port < 1 || port > 65535)
        errors.smtp_port = "Valid SMTP Port (1-65535) is required";
      if (!formData.password.trim()) errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.warn("Please review the form for errors.", { toastId: "form_error" });
      return;
    }

    setLoading(true);
    const payload = {
      userID,
      name: formData.name,
      from_name: formData.from_name,
      from_email: formData.from_email,
      reply_email: formData.reply_email,
      source: formData.source,
    };

    if (formData.source === "A") {
      payload.aws_id = formData.aws_id.trim();
      payload.aws_secret = formData.aws_secret.trim();
      payload.aws_region = formData.aws_region.trim();
    } else {
      payload.smtp_host = formData.smtp_host.trim();
      payload.smtp_port = formData.smtp_port.trim();
      payload.password = formData.password.trim();
    }

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/save-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Credentials added successfully!");
        fetchData(userID);
        setFormData(initialFormData);
        setValidationErrors({});
        // Close form after successful save
        setShowForm(false);
      } else {
        toast.error(data.message || "Failed to add provider.");
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCredential = async () => {
    if (!validateForm()) {
      toast.warn("Please review the form for errors.", { toastId: "form_error" });
      return;
    }

    setLoading(true);
    const payload = {
      credID: editCredentialId,
      name: formData.name,
      from_name: formData.from_name,
      from_email: formData.from_email,
      reply_email: formData.reply_email,
      source: formData.source,
      aws_id: formData.aws_id || "",
      aws_secret: formData.aws_secret || "",
      aws_region: formData.aws_region || "",
      smtp_host: formData.smtp_host || "",
      smtp_port: formData.smtp_port ? Number(formData.smtp_port) : "",
      password: formData.password || "",
    };

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/edit-credentials",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Credentials updated successfully!");
        fetchData(userID);
        setFormData(initialFormData);
        setValidationErrors({});
        setEditMode(false);
        setEditCredentialId(null);
        // Close form after successful update
        setShowForm(false);
      } else {
        toast.error(data.message || "Failed to update provider.");
      }
    } catch (error) {
      console.error("Edit Error:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    // Show toast message when editing
    toast.info(`Editing provider: ${item.name}`, { 
      toastId: "edit_provider",
      autoClose: 2000 
    });

    setFormData({
      name: item.name || "",
      from_name: item.from_name || "",
      from_email: item.from_email || "",
      reply_email: item.reply_email || "",
      source: item.source || "G",
      aws_region: item.aws_region || "",
      aws_id: item.aws_id || "",
      aws_secret: item.aws_secret || "",
      smtp_host: item.smtp_host || SOURCE_PROVIDERS[item.source]?.host || "",
      smtp_port: item.smtp_port || SOURCE_PROVIDERS[item.source]?.port || "",
      email: item.email || "",
      password: "",
    });
    setEditCredentialId(item.credID);
    setEditMode(true);
    setValidationErrors({});
    // Show form when editing
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Provider?",
      text: "This action cannot be undone. Are you sure you want to delete this provider?",
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
        "https://www.margda.in/miraj/work/credentials/delete-credentials",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credID: id }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Provider deleted successfully!");
        fetchData(userID);
      } else {
        toast.error(data.message || "Failed to delete provider.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("An error occurred while deleting provider.");
    } finally {
      setLoading(false);
    }
  };

 // Toggle form visibility
const handleToggleForm = () => {
  if (showForm) {
    // Closing the form → reset everything
    setShowForm(false);
    setEditMode(false);
    setEditCredentialId(null);
    setFormData(initialFormData);
    setValidationErrors({});
  } else {
    // Opening the form → reset everything too
    setShowForm(true);
    setEditMode(false);
    setEditCredentialId(null);
    setFormData(initialFormData);
    setValidationErrors({});
  }
};


  const renderInput = (name, label, placeholder, type = "text", icon = null) => (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border-2  text-sm rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none ${
          validationErrors[name] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
        }`}
      />
      {validationErrors[name] && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {validationErrors[name]}
        </p>
      )}
    </div>
  );

  const filteredCredentials = useMemo(() => {
    return credentials.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [credentials, searchQuery]);

  const paginatedCredentials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCredentials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCredentials, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCredentials.length / itemsPerPage);

  const getProviderInfo = (source) => {
    return SOURCE_PROVIDERS[source] || SOURCE_PROVIDERS.C;
  };

  return (
    <div className="min-h-screen py-6 px-4">
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
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Back button */}
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 bg-white text-sm text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="mr-2" size={13} />
              Back
            </button>
          </div>
          
          {/* Center: Title */}
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <FaEnvelope className="text-white text-md" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Email Service Providers</h1>
          </div>
          
          {/* Right: Add New Email Provider Button */}
          <div className="flex items-center">
            <button
              onClick={handleToggleForm}
              className={`flex items-center px-6 py-2 tex-[12px] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                showForm 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              }`}
            >
              {showForm ? (
                <>
                  <FaTimes className="mr-2" size={16} />
                  Close Form
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" size={16} />
                  Add New Email Provider
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaServer className="text-blue-600 text-lg" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Total Providers</p>
                <p className="text-lg font-bold text-gray-800">{credentials.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="text-green-600 text-lg" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Active Configs</p>
                <p className="text-lg font-bold text-gray-800">{credentials.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="text-purple-600 text-lg" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Ready to Use</p>
                <p className="text-lg font-bold text-gray-800">{credentials.length}</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Animated Form Card */}
        <div className={`transition-all duration-500 ease-in-out transform ${
          showForm 
            ? 'opacity-100 translate-y-0 max-h-none' 
            : 'opacity-0 -translate-y-10 max-h-0 overflow-hidden'
        }`}>
          <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    {editMode ? <FaEdit /> : <FaPlus />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {editMode ? "Edit Email Provider" : "Add New Email Provider"}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {editMode ? "Update your email provider configuration" : "Configure a new email service provider"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleForm}
                  className="w-8 h-8 bg-blue-400 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                >
                  <FaTimes className="text-white text-sm" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-8">
                
                {/* Sender Information Section */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                    <h3 className="text-md font-bold text-gray-800">Sender Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderInput("name", "Provider Name", "e.g., Marketing Team Brand")}
                    {renderInput("from_name", "From Name", "e.g., Miraj from Margda")}
                    {renderInput("from_email", "From Email", "name@domain.com", "email")}
                    {renderInput("reply_email", "Reply-To Email", "reply@domain.com", "email")}
                  </div>
                </div>

                {/* Connection Settings Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                    <h3 className="text-md font-bold text-gray-800">Connection Settings</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Email Source Selection */}
                    <div>
                      <label htmlFor="source" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Service Provider <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(SOURCE_PROVIDERS).map(([key, provider]) => {
                          const IconComponent = provider.icon;
                          const isSelected = formData.source === key;
                          return (
                            <div
                              key={key}
                              onClick={() => handleInputChange({ target: { name: 'source', value: key } })}
                              className={`cursor-pointer p-2 rounded-xl border-2 transition-all duration-200 ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                  isSelected ? provider.bgColor : 'bg-gray-100'
                                }`}>
                                  <IconComponent className={`text-lg ${isSelected ? provider.color : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <p className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                                    {provider.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Provider-specific Configuration */}
                    {formData.source === "A" ? (
                      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
                        <div className="flex items-center mb-4">
                          <FaAws className="text-orange-600 text-xl mr-2" />
                          <h4 className="text-lg font-semibold text-orange-800">AWS SES Configuration</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {renderInput("aws_region", "AWS Region", "e.g., us-east-1")}
                          {renderInput("aws_id", "AWS Access Key ID", "Your AWS Access Key")}
                          {renderInput("aws_secret", "AWS Secret Access Key", "Your AWS Secret Key", "password")}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                        <div className="flex items-center mb-4">
                          <FaServer className="text-blue-600 text-xl mr-2" />
                          <h4 className="text-lg font-semibold text-blue-800">SMTP Configuration</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {renderInput("smtp_host", "SMTP Host", "e.g., smtp.gmail.com")}
                          {renderInput("smtp_port", "SMTP Port", "e.g., 465", "number")}
                        </div>
                        
                        <div className="mt-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder={editMode ? "Enter new password" : "Your email or app password"}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none pr-12 ${
                                validationErrors.password ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                              }`}
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                              type="button"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {validationErrors.password && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span>
                              {validationErrors.password}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
                {editMode && (
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditCredentialId(null);
                      setFormData(initialFormData);
                      setValidationErrors({});
                    }}
                    disabled={loading}
                    className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editMode ? handleEditCredential : handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {editMode ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                      {editMode ? "Update Provider" : "Save Provider"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Providers List Card */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
             
              {credentials.length > 0 && (
                <div className="flex items-center justify-between gap-4 w-full">
                  {/* Left: Show Records */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">Show</label>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => setItemsPerPage(Number(e.target.value))} 
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-sm font-semibold text-gray-700">records</span>
                  </div>
                  
                  {/* Right: Search Bar */}
                  <div className="flex">
                    <FaSearch className="relative left-6 top-5 transform -translate-y-1/3 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all w-64"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {credentials.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <th className="px-6 py-4 text-left font-semibold">Provider</th>
                        <th className="px-6 py-4 text-left font-semibold">From Information</th>
                        <th className="px-6 py-4 text-left font-semibold">Source</th>
                        <th className="px-6 py-4 text-left font-semibold">Connection Details</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCredentials.map((item, index) => {
                        const providerInfo = getProviderInfo(item.source);
                        const ProviderIcon = providerInfo.icon;
                        
                        return (
                          <tr key={item.instID || item.credential_id || item.credID || `${item.from_email}-${index}`} 
                              className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{item.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-800">{item.from_name}</div>
                                <div className="text-gray-600">{item.from_email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${providerInfo.bgColor} ${providerInfo.color}`}>
                                <ProviderIcon className="mr-2" />
                                {providerInfo.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.source === "A" 
                                ? `Region: ${item.aws_region || 'N/A'}` 
                                : `${item.smtp_host}:${item.smtp_port}`
                              }
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-3">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                                  title="Edit Provider"
                                >
                                  <FaEdit className="text-blue-600 text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.instID || item.credential_id || item.credID)}
                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all"
                                  title="Delete Provider"
                                >
                                  <FaTrash className="text-red-600 text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {paginatedCredentials.map((item, index) => {
                    const providerInfo = getProviderInfo(item.source);
                    const ProviderIcon = providerInfo.icon;
                    
                    return (
                      <div key={item.instID || item.credential_id || item.credID || `${item.from_email}-${index}`} 
                           className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${providerInfo.bgColor} ${providerInfo.color}`}>
                              <ProviderIcon className="mr-1" />
                              {providerInfo.name}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all"
                            >
                              <FaEdit className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.instID || item.credential_id || item.credID)}
                              className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all"
                            >
                              <FaTrash className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">From</p>
                            <p className="text-sm font-medium">{item.from_name} &lt;{item.from_email}&gt;</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Connection</p>
                            <p className="text-sm">
                              {item.source === "A" 
                                ? `AWS Region: ${item.aws_region || 'N/A'}` 
                                : `${item.smtp_host}:${item.smtp_port}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredCredentials.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 rounded-b-2xl">
                    <div className="text-sm text-gray-600 font-medium">
                      Showing {filteredCredentials.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredCredentials.length)} of{" "}
                      {filteredCredentials.length} providers
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={currentPage === 1} 
                        className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <FaChevronLeft className="mr-2" />
                        Previous
                      </button>
                      
                      <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm">
                        {currentPage}
                      </div>
                      
                      <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={currentPage === totalPages || totalPages === 0} 
                        className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                        <FaChevronRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdOutlineBusinessCenter className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No email providers configured</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first email service provider above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCredentials;
