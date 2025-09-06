"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/app/component/customtoast/page";

const HRInteraction = () => {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if running on client side before accessing localStorage
    if (typeof window !== "undefined") {
      fetchInterviews();
    }
  }, []);

  useEffect(() => {
    let interval;
    
    if (selectedInterview && typeof window !== "undefined") {
      interval = setInterval(() => {
        fetchQuestions(selectedInterview);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedInterview]);

  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      const localUserData = JSON.parse(localStorage.getItem("userData") || "null");
      return localUserData ? localUserData.access_token : null;
    }
    return null;
  };

  const fetchInterviews = async () => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access interviews.", "error");
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/get-user-interviews",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setLoading(false);
          return true;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.Interviews)) {
        throw new Error("Unexpected response format or no interviews found");
      }
      
      setInterviews(data.Interviews);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Fetch Interviews Error:", error);
      setLoading(false);
      addToast("Failed to fetch interviews", "error");
      return false;
    }
  };

  const fetchQuestions = async (hresultID) => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      return false;
    }

    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/get_user_asked_questions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hresultID }),
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
      console.log(data);
      
      if (!data.success || !Array.isArray(data.Questions)) {
        throw new Error("Unexpected response format or no questions found");
      }
      
      setInterviewStarted(true);
      setQuestions(data.Questions);
      return true;
    } catch (error) {
      console.error("Fetch Questions Error:", error);
      setQuestions([]);
      return false;
    }
  };

  const handleInterviewSelection = (value) => {
    setSelectedInterview(value);
    // Reset states when changing interview
    setInterviewStarted(false);
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 w-full max-w-7xl">
        <h1 className="text-2xl justify-center text-center font-bold text-gray-800 mb-6">
          HR Interaction
        </h1>
        
        <div className="w-full flex flex-col justify-center items-start gap-6">
          <div className="w-full bg-white border-2 border-gray-300 rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6 w-full">
              {/* Left Side - Interview Selection and Questions */}
              <div className="flex-1">
                <div className="mb-6">
                  <label 
                    htmlFor="interview" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Interview
                  </label>
                  <select
                    name="interview"
                    value={selectedInterview || ""}
                    onChange={(e) => handleInterviewSelection(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    id="interview"
                    disabled={loading}
                  >
                    <option value="">
                      {loading ? "Loading interviews..." : "Select an interview"}
                    </option>
                    {interviews.length > 0 &&
                      interviews.map((inter) => (
                        <option value={inter.hresultID} key={inter.hresultID}>
                          {inter.postName} ({inter.fieldName})
                        </option>
                      ))}
                  </select>
                </div>

                {!selectedInterview ? (
                  <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                    Please select an interview to view details
                  </div>
                ) : interviewStarted ? (
                  <div className="bg-white rounded-xl shadow border border-gray-200 p-6 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Current Interview Question
                      </h2>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Live
                      </span>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      {questions.length > 0 ? (
                        <div className="space-y-4">
                          <div className="text-lg font-medium text-blue-800">
                            {questions[0].question}
                          </div>
                          <div className="text-sm text-gray-600">
                            {questions.length > 1 && (
                              <p>+ {questions.length - 1} more question(s)</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          No questions received yet
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      Interview Not Started
                    </h3>
                    <p className="text-yellow-700">
                      The HR has not started asking questions yet. Please wait...
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side - Video Call Section (commented out) */}
              {/* All the video call JSX remains the same as it's already commented out */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRInteraction;
