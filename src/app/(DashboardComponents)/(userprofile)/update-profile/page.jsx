"use client";

import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaVenusMars,
  FaEnvelope,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCamera,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useToast } from "@/app/component/customtoast/page";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CustomImage = ({ src, alt, className, width, height, ...props }) => {
  const isExternalUrl = src?.startsWith("http");
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: `${width}px`, height: `${height}px` }}
        {...props}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

const MyProfile = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState({
    pic_url: "",
    name: "",
    gender: "",
    mobile: "",
    email: "",
    dob: "",
    country_code: "",
    stateID: "",
    districtID: "",
    pincode: "",
    place: "",
    languages: [],
    referID: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || "null");
    if (!storedUserData || !storedUserData.userID) {
      return router.push("/login");
    } else {
      setUserData(storedUserData);
      setFormValues((prev) => ({
        ...prev,
        pic_url: storedUserData.pic || "",
        name: storedUserData.name || "",
        gender: storedUserData.gender || "",
        mobile: String(storedUserData.mobile || ""),
        email: storedUserData.email || "",
        dob: formatDateToIndianISO(storedUserData.dob) || "",
        country_code: storedUserData.country_code || "",
        stateID: storedUserData.stateID || "",
        districtID: storedUserData.districtID || "",
        pincode: storedUserData.pincode || "",
        place: storedUserData.place || "",
        languages: storedUserData.languages ? JSON.parse(storedUserData.languages) : [],
        referID: storedUserData.referID || "",
      }));
    }
  }, [router]);

  const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const handleInputChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]:
        name === "languages"
          ? value
          : typeof value === "string"
          ? value
          : String(value || ""),
    });
  };

  const handleProfilePicChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues((prev) => ({ ...prev, pic_url: reader.result }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  function formatDateToIndianISO(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offsetDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    const year = offsetDate.getUTCFullYear();
    const month = String(offsetDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(offsetDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formValues.pic_url) newErrors.pic_url = "Please upload a profile picture.";
      if (!formValues.name) newErrors.name = "Please input your Name.";
      else if (formValues.name.length < 2) newErrors.name = "Name must be at least 2 characters long.";
      if (!formValues.gender) newErrors.gender = "Please select your Gender.";
    } else if (step === 2) {
      if (!formValues.mobile) newErrors.mobile = "Please input your Mobile Number.";
      if (!formValues.email) newErrors.email = "Please input your Email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email))
        newErrors.email = "Please enter a valid email address.";
      if (!formValues.dob) newErrors.dob = "Please input your Date of Birth.";
    }
    return newErrors;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = validateStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = validateStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      } else if (formValues.pic_url) {
        formData.append("pic_url", formValues.pic_url);
      }

      formData.append("userID", userData.userID);
      formData.append("name", formValues.name);
      formData.append("gender", formValues.gender);
      formData.append("DOB", formValues.dob);
      formData.append("email", formValues.email);
      formData.append("mobile", formValues.mobile);
      formData.append("languages", JSON.stringify(formValues.languages));

      const response = await fetch(
        "https://www.margda.in/miraj/work/profile/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: formData,
        }
      );

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUserData = {
        ...userData,
        pic: formValues.pic_url,
        name: formValues.name,
        gender: formValues.gender,
        mobile: formValues.mobile,
        email: formValues.email,
        dob: formValues.dob,
        languages: JSON.stringify(formValues.languages),
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        addToast("Profile Updated Successfully", "success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (typeof window !== "undefined") {
        addToast("Failed to update profile", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen  py-6 px-4 sm:px-6 lg:px-8">
      {/* Card */}
      <div className="flex items-center justify-center w-full">
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-md border border-gray-100 p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md mr-3">
              <FaUser className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
             Update My Profile
            </h2>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Complete the steps below to update profile details
          </p>

          {/* Progress */}
          <div className="w-full max-w-xs mx-auto">
            <div className="flex items-center justify-between">
              {[1, 2].map((n) => (
                <React.Fragment key={n}>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= n
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {n}
                  </div>
                  {n < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        step > n ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form
            onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
            className="space-y-6"
          >
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Profile Pic */}
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="profilePic"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Profile Picture
                  </label>
                  <label
                    htmlFor="profilePic"
                    className="relative cursor-pointer flex flex-col items-center"
                  >
                    <div className="relative">
                      <CustomImage
                        src={
                          formValues.pic_url ||
                          "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_1280.png"
                        }
                        alt="Profile"
                        width={112}
                        height={112}
                        className="h-28 w-28 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-md">
                        <FaCamera className="text-sm" />
                      </span>
                    </div>
                  </label>
                  <input
                    type="file"
                    onChange={handleProfilePicChange}
                    accept="image/*"
                    id="profilePic"
                    className="hidden"
                  />
                  {errors.pic_url && (
                    <p className="text-red-500 text-xs text-center mt-2">
                      {errors.pic_url}
                    </p>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formValues.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Gender
                    </label>
                    <div className="relative">
                      <FaVenusMars className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select
                        id="gender"
                        value={formValues.gender || ""}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <PhoneInput
                      country={"in"}
                      value={String(formValues.mobile || "")}
                      onChange={(value) => handleInputChange("mobile", value)}
                      placeholder="Enter mobile number"
                      inputStyle={{
                        width: "100%",
                        paddingLeft: "3rem",
                        paddingRight: "1rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        fontSize: "1rem",
                        color: "#111827",
                        backgroundColor: "white",
                        height: "48px",
                      }}
                      buttonStyle={{
                        border: "2px solid #e5e7eb",
                        borderRight: "0",
                        borderRadius: "0.75rem 0 0 0.75rem",
                        backgroundColor: "white",
                      }}
                      dropdownStyle={{
                        borderRadius: "0.5rem",
                        zIndex: 50,
                      }}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formValues.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      id="dob"
                      type="date"
                      value={formValues.dob || ""}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between gap-3">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold focus:outline-none transition-all duration-200 hover:bg-gray-200"
                >
                  <FaArrowLeft className="mr-2" /> Previous
                </motion.button>
              )}
              {step < 2 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="flex items-center justify-center px-6 py-3 ml-auto w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold focus:outline-none transition-all duration-200 hover:from-blue-600 hover:to-indigo-700"
                >
                  Next <FaArrowRight className="ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg focus:outline-none transition-all duration-200 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:from-blue-600 hover:to-indigo-700"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Complete Profile"}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfile;
