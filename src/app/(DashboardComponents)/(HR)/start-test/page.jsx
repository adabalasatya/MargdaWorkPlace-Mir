'use client';

import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaSearch, FaUser } from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Custom Image Component to handle both external and internal images
const CustomImage = ({ src, alt, className, width, height, ...props }) => {
  const isExternalUrl = src?.startsWith('http');
  
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
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

const StartTest = () => {
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [remark, setRemark] = useState("");
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
    if (accessToken) {
      fetchAllUsersData();
    }
  }, [accessToken]);

  const fetchAllUsersData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/api/margda.org/admin/getallusers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setAllUsers([]);
          addToast("Unauthorized access. Please log in again.", "error");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setAllUsers(result.data || []);
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("Failed to fetch users. Please try again.", "error");
      setAllUsers([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      return addToast("Select User", "error");
    }
    
    try {
      setLoading(true);
      const response = await fetch(
        "https://www.margda.in/api/hr-interview/interview/start-interview",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: selectedUser.userID,
            remarks: remark,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        // Store resultID in sessionStorage for the next page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hrResultID', data.data.hresultID);
        }
        router.push(`/hr-ask-questions?resultID=${data.data.hresultID}`);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Start Test Error:", error);
      addToast("Unable to start test, try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = (e) => {
    const query = e.target.value;
    setSearchUser(query);
    if (query.length >= 5) {
      const filteredUsers = allUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(query.trim().toLowerCase()) ||
          user.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          user.mobile.includes(query.trim())
      );
      setUsers(filteredUsers);
    } else if (query.length === 0) {
      setUsers(allUsers);
    } else {
      setUsers([]);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUser?.userID === user.userID) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
    setSearchUser("");
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
              Start Test
            </h5>
            <div className="p-6 md:p-10">
              <div className="p-6 md:p-8 rounded-2xl border border-blue-300 shadow-sm mb-10">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-700 font-medium">
                    <FaUser className="text-custom-purple text-xl" />
                    <span>Select User</span>
                  </label>
                  <div className="flex items-center text-xl gap-4 bg-white p-2 rounded-lg shadow-md border border-gray-200 w-full">
                    {/* Search Icon and Input */}
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="user"
                        placeholder="Search User (minimum 5 characters)"
                        value={searchUser}
                        onChange={handleSearchUser}
                        className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-sm"
                        required
                      />
                    </div>

                    {/* Selected User Info */}
                    {selectedUser && (
                      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        <span className="whitespace-nowrap">Selected:</span>
                        <span className="font-semibold">
                          {selectedUser.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    {searchUser.length > 0 && searchUser.length < 5 && (
                      <div className="flex flex-row border p-4 mb-2 rounded bg-yellow-100 border-yellow-300 mt-3 items-center text-yellow-800">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Enter at least 5 characters to search
                        </div>
                      </div>
                    )}
                    {users && searchUser.length > 4 && users.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        {users.map((user) => (
                          <div
                            key={user.userID}
                            onClick={() => handleUserSelect(user)}
                            className={`flex flex-row border p-4 mb-2 rounded mt-3 items-center cursor-pointer transition-colors hover:bg-gray-100 ${
                              selectedUser?.userID === user.userID 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'bg-gray-200 border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="associate"
                              id={`user-${user.userID}`}
                              checked={user.userID === selectedUser?.userID}
                              onChange={() => handleUserSelect(user)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="mx-5 w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500">
                              <CustomImage
                                src={
                                  user.pic_url ||
                                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4uQmq5l06DIuhNUDihsvATgceMTbyKNBzT4Rharp2hacekLEJHq9eaKF1LPaT9_iRpA&usqp=CAU"
                                }
                                alt={user.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-5">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-600">{user.email}</div>
                              <div className="text-gray-600">{user.mobile}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchUser.length > 4 ? (
                      <div className="flex flex-row border p-4 mb-2 rounded bg-red-100 border-red-300 mt-3 items-center text-red-800">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          No users found for this email, mobile or name
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

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
                      placeholder="(optional) Remarks..."
                    />
                  </div>
                  <div className="text-center">
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedUser || loading}
                      className={`bg-gradient-to-r from-custom-purple to-purple-700 text-white px-8 py-3 rounded-lg hover:from-custom-purple hover:to-purple-800 transition-all duration-200 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        loading ? 'animate-pulse' : ''
                      }`}
                    >
                      {loading ? 'Starting Test...' : 'Start Test'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartTest;
