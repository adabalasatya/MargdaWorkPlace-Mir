"use client"; 

import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; 
import { useToast } from "@/app/component/customtoast/page"; 
import Select from "react-select";
import { useRouter } from "next/navigation";

const AddListDataForm = ({ setClose, fetchData, listID }) => {
  const { addToast } = useToast();
  const router = useRouter();

  const [selectedDataTypes, setSelectedDatatypes] = useState([]);
  const [formData, setFormData] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    name: "",
    task: "",
  });

  const dataTypes = [
    { value: "P", label: "Individual" },
    { value: "B", label: "Business" },
    { value: "L", label: "Learner" },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      if (!userData || !userData.pic) {
        router.push("/mange-lists");
      } else {
        setUserID(userData.userID);
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email && !formData.phone && !formData.whatsapp) {
      return addToast("Either email or mobile or whatsapp is required", "info");
    }

    if (selectedDataTypes.length === 0) {
      return addToast("Select data type", "info");
    }

    setIsLoading(true);

    const newRecord = {
      name: formData.name,
      email: formData.email,
      mobile: formData.phone,
      whatsapp: formData.whatsapp,
      listID: listID,
      userID: userID,
      datatype: selectedDataTypes.map((item) => item.value),
    };

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/add-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRecord),
        }
      );

      const result = await response.json();
      if (response.ok) {
        addToast(result.message, "success");
        setClose(false);
        await fetchData(listID);
      } else {
        addToast(result.message, "error");
      }
    } catch (error) {
      console.error("Error adding new record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "share") {
      setFormData((prev) => ({
        ...prev,
        share: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhoneChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-md shadow-2xl max-w-7xl">
        <h3 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
          Add New Record
        </h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name */}
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

            {/* Phone */}
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

            {/* WhatsApp */}
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

            {/* Email */}
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

            {/* Data Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Type
              </label>
              <Select
                isMulti
                options={dataTypes}
                value={selectedDataTypes}
                onChange={(option) => setSelectedDatatypes(option)}
                placeholder="Select Data Type"
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "48px",
                    borderColor: "#d1d5db",
                    "&:hover": {
                      borderColor: "#93c5fd",
                    },
                  }),
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => setClose(false)}
              className="px-6 w-1/3 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 w-1/3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListDataForm;
