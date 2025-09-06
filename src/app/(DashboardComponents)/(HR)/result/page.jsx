"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaUserGraduate,
  FaList,
  FaCalendar,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const ModuleResult = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonName, setLessonName] = useState("");
  const [attempted, setAttempted] = useState(0);
  const [corrected, setCorrected] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [studyInfo, setStudyInfo] = useState(null);

  // Get user data from localStorage (client-side only)
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Access localStorage only on client side
    if (typeof window !== "undefined") {
      const localUserData = JSON.parse(localStorage.getItem("userData"));
      setAccessToken(localUserData ? localUserData.access_token : null);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    if (typeof window !== "undefined") {
      const lessonID = sessionStorage.getItem("lessonID");
      const lessonName = sessionStorage.getItem("lessonName");
      const testMinutes = sessionStorage.getItem("test_minutes");
      const studyID = sessionStorage.getItem("studyID");
      const resultID = searchParams.get("resultID");

      if (
        lessonID &&
        !isNaN(lessonID) &&
        testMinutes &&
        !isNaN(testMinutes) &&
        resultID &&
        studyID &&
        !isNaN(studyID)
      ) {
        fetchResultData(resultID, lessonID);
        setLessonName(lessonName);
        fetchStudyInfo(studyID, lessonID);
      } else {
        router.push("/trainee-dashboard");
      }
    }
  }, [accessToken, searchParams, router]);

  const fetchResultData = async (resultID, lessonID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/cpp_training/trainee/test/get_result_data_with_result_id",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resultID, lessonID }),
        }
      );
      const data = await response.json();
      if (response.ok && data.data && Array.isArray(data.data)) {
        setAttempted(data.attemptedCount);
        setCorrected(data.correctedCount);
        setAnswers(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
            lessonID,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.Study) {
        setStudyInfo(data.Study);
      } else {
        setStudyInfo(null);
      }
    } catch (error) {
      console.error("Fetch MCQs Error:", error);
      setStudyInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    // Simulate loading delay (e.g., 1 second)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

  const today = () => {
    const now = new Date();
    return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
  };

  // Render loading animation
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="mb-6 relative flex items-center justify-end">
        <h4 className="text-4xl font-extrabold text-gray-800 flex items-center absolute left-1/2 transform -translate-x-1/2">
          <FaUserGraduate className="mr-3 text-blue-600" /> Module Result
        </h4>
        <button
          onClick={() => router.push("/progress-report")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold shadow-md"
        >
          Back
        </button>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-5xl mx-auto border border-gray-300">
        {/* Module Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center text-lg font-semibold text-gray-800">
            <FaList className="mr-3 text-blue-600" /> Module:{" "}
            <span className="ml-2 text-blue-700">{lessonName || "N/A"}</span>
          </div>
          <div className="flex items-center justify-end text-lg font-semibold text-gray-800">
            <FaCalendar className="mr-3 text-blue-600" /> Date:{" "}
            <span className="ml-2 text-blue-700">{today()}</span>
          </div>
        </div>

        {/* Statistics */}
        {studyInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-md bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="flex flex-col items-center">
              <span className="text-gray-700">Total Questions</span>
              <span className="font-bold text-gray-900 text-lg">
                {studyInfo.test_mcq}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-700">Attempted</span>
              <span className="font-bold text-gray-900 text-lg">{attempted}</span>
            </div>
            <div className="flex flex-col items-center text-green-600">
              <span>Right Answers</span>
              <span className="font-bold text-lg">{corrected}</span>
            </div>
            <div className="flex flex-col items-center text-red-600">
              <span>Wrong Answers</span>
              <span className="font-bold text-lg">
                {Number(attempted) - Number(corrected)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-700">Total Marks</span>
              <span className="font-bold text-gray-900 text-lg">
                {studyInfo.marks_total}
              </span>
            </div>
            <div className="flex flex-col items-center text-green-600">
              <span>Marks Correct</span>
              <span className="font-bold text-lg">
                {studyInfo.marks_correct * Number(corrected)}
              </span>
            </div>
            <div className="flex flex-col items-center text-red-600">
              <span>Deducted Marks</span>
              <span className="font-bold text-lg">
                {studyInfo.marks_wrong * Number(attempted - corrected)}
              </span>
            </div>
            <div
              className={`flex flex-col items-center ${
                (studyInfo.marks_correct * Number(corrected) * 100) /
                  studyInfo.marks_total >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              <span>Percentage</span>
              <span className="font-bold text-lg">
                {Math.round(
                  (studyInfo.marks_correct * Number(corrected) * 100) /
                    studyInfo.marks_total
                )}
                %
              </span>
            </div>
          </div>
        )}

        {/* Questions Table */}
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 bg-white">
          <table className="w-full text-center">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide sticky left-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 shadow-sm">
                  Question
                </th>
                {answers.map((_, index) => (
                  <th
                    key={index}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-gray-200"
                  >
                    {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition duration-150">
                <td className="px-3 py-2 font-semibold text-gray-800 text-sm sticky left-0 bg-white border-r border-gray-200 shadow-sm">
                  Answer
                </td>
                {answers.map((answer, index) => (
                  <td key={index} className="px-3 py-2">
                    {answer.isCorrect ? (
                      <FaCheck
                        className="text-green-500 mx-auto transform hover:scale-110 transition duration-150"
                        size={16}
                      />
                    ) : !answer.isCorrect ? (
                      <FaTimes
                        className="text-red-500 mx-auto transform hover:scale-110 transition duration-150"
                        size={16}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50 transition duration-150">
                <td className="px-3 py-2 font-semibold text-gray-800 text-sm sticky left-0 bg-white border-r border-gray-200 shadow-sm">
                  Time (s)
                </td>
                {answers.map((ans, index) => (
                  <td key={index} className="px-3 py-2 text-sm text-gray-700">
                    {ans.ans_seconds}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModuleResult;
