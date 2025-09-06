'use client';

import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useToast } from "@/app/component/customtoast/page";
import Select from "react-select";
import "react-phone-input-2/lib/style.css";

const AddDataForm = ({ setIsAddDataFormOpen, fetchData, userID }) => {
  const { addToast } = useToast();
  const [selectedDataTypes, setSelectedDatatypes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    share: true,
    name: "",
    task: "",
    cv: null, // Add CV to formData
  });
  
  const dataTypes = [
    { value: "P", label: "Individual" },
    { value: "B", label: "Business" },
    { value: "L", label: "Learner" },
  ];
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userID) {
      fetchTasks(userID);
    }
  }, [userID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.phone && !formData.whatsapp) {
      return addToast("Either email or mobile or whatsapp is required", "info");
    }
    if (selectedDataTypes.length === 0) {
      return addToast("Select data type", "info");
    }
    if (!formData.task) {
      return addToast("Task Required", "info");
    }

    setIsLoading(true);

    // Use FormData to handle file uploads
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("mobile", formData.phone);
    formDataToSend.append("whatsapp", formData.whatsapp);
    formDataToSend.append("share", formData.share.toString());
    formDataToSend.append("taskID", formData.task);
    formDataToSend.append("userID", userID);
    formDataToSend.append(
      "datatype",
      selectedDataTypes.map((item) => item.value).join(',')
    );
    if (formData.cv) {
      formDataToSend.append("cv", formData.cv); // Append CV file
    }

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/add-data",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const result = await response.json();
      if (response.ok) {
        addToast(result.message, "success");
        setIsAddDataFormOpen(false);
        await fetchData(userID);
      } else {
        addToast(result.message, "error");
      }
    } catch (error) {
      console.error("Error adding new record:", error);
      addToast("Failed to add the record. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/get-tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID: userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data.Tasks || []); // Ensure tasks is an array even if empty
      } else {
        setTasks([]);
        addToast(data.message || "Failed to fetch tasks", "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addToast("Failed to fetch tasks", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, files } = e.target;
    if (name === "share") {
      setFormData((prev) => ({
        ...prev,
        share: checked,
      }));
    } else if (name === "cv") {
      setFormData((prev) => ({
        ...prev,
        cv: files?.[0] || null, // Store the selected file
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
      <div className="bg-white p-8 rounded-md shadow-2xl max-w-7xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
          Add New Record
        </h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tasks
              </label>
              <select
                name="task"
                value={formData.task}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">Select Task</option>
                {tasks.map((task) => (
                  <option key={task.taskID} value={task.taskID}>
                    {task.task}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Type
              </label>
              <Select
                isMulti
                options={dataTypes}
                value={selectedDataTypes}
                onChange={(option) => setSelectedDatatypes(option || [])}
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
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload CV
              </label>
              <input
                type="file"
                name="cv"
                accept=".pdf,.doc,.docx"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
              onClick={() => setIsAddDataFormOpen(false)}
              className="px-6 w-1/3 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 w-1/3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AddDataForm;
