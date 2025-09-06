'use client';

import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  FaBookOpen,
  FaBookReader,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDown,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const SkillMCQ = () => {
  const { addToast } = useToast();
  const initialFormData = {
    skill: null,
    medium: null,
    question: "",
    options: ["", "", "", ""],
    explanation: "",
    weightage: "E",
    correctAnswer: "A",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [skill, setSkill] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [explanation, setExplanation] = useState("");
  const [weightage, setWeightage] = useState("E");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [mcqs, setMcqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageOptions, setLanguageOptions] = useState([]);
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingID, setIsEditingID] = useState("");
  const [localUserData, setLocalUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const userData = JSON.parse(localStorage.getItem("userData") || 'null');
    if (userData) {
      setLocalUserData(userData);
      setAccessToken(userData.access_token);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchSkills();
      fetchLanguages();
    }
  }, [accessToken]);

  const fetchSkills = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/skills/get-skills",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        const skills = data.Skills || [];
        const formattedSkills = skills.map((skill) => ({
          ...skill,
          label: skill.skillName,
          value: skill.vskillsID,
        }));

        setSkillsOptions(formattedSkills);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      addToast("Unable to fetch skills, try again later", "error");
    }
  };

  const fetchMcqs = async (vskillsID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/skills/mcq/get-mcqs",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vskillsID: vskillsID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMcqs(data.MCQ || []);
      } else {
        setMcqs([]);
      }
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      setMcqs([]);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch("https://www.margda.in/api/languages", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const languages = data.data || [];
        const formattedLanguages = languages.map((lang) => ({
          ...lang,
          label: lang.language,
          value: lang.langID,
        }));
        setLanguageOptions(formattedLanguages);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.skill?.value ||
      !formData.medium?.value ||
      !formData.question ||
      !formData.options[0] ||
      !formData.options[1] ||
      !formData.weightage ||
      !formData.correctAnswer
    ) {
      addToast("Please fill all required fields.", "error");
      return;
    }

    try {
      setIsLoading(true);
      let url;
      let method;
      let payload;
      if (isEditingID) {
        url = "https://www.margda.in/api/skills/mcq/edit-mcq";
        payload = {
          vskillsID: parseInt(formData.skill.value, 10),
          medium: parseInt(formData.medium.value, 10),
          weightage: formData.weightage,
          question: formData.question,
          option1: formData.options[0],
          option2: formData.options[1],
          option3: formData.options[2] || null,
          option4: formData.options[3] || null,
          explained: formData.explanation || null,
          correct: formData.correctAnswer,
          mcqID: isEditingID,
        };
        method = "PUT";
      } else {
        url = "https://www.margda.in/api/skills/mcq/add-mcq";
        payload = {
          vskillsID: parseInt(formData.skill.value, 10),
          medium: parseInt(formData.medium.value, 10),
          weightage: formData.weightage,
          question: formData.question,
          option1: formData.options[0],
          option2: formData.options[1],
          option3: formData.options[2] || null,
          option4: formData.options[3] || null,
          explained: formData.explanation || null,
          correct: formData.correctAnswer,
        };
        method = "POST";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.json();
        if (errorText.message) {
          addToast(errorText.message, "error");
        }
        return;
      }

      const data = await response.json();
      addToast(data.message, "success");
      if (isEditingID) {
        setIsEditingID(null);
      }

      const selectedSkill = formData.skill;
      setFormData({
        ...initialFormData,
        skill: selectedSkill,
        medium: formData.medium,
      });
      setCurrentPage(1);
      fetchMcqs(formData.skill.value);
    } catch (error) {
      console.error("Submit Error:", error);
      addToast("Failed to add MCQ: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / recordsPerPage))
      setCurrentPage(currentPage + 1);
  };

  const getPaginationRange = () => {
    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const filteredData = mcqs.filter(
    (mcq) =>
      mcq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mcq.option1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mcq.option2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mcq.option3 &&
        mcq.option3.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mcq.option4 &&
        mcq.option4.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMcqs = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Effect to handle dropdown overlapping with editor
  useEffect(() => {
    const handleDropdownPosition = () => {
      const selectElement = document.querySelector(".select__menu");
      if (selectElement) {
        const editorElement = document.querySelector(".tox.tox-tinymce");
        if (
          editorElement &&
          selectElement.getBoundingClientRect().bottom >
            editorElement.getBoundingClientRect().top
        ) {
          selectElement.style.zIndex = "1000"; // Ensure the dropdown appears above the editor
        }
      }
    };

    // Listen for when the dropdown menu is opened
    document.addEventListener("mousedown", handleDropdownPosition);

    return () => {
      document.removeEventListener("mousedown", handleDropdownPosition);
    };
  }, []);

  const handleInputChange = (e, fieldName, index = null) => {
    if (fieldName === "question" || fieldName === "explanation") {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.value }));
    } else if (fieldName === "options") {
      const newOptions = [...formData.options];
      newOptions[index] = e.target.value;
      setFormData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleSkillChange = async (option) => {
    setFormData((prev) => ({ ...prev, skill: option }));
    if (option?.value) {
      await fetchMcqs(option.value);
    }
  };

  // Edit handler
  const handleEdit = (mcq) => {
    const findLanguage = languageOptions.find(
      (option) => option.value === mcq.medium
    );
    setIsEditingID(mcq.mcqID);
    setFormData({
      skill: formData.skill,
      medium: findLanguage,
      question: mcq.question,
      options: [mcq.option1, mcq.option2, mcq.option3 || "", mcq.option4 || ""],
      explanation: mcq.explained || "",
      weightage: mcq.weightage, // Adjust if weightage is available in your MCQ data
      correctAnswer: mcq.correct,
    });
    addToast(
      "Edit mode activated. Update the form and submit to save changes.",
      "info"
    );
  };

  // Delete handler
  const handleDelete = async (mcq) => {
    if (!window.confirm("Are you sure you want to delete this MCQ?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://www.margda.in/api/skills/mcq/delete-mcq", // Adjust endpoint as needed
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mcqID: mcq.mcqID,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        addToast(data.message, "error");
        throw new Error(`Delete MCQ HTTP error! status: ${response.status}`);
      }
      await fetchMcqs(formData.skill?.value);
      const data = await response.json();
      addToast(data.message, "success");
    } catch (error) {
      console.error("Delete Error:", error);
      addToast("Failed to delete MCQ: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if user data is not loaded yet
  if (!localUserData) {
    return (
      <div className="container mx-auto p-4 relative bg-gray-10 min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 relative bg-gray-10 min-h-screen">
      <h2 className="text-4xl mb-4 text-primary font-bold flex justify-center items-center">
        <FaBookOpen className="inline-block mr-2 text-blue-500" /> Skill MCQ
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaBookReader className="text-blue-500" />
              Select Skill
            </label>
            <Select
              value={formData.skill}
              onChange={handleSkillChange}
              options={skillsOptions}
              placeholder="Select a Skill"
              className="w-full mt-1"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            />
          </div>
          <div>
            <label className="flex items-center text-base font-medium text-gray-700">
              <FaAngleDown className="mr-2 text-blue-500" />
              Select Language
            </label>
            <Select
              value={formData.medium}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, medium: selected }))
              }
              options={languageOptions}
              className="w-full"
              placeholder="Select Language"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700">
            Question
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => handleInputChange(e, "question")}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-vertical"
            rows={4}
            placeholder="Enter your question here"
          />
        </div>

        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <label className="block text-base font-medium text-gray-700">
              Option {index + 1} {index < 2 && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.options[index]}
              onChange={(e) => handleInputChange(e, "options", index)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-vertical"
              rows={2}
              placeholder={`Enter option ${index + 1} here${index < 2 ? ' (required)' : ' (optional)'}`}
            />
          </div>
        ))}

        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700">
            Explanation
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => handleInputChange(e, "explanation")}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-vertical"
            rows={4}
            placeholder="Enter explanation here (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="block text-base font-medium text-gray-700">
              Weightage
            </span>
            <div className="flex space-x-4">
              {[
                { value: "E", label: "Easy" },
                { value: "N", label: "Normal" },
                { value: "D", label: "Difficult" },
                { value: "T", label: "Very Tough" },
              ].map((option) => (
                <label key={option.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="weightage"
                    value={option.value}
                    checked={formData.weightage === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        weightage: e.target.value,
                      }))
                    }
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-base font-medium text-gray-700">
              Correct Answer
            </span>
            <div className="flex space-x-4">
              {["A", "B", "C", "D"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="correct"
                    value={option}
                    checked={formData.correctAnswer === option}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        correctAnswer: e.target.value,
                      }))
                    }
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (isEditingID ? "Updating..." : "Submitting...") : (isEditingID ? "Update" : "Submit")}
          </button>
          {isEditingID && (
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormData);
                setIsEditingID(null);
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center p-4 justify-between mb-4 mt-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center">
          <span className="mr-2">Show</span>
          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border p-2 rounded focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2">Records</span>
        </div>
        <div className="flex items-center">
          <FaSearch className="mr-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table to display MCQs */}
      <div className="mt-2 bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Question
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Option 1
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Option 2
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Option 3
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Option 4
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Explain
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Correct
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMcqs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No MCQs found for this Skill or search term.
                  </td>
                </tr>
              ) : (
                filteredMcqs.map((mcq, index) => (
                  <tr
                    key={mcq.mcqID || index}
                    className="hover:bg-gray-50 transition duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={() => handleEdit(mcq)}
                        className="text-blue-500 hover:text-blue-700 transition duration-300"
                        title="Edit"
                        aria-label="Edit MCQ"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(mcq)}
                        className="text-red-500 hover:text-red-700 transition duration-300"
                        title="Delete"
                        aria-label="Delete MCQ"
                      >
                        <FaTrash />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 break-words max-w-xs">
                        {mcq.question}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 break-words max-w-xs">
                        {mcq.option1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 break-words max-w-xs">
                        {mcq.option2}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 break-words max-w-xs">
                        {mcq.option3 || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 break-words max-w-xs">
                        {mcq.option4 || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 break-words max-w-xs">
                        {mcq.explained || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {mcq.correct}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-md border border-gray-300">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstRecord + 1} to{" "}
          {Math.min(indexOfLastRecord, filteredData.length)} of{" "}
          {filteredData.length} Records
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded transition duration-300 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300"
            }`}
            aria-label="Previous page"
          >
            <FaChevronLeft className="inline-block" /> Previous
          </button>

          {getPaginationRange().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } rounded transition duration-300`}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={
              currentPage === Math.ceil(filteredData.length / recordsPerPage)
            }
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded transition duration-300 ${
              currentPage === Math.ceil(filteredData.length / recordsPerPage)
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300"
            }`}
            aria-label="Next page"
          >
            Next <FaChevronRight className="inline-block" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillMCQ;
