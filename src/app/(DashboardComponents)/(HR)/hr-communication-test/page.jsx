'use client';

import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { useToast } from "@/app/component/customtoast/page";
import axios from "axios";

// Import the clock image - make sure to place clock-test.webp in public/assets/
// import Clock from "../../assets/clock-test.webp";

const HRCommunicationTest = () => {
  const { addToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState("");
  const [remainingTime, setRemainingTime] = useState(600); // 10 minutes for video test
  const [hidden, setHidden] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [testPhase, setTestPhase] = useState("preliminary");
  const [answer, setAnswer] = useState("");
  const [isAnswerSaved, setIsAnswerSaved] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showTestCompletion, setShowTestCompletion] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [activeTest, setActiveTest] = useState("video"); // 'video' or 'written'
  const playbackVideoRef = useRef(null);
  const timerRef = useRef(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localUserData, setLocalUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const isFollowUp = testPhase === "followup";

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const userData = JSON.parse(localStorage.getItem("userData") || 'null');
    if (userData) {
      setLocalUserData(userData);
      setAccessToken(userData.access_token);
    }

    // Get testPhase from localStorage if available
    const savedTestPhase = localStorage.getItem("testPhase");
    if (savedTestPhase) {
      setTestPhase(savedTestPhase);
    }

    return () => {
      clearInterval(timerRef.current);
      cleanupMediaStream();
    };
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchInterviews();
    }
  }, [accessToken]);

  useEffect(() => {
    if (isTestStarted && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTestStarted, remainingTime]);

  const cleanupMediaStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleTimeUp = async () => {
    if (activeTest === "video" && isCameraOn) {
      stopRecording();
      addToast(
        "Time's up! Your recording has been automatically stopped.",
        "info"
      );

      try {
        setIsUploading(true);
        const uploadSuccess = await uploadVideo();
        setIsUploading(false);

        if (uploadSuccess) {
          addToast("Video uploaded successfully!", "success");

          Swal.fire({
            title: "Video Test Completed",
            text: "Your video has been uploaded successfully. Click Start to begin the Written Test.",
            icon: "success",
            confirmButtonText: "Start Test 2",
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              setActiveTest("written");
              setRemainingTime(300); // 5 minutes for written test
              setIsTestStarted(true); // Start timer for written test
            }
          });
        }
      } catch (error) {
        setIsUploading(false);
        addToast("Failed to upload video automatically", "error");
      }
    } else if (activeTest === "written" && answer) {
      addToast(
        "Time's up! Your answer will be automatically submitted.",
        "info"
      );
      await handleAnswerSubmit();
    }
  };

  const fetchInterviews = async () => {
    if (!accessToken) {
      console.error("No access token found in localStorage.");
      addToast("Please log in to access questions.", "error");
      return false;
    }

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
          return true;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.Interviews)) {
        throw new Error("Unexpected response format or no questions found");
      }
      setInterviews(data.Interviews);
      if (selectedInterview) {
        const find = data.Interviews.find(
          (inter) => inter.hresultID === selectedInterview.hresultID
        );
        if (find) {
          setSelectedInterview(find);
        }
      }

      return true;
    } catch (error) {
      console.error("Fetch Interviews Error:", error);
      addToast("Failed to fetch interviews", "error");
      return false;
    }
  };

  const startRecording = async () => {
    setIsTestStarted(true);
    setRemainingTime(600); // Reset to 10 minutes for video test
    setRecordedChunks([]);
    setPreviewURL(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewURL(url);
        setRecordedChunks(chunks);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          stopRecording();
        }
      }, 600000);
    } catch (error) {
      addToast("Error accessing camera/microphone: " + error.message, "error");
      setIsCameraOn(false);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanupMediaStream();
    setIsCameraOn(false);
    setIsRecording(false);
    setIsTestStarted(false);
  };

  const uploadVideo = async () => {
    if (recordedChunks.length === 0) {
      addToast("No video recorded to upload", "error");
      return false;
    }

    try {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const formData = new FormData();
      formData.append("files", blob, "recording.webm");

      const response = await axios.post(
        "https://www.margda.in/api/upload_file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 300000,
        }
      );

      if (response.status === 200) {
        const videoUrl = response.data.fileUrls[0];
        const response2 = await fetch(
          "https://www.margda.in/api/hr-interview/interview/save-video-url",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              videoUrl: videoUrl,
              hresultID: selectedInterview.hresultID,
            }),
          }
        );

        const data = await response2.json();
        if (response2.ok) {
          await fetchInterviews();
          return true;
        } else {
          addToast(data.message, "error");
          return false;
        }
      }
      return false;
    } catch (err) {
      console.error(err);
      addToast("An error occurred during upload", "error");
      return false;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  const handleAnswerSubmit = async () => {
    if (!answer) {
      return addToast("Enter your answer", "error");
    }
    try {
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/save-written-answer",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hresultID: selectedInterview.hresultID,
            written_ans: answer,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        fetchInterviews();
        setIsTestStarted(false);
        setHasSubmitted(true);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Submit Answer Error:", error);
      addToast("Unable to submit, try again later", "error");
    }
  };

  const handleInterviewChange = (e) => {
    const filter = interviews.filter(
      (item) => item.hresultID === parseInt(e.target.value)
    );
    if (filter.length > 0) {
      setSelectedInterview(filter[0]);
      setActiveTest(filter[0].video_url ? "written" : "video");
      setRemainingTime(filter[0].video_url ? 300 : 600); // 5 min for written, 10 min for video
      setIsTestStarted(false);
      setAnswer("");
      setPreviewURL(null);
      setRecordedChunks([]);
    } else {
      setSelectedInterview("");
    }
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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Communication Test
          </h1>
          
          {/* Interview Selection */}
          <div className="bg-white rounded-xl border-2 border-gray-300 shadow-md p-6 mb-8">
            <div className="mb-4">
              <label htmlFor="interview" className="block text-sm font-medium text-gray-700 mb-2">
                Select Interview
              </label>
              <select
                name="interview"
                value={selectedInterview ? selectedInterview.hresultID : ""}
                onChange={handleInterviewChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                id="interview"
              >
                <option value="">Select an interview...</option>
                {interviews.map((inter) => (
                  <option value={inter.hresultID} key={inter.hresultID}>
                    {inter.postName} ({inter.fieldName})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedInterview && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-2">Selected Interview:</h3>
                <p className="text-gray-700">
                  <span className="font-semibold">Position:</span> {selectedInterview.postName}<br />
                  <span className="font-semibold">Field:</span> {selectedInterview.fieldName}
                </p>
              </div>
            )}
          </div>

          {selectedInterview ? (
            <div className="space-y-8">
              {/* Video Test Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className={`flex items-center justify-between p-6 ${selectedInterview.video_url ? 'bg-green-100 text-gray-800' : 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'}`}>
                  <div>
                    <h2 className="text-2xl font-semibold">Video Communication Test</h2>
                    <p className="text-sm opacity-90 mt-1">
                      Record a 10-minute video response
                    </p>
                  </div>
                  {activeTest === "video" && isTestStarted && (
                    <div className="relative">
                      {/* Replace with Next.js Image component */}
                      <div className="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <p className="absolute top-[45%] left-1/2 transform -translate-x-1/2 font-mono text-xl font-bold text-white">
                        {formatTime(remainingTime)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {selectedInterview.video_url ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Video Submitted</h3>
                      <p className="text-gray-600">Your video response has been successfully submitted.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>Ensure good lighting and clear audio</li>
                          <li>Dress professionally</li>
                          <li>Speak clearly and confidently</li>
                          <li>You&apos;ll have 10 minutes to complete your response</li>
                        </ul>
                      </div>

                      {previewURL && (
                        <div className="mb-6">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Your Recording:</h4>
                          <video
                            src={previewURL}
                            controls
                            className="w-full max-w-lg border border-gray-300 rounded-lg shadow-sm"
                            ref={playbackVideoRef}
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={startRecording}
                          disabled={isRecording || isUploading}
                          className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
                            isRecording 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Recording...
                            </>
                          ) : previewURL ? (
                            'Record Again'
                          ) : (
                            'Start Recording'
                          )}
                        </button>

                        {previewURL && (
                          <button
                            onClick={uploadVideo}
                            disabled={isUploading}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
                              isUploading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              'Upload Video'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Written Test Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className={`flex items-center justify-between p-6 ${selectedInterview.written_ans ? 'bg-green-100 text-gray-800' : 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'}`}>
                  <div>
                    <h2 className="text-2xl font-semibold">Written Communication Test</h2>
                    <p className="text-sm opacity-90 mt-1">
                      Provide a written response (5 minutes)
                    </p>
                  </div>
                  {activeTest === "written" && isTestStarted && (
                    <div className="relative">
                      {/* Replace with Next.js Image component */}
                      <div className="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <p className="absolute top-[45%] left-1/2 transform -translate-x-1/2 font-mono text-xl font-bold text-white">
                        {formatTime(remainingTime)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {selectedInterview.written_ans ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Answer Submitted</h3>
                      <p className="text-gray-600">Your written response has been successfully submitted.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Question:</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-800">
                            {selectedInterview.topic ||
                              "Attrition can significantly impact organizational stability. Based on your previous response, provide a strategy to reduce attrition from the perspective of an HR manager."}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Response:
                        </label>
                        <textarea
                          id="answer"
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          disabled={activeTest !== "written"}
                          placeholder="Type your response here..."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleAnswerSubmit}
                          disabled={!answer || activeTest !== "written"}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            !answer || activeTest !== "written"
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-300 rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto w-48 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Selected</h3>
              <p className="text-gray-600">Please select an interview from the dropdown above to begin your communication assessment.</p>
            </div>
          )}
        </div>
      </main>

      {/* Camera Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ${
          isCameraOn ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden transform transition-all duration-300">
          <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">Recording in Progress</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Recording</span>
              </div>
              <div className="font-mono text-lg bg-black bg-opacity-30 px-3 py-1 rounded">
                {formatTime(remainingTime)}
              </div>
            </div>
          </div>
          
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-auto max-h-[70vh] mx-auto"
            ></video>
          </div>
          
          <div className="p-4 bg-gray-100 flex justify-center">
            <button
              onClick={stopRecording}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              Stop Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRCommunicationTest;
