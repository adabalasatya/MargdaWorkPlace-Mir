'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FaCheck
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import LoadingProgress from "@/app/component/LoadingProgress";

const AddTemplate = () => {
  const router = useRouter();
  const [templateType, setTemplateType] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [headerFile, setHeaderFile] = useState(null);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/update-profile");
      return;
    } else {
      setUserData(storedUserData);
      setUserID(storedUserData.userID);
    }
  }, [router]);

  const { addToast } = useToast();

  const templateTypeOptions = [
    { value: "", label: "Select Template Type", icon: null },
    { value: "E", label: "Email Template", icon: FaEnvelope, color: "text-blue-600" },
    { value: "W", label: "WhatsApp Template", icon: FaWhatsapp, color: "text-green-600" },
    { value: "S", label: "SMS Template", icon: FaSms, color: "text-purple-600" }
  ];

  const getTemplateTypeInfo = (type) => {
    return templateTypeOptions.find(option => option.value === type) || templateTypeOptions[0];
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
        templateType,
        templateName,
        message,
        userID,
      };
    } else {
      payload = {
        templateType,
        templateName,
        subject,
        message,
        userID,
      };
    }

    try {
      if (headerFile) {
        const formData = new FormData();
        formData.append("files", headerFile);
        setIsUploading(true);
        setUploadingMessage("Uploading Header File");
        setUploadProgress(0);

        try {
          const uploadRes = await axios.post(
            "https://www.margda.in/miraj/work/template/upload-file",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
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
            payload.headerFileUrl = uploadRes.data.fileUrls[0];
          } else {
            payload.headerFileUrl = null;
          }
        } catch (uploadError) {
          console.error("Header file upload error:", uploadError);
          addToast("Failed to upload header file", "error");
          payload.headerFileUrl = null;
        }

        setUploadingMessage("");
        setIsUploading(false);
      }

      if (attachmentFiles.length > 0) {
        const validFiles = attachmentFiles.filter(file => file !== null);
        
        if (validFiles.length > 0) {
          setIsUploading(true);
          setUploadingMessage("Uploading Attachment Files");
          setUploadProgress(0);

          const formData = new FormData();
          validFiles.forEach((file) => {
            formData.append("files", file);
          });

          try {
            const uploadRes = await axios.post(
              "https://www.margda.in/miraj/work/template/upload-file",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
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
              payload.templateFileUrls = uploadRes.data.fileUrls;
            } else {
              payload.templateFileUrls = [];
            }
          } catch (uploadError) {
            console.error("Attachment files upload error:", uploadError);
            addToast("Failed to upload attachment files", "error");
            payload.templateFileUrls = [];
          }

          setUploadingMessage("");
          setIsUploading(false);
        }
      }

      const apiUrl = "https://www.margda.in/miraj/work/template/add-template";
      const response = await fetch(apiUrl, {
        method: "POST",
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
      addToast(error.message || "An error occurred while submitting", "error");
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
    if (attachmentFiles.length < 4) {
      setAttachmentFiles([...attachmentFiles, null]);
    }
  };

  const handleRemoveAttachmentFilesInput = (index) => {
    const updatedFiles = attachmentFiles.filter((_, i) => i !== index);
    setAttachmentFiles(updatedFiles);
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    
    switch (field) {
      case 'templateType':
        setTemplateType(value);
        setSubject("");
        setMessage("");
        setHeaderFile(null);
        setAttachmentFiles([]);
        break;
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

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedTemplateInfo = getTemplateTypeInfo(templateType);

  return (
    <div className="min-h-screen py-4 px-2">
      {isUploading && (
        <LoadingProgress
          progress={uploadProgress}
          uploadMessage={uploadingMessage}
        />
      )}
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-4">
        {/* Template Type Indicator */}
        {templateType && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-md border-2 border-gray-100">
              {selectedTemplateInfo.icon && (
                <selectedTemplateInfo.icon className={`${selectedTemplateInfo.color} text-xl mr-3`} />
              )}
              <span className="font-semibold text-gray-800">Create {selectedTemplateInfo.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-8 md:p-12">
            
            {/* Basic Information Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="template-type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="template-type"
                    id="template-type"
                    value={templateType}
                    onChange={(e) => handleInputChange('templateType', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none ${
                      errors.templateType ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {templateTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.templateType && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.templateType}
                    </p>
                  )}
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
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none ${
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
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                  <h2 className="text-2xl font-bold text-gray-800">Email Subject</h2>
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
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none ${
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
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    <FaImage />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Header Media</h2>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-2  border-2 border-dashed border-gray-300 hover:border-green-400 transition-all duration-200">
                  <div className="text-center">
                    <input
                      type="file"
                      name="header"
                      className="hidden"
                      id="header"
                      onChange={handleHeaderFileChange}
                      accept="image/jpeg,image/jpg,image/png"
                    />
                    
                    {!headerFile ? (
                      <label
                        htmlFor="header"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                          <FaUpload className="text-green-600 text-xl" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Upload Header Image (JPG, JPEG, PNG formats supported)</p>
                        <div className="bg-green-600 text-white px-3 py-1 rounded-xl hover:bg-green-700 transition-colors">
                          Choose File
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                            <FaCheck className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{headerFile.name}</p>
                            <p className="text-sm text-gray-500">Ready to upload</p>
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
                  </div>
                </div>
              </div>
            )}

            {/* Message Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {templateType === "E" ? "3" : "2"}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Message Content</h2>
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
                    rows={6}
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
                  <div className="mt-6">
                    <div className="flex items-center mb-4">
                      <FaEye className="text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
                    </div>
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[150px]">
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
            {templateType !== "S" && templateType && (
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    <FaPaperclip />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Attachments</h2>
                  <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Optional • Max 4 files
                  </span>
                </div>
                
                <div className="space-y-4">
                  {attachmentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    >
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
                        <IoMdClose size={20} />
                      </button>
                    </div>
                  ))}
                  
                  {attachmentFiles.length < 4 && (
                    <button
                      onClick={handleAddAttachmentFilesInput}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-center">
                        <FaPlus className="text-gray-400 group-hover:text-purple-600 mr-2" />
                        <span className="text-gray-600 group-hover:text-purple-700 font-medium">
                          {attachmentFiles.length === 0 ? "Add Attachment" : "Add Another Attachment"}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaPaperPlane className="mr-2" />
                {isUploading ? "Creating Template..." : "Create Template"}
              </button>
              
              <Link
                href="/templates-list"
                className="flex items-center justify-center px-8 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
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

export default AddTemplate;
