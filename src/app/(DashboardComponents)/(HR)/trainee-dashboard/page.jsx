'use client';

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaUserGraduate,
  FaUser,
  FaHandsHelping,
  FaAward,
  FaPhoneAlt,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

// Import the user image - make sure to place user.webp in public/assets/
// You can uncomment the line below and move the image to public/assets/user.webp
// import User from "../../../assets/user.webp";

const TrainingDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [studyCourses, setStudyCourses] = useState([]);
  const [allStudyCourses, setAllStudyCourses] = useState([]);
  const [selectedStudyCourse, setSelectedStudyCourse] = useState(null);
  const [studySubjects, setStudySubjects] = useState([]);
  const [selectedStudySubject, setSelectedStudySubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [localUserData, setLocalUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

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
      fetchStudyCourses();
    }
  }, [accessToken]);

  const fetchStudyCourses = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/cpp_training/trainee/get_study_courses",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && Array.isArray(data.Courses)) {
        const courses = data.Courses.map((course) => ({
          ...course,
          value: course.studyID,
          label: course.courseName,
        }));

        setAllStudyCourses(courses);
        
        const uniqueData = courses.reduce((acc, item) => {
          if (!acc.some((obj) => obj.courseID === item.courseID)) {
            acc.push(item);
          }
          return acc;
        }, []);
        setStudyCourses(uniqueData);

        // Check for saved selections in sessionStorage
        if (typeof window !== 'undefined') {
          const savedStudyCourse = sessionStorage.getItem("trainee-study-course");
          const savedStudySubject = sessionStorage.getItem("trainee-study-subject");
          
          if (savedStudyCourse && savedStudySubject) {
            const studyCourse = JSON.parse(savedStudyCourse);
            if (studyCourse.courseID) {
              const filterStudySubjects = courses.filter(
                (course) => course.courseID === studyCourse.courseID
              );
              const subjects = filterStudySubjects.map((subject) => ({
                ...subject,
                label: subject.subjectName,
              }));
              setStudySubjects(subjects);
              setSelectedStudyCourse(studyCourse);
            }
            
            const studySubject = JSON.parse(savedStudySubject);
            setSelectedStudySubject(studySubject);
            if (studySubject.studyID) {
              fetchLessons(studySubject.studyID);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching study courses:", error);
    }
  };

  const fetchLessons = async (studyID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/cpp_training/trainee/get_lessons",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studyID }),
        }
      );
      const data = await response.json();
      if (response.ok && Array.isArray(data.Lessons)) {
        setLessons(data.Lessons);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  };

  const coordinator = {
    name: "Test",
    mobile: "9876543210",
    pic: "coordinator.jpg",
    edate: "2025-1-11",
    endate: "2025-12-12",
  };

  const trainer = {
    name: "",
    mobile: "9123456789",
    pic: "trainer.jpg",
  };

  const handleCall = (type) => {
    const phoneNumber = type === "coordinator" ? coordinator.mobile : trainer.mobile;
    if (!phoneNumber) {
      Swal.fire(
        "",
        `No contact info for ${type === "coordinator" ? "Coordinator" : "Trainer"}`,
        "error"
      );
      return;
    }
    Swal.fire("Call dialed. Kindly check your phone", "", "success");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Navigation with loading animation
  const handleNavigate = (path) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
      setIsLoading(false);
    }, 1000);
  };

  const handleStudyCourseChange = (selectedOption) => {
    setSelectedStudyCourse(selectedOption);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem("trainee-study-course", JSON.stringify(selectedOption));
    }
    
    const filterStudySubjects = allStudyCourses.filter(
      (course) => course.courseID === selectedOption.courseID
    );
    const subjects = filterStudySubjects.map((subject) => ({
      ...subject,
      label: subject.subjectName,
    }));
    setSelectedStudySubject(null);
    setStudySubjects(subjects);
    setLessons([]); // Clear lessons when course changes
  };

  const handleStudySubjectChange = (selectedOption) => {
    setSelectedStudySubject(selectedOption);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem("trainee-study-subject", JSON.stringify(selectedOption));
    }
    if (selectedOption.studyID) {
      fetchLessons(selectedOption.studyID);
    }
  };

  const handleGiveTestClick = (lesson) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem("lessonID", lesson.lessonID);
      sessionStorage.setItem("lessonName", lesson.lesson);
      sessionStorage.setItem("studyID", lesson.studyID);
    }
    router.push("/give-test");
  };

  // Filter lessons based on search query
  const filteredLessons = lessons.filter((lesson) =>
    lesson.lesson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentLessons = filteredLessons.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredLessons.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Show loading if user data is not loaded yet
  if (!localUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

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
              onClick={() => handleNavigate("/trainee-dashboard")}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
            >
              <FaUser className="mr-2" /> Study Theory
            </button>
            <button
              onClick={() => handleNavigate("/complete-activity")}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
            >
              <FaUser className="mr-2" /> Complete Activity
            </button>
            <button
              disabled
              className="bg-gray-300 text-gray-600 px-5 py-3 rounded-lg shadow-md cursor-not-allowed flex items-center"
            >
              <FaHandsHelping className="mr-2" /> Do Practical
            </button>
            <button
              disabled
              className="bg-gray-300 text-gray-600 px-5 py-3 rounded-lg shadow-md cursor-not-allowed flex items-center"
            >
              <FaUserGraduate className="mr-2" /> Competency Sheet
            </button>
            <button
              disabled
              className="bg-gray-300 text-gray-600 px-5 py-3 rounded-lg shadow-md cursor-not-allowed flex items-center"
            >
              <FaAward className="mr-2" /> CCP Certificate
            </button>
          </div>
        </div>

        {/* Coordinator & Trainer Info */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300">
              <h6 className="text-lg font-bold text-gray-900 tracking-tight">
                Start Date
              </h6>
              <p className="mt-2 text-xl font-extrabold text-blue-700">
                {formatDate(coordinator.edate)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300">
              <h6 className="text-lg font-bold text-gray-900 tracking-tight">
                Completion Date
              </h6>
              <p className="mt-2 text-xl font-extrabold text-blue-700">
                {formatDate(coordinator.endate)}
              </p>
            </div>
          </div>
          <hr className="my-4 border-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-300 text-center">
              <h5 className="text-xl font-bold text-gray-900 tracking-tight">
                Coordinator
              </h5>
              {/* Replace with Next.js Image component */}
              <div className="w-24 h-24 rounded-full mx-auto my-4 border-4 border-blue-200 shadow-sm bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h5 className="text-lg font-medium text-gray-700">
                {coordinator.name || "Not opted"}
              </h5>
              <button
                onClick={() => handleCall("coordinator")}
                className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 hover:text-green-800 transition duration-200 flex items-center justify-center mx-auto font-semibold"
              >
                <FaPhoneAlt className="mr-2" /> Support
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-300 text-center">
              <h5 className="text-xl font-bold text-gray-900 tracking-tight">
                Trainer
              </h5>
              {/* Replace with Next.js Image component */}
              <div className="w-24 h-24 rounded-full mx-auto my-4 border-4 border-blue-200 shadow-sm bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h5 className="text-lg font-medium text-gray-700">
                {trainer.name || "Not opted"}
              </h5>
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
            <FaUserGraduate className="mr-2 text-blue-600" /> Study Theory
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-around mb-6 gap-4">
            <div className="flex w-full md:w-1/2 mx-4 flex-col items-center gap-2">
              <span className="text-gray-700">Course</span>
              <Select
                value={selectedStudyCourse}
                onChange={handleStudyCourseChange}
                options={studyCourses}
                className="w-full"
                placeholder="Select Study Course"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />
            </div>
            <div className="flex w-full md:w-1/2 mx-4 flex-col items-center gap-2">
              <span className="text-gray-700">Subject</span>
              <Select
                value={selectedStudySubject}
                onChange={handleStudySubjectChange}
                options={studySubjects}
                className="w-full"
                placeholder="Select Study Subject"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Show</span>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-700">Records</span>
            </div>
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 p-2 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SNO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLessons.length > 0 ? (
                  currentLessons.map((lesson, index) => (
                    <tr
                      key={lesson.lessonID}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {indexOfFirstRecord + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {lesson.lesson}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {lesson.content_url &&
                        Array.isArray(lesson.content_url) &&
                        lesson.content_url.length > 0 ? (
                          <ul className="space-y-1">
                            {lesson.content_url.map((url, urlIndex) => (
                              <li key={urlIndex}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline text-sm"
                                >
                                  {url.split(".")[url.split(".").length - 1].toUpperCase()}{" "}
                                  File
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 space-x-3">
                        {lesson.finished === "Y" ? (
                          <>
                            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
                              Completed
                            </span>
                            <Link
                              href={`/result?moduleId=${lesson.lessonID}`}
                              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
                            >
                              Result
                            </Link>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleGiveTestClick(lesson)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm"
                            >
                              Give Test
                            </button>
                            <span className="inline-block bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed text-sm">
                              Result
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      {searchQuery ? "No lessons found matching your search." : "No lessons available. Please select a subject."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLessons.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6">
              <span className="text-gray-600 text-sm">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredLessons.length)} of{" "}
                {filteredLessons.length} entries
              </span>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaAngleLeft /> Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-lg transition duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FaAngleRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;
