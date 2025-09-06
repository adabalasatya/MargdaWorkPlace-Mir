"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

const SendSmsCon = ({ setClose, selectedLeads, setSelectedLeads, fetchData }) => {
  const router = useRouter();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [templateID, setTemplateID] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || "null");
    if (!storedUserData || !storedUserData.pic) {
      router.push("/login");
      return;
    }
    setUserData(storedUserData);
    setUserID(storedUserData.userID);
    
    if (storedUserData.userID) {
      fetchTemplates(storedUserData.userID);
    }
  }, [router]);

  const fetchTemplates = async (userID) => {
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
        const templates = data.Templates || [];
        setTemplates(templates);
        
        if (templates.length > 0) {
          const firstTemplate = templates[0];
          setTemplateID(firstTemplate.tempID || firstTemplate.templateID || firstTemplate.id || "");
          setSelectedTemplate(firstTemplate);
        }
      } else {
        toast.error(data.message || "Failed to fetch templates", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Error loading templates. Please try again.", { autoClose: 3000 });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateChange = (e) => {
    const selectedValue = e.target.value;
    setTemplateID(selectedValue);
    
    const template = smsTemplates.find(t => getTemplateValue(t) === selectedValue);
    setSelectedTemplate(template);
  };

  const handleSendSms = async () => {
    if (!selectedLeads?.length) {
      addToast("Please select at least one lead to send SMS.", "warning");
      return;
    }

    if (!templateID) {
      toast.warn("Please select a template");
      return;
    }
    if (!remarks) {
      toast.warn("Please enter remarks");
      return;
    }
    if (!followUpDateTime) {
      toast.warn("Please enter follow-up date and time");
      return;
    }

    const dataIDs = selectedLeads.map((lead) => lead.dataID).filter(Boolean);
    if (!dataIDs.length) {
      addToast("Selected leads are missing data IDs.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://www.margda.in/miraj/work/data/sms/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateID: Number(templateID),     
          remarks: remarks,                   
          fdate: followUpDateTime,           
          userID: userID,                    
          dataIDs: dataIDs,                  
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(data.message || `SMS sent to ${dataIDs.length} recipient(s).`, "success");
        setSelectedLeads([]);
        if (fetchData) fetchData();
        setClose(false);
      } else {
        if (response.status === 402) {
          addToast(data.message || "Payment required. Redirecting to shop.", "error", 10000);
          return router.push("/dashboard");
        }
        addToast(data.message || "Failed to send SMS.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("An error occurred while sending SMS. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateKey = (template, index) => {
    return template.tempID || template.templateID || template.id || `template-${index}`;
  };

  const getTemplateValue = (template) => {
    return template.tempID || template.templateID || template.id || "";
  };

  const getTemplateName = (template) => {
    return template.template || template.name || template.templateName || `Template ${getTemplateValue(template)}`;
  };

  const smsTemplates = templates.filter(template => 
    template.temptype === "S" || template.type === "SMS"
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                💬 Send SMS Campaign
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                {selectedLeads?.length || 0} lead{(selectedLeads?.length || 0) !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={() => setClose(false)}
              className="text-white hover:bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SMS Template
            </label>
            {loadingTemplates ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                Loading templates...
              </div>
            ) : (
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                value={templateID}
                onChange={handleTemplateChange}
                disabled={smsTemplates.length === 0}
              >
                <option value="">Select a template</option>
                {smsTemplates.map((template, index) => (
                  <option 
                    key={getTemplateKey(template, index)} 
                    value={getTemplateValue(template)}
                  >
                    {getTemplateName(template)}
                  </option>
                ))}
              </select>
            )}
            {smsTemplates.length === 0 && !loadingTemplates && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 flex items-center gap-2">
                  <span>⚠️</span>
                  No SMS templates available. Please create templates first.
                </p>
              </div>
            )}
          </div>

          {/* Remarks and Follow-up */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700 mb-2">
                Campaign Remarks
              </label>
              <textarea
                name="remarks"
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg  resize-none"
                rows="3"
                placeholder="Enter campaign remarks..."
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setClose(false)}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendSms}
            disabled={isLoading || smsTemplates.length === 0 || !templateID || !remarks || !followUpDateTime}
            className="px-6 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <span>💬</span>
                Send SMS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendSmsCon;
