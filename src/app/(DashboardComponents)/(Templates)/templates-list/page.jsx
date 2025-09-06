"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaPlus,
  FaEnvelope,
  FaWhatsapp,
  FaSms,
  FaFilter,
  FaFileAlt,
  FaShare,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaGlobe,
  FaUsers,
  FaUser
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useToast } from "@/app/component/customtoast/page";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiFilter } from "react-icons/fi";

const TemplatesList = () => {
  const router = useRouter();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateFilter, setTemplateFilter] = useState("self");
  const [allTemplates, setAllTemplates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewTemplate, setViewTemplate] = useState(false);
  const [viewedTemplateData, setViewedTemplateData] = useState(null);
  const [userID, setUserID] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  // Template type configuration
  const templateTypes = {
    E: { label: "Email", icon: FaEnvelope, color: "bg-blue-100 text-blue-800", iconColor: "text-blue-600" },
    W: { label: "WhatsApp", icon: FaWhatsapp, color: "bg-green-100 text-green-800", iconColor: "text-green-600" },
    S: { label: "SMS", icon: FaSms, color: "bg-purple-100 text-purple-800", iconColor: "text-purple-600" },
    WS: { label: "WhatsApp Scan", icon: FaWhatsapp, color: "bg-emerald-100 text-emerald-800", iconColor: "text-emerald-600" },
    WA: { label: "WhatsApp API", icon: FaWhatsapp, color: "bg-teal-100 text-teal-800", iconColor: "text-teal-600" }
  };

  const filterOptions = [
    { value: "self", label: "Your Templates", icon: FaUser },
    { value: "team", label: "Team Templates", icon: FaUsers },
    { value: "others", label: "Shared Templates", icon: FaGlobe }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      if (!userData || !userData.pic) {
        return router.push("/update-profile");
      } else {
        setUserID(userData.userID);
        setAccessToken(userData.accessToken || userData.access_token);
        fetchTemplates(userData.userID);
      }
    }
  }, [router]);

  const fetchTemplates = async (userID) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/template/get-templates",
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
        const templates = data.Templates;
        setAllTemplates(templates);
      } else {
        console.error(data.message, "error");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (tempID) => {
    const result = await Swal.fire({
      title: "Delete Template?",
      text: "This action cannot be undone. Are you sure you want to delete this template?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/template/delete-template",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tempID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        await fetchTemplates(userID);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      addToast(error.message, "error");
    }
  };

  const filteredTemplates = allTemplates.filter((item) => {
    const lowerCaseQuery = searchTerm.toLowerCase().trim();
    const matchesSearchQuery = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(lowerCaseQuery)
    );
    if (templateFilter == "self") {
      return matchesSearchQuery && item.euser == userID;
    } else if (templateFilter == "others") {
      return matchesSearchQuery && item.euser != userID;
    }
    return matchesSearchQuery;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTemplates.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredTemplates.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [templateFilter, searchTerm]);

  const handleTemplateFilterChange = (e) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("template-filter", e.target.value);
    }
    setTemplateFilter(e.target.value);
  };

  const getTemplateTypeDisplay = (type) => {
    return templateTypes[type] || { label: type, icon: FaFileAlt, color: "bg-gray-100 text-gray-800", iconColor: "text-gray-600" };
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-gray-200">
          <div className="flex items-center px-6 py-4 space-x-4">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded flex-1"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-4 px-2">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <FaFileAlt className="text-white text-md" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Templates</h1>
              </div>
            </div>
          </div>
          
          <Link
            href="/add-template"
            className="inline-flex items-center  text-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaPlus className="mr-2 text-sm" />
            Create Template
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* Controls Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Show</span>
                  <select
                    value={recordsPerPage}
                    onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                    className="px-3 py-1 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm font-semibold text-gray-700">records</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all w-64"
                  />
                </div>

                <div className="flex">
                <div className="relative w-full">
                   <FiFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <select
                    className="pl-6 pr-8 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all bg-white cursor-pointer"
                    value={templateFilter}
                    onChange={handleTemplateFilterChange}
                    disabled={allTemplates.length == 0}
                  >
                    {filterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Content */}
          <div className="p-4">
            {loading ? (
              <LoadingSkeleton />
            ) : currentRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileAlt className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || templateFilter !== "self" 
                    ? "Try adjusting your search or filters" 
                    : "Create your first template to get started"}
                </p>
                {!searchTerm && templateFilter === "self" && (
                  <Link
                    href="/add-template"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Template
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="px-6 py-4 text-left font-semibold">Type</th>
                        <th className="px-6 py-4 text-left font-semibold">Template Name</th>
                        <th className="px-6 py-4 text-center font-semibold">Shared</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((template, index) => {
                        const typeInfo = getTemplateTypeDisplay(template.temptype);
                        const TypeIcon = typeInfo.icon;
                        
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${typeInfo.color}`}>
                                <TypeIcon className={`mr-2 ${typeInfo.iconColor}`} />
                                {typeInfo.label}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{template.template}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center">
                                {template.share ? (
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <FaShare className="text-green-600 text-sm" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FaUser className="text-gray-400 text-sm" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-3">
                                <button
                                  onClick={() => {
                                    setViewedTemplateData(template);
                                    setViewTemplate(true);
                                  }}
                                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                                  title="View Template"
                                >
                                  <FaEye className="text-blue-600 text-sm" />
                                </button>
                                
                                {(template.euser == userID || userID == 1) && (
                                  <>
                                    <Link 
                                      href={{
                                        pathname: "/edit-template",
                                        query: { template: JSON.stringify(template) }
                                      }}
                                      className="w-8 h-8 bg-amber-100 hover:bg-amber-200 rounded-full flex items-center justify-center transition-all"
                                      title="Edit Template"
                                    >
                                      <FaEdit className="text-amber-600 text-sm" />
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteTemplate(template.tempID)}
                                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all"
                                      title="Delete Template"
                                    >
                                      <FaTrash className="text-red-600 text-sm" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {currentRecords.map((template, index) => {
                    const typeInfo = getTemplateTypeDisplay(template.temptype);
                    const TypeIcon = typeInfo.icon;
                    
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${typeInfo.color}`}>
                            <TypeIcon className={`mr-2 ${typeInfo.iconColor}`} />
                            {typeInfo.label}
                          </div>
                          {template.share && (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <FaShare className="text-green-600 text-sm" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 mb-4">{template.template}</h3>
                        
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => {
                              setViewedTemplateData(template);
                              setViewTemplate(true);
                            }}
                            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FaEye className="text-blue-600" />
                          </button>
                          
                          {(template.euser == userID || userID == 1) && (
                            <>
                              <Link 
                                href={{
                                  pathname: "/edit-template",
                                  query: { template: JSON.stringify(template) }
                                }}
                                className="w-10 h-10 bg-amber-100 hover:bg-amber-200 rounded-xl flex items-center justify-center transition-all"
                              >
                                <FaEdit className="text-amber-600" />
                              </Link>
                              <button
                                onClick={() => handleDeleteTemplate(template.tempID)}
                                className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all"
                              >
                                <FaTrash className="text-red-600" />
                              </button>
                            </>
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
          {filteredTemplates.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, filteredTemplates.length)} of{" "}
                {filteredTemplates.length} templates
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
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
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <FaChevronRight className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template View Modal */}
      {viewTemplate && viewedTemplateData && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Template Details</h2>
                </div>
                <button
                  onClick={() => setViewTemplate(false)}
                  className="w-10 h-10 bg-blue-300 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all"
                >
                  <IoMdClose className="text-blue text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Template Type</label>
                      <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {(() => {
                          const typeInfo = getTemplateTypeDisplay(viewedTemplateData.temptype);
                          const TypeIcon = typeInfo.icon;
                          return (
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                              <TypeIcon className={`mr-2 ${typeInfo.iconColor}`} />
                              {typeInfo.label}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Template Name</label>
                      <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="font-medium text-gray-800">{viewedTemplateData.template}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject/Template ID */}
                {(viewedTemplateData.subject || viewedTemplateData.auth) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
                      {viewedTemplateData.subject ? "Subject" : "Template ID"}
                    </h3>
                    <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-medium text-gray-800">{viewedTemplateData.subject || viewedTemplateData.auth}</span>
                    </div>
                  </div>
                )}

                {/* Header File */}
                {viewedTemplateData.bimg_url && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        <FaFileAlt className="text-xs" />
                      </div>
                      Header File
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <a
                        href={viewedTemplateData.bimg_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <FaEye className="mr-2" />
                        View Header File
                      </a>
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      <FaFileAlt className="text-xs" />
                    </div>
                    Message Content
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <textarea
                      readOnly
                      value={viewedTemplateData.matter}
                      className="w-full bg-transparent border-none resize-none focus:outline-none text-gray-800 leading-relaxed"
                      rows="5"
                    />
                  </div>
                </div>

                {/* HTML Preview */}
                {viewedTemplateData.matter.toLowerCase().includes("<html") && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        <FaEye className="text-xs" />
                      </div>
                    HTML Preview 
                    </h3>
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-gray-200">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: viewedTemplateData.matter || "Preview will be shown here",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {viewedTemplateData.attach_url && viewedTemplateData.attach_url.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        <FaFileAlt className="text-xs" />
                      </div>
                      Attachments
                    </h3>
                    <div className="space-y-3">
                      {viewedTemplateData.attach_url.map((url, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                          <span className="font-medium text-gray-700">Attachment {index + 1}</span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <FaEye className="mr-2" />
                            View File
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Sharing */}
                {viewedTemplateData.team && Array.isArray(viewedTemplateData.team) && viewedTemplateData.team.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        <FaUsers className="text-xs" />
                      </div>
                      Shared with Team
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="space-y-2">
                        {viewedTemplateData.teamMemberName?.map((member, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="text-blue-600 text-sm" />
                            </div>
                            <span className="text-gray-800 font-medium">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesList;
