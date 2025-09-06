import { useState, useEffect } from "react";
import { FaTimes, FaTag } from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const LeadTypeForm = ({ selectedLead, setShowLeadTypeForm, setUserData, userData, userID }) => {
  const [leadTypes, setLeadTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchLeadTypes();
    if (selectedLead) {
      setSelectedType(selectedLead.typeID || "");
    }
  }, [selectedLead]);

  const fetchLeadTypes = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/leadtype/get-lead-types",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLeadTypes(data.LeadTypes || []);
      } else {
        addToast(data.message || "Failed to fetch lead types", "error");
      }
    } catch (error) {
      console.error("Error fetching lead types:", error);
      addToast("Failed to fetch lead types", "error");
    }
  };

  const handleSave = async () => {
    // Validation
    if (!selectedType) {
      addToast("Please select a lead type", "error");
      return;
    }
    
    if (!selectedLead) {
      addToast("No lead selected", "error");
      return;
    }

    // Check for dataID or leadID (depending on your data structure)
    const dataID = selectedLead.dataID;
    if (!dataID) {
      addToast("Invalid lead data - missing ID", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/leadtype/update-lead-type",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: userID,
            typeID: parseInt(selectedType),
            dataID: parseInt(dataID),
          }),
        }
      );
      
      const data = await response.json();
      console.log(data)

      if (response.ok) {
        setUserData((prevData) =>
          prevData.map((item) => {
            const itemId = item.dataID;
            return itemId === dataID
              ? { ...item, typeID: parseInt(selectedType) }
              : item;
          })
        );

        // Get the selected type name for success message
        const selectedTypeName = leadTypes.find(
          (type) => type.typeID == selectedType
        )?.type || "Unknown";

        addToast(
          `Lead type updated to "${selectedTypeName}" for ${selectedLead.name}`,
          "success"
        );
        setShowLeadTypeForm(false);
      } else {
        addToast(data.message || "Failed to update lead type", "error");
      }
    } catch (error) {
      console.error("Error updating lead type:", error);
      addToast("Network error: Failed to update lead type", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setShowLeadTypeForm(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [loading]);

  const getTypeColor = (typeID) => {
    switch (parseInt(typeID)) {
      case 1: return "bg-red-300 border-red-400";
      case 2: return "bg-orange-300 border-orange-400";
      case 3: return "bg-blue-300 border-blue-400";
      case 4: return "bg-green-300 border-green-400";
      case 5: return "bg-purple-300 border-purple-400";
      case 6: return "bg-yellow-300 border-yellow-400";
      case 7: return "bg-pink-300 border-pink-400";
      case 8: return "bg-slate-500 border-slate-600 text-white";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  const getTypeIcon = (typeID) => {
    switch (parseInt(typeID)) {
      case 1: return "🔴";
      case 2: return "🟠";
      case 3: return "🔵";
      case 4: return "🟢";
      case 5: return "🟣";
      case 6: return "🟡";
      case 7: return "🟪";
      case 8: return "⚫️";
      default: return "⚪️";
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <FaTag className="text-blue-600 w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-800">
              Change Lead Type
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 p-1"
            title="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Info */}
        {selectedLead && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Lead:</span> {selectedLead.name}
            </p>
            {selectedLead.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {selectedLead.email}
              </p>
            )}
            {selectedLead.mobile && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Mobile:</span> {selectedLead.mobile}
              </p>
            )}
          </div>
        )}

        {/* Current Lead Type */}
        {selectedLead?.typeID && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Current Lead Type:</span>
            </p>
            <div className={`p-2 rounded-md border ${getTypeColor(selectedLead.typeID)}`}>
              <span className="text-sm font-medium">
                {leadTypes.find((t) => t.typeID == selectedLead.typeID)?.type || "Unknown"} {getTypeIcon(selectedLead.typeID)}
              </span>
            </div>
          </div>
        )}

        {/* Lead Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Lead Type <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            disabled={loading}
          >
            <option value="">-- Select Lead Type --</option>
            {leadTypes.map((type) => (
              <option key={type.typeID} value={type.typeID}>
                {type.type} {getTypeIcon(type.typeID)}
              </option>
            ))}
          </select>
          {leadTypes.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">Loading lead types...</p>
          )}
        </div>

        {/* Preview Selected Type */}
        {selectedType && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Preview New Lead Type:</span>
            </p>
            <div className={`p-3 rounded-md border ${getTypeColor(selectedType)}`}>
              <p className="text-sm font-medium">
                {leadTypes.find((t) => t.typeID == selectedType)?.type || "Unknown"} {getTypeIcon(selectedType)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedType}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaTag className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTypeForm;
