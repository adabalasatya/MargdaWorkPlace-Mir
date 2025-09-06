'use client';

import React, { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "react-select";

const AskQuestions = () => {
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [positions, setPositions] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [questions, setQuestions] = useState([]);
  const [resultID, setResultID] = useState("");
  const [remark, setRemark] = useState("");
  const [selected, setSelected] = useState(false);
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
    // Get resultID from URL params or sessionStorage
    const urlResultID = searchParams.get('resultID');
    const sessionResultID = typeof window !== 'undefined' 
      ? sessionStorage.getItem('hrResultID') 
      : null;
    
    const resultIdToUse = urlResultID || sessionResultID;
    
    if (resultIdToUse && accessToken) {
      setResultID(resultIdToUse);
      fetchQuestions(resultIdToUse);
      fetchPositions();
    } else if (accessToken) {
      // Redirect if no resultID is found
      router.push("/hr-take-test");
    }
  }, [accessToken, searchParams, router]);

  const fetchQuestions = async (resultID) => {
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      return false;
    }

    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/get-questions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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
      if (!data.success || !Array.isArray(data.Questions)) {
        throw new Error("Unexpected response format or no questions found");
      }
      
      const questions = data.Questions.map((ques) => ({
        ...ques,
        asked: false,
        score: null,
      }));

      fetchAskedQuestions(resultID, questions);

      return true;
    } catch (error) {
      console.error("Fetch Questions Error:", error);
      let errorMessage = "Failed to fetch questions: " + error.message;
      if (error.message.includes("401")) {
        errorMessage = "Unauthorized. Please check your access token.";
      }
      addToast(errorMessage, "error");
      setQuestions([]);
      return false;
    }
  };

  const fetchPositions = async () => {
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      return false;
    }

    try {
      const response = await fetch(
        "https://www.margda.in/api/master/position/get-positions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        const transform = (data.data || []).map((item) => ({
          ...item,
          label: item.position,
          value: item.postID,
        }));
        setPositions(transform);
      }
    } catch (error) {
      console.error("Fetch Positions Error:", error);
      addToast("Failed to fetch positions", "error");
    }
  };

  const fetchAskedQuestions = async (resultID, questions) => {
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      return false;
    }

    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/get-asked-questions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hresultID: resultID }),
        }
      );
      if (!response.ok) {
        setQuestions(questions);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const askedQues = data.Questions || [];
      const updatedQuestions = questions.map((ques) => {
        const find = askedQues.find(
          (asked) => asked.hrquestID === ques.hrquestID
        );
        if (find) {
          return {
            ...ques,
            asked: true,
            score: find.score,
          };
        }
        return ques;
      });
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Fetch Asked Questions Error:", error);
    }
  };

  const handleAskQuestion = async (id, score) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/ask-question",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hrquestID: id,
            hresultID: resultID,
            score: score,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        fetchQuestions(resultID);
      } else {
        addToast(data.message || "Failed to ask question", "error");
      }
    } catch (error) {
      console.error("Ask Question Error:", error);
      addToast("Unable to ask question, try again later", "error");
    }
  };

  const resetAsk = async (id) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/delete-asked-question",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hrquestID: id,
            hresultID: resultID,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        fetchQuestions(resultID);
      } else {
        addToast(data.message || "Failed to reset question", "error");
      }
    } catch (error) {
      console.error("Reset Ask Error:", error);
      addToast("Unable to reset question, try again later", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/submit-result",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hresultID: resultID,
            remarks: remark,
            selected: Boolean(selected),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        // Clear session data after successful submission
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('hrResultID');
        }
        router.push("/lead");
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Submit Result Error:", error);
      addToast("Unable to submit result, try again later", "error");
    }
  };

  const filteredData = questions.filter((ques) => {
    const matchPost = selectedPost ? ques.postID === selectedPost.postID : true;
    return matchPost;
  });

  const handlePostChange = (option) => {
    setSelectedPost(option || "");
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
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-2 w-full">
        <div className="w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-300">
            <h5 className="bg-custom-purple text-white text-center p-8 text-3xl font-bold tracking-tight">
              HR Interview Questions
            </h5>
            <div className="p-6 md:p-10">
              <div className="p-6 md:p-8 rounded-2xl border border-blue-300 shadow-sm mb-10">
                <div>
                  <Select
                    options={positions}
                    onChange={handlePostChange}
                    value={selectedPost}
                    placeholder="Select Post"
                    className="w-full my-1 border"
                    isClearable
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  />
                </div>
                {selectedPost ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-gray-300 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-custom-purple text-white text-left">
                          <th className="px-4 py-3 font-semibold w-16">
                            S_No.
                          </th>
                          <th className="px-4 py-3 font-semibold">Question</th>
                          <th className="px-4 py-3 font-semibold w-24 text-center">
                            Action
                          </th>
                          <th className="px-4 py-3 font-semibold w-36 text-center">
                            Reset
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((question, index) => (
                            <tr
                              key={question.hrquestID}
                              className="border-b hover:bg-gray-100 transition-colors duration-200"
                            >
                              <td className="px-4 py-3 align-middle font-medium text-gray-700">
                                {index + 1}.
                              </td>
                              <td className="px-4 py-3 align-middle text-gray-800 break-words">
                                {question.question}
                              </td>
                              <td className="px-4 py-3 align-middle w-24 text-center">
                                {!question.asked ? (
                                  <button
                                    onClick={() => {
                                      console.log(question);
                                      handleAskQuestion(
                                        question.hrquestID,
                                        null
                                      );
                                    }}
                                    className="w-full bg-purple-700 text-white hover:bg-custom-purple transition-colors duration-200 cursor-pointer py-2 px-3 rounded-lg text-sm font-medium text-center block shadow-md"
                                  >
                                    Ask
                                  </button>
                                ) : (
                                  <select
                                    className="w-max p-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={String(question.score) || ""}
                                    onChange={(e) => {
                                      handleAskQuestion(
                                        question.hrquestID,
                                        e.target.value
                                      );
                                    }}
                                  >
                                    <option value="">Score</option>
                                    {[...Array(11)].map((_, i) => (
                                      <option key={i} value={String(i)}>
                                        {i}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="px-4 py-3 align-middle w-36 text-center">
                                <button
                                  onClick={() => resetAsk(question.hrquestID)}
                                  className="w-full bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200 cursor-pointer py-2 px-3 rounded-lg text-sm font-medium text-center block shadow-md"
                                >
                                  Reset Ask
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-4 py-3 text-center text-xl text-gray-500"
                            >
                              Question not available. Contact admin.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xl flex justify-center mt-3">
                    Select a post
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-center w-full">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-l-lg border border-r-0 border-gray-300 flex-shrink-0">
                      <FaPencilAlt className="text-gray-600 text-lg" />
                    </span>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-r-lg bg-white text-gray-700 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      type="text"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="Enter your remarks here..."
                    />
                  </div>
                  <div className="w-full">
                    <label className="w-max text-xl p-3 rounded-lg bg-white text-gray-700 flex gap-2 items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        className="w-4 h-4 accent-purple-600"
                        onChange={(e) => setSelected(e.target.checked)}
                      />
                      Selected
                    </label>
                  </div>
                </div>
              </div>
              {questions.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-custom-purple to-purple-700 text-white px-8 py-3 rounded-lg hover:from-custom-purple hover:to-purple-800 transition-all duration-200 text-lg font-semibold shadow-lg"
                  >
                    SUBMIT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AskQuestions;
