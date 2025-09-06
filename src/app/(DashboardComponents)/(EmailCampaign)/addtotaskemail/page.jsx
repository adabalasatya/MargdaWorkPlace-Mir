"use client"; 

import React, { useEffect, useState } from "react";
import { useToast } from "@/app/component/customtoast/page";
import { FaTasks, FaPlus, FaTimes, FaCheckCircle, FaListUl, FaSpinner } from "react-icons/fa";
import { FiX, FiCheck, FiList, FiPlus as FiPlusIcon } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

const AddToTask = ({ setClose, item, userID, fetchData }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTasks(userID);
  }, [userID]);

  const fetchTasks = async (userID) => {
    try {
      setLoading(true);
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
        setTasks(data.Tasks || []);
      } else {
        setTasks([]);
        addToast(data.message || "Failed to fetch tasks", "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addToast("Failed to fetch tasks", "error");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTask) {
      addToast("Please select a task", "error");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/add-to-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskID: selectedTask,
            dataID: item.dataID,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchData(userID);
        addToast(data.message, "success");
        setClose(false);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      addToast(error.message || "Unknown Error, try again later", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setClose(false);
    }
  };

  return (
    <div 
      className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <FaTasks className="text-blue-500 text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Add to Task</h2>
                <p className="text-blue-100 text-sm mt-1">Assign this item to a task</p>
              </div>
            </div>
            <button
              onClick={() => setClose(false)}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
              disabled={submitting}
            >
              <IoMdClose className="text-blue-500 text-lg" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading tasks...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Task Selection Section */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    <FiList className="text-xs" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Select Task</h3>
                </div>

                {tasks.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaListUl className="text-2xl text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Tasks Available</h4>
                    <p className="text-gray-500 text-sm">Create a task first to assign items to it.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <FiList className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="task"
                      id="task"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium"
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                      required
                      disabled={submitting}
                    >
                      <option value="" disabled className="text-gray-400">
                        Choose a task to assign this item
                      </option>
                      {tasks.map((task) => (
                        <option key={task.taskID} value={task.taskID} className="text-gray-700">
                          {task.task}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Task Info */}
                {selectedTask && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <FaCheckCircle className="text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium text-sm">
                        Task selected: {tasks.find(t => t.taskID === parseInt(selectedTask))?.task}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Information */}
              {item && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mr-2"></div>
                    Item to be assigned
                  </h4>
                  <div className="space-y-2 text-sm">
                    {item.subject && (
                      <p className="text-gray-600">
                        <span className="font-medium">Subject:</span> {item.subject}
                      </p>
                    )}
                    {item.sender && (
                      <p className="text-gray-600">
                        <span className="font-medium">From:</span> {item.sender}
                      </p>
                    )}
                    {item.receiver && (
                      <p className="text-gray-600">
                        <span className="font-medium">To:</span> {item.receiver}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!loading && (
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setClose(false)}
              disabled={submitting}
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="mr-2" size={16} />
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!selectedTask || tasks.length === 0 || submitting}
              className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" size={16} />
                  Adding to Task...
                </>
              ) : (
                <>
                  <FiPlusIcon className="mr-2" size={16} />
                  Add to Task
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToTask;
