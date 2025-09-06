'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FaUserGraduate, FaUser, FaHandsHelping, FaAward, FaPhoneAlt, FaSearch, FaAngleLeft, FaAngleRight, FaUpload } from 'react-icons/fa';
// import User from "../../../assets/user.webp";

// Dynamically import Swal to avoid SSR issues
const Swal = dynamic(() => import('sweetalert2'), { ssr: false });

const CompleteActivity = () => {
  const router = useRouter(); // Use Next.js router instead of React Router
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const coordinator = {
    name: "Coln Vk Sangwan",
    mobile: "9876543210",
    pic: "coordinator.jpg",
    edate: "2025-1-11",
    endate: "2023-12-12",
  };

  const trainer = {
    name: "",
    mobile: "9123456789",
    pic: "trainer.jpg",
  };

  const [modules, setModules] = useState([
    { module: "World of Occupations", marks: "43.75", finished: "N", moduleID: "1", mid: "1" },
    { module: "Counselling & Guidance", marks: "51.25", finished: "N", moduleID: "2", mid: "2" },
  ]);

  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCall = async (type) => {
    const phoneNumber = type === 'coordinator' ? coordinator.mobile : trainer.mobile;
    if (!phoneNumber) {
      const SwalComponent = await import('sweetalert2');
      SwalComponent.default.fire('', `No contact info for ${type === 'coordinator' ? 'Coordinator' : 'Trainer'}`, 'error');
      return;
    }
    const SwalComponent = await import('sweetalert2');
    SwalComponent.default.fire("Call dialed. Kindly check your phone", "", "success");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const updateModuleStatus = async (moduleId, file) => {
    if (file) {
      const SwalComponent = await import('sweetalert2');
      SwalComponent.default.fire({
        title: "Success!",
        text: `File "${file.name}" uploaded successfully for module ${moduleId}.`,
        icon: "success",
      });
    }
    setModules(prevModules =>
      prevModules.map(module =>
        module.moduleID === moduleId ? { ...module, finished: "Y" } : module
      )
    );
  };

  const handleUploadClick = (moduleId) => {
    if (fileInputRef.current) {
      fileInputRef.current.moduleId = moduleId;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const moduleId = fileInputRef.current?.moduleId;
    if (file && moduleId) {
      updateModuleStatus(moduleId, file);
    }
    if (e.target) {
      e.target.value = null;
    }
  };

  // Navigation with loading animation
  const handleNavigate = (path) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-10 relative">
      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 mt-2">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center justify-center md:justify-start">
          <FaUserGraduate className="mr-3 text-blue-600" />
          Training & Certification as a Career Counselling Professional (CCP)
        </h2>

        {/* Navigation Buttons */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-300">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={() => handleNavigate('/trainee-dashboard')}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
            >
              <FaUser className="mr-2" /> Study Theory
            </button>
            <button
              onClick={() => handleNavigate('/complete-activity')}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
            >
              <FaUser className="mr-2" /> Complete Activity
            </button>
            <button disabled className="bg-gray-300 text-gray-600 px-5 py-3 rounded-lg shadow-md cursor-not-allowed flex items-center">
              <FaHandsHelping className="mr-2" /> Do Practical
            </button>
            <button disabled className="bg-gray-300 text-gray-600 px-5 py-3 rounded-lg shadow-md cursor-not-allowed flex items-center">
              <FaUserGraduate className="mr-2" /> Competency Sheet
            </button>
            <button disabled className="bg-gray-300 text-gray-600 px-5 py-3 rounded-lg shadow-md cursor-not-allowed flex items-center">
              <FaAward className="mr-2" /> CCP Certificate
            </button>
          </div>
        </div>

        {/* Coordinator & Trainer Info */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300">
              <h6 className="text-lg font-bold text-gray-900 tracking-tight">Start Date</h6>
              <p className="mt-2 text-xl font-extrabold text-blue-700">{formatDate(coordinator.edate)}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300">
              <h6 className="text-lg font-bold text-gray-900 tracking-tight">Completion Date</h6>
              <p className="mt-2 text-xl font-extrabold text-blue-700">{formatDate(coordinator.endate)}</p>
            </div>
          </div>
          <hr className="my-4 border-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coordinator */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-300 text-center">
              <h5 className="text-xl font-bold text-gray-900 tracking-tight">Coordinator</h5>
              <Image
                src=""
                alt="Coordinator"
                width={96}
                height={96}
                className="rounded-full mx-auto my-4 border-4 border-blue-200 shadow-sm"
              />
              <h5 className="text-lg font-medium text-gray-700">{coordinator.name || "Not opted"}</h5>
              <button
                onClick={() => handleCall('coordinator')}
                className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 hover:text-green-800 transition duration-200 flex items-center justify-center mx-auto font-semibold"
              >
                <FaPhoneAlt className="mr-2" /> Support
              </button>
            </div>

            {/* Trainer */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-300 text-center">
              <h5 className="text-xl font-bold text-gray-900 tracking-tight">Trainer</h5>
              <Image
                src=""
                alt="Trainer"
                width={96}
                height={96}
                className="rounded-full mx-auto my-4 border-4 border-blue-200 shadow-sm"
              />
              <h5 className="text-lg font-medium text-gray-700">{trainer.name || "Not opted"}</h5>
              <button
                disabled
                className="mt-4 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center mx-auto font-semibold"
              >
                <FaPhoneAlt className="mr-2" /> Support
              </button>
            </div>
          </div>
        </div>

        {/* Modules Table */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
            <FaUserGraduate className="mr-2 text-blue-600" /> Complete Activity
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Show</span>
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-700">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 p-2 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SNO</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Complete Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.slice(0, recordsPerPage).map((module, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{module.module}</p>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      {module.finished === 'Y' ? (
                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium">Completed</span>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(module.moduleID)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                        >
                          <FaUpload className="mr-2" /> Upload
                        </button>
                      )}
                      <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium">
                        {module.marks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6">
            <span className="text-gray-600 text-sm">
              Showing 1 to {Math.min(recordsPerPage, modules.length)} of {modules.length} entries
            </span>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                className="px-4 py-2 border rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 flex items-center gap-1 disabled:opacity-50"
                disabled={true}
              >
                <FaAngleLeft /> Previous
              </button>
              <span className="px-4 py-2 border rounded-lg bg-blue-600 text-white font-semibold">1</span>
              <button
                className="px-4 py-2 border rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 flex items-center gap-1 disabled:opacity-50"
                disabled={true}
              >
                Next <FaAngleRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteActivity;
