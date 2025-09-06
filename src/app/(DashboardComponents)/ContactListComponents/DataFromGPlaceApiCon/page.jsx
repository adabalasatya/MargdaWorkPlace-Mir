"use client";

import { useState } from "react";
import {
  FaGlobe,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaSearch,
  FaTimes,
  FaUser,
  FaUserCog,
  FaSpinner,
} from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const DataFromGPlaceApi = ({ setShow, userID }) => {
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [limit, setLimit] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const { addToast } = useToast();

  const getData = async () => {
    if (!limit) {
      return addToast("Select a limit", "warning");
    }
    if (!query) {
      return addToast("Enter query", "warning");
    } else if (query.length < 5) {
      return addToast("Enter at least 5 letters", "warning");
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/data-extraction/google-map/get-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword: query, limit: Number(limit) }),
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.data &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        setData(data.data);
      } else {
        addToast("Data not found, please enter valid keywords", "error");
        setData([]);
      }
    } catch (error) {
      console.log(error);
      addToast("Error searching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item, index) => {
    if (!item.phone || item.phone === "N/A") {
      return addToast("This data doesn't have a phone number", "error");
    }

    const payload = {
      name: item.name,
      mobile: item.phone,
      address: item.address,
      datatype: "B",
      website: item.website,
      pincode: item.pincode,
      userID: userID,
    };

    setSavingId(index);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/data-extraction/google-map/save-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
      } else {
        addToast(data.message, "warning");
      }
    } catch (error) {
      console.error(error);
      addToast("Error in adding data", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-800  px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                🌍 Google Places Data Search
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Search and extract business data from Google Places
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-white hover:bg-gray-500 hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Results Limit
              </label>
              <select
                name="limit"
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg "
              >
                <option value="">Select</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="80">80</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Query
              </label>
              <div className="relative flex items-center">
                <FaSearch className="absolute left-4 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., restaurants in New York, plumbers in London"
                  className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      getData();
                    }
                  }}
                />
              </div>
            </div>

            <button
              onClick={getData}
              disabled={loading}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
                <p className="text-gray-600">Searching for data...</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <div className="p-6">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Found {data.length} results
                </h3>
                <div className="text-sm text-gray-600">
                  Query: "{query}"
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaUserCog className="text-blue-600 w-4 h-4" />
                            Actions
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaUser className="text-blue-600 w-4 h-4" />
                            Business Name
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaPhone className="text-green-600 w-4 h-4" />
                            Phone
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaMapMarkerAlt className="text-red-600 w-4 h-4" />
                            Address
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaMapMarkerAlt className="text-orange-600 w-4 h-4" />
                            Pincode
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaGlobe className="text-purple-600 w-4 h-4" />
                            Website
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              title="Save to leads"
                              className={`p-2 rounded-lg shadow transition-all ${
                                item.phone && item.phone !== "N/A"
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              onClick={() => handleSave(item, index)}
                              disabled={
                                !item.phone || 
                                item.phone === "N/A" || 
                                savingId === index
                              }
                            >
                              {savingId === index ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                              ) : (
                                <FaSave className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">
                              {item.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`${
                              item.phone && item.phone !== "N/A"
                                ? "text-green-700 font-medium"
                                : "text-gray-400"
                            }`}>
                              {item.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700 text-xs max-w-xs truncate">
                              {item.address || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700">
                              {item.pincode || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.website && item.website !== "N/A" ? (
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 underline text-sm"
                              >
                                Visit
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Results Yet
                </h3>
                <p className="text-gray-600">
                  Enter a search query and click Search to find business data
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataFromGPlaceApi;
