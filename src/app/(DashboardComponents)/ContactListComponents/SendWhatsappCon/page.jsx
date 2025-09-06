'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/app/component/customtoast/page";

// Custom Image Component to handle both external and internal images
const CustomImage = ({ src, alt, className, width, height, ...props }) => {
  const isExternalUrl = src?.startsWith('http');
  
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

const WhatsAppCon = ({ selectedLeads, setClose, userID, setSelectedLeads }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [headerUrl, setHeaderUrl] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (userID) {
      fetchWhatsAppProfiles(userID);
      fetchTemplates(userID);
    }
  }, [userID]);

  const fetchTemplates = async (userID) => {
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
        const filter = templates.filter((template) => template.temptype === "W");
        setTemplates(filter);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      addToast("Failed to fetch WhatsApp templates", "error");
    }
  };

  const fetchWhatsAppProfiles = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/whatsapp/scan/get-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const body = await response.json();
      if (response.ok) {
        setProfile(body.Profile || null);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp profiles:", error);
      addToast("Failed to fetch WhatsApp profile", "error");
    }
  };

  const sendMessage = async () => {
    if (!followUpDateTime) {
      return addToast("Please Enter Follow up date and time", "info");
    }

    if (!remarks) {
      addToast("Please Enter Remarks", "info");
      return;
    }

    if (!selectedTemplate) {
      addToast("Please select a template", "info");
      return;
    }

    setLoading(true);
    const dataIDs = selectedLeads.map((lead) => lead.dataID);
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/whatsapp/send-whatsapp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataIDs,
            templateID: selectedTemplate.tempID,
            userID: userID,
            remarks,
            fdate: followUpDateTime,
          }),
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        const responseMessages = data.responses;
        if (Array.isArray(responseMessages)) {
          responseMessages.forEach((mess) => addToast(mess.message, mess.type));
        }
      } else {
        if (response.status === 402) {
          addToast(data.message, "error", { autoClose: 10000 });
          return router.push("/dasboard");
        }
        addToast(data.message, "error");
      }

      setSelectedLeads([]);
      setClose(false);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.message) {
        return addToast(error.message, "error");
      }
      addToast("Error in Message Sending: " + error.toString(), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex !== "") {
      const template = templates[parseInt(selectedIndex)];
      setSelectedTemplate(template);
      setMessage(template.matter || "");
      if (template.bimg_url) {
        setHeaderUrl(template.bimg_url);
      } else {
        setHeaderUrl(null);
      }
    } else {
      setSelectedTemplate(null);
      setHeaderUrl(null);
      setMessage("");
    }
  };

  const canSendMessage = profile && profile.active;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                💬 Send WhatsApp Message
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-green-100 text-sm">
                  {selectedLeads?.length} lead{selectedLeads?.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${canSendMessage ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span className="text-xs text-green-100">
                    {canSendMessage ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setClose(false)}
              className="text-white hover:bg-green-500 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* WhatsApp Status Alert */}
          {!canSendMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">WhatsApp Not Connected</h3>
                  <p className="text-red-600 text-sm mt-1">
                    Please scan the QR code to connect your WhatsApp account first.
                  </p>
                </div>
                <Link
                  href="/qr-scan"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Connect Now
                </Link>
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label htmlFor="template" className="block text-sm font-semibold text-gray-700 mb-2">
              Message Template
            </label>
            <select
              name="template"
              id="template"
              onChange={handleTemplateChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Template</option>
              {templates.length > 0 &&
                templates.map((template, index) => (
                  <option key={template.tempID || index} value={index}>
                    {template.template}
                  </option>
                ))}
            </select>
          </div>

          {/* Header Image */}
          {headerUrl && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Header Image
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                <CustomImage
                  src={headerUrl}
                  alt="Header"
                  width={300}
                  height={200}
                  className="w-full max-w-sm h-auto rounded-lg border border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message Content
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-gray-800"
                rows={4}
                placeholder="Your WhatsApp message will appear here when you select a template..."
                disabled={!selectedTemplate}
              />
            </div>
          </div>

          {/* Remarks and Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700 mb-2">
                Campaign Remarks
              </label>
              <textarea
                name="remarks"
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-0 border border-gray-300 rounded-lg  resize-none"
                rows={3}
                placeholder="Enter campaign remarks"
              />
            </div>

            <div>
              <label htmlFor="followup-date-time" className="block text-sm font-semibold text-gray-700 mb-2">
                Follow-up Schedule
              </label>
              <input
                name="followup-date-time"
                id="followup-date-time"
                value={followUpDateTime}
                onChange={(e) => setFollowUpDateTime(e.target.value)}
                type="datetime-local"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setClose(false)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          {canSendMessage ? (
            <button
              onClick={sendMessage}
              disabled={loading || !selectedTemplate || !remarks || !followUpDateTime}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <span>💬</span>
                  Send Message
                </>
              )}
            </button>
          ) : (
            <Link
              href="/qr-scan"
              className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2"
            >
              <span>📱</span>
              Connect WhatsApp
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppCon;
