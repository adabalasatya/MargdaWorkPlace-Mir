"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaArrowLeft, 
  FaObjectGroup, 
  FaMinus, 
  FaArrowRight, 
  FaArrowLeft as FaArrowLeftPagination,
  FaLayerGroup,
  FaUsers,
  FaChartLine,
  FaListUl,
  FaCheckCircle
} from "react-icons/fa";
import { 
  FiEdit, 
  FiLayers, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX, 
  FiCheck,
  FiCalendar,
  FiFilter,
  FiTrash2,
  FiEye,
  FiSettings
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/app/component/customtoast/page";
import Swal from "sweetalert2";

const ManageLists = () => {
  const router = useRouter();
  const { addToast } = useToast();

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editList, setEditList] = useState(null);
  const [listName, setListName] = useState("");
  const [listID, setListID] = useState("");
  const [error, setError] = useState("");
  const [lists, setLists] = useState([]);
  const [userID, setUserID] = useState("");
  const [selectedLists, setSelectedLists] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [operationType, setOperationType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.pic) {
      return router.push("/update-profile");
    } else {
      setUserID(userData.userID);
      fetchLists(userData.userID);
    }
  }, [router]);

  useEffect(() => {
    if (lists.length > 0 && selectedLists.length === lists.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedLists, lists]);

  // Filter lists based on search
  const filteredLists = lists.filter(list => 
    list.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredLists.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredLists.length / recordsPerPage);

  const fetchLists = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/get-lists",
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
        setLists(data.Lists || []);
      } else {
        setLists([]);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  const handleSubmit = async () => {
    if (!listName.trim()) {
      setError("List name is required");
      return;
    }

    try {
      if (editList) {
        const response = await fetch(
          "https://www.margda.in/miraj/work/lists/edit-list",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: listName, listID: listID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("List updated successfully!", "success");
          await fetchLists(userID);
        } else {
          addToast(data.message || "Failed to update list", "error");
        }
      } else {
        const response = await fetch(
          "https://www.margda.in/miraj/work/lists/add-list",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: listName, userID: userID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("List added successfully!", "success");
          await fetchLists(userID);
        } else {
          addToast(data.message || "Failed to add list", "error");
        }
      }

      setListName("");
      setError("");
      setEditList(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      addToast("An error occurred. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete List?",
      text: "This action cannot be undone. Are you sure you want to delete this list?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/delete-list",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listID: id }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast("List deleted successfully!", "success");
        setLists(lists.filter((item) => item.listID !== id));
        setSelectedLists(selectedLists.filter((item) => item.listID !== id));
      } else {
        addToast(data.message || "Failed to delete list", "error");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      addToast("Failed to delete list", "error");
    }
  };

  const handleEdit = (item) => {
    setEditList(item);
    setListName(item.name);
    setListID(item.listID);
    setIsModalOpen(true);
  };

  const handleBack = () => {
    router.back();
  };

  const toggleListSelection = (list) => {
    if (selectedLists.some((selected) => selected.listID === list.listID)) {
      setSelectedLists(
        selectedLists.filter((selected) => selected.listID !== list.listID)
      );
    } else {
      setSelectedLists([...selectedLists, list]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLists([]);
    } else {
      setSelectedLists([...filteredLists]);
    }
    setSelectAll(!selectAll);
  };

  const handleMerge = () => {
    if (selectedLists.length < 2) {
      addToast("Please select at least two lists to merge", "error");
      return;
    }
    setOperationType("merge");
    setNewListName("");
    setIsMergeModalOpen(true);
  };

  const handleRemove = () => {
    if (selectedLists.length < 2) {
      addToast("Please select at least two lists to remove duplicates", "error");
      return;
    }
    setOperationType("remove");
    setNewListName("");
    setIsRemoveModalOpen(true);
  };

  const performMerge = async () => {
    try {
      if (selectedLists.length < 2) {
        addToast("Please select at least two lists to merge", "error");
        return;
      }
      if (!newListName.trim()) {
        addToast("Please provide a new list name", "error");
        return;
      }

      const listIDs = selectedLists.map((list) => list.listID);

      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/merge-lists",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID: userID,
            listIDs: listIDs,
            newListName: newListName,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast("Lists merged successfully!", "success");
        await fetchLists(userID);
        setSelectedLists([]);
        setIsMergeModalOpen(false);
      } else {
        addToast(data.message || "Failed to merge lists", "error");
      }
    } catch (error) {
      console.error("Error merging lists:", error);
      addToast("Failed to merge lists", "error");
    }
  };

  const performRemoveDuplicates = async () => {
    try {
      if (selectedLists.length !== 2) {
        addToast("Please select exactly two lists to remove duplicates", "error");
        return;
      }

      const [list1, list2] = selectedLists;

      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/remove-duplicates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list1ID: list1.listID,
            list2ID: list2.listID,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast("Duplicates removed successfully!", "success");
        await fetchLists(userID);
        setSelectedLists([]);
        setIsRemoveModalOpen(false);
      } else {
        addToast(data.message || "Failed to remove duplicates", "error");
      }
    } catch (error) {
      console.error("Error removing duplicates:", error);
      addToast("Failed to remove duplicates", "error");
    }
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate stats
  const totalLists = lists.length;
  const totalSubscribers = lists.reduce((sum, list) => sum + (parseInt(list.ars) || 0), 0);
  const totalUnsubscribed = lists.reduce((sum, list) => sum + (parseInt(list.unsubscribed) || 0), 0);
  const totalBounced = lists.reduce((sum, list) => sum + (parseInt(list.bounced) || 0), 0);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
      />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
  {/* Left Side - Back Button */}
  <div className="flex items-center">
    <button
      onClick={handleBack}
      className="flex items-center px-4 py-2 text-sm bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
    >
      <FaArrowLeft className="mr-2" size={12} />
      Back
    </button>
  </div>

  {/* Center - Title with Icon */}
  <div className="flex items-center justify-center flex-1">
    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
      <FaLayerGroup className="text-white text-md" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800">Subscriber Lists</h1>
  </div>

  {/* Right Side (Optional – empty for now) */}
  <div className="w-16"></div>
</div>


        {/* Stats Cards */}
{/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <FaListUl className="text-blue-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Lists</p>
        <p className="text-lg font-bold text-gray-800">{totalLists}</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <FaUsers className="text-green-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Total Subscribers</p>
        <p className="text-lg font-bold text-gray-800">{totalSubscribers.toLocaleString()}</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
        <FiX className="text-amber-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Unsubscribed</p>
        <p className="text-lg font-bold text-gray-800">{totalUnsubscribed.toLocaleString()}</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <FiTrash2 className="text-red-600 text-lg" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-gray-600">Bounced</p>
        <p className="text-lg font-bold text-gray-800">{totalBounced.toLocaleString()}</p>
      </div>
    </div>
  </div>
</div> */}

      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* Controls Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Left Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Show</label>
                  <select
                    value={recordsPerPage}
                    onChange={handleRecordsPerPageChange}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm font-semibold text-gray-700">records</span>
                </div>

                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search lists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all w-64"
                  />
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditList(null);
                    setListName("");
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FaPlus className="mr-2" size={16} />
                  Add New List
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMerge}
                  className={`inline-flex items-center px-4 py-2 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    selectedLists.length < 2
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white "
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                  }`}
                  disabled={selectedLists.length < 2}
                >
                  <FaObjectGroup className="mr-2" size={16} />
                  Merge ({selectedLists.length})
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemove}
                  className={`inline-flex items-center px-4 py-2 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    selectedLists.length < 2
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                  }`}
                  disabled={selectedLists.length < 2}
                >
                  <FaMinus className="mr-2" size={16} />
                  Remove Duplicates
                </motion.button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            {currentRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaListUl className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No lists found</h3>
                <p className="text-gray-500 mb-6">
                  {filteredLists.length === 0 && lists.length > 0
                    ? "Try adjusting your search query"
                    : "Create your first subscriber list to get started"}
                </p>
                {filteredLists.length === 0 && lists.length === 0 && (
                  <button
                    onClick={() => {
                      setEditList(null);
                      setListName("");
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First List
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <th className="px-6 py-4 text-left font-semibold">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">List Name</th>
                        <th className="px-6 py-4 text-center font-semibold">Active Subscribers</th>
                        <th className="px-6 py-4 text-center font-semibold">Unsubscribed</th>
                        {/* <th className="px-6 py-4 text-center font-semibold">Sent</th>
                        <th className="px-6 py-4 text-center font-semibold">Openeds</th>
                        <th className="px-6 py-4 text-center font-semibold">Bounced</th> */}
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {currentRecords.map((item, index) => (
                          <motion.tr
                            key={item.listID}
                            custom={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedLists.some(
                                  (selected) => selected.listID === item.listID
                                )}
                                onChange={() => toggleListSelection(item)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/list-data?item=${encodeURIComponent(
                                  JSON.stringify(item)
                                )}`}
                                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {item.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.subscribers || "0"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {item.unSubscribers || "0"}
                              </span>
                            </td>
                             {/* <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {item.sent || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {item.opened || "0"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {item.bounced || "0"}
                              </span>
                            </td> */}
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(item)}
                                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                                  title="Edit List"
                                >
                                  <FiEdit className="text-blue-600 text-sm" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(item.listID)}
                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all"
                                  title="Delete List"
                                >
                                  <FiTrash2 className="text-red-600 text-sm" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {currentRecords.map((item, index) => (
                    <motion.div
                      key={item.listID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedLists.some(
                              (selected) => selected.listID === item.listID
                            )}
                            onChange={() => toggleListSelection(item)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <div>
                            <Link
                              href={`/list-data?item=${encodeURIComponent(
                                JSON.stringify(item)
                              )}`}
                              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FiEdit className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.listID)}
                            className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all"
                          >
                            <FiTrash2 className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Active Subscribers</p>
                          <p className="font-semibold text-blue-600">{item.subscribers || "0"}</p>
                        </div>
                        {/* <div>
                          <p className="text-xs text-gray-500 mb-1">Segments</p>
                          <p className="font-semibold text-purple-600">{item.segs || "0"}</p>
                        </div> */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Unsubscribers</p>
                          <p className="font-semibold text-amber-600">{item.unSubscribed || "0"}</p>
                        </div>
                        {/* <div>
                          <p className="text-xs text-gray-500 mb-1">Bounced</p>
                          <p className="font-semibold text-red-600">{item.bounced || "0"}</p>
                        </div> */}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredLists.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, filteredLists.length)} of{" "}
                {filteredLists.length} lists
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="mr-2" />
                  Previous
                </motion.button>
                
                <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm">
                  {currentPage}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <FiChevronRight className="ml-2" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit List Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editList ? "Edit List" : "Create New List"}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {editList ? "Update list information" : "Add a new subscriber list"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setError("");
                      setEditList(null);
                      setListName("");
                    }}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                  >
                    <IoMdClose className="text-blue-500 text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      List Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={listName}
                      onChange={(e) => {
                        setListName(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter list name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                    />
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center"
                      >
                        <span className="mr-1">⚠</span>
                        {error}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setError("");
                      setEditList(null);
                      setListName("");
                    }}
                    className="flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {editList ? (
                      <>
                        <FiEdit className="mr-2" size={16} />
                        Update List
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-2" size={16} />
                        Create List
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merge Modal */}
      <AnimatePresence>
        {isMergeModalOpen && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Merge Lists</h2>
                    <p className="text-green-100 mt-1">Combine selected lists into one</p>
                  </div>
                  <button
                    onClick={() => setIsMergeModalOpen(false)}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                  >
                    <IoMdClose className="text-white text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New List Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter new list name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 focus:outline-none transition-all duration-200"
                    />
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Selected lists: {selectedLists.length}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
                  <button
                    onClick={() => setIsMergeModalOpen(false)}
                    className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={performMerge}
                    className="flex-1 flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaObjectGroup className="mr-2" size={16} />
                    Merge Lists
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Duplicates Modal */}
      <AnimatePresence>
        {isRemoveModalOpen && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Remove Duplicates</h2>
                    <p className="text-amber-100 mt-1">Clean up duplicate entries between lists</p>
                  </div>
                  <button
                    onClick={() => setIsRemoveModalOpen(false)}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                  >
                    <IoMdClose className="text-white text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="space-y-6">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 mb-2">
                      <strong>Important:</strong> This will compare the two selected lists and remove duplicate entries from the second list.
                    </p>
                    <p className="text-sm text-amber-700">
                      Selected lists: <strong>{selectedLists.length}</strong> (exactly 2 required)
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
                  <button
                    onClick={() => setIsRemoveModalOpen(false)}
                    className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={performRemoveDuplicates}
                    className="flex-1 flex items-center justify-center px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaMinus className="mr-2" size={16} />
                    Remove Duplicates
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageLists;
