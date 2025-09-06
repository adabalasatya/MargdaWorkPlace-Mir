'use client';

import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  FaBook,
  FaGraduationCap,
  FaTasks,
  FaDatabase,
  FaAngleLeft,
  FaAngleRight,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const AddSkill = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    skill: "",
    marks_total: "",
    marks_pass: "",
    marks_correct: "",
    marks_wrong: "",
    test_question: "",
    test_minutes: "",
    attempts: "",
    details: "",
    vskillsID: null,
  });
  const [skills, setSkills] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });
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
    const fetchData = async () => {
      if (!accessToken) {
        addToast("No access token found. Please log in.", "error");
        return;
      }

      try {
        // Fetch skills for dropdown
        const skillsResponse = await fetch(
          "https://www.margda.in/api/master/workskills/get-workskills",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!skillsResponse.ok) {
          throw new Error(
            `Skills HTTP error! status: ${skillsResponse.status}`
          );
        }
        const skillsData = await skillsResponse.json();
        if (!skillsData.WorkSkills || !Array.isArray(skillsData.WorkSkills)) {
          addToast("No valid skills data found.", "warning");
          setSkills([]);
          return;
        }
        const skillOptions = skillsData.WorkSkills.map((skill) => ({
          value: skill.skillsID,
          label: skill.skills,
        }));
        setSkills(skillOptions);

        // Fetch skills for table
        await fetchSkillsForTable();
      } catch (error) {
        console.error("Data Fetching Error:", error);
        addToast("Failed to fetch data: " + error.message, "error");
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken, addToast]);

  const fetchSkillsForTable = async () => {
    try {
      const tableResponse = await fetch(
        "https://www.margda.in/api/skills/get-skills",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!tableResponse.ok) {
        throw new Error(
          `Skills Table HTTP error! status: ${tableResponse.status}`
        );
      }
      const tableData = await tableResponse.json();
      if (!tableData.Skills || !Array.isArray(tableData.Skills)) {
        addToast("No valid skills data found for table.", "warning");
        setSkillList([]);
        return;
      }
      setSkillList(
        tableData.Skills.map((skill) => ({
          id: skill.skillsID,
          skill: skill.skillName || "N/A",
          marks_total: skill.marks_total,
          marks_pass: skill.marks_pass,
          marks_correct: parseFloat(skill.marks_correct),
          marks_wrong: parseFloat(skill.marks_wrong),
          test_question: skill.test_question,
          test_minutes: skill.test_minutes,
          attempts: skill.attempts,
          details: skill.details,
          createdAt: skill.edate ? new Date(skill.edate).getTime() : Date.now(),
          vskillsID: skill.vskillsID,
        }))
      );
    } catch (error) {
      console.error("Skills Table Fetch Error:", error);
      addToast("Failed to fetch table data: " + error.message, "error");
      setSkillList([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      [
        "marks_total",
        "marks_pass",
        "test_question",
        "test_minutes",
        "attempts",
      ].includes(name)
    ) {
      if (value === "" || value.match(/^\d*$/)) {
        setFormData({ ...formData, [name]: value });
      } else {
        addToast(
          `${name.replace("_", " ")} must be a valid positive integer.`,
          "error"
        );
      }
    } else if (["marks_correct", "marks_wrong"].includes(name)) {
      if (
        value === "" ||
        (value.match(/^\d*\.?\d*$/) &&
          (value === "." || parseFloat(value) < 100))
      ) {
        setFormData({ ...formData, [name]: value });
      } else if (parseFloat(value) >= 100) {
        addToast(`${name.replace("_", " ")} must be less than 100`, "error");
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.skill ||
        !formData.marks_total ||
        !formData.marks_pass ||
        !formData.marks_correct ||
        !formData.marks_wrong ||
        !formData.test_question ||
        !formData.test_minutes ||
        !formData.attempts ||
        !formData.details
      ) {
        addToast("Please fill out all required fields.", "error");
        return;
      }

      const detailsTrimmed = formData.details.trim();
      if (detailsTrimmed === "" || detailsTrimmed.match(/^\.+$/)) {
        addToast("Please enter meaningful text in the details field.", "error");
        return;
      }

      const payload = {
        skillsID: parseInt(formData.skill, 10),
        marks_total: parseInt(formData.marks_total, 10),
        marks_pass: parseInt(formData.marks_pass, 10),
        marks_correct: parseFloat(formData.marks_correct),
        marks_wrong: parseFloat(formData.marks_wrong),
        test_question: parseInt(formData.test_question, 10),
        test_minutes: parseInt(formData.test_minutes, 10),
        attempts: parseInt(formData.attempts, 10),
        details: detailsTrimmed,
        vskillsID: formData.vskillsID
          ? parseInt(formData.vskillsID, 10)
          : undefined,
      };

      // Validate numeric fields
      if (
        isNaN(payload.skillsID) ||
        isNaN(payload.marks_total) ||
        isNaN(payload.marks_pass) ||
        isNaN(payload.marks_correct) ||
        isNaN(payload.marks_wrong) ||
        isNaN(payload.test_question) ||
        isNaN(payload.test_minutes) ||
        isNaN(payload.attempts)
      ) {
        addToast("All numeric fields must contain valid numbers.", "error");
        return;
      }

      // Validate skillsID
      if (!skills.some((skill) => skill.value === payload.skillsID)) {
        addToast("Selected skill is invalid or does not exist.", "error");
        return;
      }

      // Server-aligned validations
      if (payload.marks_total <= 0 || payload.marks_total > 1000) {
        addToast("Marks Total must be between 1 and 1000.", "error");
        return;
      }
      if (payload.marks_pass <= 0 || payload.marks_pass > payload.marks_total) {
        addToast(
          "Marks Pass must be greater than 0 and less than or equal to Marks Total.",
          "error"
        );
        return;
      }
      if (
        payload.marks_correct <= 0 ||
        payload.marks_correct > payload.marks_total
      ) {
        addToast(
          "Marks Correct must be greater than 0 and less than or equal to Marks Total.",
          "error"
        );
        return;
      }
      if (payload.marks_wrong > 100 || payload.marks_wrong < -100) {
        addToast("Marks Wrong must be between -100 and 100.", "error");
        return;
      }
      if (payload.test_question <= 0 || payload.test_question > 1000) {
        addToast("Test Questions must be between 1 and 1000.", "error");
        return;
      }
      if (payload.test_minutes <= 0 || payload.test_minutes > 1440) {
        addToast(
          "Test Minutes must be between 1 and 1440 (24 hours).",
          "error"
        );
        return;
      }
      if (payload.details.length > 1000) {
        addToast("Details cannot exceed 1000 characters.", "error");
        return;
      }

      if (formData.vskillsID) {
        // Edit existing skill
        const response = await fetch(
          `https://www.margda.in/api/skills/edit-skill`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const responseData = await response.json();
        if (!response.ok) {
          console.error("Update API Response:", {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          });
          throw new Error(
            responseData.message ||
              `Failed to update the skill (Status: ${response.status})`
          );
        }
        addToast("Skill updated successfully!", "success");
      } else {
        const response = await fetch(
          "https://www.margda.in/api/skills/add-skill",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const responseData = await response.json();
        if (!response.ok) {
          console.error("Add API Response:", {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          });
          if (response.status === 409) {
            return addToast(responseData.message, "error");
          }
          throw new Error(
            responseData.message ||
              `Failed to add the skill (Status: ${response.status})`
          );
        }

        addToast("Skill added successfully!", "success");
      }

      // Refresh table data
      await fetchSkillsForTable();

      // Reset form
      setFormData({
        skill: "",
        marks_total: "",
        marks_pass: "",
        marks_correct: "",
        marks_wrong: "",
        test_question: "",
        test_minutes: "",
        attempts: "",
        details: "",
        vskillsID: null,
      });
      setCurrentPage(1);
    } catch (error) {
      console.error("Error submitting skill:", error);
      addToast(
        `Failed to ${formData.vskillsID ? "update" : "add"} skill: ${
          error.message
        }`,
        "error"
      );
    }
  };

  const handleEdit = (skill) => {
    setFormData({
      skill: skill.id,
      marks_total: skill.marks_total.toString(),
      marks_pass: skill.marks_pass.toString(),
      marks_correct: skill.marks_correct.toString(),
      marks_wrong: skill.marks_wrong.toString(),
      test_question: skill.test_question.toString(),
      test_minutes: skill.test_minutes.toString(),
      attempts: skill.attempts.toString(),
      details: skill.details,
      vskillsID: skill.vskillsID,
    });
    addToast(
      `Editing skill: "${skill.skill}". Update and submit to save changes.`,
      "info"
    );
  };

  const handleDelete = async (vskillsID) => {
    // Validate vskillsID
    if (!vskillsID || isNaN(parseInt(vskillsID, 10))) {
      console.error(`[handleDelete] Invalid vskillsID: ${vskillsID}`);
      addToast("Invalid skill ID. Cannot delete.", "error");
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://www.margda.in/api/skills/delete-skill`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vskillsID: vskillsID }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error(
          `[handleDelete] Failed to delete skill for vskillsID: ${vskillsID}`,
          {
            status: response.status,
            statusText: response.statusText,
            responseData,
          }
        );
        throw new Error(
          responseData.message ||
            `Failed to delete the skill (Status: ${response.status})`
        );
      }

      addToast("Skill deleted successfully!", "success");

      await fetchSkillsForTable();
    } catch (error) {
      // Log error details
      console.error(
        `[handleDelete] Error deleting skill for vskillsID: ${vskillsID}`,
        {
          error: error.message,
          stack: error.stack,
        }
      );
      addToast(`Failed to delete skill: ${error.message}`, "error");
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    let sortableData = [...skillList];

    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      sortableData = sortableData.filter(
        (skill) =>
          skill.skill?.toLowerCase().includes(lowerSearch) ||
          skill.details?.toLowerCase().includes(lowerSearch)
      );
    }

    sortableData.sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "ascending"
          ? aValue - bValue
          : bValue - aValue;
      }
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortableData;
  };

  const getClassNamesFor = (name) => {
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData().length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Show loading if user data is not loaded yet
  if (!localUserData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-green-800 mb-6 flex justify-center items-center">
          <FaGraduationCap className="mr-2 text-green-600" />{" "}
          {formData.vskillsID ? "Edit Skill" : "Add Skill"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg border border-blue-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaBook className="text-indigo-600" /> Skill
              </label>
              <Select
                options={skills}
                onChange={(option) => handleSelectChange("skill", option)}
                value={
                  skills.find((option) => option.value === formData.skill) ||
                  null
                }
                placeholder="Select Skill"
                className="w-full mt-1"
                isClearable
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />
            </div>

            {[
              "marks_total",
              "marks_pass",
              "marks_correct",
              "marks_wrong",
              "test_question",
              "test_minutes",
              "attempts",
            ].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <FaTasks className="mr-2 text-indigo-800" />{" "}
                  {field.replace("_", " ")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  placeholder={field.replace("_", " ")}
                />
              </div>
            ))}

            <div className="col-span-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaBook className="text-indigo-600" /> Details (Text only)
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-vertical"
                placeholder="Enter skill details (letters and basic punctuation only)"
                rows={5}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              {formData.vskillsID ? "Update" : "Submit"}
            </button>
            {formData.vskillsID && (
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    skill: "",
                    marks_total: "",
                    marks_pass: "",
                    marks_correct: "",
                    marks_wrong: "",
                    test_question: "",
                    test_minutes: "",
                    attempts: "",
                    details: "",
                    vskillsID: null,
                  })
                }
                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="flex justify-between pt-6 p-4 shadow-lg rounded-lg mt-4 border border-blue-300 items-center mb-4">
          <div className="flex items-center ml-2">
            <label htmlFor="entries" className="mr-2 ml-4 text-gray-600">
              Show
            </label>
            <select
              id="entries"
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-2 text-gray-600">Entries</span>
          </div>

          <div className="relative mr-2">
            <input
              type="text"
              id="search"
              placeholder="Search skills..."
              className="w-40 border border-gray-300 rounded px-2 py-1 pl-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FaSearch className="absolute top-1/2 left-1 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg border border-blue-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: "skill", label: "Skill", width: "12%" },
                    { key: "marks_total", label: "Marks Total", width: "12%" },
                    { key: "marks_pass", label: "Marks Pass", width: "12%" },
                    {
                      key: "marks_correct",
                      label: "Marks Correct",
                      width: "12%",
                    },
                    { key: "marks_wrong", label: "Marks Wrong", width: "12%" },
                    {
                      key: "test_question",
                      label: "Test Questions",
                      width: "12%",
                    },
                    {
                      key: "test_minutes",
                      label: "Test Minutes",
                      width: "12%",
                    },
                    { key: "attempts", label: "Attempts", width: "10%" },
                    { key: "details", label: "Details", width: "20%" },
                    { key: "action", label: "Action", width: "10%" },
                  ].map(({ key, label, width }) => (
                    <th
                      key={key}
                      style={{ width }}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer bg-gray-50 sticky top-0"
                      onClick={() => key !== "action" && requestSort(key)}
                    >
                      <div className="flex items-center space-x-1">
                        <FaDatabase className="text-blue-500" />
                        <span>{label}</span>
                        {key !== "action" && (
                          <span className={`ml-1 ${getClassNamesFor(key)}`}>
                            {sortConfig.key === key &&
                              (sortConfig.direction === "ascending"
                                ? "▲"
                                : "▼")}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-blue-200">
                {currentItems.length > 0 ? (
                  currentItems.map((row, index) => (
                    <tr
                      key={row.vskillsID}
                      className={`hover:bg-gray-50 transition-colors duration-150 ease-in-out ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.skill}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.marks_total}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.marks_pass}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.marks_correct}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.marks_wrong}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.test_question}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.test_minutes}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.attempts}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        {row.details}
                      </td>
                      <td className="px-4 py-3 text-sm text-black-500 break-words">
                        <div className="flex space-x-2">
                          <FaEdit
                            className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                            onClick={() => handleEdit(row)}
                            aria-label="Edit skill"
                          />
                          <FaTrash
                            className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                            onClick={() => handleDelete(row.vskillsID)}
                            aria-label="Delete skill"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-4 py-3 text-center text-gray-500 bg-gray-50"
                    >
                      No skills available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg mt-2 border border-blue-300 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, sortedData().length)}
              </span>{" "}
              of <span className="font-medium">{sortedData().length}</span>{" "}
              entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                aria-label="Previous page"
              >
                <FaAngleLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition-colors duration-150 ${
                        currentPage === pageNumber
                          ? "z-10 bg-indigo-600 border-indigo-600 text-white"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                      aria-label={`Page ${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                aria-label="Next page"
              >
                <FaAngleRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddSkill;
