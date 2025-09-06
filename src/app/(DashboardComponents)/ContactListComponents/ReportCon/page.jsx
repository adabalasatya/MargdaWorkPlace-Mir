"use client"; // needed if you are using Next.js App Router (app directory)

import { useEffect, useState } from "react";
// import { useToast } from "../../CustomToast/ToastContext";

export default function ReportCon({ setShow, userData }) {
  //   const { addToast } = useToast();
  const [reportData, setReportData] = useState(null);
  const [allLeads, setAllLeads] = useState(0);
  const [unFollowLeads, setUnFollowLeads] = useState(0);
  const [mostLateLead, setMostLateLead] = useState(null);
  const [userLocalData, setUserLocalData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // ✅ handle localStorage safely (only client-side)
  useEffect(() => {
    const data = localStorage.getItem("userData");
    if (data) {
      const parsed = JSON.parse(data);
      setUserLocalData(parsed);
      setAccessToken(parsed.access_token);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchReport();
    }
  }, [accessToken]);

  useEffect(() => {
    if (!userData) return;

    setUnFollowLeads(userData.filter((item) => !item.log).length);
    setAllLeads(userData.length);
    let mostLateItem = null;
    let latestDate = null;

    userData.forEach((item) => {
      if (item.log) {
        const lastDate = new Date(item.log.fdate);
        if (!latestDate || lastDate < latestDate) {
          latestDate = lastDate;
          mostLateItem = item;
        }
      }
    });

    setMostLateLead(mostLateItem);
  }, [userData]);

  const fetchReport = async () => {
    try {
      const response = await fetch("/api/leads-report", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReportData(data);
      }
    } catch (error) {
      console.error(error);
      //   addToast("Unknown Error", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {userLocalData?.user_data?.name} - Leads Report
          </h2>
          <button
            onClick={() => setShow(false)}
            className="text-white hover:bg-orange-600 rounded px-2 py-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800">{allLeads}</h3>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-orange-600">{unFollowLeads}</h3>
              <p className="text-sm text-gray-600">Unfollow Leads</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-red-600">
                {userData ? userData.filter((item) => item.typeID === 1).length : 0}
              </h3>
              <p className="text-sm text-gray-600">Hot Leads</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-green-600">
                {allLeads > 0 ? Math.round(((allLeads - unFollowLeads)/allLeads)*100) : 0}%
              </h3>
              <p className="text-sm text-gray-600">Follow-up Rate</p>
            </div>
          </div>

          {/* Most Late Lead */}
          {mostLateLead && (
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Most Late Follow-up Required
              </h3>
              <div className="text-sm text-gray-700">
                <p className="font-medium">{mostLateLead.name}</p>
                <p className="text-gray-600">{mostLateLead.email}</p>
                {mostLateLead.log?.fdate && (
                  <p className="text-yellow-700 mt-1">
                    Last contact: {new Date(mostLateLead.log.fdate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={() => setShow(false)}
            className="bg-orange-600 text-white px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
