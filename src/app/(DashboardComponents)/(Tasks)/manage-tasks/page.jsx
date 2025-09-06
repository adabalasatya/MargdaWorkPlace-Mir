'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaArrowLeft, 
  FaArrowRight,
  FaTasks,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaListUl
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
  FiSettings,
  FiTarget
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/app/component/customtoast/page";
import Swal from "sweetalert2";

const ManageTasks = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [taskID, setTaskID] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const { addToast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/update-profile");
      return;
    } else {
      setUserData(storedUserData);
      setUserID(storedUserData.userID);
      fetchTasks(storedUserData.userID);
    }
  }, [router]);

  const fetchTasks = async (userID) => {
    if (!userID) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/get-tasks",
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
        setTasks(data.Tasks || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }

    setError("");

    try {
      setIsLoading(true);

      if (editTask) {
        const response = await fetch(
          "https://www.margda.in/miraj/work/task/edit-task",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: taskName.trim(), taskID: taskID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("Task updated successfully!", "success");
          await fetchTasks(userID);
        } else {
          addToast(data.message || "Failed to update Task", "error");
        }
      } else {
        const response = await fetch(
          "https://www.margda.in/miraj/work/task/add-task",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: taskName.trim(), userID: userID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("Task added successfully!", "success");
          await fetchTasks(userID);
        } else {
          addToast(data.message || "Failed to add Task", "error");
        }
      }

      resetModal();
    } catch (error) {
      console.error("Error:", error);
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditTask(item);
    setTaskName(item.task);
    setTaskID(item.taskID);
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (taskID) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone. Are you sure you want to delete this task?",
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
      setIsLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/delete-task",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast("Task deleted successfully!", "success");
        await fetchTasks(userID);
      } else {
        addToast(data.message || "Failed to delete Task", "error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      addToast("Failed to delete task", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const resetModal = () => {
    setTaskName("");
    setError("");
    setEditTask(null);
    setTaskID("");
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setTaskName(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter((task) =>
    task.task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTasks.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredTasks.length / recordsPerPage);

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
  const totalTasks = tasks.length;
  const completedTasks = Math.floor(totalTasks * 0.7); // Mock completion rate
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

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

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4">
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
  {/* Left - Back Button */}
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
  <div className="flex flex-1 justify-center items-center">
    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-xl flex items-center justify-center mr-3">
      <FaTasks className="text-white text-md" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
  </div>

  {/* Right - Empty (keeps title centered) */}
  <div className="w-20"></div>
</div>


        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaListUl className="text-indigo-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{completedTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-amber-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{activeTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-800">{completionRate}%</p>
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
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm font-semibold text-gray-700">records</span>
                </div>

                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all w-64"
                  />
                </div>
              </div>

              {/* Right Controls */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditTask(null);
                  setTaskName("");
                  setError("");
                  setIsModalOpen(true);
                }}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <FaPlus className="mr-2" size={16} />
                Add New Task
              </motion.button>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mr-4"></div>
                <span className="text-gray-600 font-medium">Loading tasks...</span>
              </div>
            ) : currentRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTasks className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? `No tasks found matching "${searchTerm}"`
                    : "Create your first task to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setEditTask(null);
                      setTaskName("");
                      setError("");
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Task
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-600 text-white">
                        <th className="px-6 py-4 text-left font-semibold">S.No</th>
                        <th className="px-6 py-4 text-left font-semibold">Task Name</th>
                        <th className="px-6 py-4 text-center font-semibold">Status</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {currentRecords.map((item, index) => (
                          <motion.tr
                            key={item.taskID}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={rowVariants}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-6 py-4 text-gray-700 font-medium">
                              {indexOfFirstRecord + index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{item.task}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <FiTarget className="mr-1" size={12} />
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(item)}
                                  disabled={isLoading}
                                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                                  title="Edit Task"
                                >
                                  <FiEdit className="text-blue-600 text-sm" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(item.taskID)}
                                  disabled={isLoading}
                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                                  title="Delete Task"
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
                      key={item.taskID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{item.task}</h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <FiTarget className="mr-1" size={12} />
                            Active
                          </span>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={isLoading}
                            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <FiEdit className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.taskID)}
                            disabled={isLoading}
                            className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <FiTrash2 className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Task #{indexOfFirstRecord + index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredTasks.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {filteredTasks.length > 0 ? indexOfFirstRecord + 1 : 0} to{" "}
                {Math.min(indexOfLastRecord, filteredTasks.length)} of {filteredTasks.length} tasks
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || isLoading}
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
                  disabled={currentPage === totalPages || isLoading}
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

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                resetModal();
              }
            }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editTask ? "Edit Task" : "Create New Task"}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {editTask ? "Update task information" : "Add a new task to your list"}
                    </p>
                  </div>
                  <button
                    onClick={resetModal}
                    disabled={isLoading}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    <IoMdClose className="text-indigo-500 text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskName}
                      onChange={handleInputChange}
                      placeholder="Enter task name"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      autoFocus
                      disabled={isLoading}
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
                    onClick={resetModal}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center px-8 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : editTask ? (
                      <>
                        <FiEdit className="mr-2" size={16} />
                        Update Task
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-2" size={16} />
                        Create Task
                      </>
                    )}
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

export default ManageTasks;
