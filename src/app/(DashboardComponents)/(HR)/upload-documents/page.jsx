"use client";

import React, { useEffect, useState } from "react";
import { FaUpload, FaFileAlt } from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const DocumentUploadForm = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    photoId: [],
    panCard: [],
    academicCert: [],
    professionalCert: [],
    experienceCert: [],
  });
  const [urls, setUrls] = useState(null);
  const [photoIdType, setPhotoIdType] = useState("adhaar_card");

  useEffect(() => {
    // Check if running on client side before accessing localStorage
    if (typeof window !== "undefined") {
      fetchData();
    }
  }, []);

  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      const localUserData = JSON.parse(localStorage.getItem("userData") || "null");
      return localUserData ? localUserData.access_token : null;
    }
    return null;
  };

  const fetchData = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log("No access token available");
        return;
      }

      const response = await fetch(
        "https://www.margda.in/api/documents/get-urls",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUrls(data.Record);
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("Failed to fetch document URLs", "error");
    }
  };

  const handleChange = (e) => {
    const { name, files } = e.target;
    const fileArray = Array.from(files); // convert FileList to array
    setFormData((prev) => ({ ...prev, [name]: fileArray }));
  };

  const uploadFile = async (files) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const uploadedUrls = [];
      for (const file of files) {
        const uploadFormData = new FormData();
        uploadFormData.append("files", file);

        const response = await fetch("https://www.margda.in/api/upload_file", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: uploadFormData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `File upload failed with status: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        if (data.success && data.fileUrls && data.fileUrls.length > 0) {
          uploadedUrls.push(data.fileUrls[0]);
        } else {
          throw new Error(
            data.message || "Upload failed - No file URL returned"
          );
        }
      }
      return uploadedUrls;
    } catch (error) {
      addToast("File upload failed: " + error.message, "error");
      throw error;
    }
  };

  const handleSubmit = async (type, files) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return addToast("Select File", "error");
    }

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        addToast("Authentication required", "error");
        return;
      }

      const uploadedUrls = await uploadFile(files);
      const response = await fetch(
        "https://www.margda.in/api/documents/save-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            url:
              type === "experience_cert" ||
              type === "professional_cert" ||
              type === "academic_cert"
                ? uploadedUrls
                : uploadedUrls[0],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addToast(data.message, "success");
      await fetchData();
    } catch (error) {
      console.error("Error submitting document:", error);
      addToast("Unable to save file, try again later", "error");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center text-gray-800">
          <FaUpload className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-indigo-600" />
          Upload Documents
        </h2>

        {/* Document Sections */}
        <div className="space-y-6">
          {/* Photo ID Section */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white transition-all duration-200 hover:bg-gray-50 hover:border-indigo-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <FaFileAlt className="w-6 h-6 mr-3 text-indigo-500" />
              <span className="text-gray-700 font-medium text-lg">
                Photo Id
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex items-center justify-center flex-wrap gap-3">
                {urls && (
                  <div className="flex flex-col">
                    {urls.adhaar_card && (
                      <a
                        href={urls.adhaar_card}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Adhaar Card
                      </a>
                    )}
                    {urls.driving_licence && (
                      <a
                        href={urls.driving_licence}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Driving Licence
                      </a>
                    )}
                    {urls.voter_card && (
                      <a
                        href={urls.voter_card}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Voter Card
                      </a>
                    )}
                  </div>
                )}
                <label htmlFor="adhaarFile" className="flex items-center">
                  <input
                    type="radio"
                    name="photoId"
                    value="adhaar_card"
                    checked={photoIdType === "adhaar_card"}
                    id="adhaarFile"
                    onChange={(e) => setPhotoIdType(e.target.value)}
                    className="mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-150"
                  />
                  Adhaar
                </label>
                <label htmlFor="drivingLicence" className="flex items-center">
                  <input
                    type="radio"
                    name="photoId"
                    value="driving_licence"
                    checked={photoIdType === "driving_licence"}
                    id="drivingLicence"
                    onChange={(e) => setPhotoIdType(e.target.value)}
                    className="mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-150"
                  />
                  Driving Licence
                </label>
                <label htmlFor="voterCard" className="flex items-center">
                  <input
                    type="radio"
                    name="photoId"
                    value="voter_card"
                    checked={photoIdType === "voter_card"}
                    id="voterCard"
                    onChange={(e) => setPhotoIdType(e.target.value)}
                    className="mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-150"
                  />
                  Voter Card
                </label>
              </div>

              <label className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all duration-150">
                {formData.photoId && formData.photoId.length > 0
                  ? "Change File"
                  : "Choose File"}
                <input
                  type="file"
                  name="photoId"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {formData.photoId && formData.photoId.length > 0 && (
                <div>{formData.photoId[0].name}</div>
              )}

              <button
                onClick={() => handleSubmit(photoIdType, formData.photoId)}
                className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 focus:ring-4 focus:ring-indigo-300"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Pan Card Section */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white transition-all duration-200 hover:bg-gray-50 hover:border-indigo-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <FaFileAlt className="w-6 h-6 mr-3 text-indigo-500" />
              <span className="text-gray-700 font-medium text-lg">
                Pan Card
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              {urls && (
                <div className="flex flex-col">
                  {urls.pan_card && (
                    <a
                      href={urls.pan_card}
                      className="text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pan Card
                    </a>
                  )}
                </div>
              )}
              <label className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all duration-150">
                {formData.panCard && formData.panCard.length > 0
                  ? "Change File"
                  : "Choose File"}
                <input
                  type="file"
                  onChange={handleChange}
                  name="panCard"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {formData.panCard && formData.panCard.length > 0 && (
                <div>{formData.panCard[0].name}</div>
              )}
              <button
                onClick={() => handleSubmit("pan_card", formData.panCard)}
                className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 focus:ring-4 focus:ring-indigo-300"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Academic Certificate Section */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white transition-all duration-200 hover:bg-gray-50 hover:border-indigo-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <FaFileAlt className="w-6 h-6 mr-3 text-indigo-500" />
              <span className="text-gray-700 font-medium text-lg">
                Highest Academic Certificate (Multi)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              {urls && (
                <div className="flex flex-col">
                  {urls.academic_cert &&
                    urls.academic_cert.length > 0 &&
                    urls.academic_cert.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {i + 1} Academic Certificate
                      </a>
                    ))}
                </div>
              )}
              <label className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all duration-150">
                {formData.academicCert && formData.academicCert.length > 0
                  ? "Change Files"
                  : "Choose Files"}
                <input
                  type="file"
                  multiple
                  name="academicCert"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>

              <div className="flex flex-col">
                {formData.academicCert &&
                  formData.academicCert.length > 0 &&
                  formData.academicCert.map((cert, i) => (
                    <div key={i}>{cert.name}</div>
                  ))}
              </div>
              <button
                onClick={() =>
                  handleSubmit("academic_cert", formData.academicCert)
                }
                className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 focus:ring-4 focus:ring-indigo-300"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Professional Certificate Section */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white transition-all duration-200 hover:bg-gray-50 hover:border-indigo-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <FaFileAlt className="w-6 h-6 mr-3 text-indigo-500" />
              <span className="text-gray-700 font-medium text-lg">
                Professional Certificate (Multi)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              {urls && (
                <div className="flex flex-col">
                  {urls.professional_cert &&
                    urls.professional_cert.length > 0 &&
                    urls.professional_cert.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {i + 1} Professional Certificate
                      </a>
                    ))}
                </div>
              )}
              <label className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all duration-150">
                {formData.professionalCert &&
                formData.professionalCert.length > 0
                  ? "Change Files"
                  : "Choose Files"}
                <input
                  type="file"
                  multiple
                  onChange={handleChange}
                  name="professionalCert"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <div className="flex flex-col">
                {formData.professionalCert &&
                  formData.professionalCert.length > 0 &&
                  formData.professionalCert.map((cert, i) => (
                    <div key={i}>{cert.name}</div>
                  ))}
              </div>
              <button
                onClick={() =>
                  handleSubmit("professional_cert", formData.professionalCert)
                }
                className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 focus:ring-4 focus:ring-indigo-300"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Experience Certificate Section */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white transition-all duration-200 hover:bg-gray-50 hover:border-indigo-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <FaFileAlt className="w-6 h-6 mr-3 text-indigo-500" />
              <span className="text-gray-700 font-medium text-lg">
                Last Experience Certificate (Multi)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              {urls && (
                <div className="flex flex-col">
                  {urls.experience_cert &&
                    urls.experience_cert.length > 0 &&
                    urls.experience_cert.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {i + 1} Experience Certificate
                      </a>
                    ))}
                </div>
              )}
              <label className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all duration-150">
                {formData.experienceCert && formData.experienceCert.length > 0
                  ? "Change Files"
                  : "Choose Files"}
                <input
                  type="file"
                  multiple
                  onChange={handleChange}
                  name="experienceCert"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>

              <div className="flex flex-col">
                {formData.experienceCert &&
                  formData.experienceCert.length > 0 &&
                  formData.experienceCert.map((cert, i) => (
                    <div key={i}>{cert.name}</div>
                  ))}
              </div>
              <button
                onClick={() =>
                  handleSubmit("experience_cert", formData.experienceCert)
                }
                className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 focus:ring-4 focus:ring-indigo-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
