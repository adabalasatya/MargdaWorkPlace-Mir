'use client';

import { useState, useEffect } from "react";
import {
  FaClock,
  FaQuestion,
  FaCalculator,
  FaHandPointDown,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const GiveTest = () => {
  const router = useRouter();
  const [lessonName, setLessonName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [studyInfo, setStudyInfo] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
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
    if (typeof window === 'undefined') return;

    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const lessonName = sessionStorage.getItem("lessonName");
    const studyID = sessionStorage.getItem("studyID");
    const lessonID = sessionStorage.getItem("lessonID");
    
    if (studyID && !isNaN(studyID) && accessToken) {
      setLessonName(lessonName || "");
      fetchStudyInfo(studyID, lessonID);
    } else if (accessToken) {
      router.push("/progress-report");
    }
  }, [accessToken, router]);

  const fetchStudyInfo = async (studyID, lessonID) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        "https://www.margda.in/api/cpp_training/trainee/get_study_info",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studyID: parseInt(studyID),
            lessonID: parseInt(lessonID),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.Study) {
        const total = data.Study.attempts;
        const done = data.Results?.length || 0;
        setRemainingAttempts(Number(total) - Number(done));
        setStudyInfo(data.Study);
      } else {
        setStudyInfo(null);
        console.error("Failed to fetch study info:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Fetch Study Info Error:", error);
      setStudyInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBeginTest = () => {
    if (typeof window !== 'undefined' && studyInfo) {
      sessionStorage.setItem("test_minutes", studyInfo.test_minutes.toString());
    }
    router.push("/begin-test");
  };

  // Show loading if user data is not loaded yet
  if (!localUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Render loading animation matching TrainingDashboard
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error state if no study info is available
  if (!studyInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-300 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">
            <FaTimes className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Not Available</h2>
          <p className="text-gray-600 mb-6">
            Unable to load test information. Please try again or contact support.
          </p>
          <button
            onClick={() => router.push("/trainee-dashboard")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main content after loading
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-2 mt-8">
        <div className="flex justify-center">
          <h2 className="text-3xl font-bold mb-4 flex items-center">
            <FaClock className="mr-2 text-blue-600" />
            Lesson MCQ Test
          </h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-300">
          <div className="mb-5">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-lg">
                <p className="break-words">
                  Lesson: <strong>{lessonName}</strong>
                </p>
              </div>
              <div className="text-lg text-center">
                <p>
                  Remaining Attempts: <span className="font-bold text-blue-600">{remainingAttempts}/{studyInfo.attempts}</span>
                </p>
              </div>
              <div className="text-lg md:text-right">
                <FaClock className="inline-block mb-1 mr-2 text-blue-600" />
                <span>Time: <strong>{studyInfo.test_minutes} minutes</strong></span>
              </div>
            </div>

            {/* Test Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={`Total Questions: ${studyInfo.test_mcq}`}
                  readOnly
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 w-full font-bold pl-10 bg-gray-100 cursor-not-allowed focus:outline-none"
                />
                <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-700">
                  <FaQuestion />
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={`Total Marks: ${studyInfo.marks_total}`}
                  readOnly
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 w-full font-bold pl-10 bg-gray-100 cursor-not-allowed focus:outline-none"
                />
                <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-700">
                  <FaCalculator />
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={`Right Marks: ${Number(studyInfo.marks_correct)}`}
                  readOnly
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 w-full font-bold text-green-600 pl-10 bg-gray-100 cursor-not-allowed focus:outline-none"
                />
                <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-green-600">
                  <FaCheck />
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={`Wrong Marks: ${Number(studyInfo.marks_wrong)}`}
                  readOnly
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 w-full font-bold text-red-600 pl-10 bg-gray-100 cursor-not-allowed focus:outline-none"
                />
                <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-red-600">
                  <FaTimes />
                </span>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg mb-4 flex items-center text-blue-800 font-semibold">
                <FaHandPointDown className="mr-2" />
                Important Instructions:
              </h3>
              <ul className="list-decimal pl-5 space-y-3 text-gray-700">
                <li>
                  Your time countdown will begin as soon as you click the
                  &apos;Begin Test&apos; button.
                </li>
                <li>
                  Your test will automatically end when the test time is over.
                </li>
                <li>
                  During the test, you can move backwards and forward or jump to
                  any question you wish.
                </li>
                <li>You can change the answers to your questions.</li>
                <li>
                  If the browser window closes during the test, you can resume
                  the test with the same question.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {remainingAttempts > 0 ? (
                <button
                  onClick={handleBeginTest}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
                >
                  Begin Test
                </button>
              ) : (
                <div className="text-center">
                  <button
                    disabled
                    className="bg-gray-400 text-white font-bold py-3 px-8 rounded-lg cursor-not-allowed shadow-md"
                  >
                    No Attempts Remaining
                  </button>
                  <p className="text-red-600 text-sm mt-2">
                    You have used all your attempts for this test.
                  </p>
                </div>
              )}
              
              <button
                onClick={() => router.push("/trainee-dashboard")}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveTest;
