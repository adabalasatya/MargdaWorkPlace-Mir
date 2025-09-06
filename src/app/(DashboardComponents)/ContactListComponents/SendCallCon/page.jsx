"use client"; 
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

const CallCon = ({ setShowCallCon, selectedLeads = [], setSelectedLeads, fetchData }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [callType, setCallType] = useState("S");
  const [callServices, setCallServices] = useState([
    { value: "S", name: "SIM" },
    { value: "A", name: "API" },
  ]);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/login");
      return;
    } else {
      setUserData(storedUserData);
      setUserID(storedUserData.userID);
    }
  }, [router]);

  useEffect(() => {
    if (selectedLeads && selectedLeads.length > 0) {
      check();
    }
  }, [selectedLeads]);

  const check = () => {
    if (selectedLeads?.length > 0) {
      for (let i = 0; i < selectedLeads.length; i++) {
        const lead = selectedLeads[i];
        if (!lead.isView) {
          setCallServices([
            { value: "S", name: "SIM" },
            { value: "A", name: "API" },
          ]);
          setCallType("A");
          break;
        }
      }
    }
  };

  const handleCall = async () => {
    if (!selectedLeads || selectedLeads.length === 0) {
      addToast("No lead selected for calling.", "warning");
      return;
    }

    if (selectedLeads.length > 1) {
      addToast("Please select only one lead for calling.", "warning");
      return;
    }
    
    const lead = selectedLeads[0];
    const mobile = lead.mobile;
    
    if (!followUpDateTime) {
      toast.warn("Please Enter Follow up date and time");
      return;
    }
    
    if (!remarks) {
      toast.warn("Please Enter Remarks");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (callType === "S") {
        const response = await fetch(
          "https://www.margda.in/miraj/work/data/call/make-call",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: userID,
              dataID: lead.dataID,
              remarks: remarks,
              fdate: followUpDateTime,
            }),
          }
        );
        
        const data = await response.json();
        if (response.ok) {
          addToast(data.message || "Call initiated successfully.", "success");
          if (setSelectedLeads) setSelectedLeads([]);
          if (fetchData) fetchData();
          if (setShowCallCon) setShowCallCon(false);
        } else {
          if (response.status == 402) {
            addToast(data.message, "error", 10000);
            return router.push("/dashboard");
          }
          addToast(data.message || "Failed to initiate call.", "error");
        }
      }
    } catch (error) {
      console.error(error);
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no leads are selected (for prerendering safety)
  if (!selectedLeads || selectedLeads.length === 0) {
    return null;
  }

  const currentLead = selectedLeads[0];

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">📞 Initiate Call</h2>
              <p className="text-blue-100 text-sm mt-1">
                {currentLead?.name || 'Unknown'} • {currentLead?.mobile || 'No number'}
              </p>
            </div>
            <button
              onClick={() => setShowCallCon && setShowCallCon(false)}
              className="text-white hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Call Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Call Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {callServices.map((service) => (
                <button
                  key={service.value}
                  onClick={() => setCallType(service.value)}
                  disabled={service.disabled}
                  className={`p-3 rounded-lg border-2 transition-all font-medium ${
                    callType === service.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  } ${service.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">
                      {service.value === 'S' ? '📱' : '🔗'}
                    </div>
                    {service.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700 mb-2">
              Call Remarks
            </label>
            <textarea
              name="remarks"
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              rows="3"
              placeholder="Enter your remarks about the call..."
            />
          </div>

          {/* Follow Up Date */}
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

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setShowCallCon && setShowCallCon(false)}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCall}
            disabled={isLoading || !remarks || !followUpDateTime}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Calling...
              </>
            ) : (
              <>
                <span>📞</span>
                Start Call
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallCon;
