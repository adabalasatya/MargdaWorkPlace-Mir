"use client";

import { useState } from "react";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";

// Sample options for filters (moved from Dashboard)
const sampleCountries = [
  { country_code: "IN", country: "India" },
  { country_code: "US", country: "United States" },
];
const sampleStates = [
  { stateID: 1, state_code: "MH", state: "Maharashtra", country_code: "IN" },
  { stateID: 2, state_code: "KA", state: "Karnataka", country_code: "IN" },
];
const sampleDistricts = [
  { districtID: 1, district: "Mumbai", state_code: "MH" },
  { districtID: 2, district: "Bangalore", state_code: "KA" },
];
const samplePincodes = [
  { pinID: 1, pincode: "400001", label: "400001, Mumbai", value: 1 },
  { pinID: 2, pincode: "560001", label: "560001, Bangalore", value: 2 },
];
const sampleSkills = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];
const sampleFunctionalAreas = [
  { value: "it", label: "Information Technology" },
  { value: "hr", label: "Human Resources" },
];
const samplePositions = [
  { value: "developer", label: "Developer" },
  { value: "manager", label: "Manager" },
];
const sampleIndustries = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
];
const sampleEducations = [
  { value: "btech", label: "B.Tech" },
  { value: "mba", label: "MBA" },
];
const sampleInstitutes = [
  { value: "iit", label: "IIT" },
  { value: "iim", label: "IIM" },
];
const sampleExperiences = [
  { value: "frontend", label: "Frontend Development" },
  { value: "backend", label: "Backend Development" },
];

const FilterComponent = ({
  isFilterOpen,
  toggleFilter,
  handleFilterSearch,
  handleResetFilters,
  filterState,
  setFilterState
}) => {
  // Handler functions
  const handleSelectCountry = (e) => {
    const countryCode = e.target.value;
    setFilterState({
      ...filterState,
      selectedCountry: countryCode,
      selectedState: "",
      selectedDistrict: "",
      selectedPincode: ""
    });
  };

  const handleStateChange = (e) => {
    const state_code = e.target.value;
    const selectedState = sampleStates.find(
      (item) => item.state_code === state_code
    );
    setFilterState({
      ...filterState,
      selectedState: selectedState,
      selectedDistrict: "",
      selectedPincode: ""
    });
  };

  const handleDistrictChange = (e) => {
    setFilterState({
      ...filterState,
      selectedDistrict: e.target.value,
      selectedPincode: ""
    });
  };

  const handlePinCodeChange = (selectedPincode) => {
    setFilterState({
      ...filterState,
      selectedPincode: selectedPincode
    });
  };

  const handleInputChange = (field, value) => {
    setFilterState({
      ...filterState,
      [field]: value
    });
  };

  if (!isFilterOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Advanced Filters
          </h2>
          <button
            onClick={toggleFilter}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Basic Filters
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Type
              </label>
              <select
                value={filterState.selectedDataFilter}
                onChange={(e) => handleInputChange("selectedDataFilter", e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="All">All Data</option>
                <option value="P">Individual</option>
                <option value="B">Business</option>
                <option value="A">Advisor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead
              </label>
              <select
                value={filterState.selectedLead}
                onChange={(e) => handleInputChange("selectedLead", e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="">All Leads</option>
                <option value="lead1">Lead 1</option>
                <option value="lead2">Lead 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterState.selectedStatus}
                onChange={(e) => handleInputChange("selectedStatus", e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filterState.dateFrom}
                  onChange={(e) => handleInputChange("dateFrom", e.target.value)}
                  className="border-2 border-gray-300 rounded-lg p-2"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filterState.dateTo}
                  onChange={(e) => handleInputChange("dateTo", e.target.value)}
                  className="border-2 border-gray-300 rounded-lg p-2"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Location Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Location
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={filterState.selectedCountry}
                onChange={handleSelectCountry}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Country</option>
                {sampleCountries.map((country) => (
                  <option
                    key={country.country_code}
                    value={country.country_code}
                  >
                    {country.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={filterState.selectedState?.state_code || ""}
                onChange={handleStateChange}
                disabled={!filterState.selectedCountry}
                className={`w-full border-2 border-gray-300 rounded-lg p-2 ${
                  !filterState.selectedCountry ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select State</option>
                {sampleStates
                  .filter((state) => state.country_code === filterState.selectedCountry)
                  .map((state) => (
                    <option key={state.state_code} value={state.state_code}>
                      {state.state}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                value={filterState.selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!filterState.selectedState}
                className={`w-full border-2 border-gray-300 rounded-lg p-2 ${
                  !filterState.selectedState ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select District</option>
                {sampleDistricts
                  .filter(
                    (district) =>
                      district.state_code === filterState.selectedState?.state_code
                  )
                  .map((district) => (
                    <option
                      key={district.districtID}
                      value={district.district}
                    >
                      {district.district}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pin code
              </label>
              <Select
                options={samplePincodes.filter(
                  (pincode) =>
                    sampleDistricts.find(
                      (d) => d.district === filterState.selectedDistrict
                    )?.state_code ===
                    sampleStates.find(
                      (s) => s.state_code === filterState.selectedState?.state_code
                    )?.state_code
                )}
                value={filterState.selectedPincode}
                onChange={handlePinCodeChange}
                placeholder="Select Pincode"
                className="w-full"
                isDisabled={!filterState.selectedDistrict}
              />
            </div>
          </div>

          {/* Professional Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Professional
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <Select
                isMulti
                options={sampleSkills}
                value={filterState.selectedSkills}
                onChange={(selected) => handleInputChange("selectedSkills", selected)}
                placeholder="Select Skills"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Functional Area
              </label>
              <select
                value={filterState.selectedFunctionalArea}
                onChange={(e) => handleInputChange("selectedFunctionalArea", e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Functional Area</option>
                {sampleFunctionalAreas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={filterState.selectedPosition}
                onChange={(e) => handleInputChange("selectedPosition", e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Position</option>
                {samplePositions.map((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                value={filterState.selectedIndustry}
                onChange={(e) => handleInputChange("selectedIndustry", e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Industry</option>
                {sampleIndustries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education
              </label>
              <Select
                isMulti
                options={sampleEducations}
                value={filterState.selectedEducations}
                onChange={(selected) => handleInputChange("selectedEducations", selected)}
                placeholder="Select Education"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institute
              </label>
              <Select
                isMulti
                options={sampleInstitutes}
                value={filterState.selectedInstitutes}
                onChange={(selected) => handleInputChange("selectedInstitutes", selected)}
                placeholder="Select Institute"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <Select
                isMulti
                options={sampleExperiences}
                value={filterState.selectedExperiences}
                onChange={(selected) => handleInputChange("selectedExperiences", selected)}
                placeholder="Select Experience"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Years
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filterState.experienceYearsFrom}
                  onChange={(e) => handleInputChange("experienceYearsFrom", e.target.value)}
                  placeholder="From"
                  className="border-2 border-gray-300 rounded-lg p-2"
                />
                <input
                  type="number"
                  value={filterState.experienceYearsTo}
                  onChange={(e) => handleInputChange("experienceYearsTo", e.target.value)}
                  placeholder="To"
                  className="border-2 border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
          <button
            onClick={handleResetFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200"
          >
            Reset Filters
          </button>
          <button
            onClick={handleFilterSearch}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;