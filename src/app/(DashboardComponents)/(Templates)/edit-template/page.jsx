'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/component/customtoast/page";
import { 
  FaFileAlt, 
  FaEnvelope, 
  FaWhatsapp, 
  FaSms,
  FaUpload,
  FaTrash,
  FaPlus,
  FaEye,
  FaPaperPlane,
  FaArrowLeft,
  FaImage,
  FaPaperclip,
  FaCheck,
  FaEdit,
  FaTimes
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import LoadingProgress from "@/app/component/LoadingProgress";

const EditTemplate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allUsers, setAllUsers] = useState([]);
  const [tempID, setTempID] = useState("");
  const [members, setMembers] = useState([]);
  const [templateType, setTemplateType] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [share, setShare] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [attachmentUrls, setAttachmentUrls] = useState([]);
  const [headerFile, setHeaderFile] = useState(null);
  const [headerUrl, setHeaderUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  const { addToast } = useToast();

  // Template type configuration
  const templateTypes = {
    E: { label: "Email Template", icon: FaEnvelope, color: "text-blue-600", bgColor: "bg-blue-100" },
    W: { label: "WhatsApp Template", icon: FaWhatsapp, color: "text-green-600", bgColor: "bg-green-100" },
    S: { label: "SMS Template", icon: FaSms, color: "text-purple-600", bgColor: "bg-purple-100" }
  };

  // Safe localStorage access
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  };

  const userLocalData = getUserData();
  const accessToken = userLocalData ? userLocalData.access_token : null;

  useEffect(() => {
    const templateData = searchParams.get('template');
    if (templateData) {
      try {
        const template = JSON.parse(decodeURIComponent(templateData));
        setTemplateType(template.temptype.trim());
        setTempID(template.tempID);
        setSubject(template.subject);
        setTemplateName(template.template);
        setTemplateId(template.auth);
        setMessage(template.matter);
        setShare(template.share);
        setHeaderUrl(template.bimg_url);
        setAttachmentUrls(template.attach_url);
      } catch (error) {
        console.error('Error parsing template data:', error);
        router.push("/templates-list");
      }
    } else {
      router.push("/templates-list");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllUsersData();
  }, []);

  const fetchAllUsersData = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/margda.org/admin/getallusers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setAllUsers([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (response.ok) {
        const users = result.data;
        users.map((user) => {
          user.label = `${user.name}, ${user.email.slice(0, 4)}******${user.email.slice(user.email.length - 3, user.email.length)}`;
          user.value = user.userID;
          return user;
        });
        setAllUsers(users);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleHeaderFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        addToast("Please select a valid image file (JPG, JPEG, PNG)", "error");
        return;
      }
      setHeaderFile(file);
    }
  };

  const handleHeaderFileDelete = () => {
    setHeaderFile(null);
    const fileInput = document.getElementById('header');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!templateType.trim()) {
      newErrors.templateType = "Template type is required.";
    }
    if (!templateName.trim()) {
      newErrors.templateName = "Template Name is required.";
    }
    if (!message.trim()) {
      newErrors.message = "Message is required";
    }
    if (templateType === "E") {
      if (!subject.trim()) {
        newErrors.subject = "Subject is required";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    let payload;
    if (templateType !== "E") {
      payload = {
        tempID,
        templateName,
        share,
        templateId,
        message,
      };
    } else {
      payload = {
        tempID,
        templateName,
        share,
        subject,
        message,
      };
    }

    try {
      if (headerFile) {
        const formData = new FormData();
        formData.append("files", headerFile);
        setIsUploading(true);
        setUploadingMessage("Uploading Header File");
        setUploadProgress(0);

        const uploadRes = await axios.post(
          "https://www.margda.in/miraj/work/template/upload-file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );

        setUploadingMessage("");
        setIsUploading(false);

        if (uploadRes.status === 200) {
          payload.headerFileUrl = uploadRes.data.fileUrls[0];
        } else {
          payload.headerFileUrl = null;
        }
      } else if (headerUrl) {
        payload.headerFileUrl = headerUrl;
      }

      payload.templateFileUrls = [];

      if (attachmentFiles.length > 0) {
        setIsUploading(true);
        setUploadingMessage("Uploading Attachment Files");
        setUploadProgress(0);

        const formData = new FormData();
        attachmentFiles.forEach((file) => {
          if (file) {
            formData.append("files", file);
          }
        });

        try {
          const uploadRes = await axios.post(
            "https://www.margda.in/miraj/work/template/upload-file",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${accessToken}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            }
          );

          if (uploadRes.status === 200) {
            payload.templateFileUrls.push(...uploadRes.data.fileUrls);
          }
        } catch (error) {
          console.error("Attachment upload error:", error);
        }

        setUploadingMessage("");
        setIsUploading(false);
      }

      if (attachmentUrls && attachmentUrls.length > 0) {
        payload.templateFileUrls.push(...attachmentUrls);
      }

      const apiUrl = "https://www.margda.in/miraj/work/template/edit-template";
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        router.push("/templates-list");
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      addToast(error.message || "An error occurred while updating", "error");
    } finally {
      setIsUploading(false);
      setUploadingMessage("");
      setUploadProgress(0);
    }
  };

  const handleAttachmentFilesChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const updatedFiles = [...attachmentFiles];
      updatedFiles[index] = file;
      setAttachmentFiles(updatedFiles);
    }
  };

  const handleAddAttachmentFilesInput = () => {
    if (attachmentFiles.length + (attachmentUrls?.length || 0) < 4) {
      setAttachmentFiles([...attachmentFiles, null]);
    }
  };

  const handleRemoveAttachmentFilesInput = (index) => {
    const updatedFiles = attachmentFiles.filter((_, i) => i !== index);
    setAttachmentFiles(updatedFiles);
  };

  const handleRemoveAttachmentUrls = (index) => {
    const updatedUrls = attachmentUrls.filter((_, i) => i !== index);
    setAttachmentUrls(updatedUrls);
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    
    switch (field) {
      case 'templateName':
        setTemplateName(value);
        break;
      case 'subject':
        setSubject(value);
        break;
      case 'message':
        setMessage(value);
        break;
      default:
        break;
    }
  };

  const getTemplateTypeDisplay = () => {
    return templateTypes[templateType] || { label: "Template", icon: FaFileAlt, color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  const typeInfo = getTemplateTypeDisplay();
  const TypeIcon = typeInfo.icon;

  return (
    <div className="min-h-screen  py-4 px-2">
      {isUploading && (
        <LoadingProgress
          progress={uploadProgress}
          uploadMessage={uploadingMessage}
        />
      )}
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-2">
        {/* Template Type Indicator */}
        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-md border-2 border-gray-100">
            <TypeIcon className={`${typeInfo.color} text-xl mr-3`} />
            <span className="font-semibold text-gray-800">Edit {typeInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-8">
            
            {/* Basic Information Section */}
            <div className="mb-4">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="template-type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Type
                  </label>
                  <div className="relative">
                    <select
                      disabled
                      name="template-type"
                      id="template-type"
                      value={templateType}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed transition-all duration-200"
                    >
                      <option value="">Select Template Type</option>
                      <option value="W">WhatsApp</option>
                      <option value="E">Email</option>
                      <option value="S">SMS</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 mr-2 flex items-center pr-3 pointer-events-none">
                      <TypeIcon className={typeInfo.color} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="template-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="template-name"
                    id="template-name"
                    value={templateName}
                    onChange={(e) => handleInputChange('templateName', e.target.value)}
                    placeholder="Enter a descriptive template name"
                    className={`w-full px-4 py-2 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none ${
                      errors.templateName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.templateName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.templateName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Subject field for Email templates */}
            {templateType === "E" && (
              <div className="mb-4">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                  <h2 className="text-xl font-bold text-gray-800">Email Subject</h2>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="template-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="template-subject"
                    id="template-subject"
                    value={subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter compelling subject line"
                    className={`w-full px-4 py-2 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none ${
                      errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Header file upload for WhatsApp templates */}
            {templateType === "W" && (
              <div className="mb-4">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    <FaImage />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Header Media</h2>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300 hover:border-green-400 transition-all duration-200">
                  <input
                    type="file"
                    name="header"
                    className="hidden"
                    id="header"
                    onChange={handleHeaderFileChange}
                    accept="image/jpeg,image/jpg,image/png"
                  />
                  
                  {!headerFile && !headerUrl ? (
                    <label htmlFor="header" className="cursor-pointer flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FaUpload className="text-green-600 text-2xl" />
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Upload Header Image</p>
                      <p className="text-sm text-gray-500 mb-4">JPG, JPEG, PNG formats supported</p>
                      <div className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors">
                        Choose File
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      {headerFile && (
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                              <FaCheck className="text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{headerFile.name}</p>
                              <p className="text-sm text-gray-500">New file selected</p>
                            </div>
                          </div>
                          <button
                            onClick={handleHeaderFileDelete}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                      
                      {headerUrl && !headerFile && (
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                              <FaImage className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Current Header File</p>
                              <a href={headerUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                                View current file
                              </a>
                            </div>
                          </div>
                          <label htmlFor="header" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                            Change File
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message Section */}
            <div className="mb-4">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {templateType === "E" ? "3" : "2"}
                </div>
                <h2 className="text-xl font-bold text-gray-800">Message Content</h2>
              </div>
              
              <div className="space-y-4">
                <label htmlFor="template-message" className="block text-sm font-semibold text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                
                <div className="relative">
                  <textarea
                    name="message"
                    id="template-message"
                    placeholder="Craft your message here..."
                    rows={8}
                    value={message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none resize-none ${
                      errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-500 bg-white px-2 py-1 rounded-lg border">
                    {message.length} characters
                  </div>
                </div>

                {errors.message && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.message}
                  </p>
                )}

                {/* Preview for Email templates */}
                {templateType === "E" && message && (
                  <div className="mt-2">
                    <div className="flex items-center mb-4">
                      <FaEye className="text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
                    </div>
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[150px] max-h-64 overflow-y-auto">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: message || "<p class='text-gray-400'>Preview will appear here as you type...</p>",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attachment files (not for SMS) */}
            {templateType !== "S" && (
              <div className="mb-4">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    <FaPaperclip />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Attachments</h2>
                  <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Optional • Max 4 files
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* Existing attachment URLs */}
                  {attachmentUrls && attachmentUrls.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-700">Current Attachments</h3>
                      {attachmentUrls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <FaPaperclip className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800">Attachment {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <FaEye className="inline mr-1" />
                              View
                            </a>
                            <button
                              onClick={() => handleRemoveAttachmentUrls(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New attachment files */}
                  {attachmentFiles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-700">
                        {attachmentUrls && attachmentUrls.length > 0 ? "Additional Attachments" : "New Attachments"}
                      </h3>
                      {attachmentFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaPaperclip className="text-purple-600" />
                          </div>
                          
                          <div className="flex-1">
                            <input
                              type="file"
                              id={`attachment${index}`}
                              onChange={(e) => handleAttachmentFilesChange(e, index)}
                              className="hidden"
                            />
                            <label
                              htmlFor={`attachment${index}`}
                              className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <FaUpload className="mr-2" />
                              {file ? "Change File" : `Choose File ${index + 1}`}
                            </label>
                            {file && (
                              <p className="text-sm text-gray-600 mt-2 font-medium">{file.name}</p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleRemoveAttachmentFilesInput(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Remove attachment"
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(attachmentFiles.length + (attachmentUrls?.length || 0)) < 4 && (
                    <button
                      onClick={handleAddAttachmentFilesInput}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-center">
                        <FaPlus className="text-gray-400 group-hover:text-purple-600 mr-2" />
                        <span className="text-gray-600 group-hover:text-purple-700 font-medium">
                          {attachmentFiles.length === 0 && (!attachmentUrls || attachmentUrls.length === 0) 
                            ? "Add Attachment" 
                            : "Add Another Attachment"}
                        </span>
                      </div>
                    </button>
                  )}

                  {(attachmentFiles.length + (attachmentUrls?.length || 0)) >= 4 && (
                    <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-amber-700 font-medium">Maximum 4 attachments allowed</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaPaperPlane className="mr-2" />
                {isUploading ? "Updating Template..." : "Update Template"}
              </button>
              
              <Link
                href="/templates-list"
                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
              >
                <FaArrowLeft className="mr-2" />
                Back to Templates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;
