"use client";

import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaFileAlt,
  FaGraduationCap,
  FaBriefcase,
  FaFile,
  FaCheckCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const VerifyDocument = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Toast functionality - you'll need to implement this or use a Next.js compatible toast library
  const addToast = (message, type) => {
    // Replace with your preferred toast implementation for Next.js
    // e.g., react-hot-toast, react-toastify, or a custom solution
    console.log(`${type}: ${message}`);
  };

  const [userLocalData, setUserLocalData] = useState({});
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Access localStorage only on client side
    if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      setUserLocalData(userData);
      setAccessToken(userData.access_token || null);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/admin/documents/get-all-list",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const responseData = await response.json();
      if (response.ok) {
        console.log(responseData);
        setData(responseData.List);
      } else if (response.status === 401) {
        return router.push("/login");
      } else {
        setData([]);
        addToast(responseData.message, "error");
      }
    } catch (error) {
      console.log(error);
      addToast("Unknown Error, try again later", "error");
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearchQuery = Object.values(item).some(
      (value) =>
        value &&
        value
          .toString()
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
    );

    return matchesSearchQuery;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle entries per page change
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handleUpdate = async (type, userID, verify) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/admin/documents/verify-document",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, userID, verify }),
        }
      );
      const responseData = await response.json();
      if (response.ok) {
        await fetchData();
        addToast(responseData.message, "success");
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        addToast(responseData.message, "error");
      }
    } catch (error) {
      console.log(error);
      addToast("Unknown Error, try again later", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-2 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header with Icon */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 flex items-center text-gray-800">
            <FaCheckCircle className="w-8 h-8 mr-3 text-indigo-600" />
            <span className="text-black-600">Verify Documents</span>
          </h2>

          {/* Entries and Search */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <div className="flex items-center">
              <label className="mr-3 text-gray-600 font-medium">Show</label>
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-150"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="ml-3 text-gray-600 font-medium">entries</span>
            </div>
            <div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search..."
                className="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-150 w-full sm:w-auto"
              />
            </div>
          </div>

          {/* Document Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full" style={{ minWidth: "1200px" }}>
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="bg-indigo-50 text-indigo-800">
                    <th className="p-4 text-left font-semibold w-64">
                      <div className="flex items-center">
                        <FaUser className="w-5 h-5 mr-2" />
                        User
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-48">
                      <div className="flex flex-col items-center">
                        <FaIdCard className="w-5 h-5 mb-1" />
                        Aadhar Card
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-48">
                      <div className="flex flex-col items-center">
                        <FaIdCard className="w-5 h-5 mb-1" />
                        Driving Licence
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-48">
                      <div className="flex flex-col items-center">
                        <FaIdCard className="w-5 h-5 mb-1" />
                        Voter Card
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-48">
                      <div className="flex flex-col items-center">
                        <FaFileAlt className="w-5 h-5 mb-1" />
                        PAN Card
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-64">
                      <div className="flex flex-col items-center">
                        <FaGraduationCap className="w-5 h-5 mb-1" />
                        Highest Academic Certificate
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-64">
                      <div className="flex flex-col items-center">
                        <FaBriefcase className="w-5 h-5 mb-1" />
                        Professional Certificate
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold w-64">
                      <div className="flex flex-col items-center">
                        <FaFile className="w-5 h-5 mb-1" />
                        Last Experience Certificate
                      </div>
                    </th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {currentRecords.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-100 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 border">
                        <div className="flex flex-col items-start space-y-2">
                          <div className="flex items-center">
                            {item.pic_url ? (
                              <div className="">
                                <img
                                  src={item.pic_url}
                                  className="w-10 h-10 rounded-full border border-gray-500"
                                  alt={item.name}
                                />
                              </div>
                            ) : (
                              <div className="text-xl px-3 py-2 text-white border rounded-full bg-amber-500">
                                {item.name &&
                                  item.name
                                    .split(" ")
                                    .map((item) => item.slice(0, 1))}
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                {item.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {item.adhaar_card ? (
                          <div className="flex flex-col gap-3 items-center">
                            <a
                              href={item.adhaar_card}
                              className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              view
                            </a>
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  type="checkbox"
                                  checked={item.adhaar_verified}
                                  onChange={(e) =>
                                    handleUpdate(
                                      "adhaar_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {item.driving_licence ? (
                          <div className="flex flex-col gap-3 items-center">
                            <a
                              href={item.driving_licence}
                              className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              view
                            </a>
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  type="checkbox"
                                  onChange={(e) =>
                                    handleUpdate(
                                      "driving_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                  checked={item.driving_verified}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {item.voter_card ? (
                          <div className="flex flex-col gap-3 items-center">
                            <a
                              href={item.voter_card}
                              className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              view
                            </a>
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  onChange={(e) =>
                                    handleUpdate(
                                      "voter_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                  type="checkbox"
                                  checked={item.voter_verified}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {item.pan_card ? (
                          <div className="flex flex-col gap-3 items-center">
                            <a
                              href={item.pan_card}
                              className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              view
                            </a>
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  onChange={(e) =>
                                    handleUpdate(
                                      "pan_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                  type="checkbox"
                                  checked={item.pan_verified}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {Array.isArray(item.academic_cert) &&
                        item.academic_cert.length > 0 ? (
                          <div className="flex flex-col gap-3 items-center">
                            {item.academic_cert.map((cert, i) => (
                              <div key={i}>
                                <a
                                  href={cert}
                                  className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  view
                                </a>
                              </div>
                            ))}
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  type="checkbox"
                                  checked={item.academic_verified}
                                  onChange={(e) =>
                                    handleUpdate(
                                      "academic_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {Array.isArray(item.professional_cert) &&
                        item.professional_cert.length > 0 ? (
                          <div className="flex flex-col gap-3 items-center">
                            {item.professional_cert.map((cert, i) => (
                              <div key={i}>
                                <a
                                  href={cert}
                                  className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  view
                                </a>
                              </div>
                            ))}
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  type="checkbox"
                                  checked={item.professional_verified}
                                  onChange={(e) =>
                                    handleUpdate(
                                      "professional_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td className="px-4 py-4 border text-center">
                        {Array.isArray(item.experience_cert) &&
                        item.experience_cert.length > 0 ? (
                          <div className="flex flex-col gap-3 items-center">
                            {item.experience_cert.map((cert, i) => (
                              <div key={i}>
                                <a
                                  href={cert}
                                  className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  view
                                </a>
                              </div>
                            ))}
                            <div>
                              <label className="flex gap-2 items-center justify-center">
                                Verified
                                <input
                                  onChange={(e) =>
                                    handleUpdate(
                                      "experience_verified",
                                      item.userID,
                                      e.target.checked
                                    )
                                  }
                                  type="checkbox"
                                  checked={item.experience_verified}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          "❌"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <p className="text-gray-600 font-medium">
              Showing {indexOfFirstRecord + 1} to{" "}
              {Math.min(indexOfLastRecord, filteredData.length)} of{" "}
              {filteredData.length} Records
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-5 py-2 rounded-lg font-medium text-white transition-all duration-150 ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
                }`}
              >
                Previous
              </button>
              <span className="px-5 py-2 bg-indigo-100 rounded-lg text-indigo-700 font-medium">
                {currentPage}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-5 py-2 rounded-lg font-medium text-white transition-all duration-150 ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocument;
