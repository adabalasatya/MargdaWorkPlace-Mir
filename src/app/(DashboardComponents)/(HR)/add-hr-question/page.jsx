'use client';

import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaCog,
  FaSortNumericUp,
  FaQuestionCircle,
  FaChevronLeft,
  FaChevronRight,
  FaPodcast,
  FaPoll,
} from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const HRQuestionsAdd = () => {
  const { addToast } = useToast();
  const initialFormData = {
    question: "",
    rank: "",
  };
  const [positions, setPositions] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingID, setIsEditingID] = useState(null);
  const [fetchError, setFetchError] = useState(null);
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

  // Fetch questions from GET API
  const fetchQuestions = async () => {
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      setFetchError("Authentication required. Please log in.");
      return false;
    }

    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/get-questions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setQuestions([]);
          return true;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.Questions)) {
        throw new Error("Unexpected response format or no questions found");
      }

      const transformedQuestions = data.Questions.map((q) => ({
        id: q.hrquestID,
        rank: q.rank || null,
        text: q.question,
        position: q.position,
        postID: q.postID,
      }));

      setAllQuestions(transformedQuestions);

      if (selectedPost) {
        const filter = transformedQuestions.filter(
          (ques) => ques.postID === parseInt(selectedPost)
        );
        setQuestions(filter);
      } else {
        setQuestions(transformedQuestions);
      }

      return true;
    } catch (error) {
      console.error("Fetch Questions Error:", error);
      let errorMessage = "Failed to fetch questions: " + error.message;
      if (error.message.includes("401")) {
        errorMessage = "Unauthorized. Please check your access token.";
      }
      addToast(errorMessage, "error");
      setFetchError(errorMessage);
      setQuestions([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      setFetchError("Authentication required. Please log in.");
      return false;
    }

    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await fetch(
        "https://www.margda.in/api/master/position/get-positions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPositions(data.data || []);
      }
    } catch (error) {
      console.error("Fetch Positions Error:", error);
      addToast("Failed to fetch positions", "error");
    }
  };

  // Fetch questions and positions on accessToken availability
  useEffect(() => {
    if (accessToken) {
      fetchQuestions();
      fetchPositions();
    }
  }, [accessToken]);

  // Handle input changes
  const handleInputChange = (e, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  // Handle form submission (add or update question)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) {
      return addToast("Select Position", "error");
    }

    if (!formData.question.trim()) {
      addToast("Please enter a question.", "error");
      return;
    }

    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to submit questions.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const isEditing = !!isEditingID;
      const url = isEditing
        ? "https://www.margda.in/api/hr-interview/edit-question"
        : "https://www.margda.in/api/hr-interview/add-question";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? {
            hrquestID: parseInt(isEditingID, 10),
            question: formData.question,
            postID: parseInt(selectedPost) || null,
          }
        : {
            question: formData.question,
            postID: parseInt(selectedPost) || null,
          };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.json();
        addToast(
          errorText.message ||
            `Failed to ${isEditing ? "update" : "add"} question.`,
          "error"
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addToast(
        data.message ||
          `Question ${isEditing ? "updated" : "added"} successfully.`,
        "success"
      );

      setFormData(initialFormData);
      setIsEditingID(null);
      setCurrentPage(1);

      const success = await fetchQuestions();
      if (!success) {
        addToast("Failed to refresh questions after submission.", "error");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      addToast(
        `Failed to ${isEditingID ? "update" : "add"} question: ${
          error.message
        }`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (q) => {
    setIsEditingID(q.id);
    setSelectedPost(q.postID ? q.postID.toString() : "");
    setFormData({
      question: q.text,
      rank: q.rank !== null ? q.rank.toString() : "",
    });
    addToast(
      "Edit mode activated. Update the form and submit to save changes.",
      "info"
    );
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to delete questions.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const url = "https://www.margda.in/api/hr-interview/delete-question";
      const payload = {
        hrquestID: parseInt(id, 10),
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.json();
        addToast(errorText.message || "Failed to delete question.", "error");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addToast(data.message || "Question deleted successfully.", "success");

      const success = await fetchQuestions();
      if (!success) {
        addToast(
          "Failed to refresh questions after deletion. The question may have been deleted but the table is not updated.",
          "warning"
        );
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (error) {
      console.error("Delete Error:", error);
      addToast(`Failed to delete question: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Pagination logic
  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalItems = filteredQuestions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getPaginationRange = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handlePositionChange = (e) => {
    const value = e.target.value;
    setSelectedPost(value);
    if (value) {
      const filter = allQuestions.filter(
        (ques) => ques.postID === parseInt(value)
      );
      setQuestions(filter);
    } else {
      setQuestions(allQuestions);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Show loading if user data is not loaded yet
  if (!localUserData) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-6">
        <header className="flex justify-center items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center">
            <FaQuestionCircle className="mr-2" />
            HR Questions
          </h2>
        </header>

        <main className="bg-white border border-blue-300 rounded-lg shadow-md p-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div>
              <label
                htmlFor="post"
                className="block text-gray-700 font-semibold mb-2"
              >
                Post <span className="text-red-500">*</span>
              </label>

              <select
                name="post"
                id="post"
                value={selectedPost}
                onChange={handlePositionChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Post</option>
                {positions.map((post) => (
                  <option value={post.postID} key={post.postID}>
                    {post.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => handleInputChange(e, "question")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                rows={4}
                placeholder="Enter your question here"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isEditingID ? "Updating..." : "Submitting...") 
                  : (isEditingID ? "Update" : "Submit")
                }
              </button>
              {isEditingID && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormData);
                    setIsEditingID(null);
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {fetchError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {fetchError}
            </div>
          )}

          {/* Controls Section */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center">
              <label className="text-gray-700 mr-2">Show</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 30, 50].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              <span className="ml-2 text-gray-700">entries</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by HR Question..."
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left text-gray-700 font-semibold w-24">
                    <div className="flex items-center">
                      <FaCog className="mr-2" />
                      Action
                    </div>
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold w-24">
                    <div className="flex items-center">
                      <FaSortNumericUp className="mr-2" />
                      ID
                    </div>
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    <div className="flex items-center">
                      <FaQuestionCircle className="mr-2" />
                      HR Question
                    </div>
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    <div className="flex items-center">
                      <FaPoll className="mr-2" />
                      Post
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-500">
                      Loading questions...
                    </td>
                  </tr>
                ) : paginatedQuestions.length > 0 ? (
                  paginatedQuestions.map((q) => (
                    <tr key={q.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(q)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                            aria-label="Edit question"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                            aria-label="Delete question"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">{q.id}</td>
                      <td className="p-3 break-words max-w-md">{q.text}</td>
                      <td className="p-3">{q.position || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-500">
                      {fetchError
                        ? "Unable to load questions."
                        : searchTerm
                        ? "No questions found matching your search."
                        : "No questions found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          {!isLoading && totalItems > 0 && (
            <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
              <div className="text-gray-700">
                Showing {startIndex + 1} to {endIndex} of {totalItems} records
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
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } rounded transition duration-300`}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 bg-gray-200 text-gray-700 rounded transition duration-300 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-300"
                  }`}
                  aria-label="Next page"
                >
                  Next <FaChevronRight className="inline-block" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default HRQuestionsAdd;
