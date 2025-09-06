'use client';

/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

const SendEmailCon = ({
  setSendEmail,
  selectedLeads = [], // Default to empty array
  setSelectedLeads,
  userID,
}) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [emailDetails, setEmailDetails] = useState({
    recipientEmails: [],
    subject: "",
    body: "",
    senderEmail: "",
    senderPassword: "",
    replyToEmail: "",
    senderName: "",
    recipientnames: [],
    attachment_urls: [],
    tempID: null,
    dataIDs: [],
    userIDs: [],
    isFooter: false,
  });

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedService, setSelectedService] = useState("aws");
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [error, setError] = useState("");
  const [esps, setEsps] = useState([]);

  useEffect(() => {
    if (userID) {
      fetchTemplates(userID);
      fetchCreds(userID);
    }
  }, [userID]);

  const fetchCreds = async (userID) => {
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
        setEsps(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      if (addToast) {
        addToast("Failed to fetch email credentials", "error");
      }
    }
  };

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
        const templates = Array.isArray(data.Templates) ? data.Templates : [];
        const filter = templates.filter((template) => template.temptype === "E");
        setTemplates(filter);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      if (addToast) {
        addToast("Failed to fetch email templates", "error");
      }
    }
  };

  const handleTemplateSelection = (template) => {
    if (template) {
      setSelectedTemplate(template);
      setEmailDetails((prevState) => ({
        ...prevState,
        subject: template.subject || "",
        body: template.matter || "",
        attachment_urls: Array.isArray(template.attach_url) ? template.attach_url : [],
        tempID: template.tempID || null,
      }));
    } else {
      setSelectedTemplate(null);
      setEmailDetails((prevState) => ({
        ...prevState,
        subject: "",
        body: "",
        attachment_urls: [],
        tempID: null,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      setError("Please select an ESP.");
      return;
    }

    if (!selectedTemplate) {
      setError("Please select a template.");
      return;
    }

    if (!followUpDateTime) {
      setError("Please provide follow up date and time");
      if (typeof toast !== 'undefined') {
        toast.warn("Please provide follow up date and time");
      }
      return;
    }

    if (!remarks) {
      if (typeof toast !== 'undefined') {
        toast.warn("Please Enter Remarks");
      }
      return;
    }

    if (!Array.isArray(selectedLeads) || selectedLeads.length === 0) {
      setError("No leads selected");
      return;
    }

    setLoading(true);
    setError("");

    const emailData = {
      dataIDs: selectedLeads.map((lead) => lead.dataID),
      templateID: selectedTemplate.tempID,
      remarks,
      fdate: followUpDateTime,
      userID,
      credID: selectedService,
    };

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/email/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          if (addToast) {
            addToast(data.message, "error", { autoClose: 10000 });
          }
          return router.push("/shop");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      const data = await response.json();

      if (
        data.responses &&
        Array.isArray(data.responses) &&
        data.responses.length > 0
      ) {
        data.responses.forEach((resMes) => {
          if (addToast) {
            addToast(resMes.message, resMes.type);
          }
        });
      } else {
        if (addToast) {
          addToast("Email sent, Verify in email report", "info");
        }
      }

      setEmailDetails({
        recipientEmails: [],
        subject: "",
        body: "",
        senderEmail: "",
        senderPassword: "",
        replyToEmail: "",
        senderName: "",
        recipientnames: [],
        attachment_urls: [],
        tempID: null,
        dataIDs: [],
        userIDs: [],
        isFooter: false,
      });
      
      if (setSelectedLeads) {
        setSelectedLeads([]);
      }
      setSelectedTemplate(null);
      if (setSendEmail) {
        setSendEmail(false);
      }
    } catch (error) {
      if (error.message) {
        if (addToast) {
          addToast(error.message, "error");
        }
        return;
      }
      console.error("Error sending email:", error);
      if (addToast) {
        addToast(JSON.stringify(error), "error");
      }
      setError(error.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const safeSelectedLeads = Array.isArray(selectedLeads) ? selectedLeads : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safeEsps = Array.isArray(esps) ? esps : [];

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                📧 Send Email Campaign
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {safeSelectedLeads.length} lead{safeSelectedLeads.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={() => setSendEmail && setSendEmail(false)}
              className="text-white hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Service and Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emailService" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Service Provider
                </label>
                <select
                  id="emailService"
                  value={selectedService}
                  onChange={handleServiceChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                >
                  <option value="">Select ESP</option>
                  {safeEsps.map((service) => (
                    <option key={service.credID} value={service.credID}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="template" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  id="template"
                  value={selectedTemplate ? selectedTemplate.tempID : ""}
                  onChange={(e) => {
                    const selected = safeTemplates.find(
                      (template) => template.tempID === parseInt(e.target.value)
                    );
                    handleTemplateSelection(selected);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a template</option>
                  {safeTemplates.length > 0 ? (
                    safeTemplates.map((template) => (
                      <option key={template.tempID} value={template.tempID}>
                        {template.template}
                      </option>
                    ))
                  ) : (
                    <option disabled>No templates available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={emailDetails.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder={selectedTemplate ? "Subject from template" : "Enter email subject"}
                disabled={!!selectedTemplate}
              />
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Content
              </label>
              <textarea
                name="body"
                id="body"
                value={emailDetails.body}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg  resize-none"
                rows={6}
                placeholder={selectedTemplate ? "Content from template" : "Enter email content"}
              />
            </div>

            {/* Preview */}
            {emailDetails.body && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Preview
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <div
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: emailDetails.body }}
                  />
                </div>
              </div>
            )}

            {/* Remarks and Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setSendEmail && setSendEmail(false)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !safeSelectedLeads.length || !selectedTemplate || !selectedService}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <span>📧</span>
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEmailCon;
