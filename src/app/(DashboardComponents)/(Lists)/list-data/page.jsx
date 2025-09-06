'use client';
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { FaArrowLeft, FaEdit, FaSearch, FaTrash, FaDownload, FaPlus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import AddListDataForm from "@/app/(DashboardComponents)/(Lists)/AddListForm/page";

const ListData = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [addDataFormOpen, setAddDataFormOpen] = useState(false);
  const [editDataFormOpen, setEditDataFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [listData, setListData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showCsvData, setShowCsvData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [pieData, setPieData] = useState([
    { name: "Active", value: 0, color: "#10b981" },
    { name: "Unconfirmed", value: 0, color: "#9ca3af" },
    { name: "Unsubscribed", value: 0, color: "#ef4444" },
    { name: "Bounced", value: 0, color: "#4b5563" },
    { name: "Marked as spam", value: 0, color: "#374151" },
  ]);
  const [filters, setFilters] = useState([
    { name: "All", count: 0, color: "bg-blue-500" },
    { name: "Active", count: 0, color: "bg-green-500" },
    { name: "Unsubscribed", count: 0, color: "bg-red-500" },
  ]);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.pic) {
      router.push("/update-profile");
    } else {
      setUserID(userData.userID);
    }
  }, [router]);

  useEffect(() => {
    const state = JSON.parse(searchParams.get("item") || "{}");
    if (state && state.listID) {
      setListData(state);
      const listID = parseInt(state.listID);
      if (!isNaN(listID)) {
        fetchSubscribers(listID);
      } else {
        addToast("Invalid list ID. Redirecting to lists page.", "error");
        router.push("/lists");
      }
    } else {
      addToast("No valid list data found. Redirecting to lists page.", "error");
      router.push("/lists");
    }
  }, [searchParams]);

  // Polling mechanism to fetch new data every 10 seconds
  useEffect(() => {
    if (listData?.listID) {
      const listID = parseInt(listData.listID);
      if (!isNaN(listID)) {
        const interval = setInterval(() => {
          fetchSubscribers(listID, true); // Pass isPolling flag
        }, 10000); // Poll every 10 seconds for testing
        return () => {
          clearInterval(interval);
        };
      }
    }
  }, [listData?.listID]);

  const fetchSubscribers = async (listID, isPolling = false) => {
    if (!isPolling) setIsLoading(true); // Only show loading for initial fetch
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/get-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Prevent caching
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ listID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const subscriberData = data.Data || [];
        // Only update state if data has changed to avoid unnecessary re-renders
        if (JSON.stringify(subscriberData) !== JSON.stringify(subscribers)) {
          setSubscribers(subscriberData);
          updateCharts(subscriberData);
          setCurrentPage(1);
          setSelectedRows([]);
          if (isPolling) {
          }
        } else {
        }
      } else {
        setSubscribers([]);
      }
    } catch (error) {
      setSubscribers([]);
      addToast("Error fetching subscribers: " + error.message, "error");
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  const updateCharts = (subscribers) => {
    const statusCounts = subscribers.reduce(
      (acc, sub) => {
        const status = sub.status || (sub.subscribe ? "Active" : "Unsubscribed");
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { All: subscribers.length }
    );

    const all = subscribers.length;
    const subscribed = subscribers.filter((item) => item.subscribe).length;
    const unsubscribed = subscribers.filter((item) => !item.subscribe).length;

    const newPieData = [
      { name: "Active", value: statusCounts["Active"] || subscribed || 0, color: "#10b981" },
      { name: "Unconfirmed", value: statusCounts["Unconfirmed"] || 0, color: "#9ca3af" },
      { name: "Unsubscribed", value: statusCounts["Unsubscribed"] || unsubscribed || 0, color: "#ef4444" },
      { name: "Bounced", value: statusCounts["Bounced"] || 0, color: "#4b5563" },
      { name: "Marked as spam", value: statusCounts["Marked as spam"] || 0, color: "#374151" },
    ].filter((item) => item.value > 0);

    const newFilters = [
      { name: "All", count: all || 0, color: "bg-blue-500" },
      { name: "Active", count: subscribed || 0, color: "bg-green-500" },
      { name: "Unsubscribed", count: unsubscribed || 0, color: "bg-red-500" },
    ];

    setPieData(newPieData.length > 0 ? newPieData : pieData);
    setFilters(newFilters);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubscribe = async () => {
    if (selectedRows.length === 0) {
      addToast("Please select at least one subscriber", "error");
      return;
    }

    const dataIDs = selectedRows.map(row => row.dataID);

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/subscribe",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            dataIDs: dataIDs,
            subscribe: true
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        addToast(data.message, "success");
      } else {
        addToast(data.message || "Failed to subscribe", "error");
      }
    } catch (error) {
      addToast(error.message || "Unknown Error, try again later", "error");
    }
  };

  const handleBulkUnsubscribe = async () => {
    if (selectedRows.length === 0) {
      addToast("Please select at least one subscriber", "error");
      return;
    }

    const dataIDs = selectedRows.map(row => row.dataID);

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/subscribe",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            dataIDs: dataIDs,
            subscribe: false
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        addToast(data.message, "success");
      } else {
        addToast(data.message || "Failed to unsubscribe", "error");
      }
    } catch (error) {
      addToast(error.message || "Unknown Error, try again later", "error");
    }
  };

  const handleEditSubscriber = (subscriber) => {
    setEditingSubscriber(subscriber);
    setEditDataFormOpen(true);
  };

  const handleUpdateSubscriber = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/edit-data",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataID: updatedData.dataID,
            name: updatedData.name,
            email: updatedData.email,
            mobile: updatedData.mobile,
            whatsapp: updatedData.whatsapp,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        setEditDataFormOpen(false);
        setEditingSubscriber(null);
        addToast("Subscriber updated successfully", "success");
      } else {
        addToast(data.message || "Failed to update subscriber", "error");
      }
    } catch (error) {
      addToast("Error updating subscriber: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (dataIDs) => {
    if (!dataIDs || dataIDs.length === 0) {
      addToast("Please select at least one data from the table", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure to delete?",
      text: `Do you want to delete ${dataIDs.length > 1 ? 'these subscribers' : 'this subscriber'}?`,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/delete-data",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataIDs: dataIDs }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        addToast("Subscriber(s) deleted successfully", "success");
      } else {
        addToast(data.message || "Failed to delete subscriber", "error");
      }
    } catch (error) {
      addToast("Error deleting subscriber: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (selectedRows.length === 0) {
      addToast("Please select at least one subscriber to verify", "error");
      return;
    }

    const dataIDs = selectedRows.map(row => row.dataID);
    
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/verify-email",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataIDs }),
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        addToast(data.message || "Email verification initiated successfully", "success");
      } else {
        addToast(data.message || "Failed to initiate email verification", "error");
      }
    } catch (error) {
      addToast("Error verifying emails: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const data =
      "datatype,name,mobile,whatsapp,email\nI,John Doe,911234567890,911234567890,john@example.com\nB,Jahn Doe,911234567890,911234567890,jahn@example.com\nI,John Doe,911234567890,911234567890,johndeep@example.com";
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesFilter =
      activeFilter === "All"
        ? true
        : activeFilter === "Active"
        ? subscriber.subscribe
        : activeFilter === "Unsubscribed"
        ? !subscriber.subscribe
        : true;
    const matchesSearch =
      searchTerm === "" ||
      (subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSubscribers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredSubscribers.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setCurrentPage(1);
    if (value) {
      if (value < 1) {
        setRecordsPerPage(1);
      } else if (value > 500) {
        setRecordsPerPage(500);
      } else {
        setRecordsPerPage(value);
      }
    } else {
      setRecordsPerPage(10);
    }
  };

  const getPaginationRange = () => {
    const totalPageNumbers = 5;
    const halfRange = Math.floor(totalPageNumbers / 2);

    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + totalPageNumbers - 1, totalPages);

    if (endPage - startPage + 1 < totalPageNumbers) {
      startPage = Math.max(endPage - totalPageNumbers + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const handleSelectRow = (row) => {
    if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((item) => item !== row));
    } else {
      setSelectedRows((prev) => [...prev, row]);
    }
  };

  const handleSelectAll = (isChecked) => {
    setSelectedRows(isChecked ? [...currentRecords] : []);
  };

  const expectedHeaders = ["datatype", "name", "mobile", "whatsapp", "email"];

  const formatName = (input) => {
    return input
      .split(" ")
      .map((word) => {
        if (word.length === 1) {
          return word.toUpperCase() + ".";
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data, meta } = results;
          const fileHeaders = meta.fields;
          const lowerCaseExpectedHeaders = expectedHeaders.map((header) =>
            header.toLowerCase()
          );
          if (
            JSON.stringify(fileHeaders) !==
            JSON.stringify(lowerCaseExpectedHeaders)
          ) {
            alert(`Invalid columns. Expected: ${expectedHeaders.join(", ")}`);
            setCsvData([]);
            setHeaders([]);
            return;
          }
          data.forEach((item) => {
            item.name = formatName(item.name);
          });

          setHeaders(fileHeaders);
          setCsvData(data);
          setShowCsvData(true);
        },
      });
    }
  };

  const handleAddLeadFromCsv = async () => {
    setShowCsvData(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("listID", listData.listID);
      formData.append("userID", userID);
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/upload-csv",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        await fetchSubscribers(listData.listID);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      addToast(error.message || "Error uploading CSV", "error");
    } finally {
      setLoading(false);
      setFile(null);
      setCsvData([]);
      setHeaders([]);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
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

  const EditSubscriberForm = ({ subscriber, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: subscriber.name || "",
      email: subscriber.email || "",
      mobile: subscriber.mobile || "",
      whatsapp: subscriber.whatsapp || "",
      dataID: subscriber.dataID,
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Subscriber</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Mobile Number with Country code</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number with Country code</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100px] overflow-hidden">
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
      />
      {loading && <Loader />}

      <div className="border-b border-gray-200 px-6 py-3">
        <div className="relative flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-[12px] bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft className="mr-2" size={12} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            Subscriber Lists
          </h1>
          <div className="relative mb-2 items-center space-x-2">
            <span className="text-lg font-medium text-gray-600">List:</span>
            <span className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-semibold rounded-lg shadow">
              {listData ? listData.name : "Loading..."}
            </span>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 shadow-md rounded-xl px-6 py-2 mt-3">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-1 flex-1 max-w-md">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none flex-1 text-gray-700"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[12px] font-medium text-gray-600">Show:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="border border-gray-300 rounded-lg px-2 py-1 w-15 text-center"
              />
              <span className="text-[12px] font-medium text-gray-600">Records</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAddDataFormOpen(true)}
                className="flex items-center px-4 py-2 text-[12px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                <FaPlus className="text-[12px] mr-2" />
                Add List Data
              </button>
              <label className="flex items-center px-4 py-2 text-[12px] bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
                <FaPlus className="text-[12px] mr-2" />
                Upload CSV
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={downloadSample}
                className="flex items-center px-4 py-2 text-[12px] bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                <FaDownload className="mr-2 text-[12px]" />
                Sample CSV
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 shadow-md rounded-xl px-6 py-2 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleVerifyEmail}
                className="flex items-center px-4 py-2 text-[12px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                Verify
              </button>
              <button
                onClick={handleSubscribe}
                className="flex items-center px-4 py-2 text-[12px] bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                Subscribe
              </button>
              <button
                onClick={handleBulkUnsubscribe}
                className="flex items-center px-4 py-2 text-[12px] bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                Unsubscribe
              </button>
            </div>
            <button
              onClick={() => {
                const selectedDataIDs = selectedRows.map(row => row.dataID);
                handleDeleteSubscriber(selectedDataIDs);
              }}
              className="flex items-center px-3 py-2 text-[12px] bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
            >
              <FaTrash className="text-[12px] mr-2" />
              Delete Selected ({selectedRows.length})
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 rounded-3xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between space-x-4 mb-4 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <div className="flex items-center">
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={selectedRows.length >= currentRecords.length && currentRecords.length > 0}
                className="text-[12px] text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-[12px] font-medium">
                Select All ({selectedRows.length} selected)
              </span>
            </label>
          </div>
          <div className="flex items-center space-x-3">
            {filters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => setActiveFilter(filter.name)}
                className={`flex items-center px-4 py-2 text-[12px] rounded-xl shadow-sm transition-transform duration-200 hover:scale-105 ${
                  activeFilter === filter.name
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-[12px] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full mr-2 ${filter.color}`}
                ></span>
                {filter.name}
                <span
                  className={`ml-2 px-2 py-0.5 text-[12px] rounded-full ${
                    activeFilter === filter.name
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-600 border border-gray-300"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg overflow-x-auto overflow-y-auto">
          <div className="md:max-h-[420px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-blue-600 to-blue-600 text-white">
                  <th className="px-2 py-3 text-left text-[12px] uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-2 py-3 text-left text-[12px] uppercase tracking-wider">
                    S/No
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Whatsapp
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    <div className="flex items-center">Status</div>
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Opened
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Bounced
                  </th>
                  <th className="px-3 py-3 text-left text-[12px] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="12"
                        className="px-4 py-3 text-center text-gray-500"
                      >
                        Loading subscribers...
                      </td>
                    </tr>
                  ) : currentRecords.length > 0 ? (
                    currentRecords.map((subscriber, index) => (
                      <motion.tr
                        key={subscriber.id || `subscriber-${index}`}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={rowVariants}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(subscriber)}
                            onChange={() => handleSelectRow(subscriber)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                          {indexOfFirstRecord + index + 1}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subscriber.name || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.email
                            ? subscriber.email.length > 34
                              ? subscriber.email.substring(0, 34) + "..."
                              : subscriber.email
                            : "N/A"}
                          {subscriber.verified === true ? (
                            <FaCheckCircle className="text-green-500 ml-1 w-3 h-3 inline" />
                          ) : subscriber.verified === false ? (
                            <FaTimesCircle className="text-red-500 ml-1 w-3 h-3 inline" />
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.mobile || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.whatsapp || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.subscribe === true ? (
                            <FaCheckCircle className="text-green-500 w-5 h-5 inline" />
                          ) : subscriber.subscribe === false ? (
                            <FaTimesCircle className="text-red-500 w-5 h-5 inline" />
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.emails_Sent || 0}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.open_count || 0}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.bounced || 0}
                        </td>
                        <td className="px-3 py-4 flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditSubscriber(subscriber)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FaEdit className="text-[12px]" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteSubscriber([subscriber.dataID])}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FaTrash className="text-[12px]" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="12"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No data found for this list.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-[12px] font-bold text-gray-600">
            Showing {indexOfFirstRecord + 1} to{" "}
            {Math.min(indexOfLastRecord, filteredSubscribers.length)} Records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
              }`}
            >
              {"<<"} Previous
            </button>
            <span className="px-4 py-2 bg-blue-600 text-[12px] text-white rounded">
              {currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
              }`}
            >
              Next {">>"}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {editDataFormOpen && editingSubscriber && (
          <EditSubscriberForm
            subscriber={editingSubscriber}
            onSubmit={handleUpdateSubscriber}
            onCancel={() => {
              setEditDataFormOpen(false);
              setEditingSubscriber(null);
            }}
          />
        )}
      </AnimatePresence>
      {csvData.length > 0 && showCsvData && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="border border-gray-500 relative bg-white shadow-lg rounded-lg overflow-x-auto overflow-y-auto max-h-[700px] w-3/4 p-6">
            <div style={{ textAlign: "end" }}>
              <button
                onClick={() => setShowCsvData(false)}
                className="bg-green-500 text-white px-4 py-2 mr-3 rounded-lg hover:bg-green-600 mb-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLeadFromCsv}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-2"
              >
                Add all data
              </button>
            </div>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-center">
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="py-3 px-4 text-justify uppercase font-semibold text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t hover:bg-gray-100 cursor-pointer border"
                  >
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="py-[9px] px-4 text-justify text-xl font-sans font-normal min-w-50"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {addDataFormOpen && (
        <AddListDataForm
          listID={listData.listID}
          setClose={setAddDataFormOpen}
          fetchData={fetchSubscribers}
        />
      )}
    </div>
  );
};

export default ListData;