'use client';

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useToast } from "@/app/component/customtoast/page";

const EditDataForm = ({ setIsEditDataFormOpen, fetchData, userID, editingData }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    dataID: editingData.dataID || "",
    name: editingData.name || "",
    phone: editingData.mobile || "",
    whatsapp: editingData.whatsapp || "",
    email: editingData.email || "",
    share: editingData.share || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.phone && !formData.whatsapp) {
      return addToast("Either email, mobile, or WhatsApp is required", "info");
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/edit-data",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataID: formData.dataID,
            name: formData.name,
            mobile: formData.phone,
            whatsapp: formData.whatsapp,
            email: formData.email,
            share: formData.share,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        addToast(result.message || "Successfully updated record", "success");
        setIsEditDataFormOpen(false);
        // Check if fetchData is a function before calling
        if (typeof fetchData === "function") {
          await fetchData(userID);
        } else {
          console.warn("fetchData is not a function. Skipping data refresh.");
        }
      } else {
        addToast(result.message || "Failed to update record", "error");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      addToast("Failed to update record. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "share" ? checked : value,
    }));
  };

  const handlePhoneChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-md shadow-2xl max-w-7xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
          Edit Record
        </h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={(value) => handlePhoneChange(value, "phone")}
                inputStyle={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1.55rem",
                  paddingBottom: "1.55rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  color: "#374151",
                  backgroundColor: "white",
                }}
                buttonStyle={{
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem 0 0 0.5rem",
                  backgroundColor: "white",
                }}
                dropdownStyle={{
                  borderRadius: "0.5rem",
                  zIndex: 9999,
                }}
                containerClass="phone-input-container"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <PhoneInput
                country={"in"}
                value={formData.whatsapp}
                onChange={(value) => handlePhoneChange(value, "whatsapp")}
                inputStyle={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1.55rem",
                  paddingBottom: "1.55rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  color: "#374151",
                  backgroundColor: "white",
                }}
                buttonStyle={{
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem 0 0 0.5rem",
                  backgroundColor: "white",
                }}
                dropdownStyle={{
                  borderRadius: "0.5rem",
                  zIndex: 9999,
                }}
                containerClass="phone-input-container"
                placeholder="WhatsApp number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Enter email"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <div className="flex flex-col w-1/3 justify-center items-center">
              <label
                htmlFor="share"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Share
              </label>
              <input
                className="w-4 h-4"
                type="checkbox"
                name="share"
                id="share"
                checked={formData.share}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditDataFormOpen(false)}
              className="px-6 w-1/3 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 w-1/3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDataForm;