'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/component/customtoast/page";
import SearchSection from "./components/SearchSection";
import CRMSection from "./components/CRMSection";
import FilterTaskSection from "./components/FilterTaskSection";
import DataTable from "./components/DataTable";
import Pagination from "./components/Pagination";
import CSVModal from "./components/CSVModal";
import CommunicationModals from "./components/CommunicationModals";
import AddDataForm from "@/app/(DashboardComponents)/ContactListComponents/AddDataForm/page";
import FilterComponent from "./FilterComponent";
import LeadTypeForm from "./ActionComponent/LeadTypeModal";
import moment from "moment";
import Papa from "papaparse";
import Swal from "sweetalert2";
import ReportCon from "../ContactListComponents/ReportCon/page";
import DataFromGPlaceApi from "../ContactListComponents/DataFromGPlaceApiCon/page";

const sampleDataTypes = [
  { value: "P", label: "Individual" },
  { value: "B", label: "Business" },
  { value: "A", label: "Advisor" },
  { value: "W", label: "Work Seeker" },
];

const Dashboard = () => {
  const router = useRouter();
  const { addToast } = useToast();

  // State management
  const [dataDetails, setDataDetails] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedDataType, setSelectedDataType] = useState("");
  const [dataFilter, setDataFilter] = useState("all"); // Initialize with "all" to match CRMSection and DataTable
  const [searchQuery, setSearchQuery] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAddDataFormOpen, setIsAddDataFormOpen] = useState(false);
  const [showEmailSend, setShowEmailSend] = useState(false);
  const [showWhatsappSend, setShowSendWhatsapp] = useState(false);
  const [showSmsSend, setShowSmsSend] = useState(false);
  const [showCallSend, setShowCallSend] = useState(false);
  const [showReportCon, setShowReportCon] = useState(false);
  const [showGoogleDataCon, setShowGoogleDataCon] = useState(false);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showCsvData, setShowCsvData] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [applyFilters, setApplyFilters] = useState(false);
  const [userID, setUserID] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showLeadTypeForm, setShowLeadTypeForm] = useState(false);
  const [leadTypes, setLeadTypes] = useState([]);
  const [selectedLeadType, setSelectedLeadType] = useState("");
  const [logs, setLogs] = useState({});
  const [editingData, setEditingData] = useState({});

  // Consolidated filter state
  const [filterState, setFilterState] = useState({
    selectedDataFilter: "All",
    selectedLead: "",
    selectedStatus: "",
    dateFrom: "",
    dateTo: "",
    selectedCountry: "",
    selectedState: "",
    selectedDistrict: "",
    selectedPincode: "",
    selectedSkills: [],
    selectedFunctionalArea: "",
    selectedPosition: "",
    selectedIndustry: "",
    selectedEducations: [],
    selectedInstitutes: [],
    selectedExperiences: [],
    experienceYearsFrom: "",
    experienceYearsTo: "",
  });

  const expectedHeaders = [
    "datatype",
    "name",
    "mobile",
    "whatsapp",
    "email",
    "gender",
    "country_code",
    "state",
    "district",
    "pincode",
    "skills",
    "functional_area",
    "position",
    "industry",
    "education",
    "institute",
    "experience",
    "experience_years",
    "lead",
    "status",
    "created_at",
  ];

  // Initialize component
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = sessionStorage.getItem("userData");
      if (!userData) {
        router.push("/login");
        return;
      }

      try {
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData || !parsedUserData.userID) {
          router.push("/login");
        } else {
          setUserID(parsedUserData.userID);

          const storedLeadType =
            sessionStorage.getItem("selectedLeadType") || "";
          setSelectedLeadType(storedLeadType);

          fetchData(parsedUserData.userID);
          fetchTasks(parsedUserData.userID);
          fetchLeadTypes();
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        addToast("Failed to parse user data", "error");
        router.push("/login");
      }
    }
  }, [router, addToast]);

  // Save selectedLeadType to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedLeadType) {
        sessionStorage.setItem("selectedLeadType", selectedLeadType);
      } else {
        sessionStorage.removeItem("selectedLeadType");
      }
    }
  }, [selectedLeadType]);

  // API Functions
  const fetchData = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/get-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDataDetails(data.data || []);
      } else {
        addToast(data.message || "Failed to fetch data", "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("Failed to fetch data", "error");
    }
  };

  const fetchTasks = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/get-tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data.Tasks || []);
      } else {
        addToast(data.message || "Failed to fetch tasks", "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addToast("Failed to fetch tasks", "error");
    }
  };

  const fetchLeadTypes = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/leadtype/get-lead-types",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLeadTypes(data.LeadTypes || []);
      } else {
        addToast(data.message || "Failed to fetch lead types", "error");
      }
    } catch (error) {
      console.error("Error fetching lead types:", error);
      addToast("Failed to fetch lead types", "error");
    }
  };

  const fetchLogs = async (dataID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/logs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID, dataID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLogs((prev) => ({
          ...prev,
          [dataID]: data.logs || [],
        }));
      } else {
        addToast(data.message || "Failed to fetch logs", "error");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      addToast("Failed to fetch logs", "error");
    }
  };

  // Inline edit handler
  const handleInlineEdit = async (dataID, field, value) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/update-data",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID,
            dataID,
            [field]: value,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDataDetails((prev) =>
          prev.map((item) =>
            item.dataID === dataID ? { ...item, [field]: value } : item
          )
        );
        addToast(`Updated ${field}`, "success");
      } else {
        addToast(data.message || "Failed to update record", "error");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      addToast("Failed to update record", "error");
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      addToast("No records selected for deletion", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure to delete?",
      text: "Do you want to delete this selected all contact?",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/delete-data",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataIDs: selectedRows.map((row) => row.dataID),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDataDetails((prev) =>
          prev.filter((item) => !selectedRows.includes(item))
        );
        setSelectedRows([]);
        addToast("Selected records deleted successfully", "success");
      } else {
        addToast(data.message || "Failed to delete records", "error");
      }
    } catch (error) {
      console.error("Error deleting records:", error);
      addToast("Failed to delete records", "error");
    }
  };

  // Filter data
  const filteredData = dataDetails.filter((item) => {
    const matchTask = selectedTask
      ? item.taskID === selectedTask || item.taskID === parseInt(selectedTask)
      : true;

    if (!matchTask) return false;

    const matchLeadType = selectedLeadType
      ? parseInt(item.leadID) == parseInt(selectedLeadType)
      : true;

    if (!matchLeadType) return false;

    const matchesSearchQuery = searchQuery
      ? Object.entries(item).some(([key, value]) => {
          if (
            key === "skills" ||
            key === "education" ||
            key === "institute" ||
            key === "experience"
          ) {
            return (
              Array.isArray(value) &&
              value.some((val) =>
                val
                  .toString()
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase().trim())
              )
            );
          }
          return (
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchQuery.toLowerCase().trim())
          );
        })
      : true;

    const matchesDataType = selectedDataType
      ? item.datatype === selectedDataType
      : true;

    const matchDataFilter =
      filterState.selectedDataFilter === "All" ||
      item.datatype === filterState.selectedDataFilter;

    const matchLead = filterState.selectedLead
      ? item.lead === filterState.selectedLead
      : true;

    const matchStatus = filterState.selectedStatus
      ? item.status === filterState.selectedStatus
      : true;

    const matchCountry = filterState.selectedCountry
      ? item.country_code === filterState.selectedCountry
      : true;

    const matchState = filterState.selectedState
      ? item.state === filterState.selectedState.state
      : true;

    const matchDistrict = filterState.selectedDistrict
      ? item.district === filterState.selectedDistrict
      : true;

    const matchPincode = filterState.selectedPincode
      ? item.pincode === filterState.selectedPincode.pincode
      : true;

    const matchSkills = filterState.selectedSkills.length
      ? filterState.selectedSkills.every((skill) =>
          item.skills?.includes(skill.value)
        )
      : true;

    const matchFunctionalArea = filterState.selectedFunctionalArea
      ? item.functional_area === filterState.selectedFunctionalArea
      : true;

    const matchPosition = filterState.selectedPosition
      ? item.position === filterState.selectedPosition
      : true;

    const matchIndustry = filterState.selectedIndustry
      ? item.industry === filterState.selectedIndustry
      : true;

    const matchEducations = filterState.selectedEducations.length
      ? filterState.selectedEducations.every((edu) =>
          item.education?.includes(edu.value)
        )
      : true;

    const matchInstitutes = filterState.selectedInstitutes.length
      ? filterState.selectedInstitutes.every((inst) =>
          item.institute?.includes(inst.value)
        )
      : true;

    const matchExperiences = filterState.selectedExperiences.length
      ? filterState.selectedExperiences.every((exp) =>
          item.experience?.includes(exp.value)
        )
      : true;

    const matchExperienceYears =
      (!filterState.experienceYearsFrom ||
        item.experience_years >= Number(filterState.experienceYearsFrom)) &&
      (!filterState.experienceYearsTo ||
        item.experience_years <= Number(filterState.experienceYearsTo));

    const matchDate =
      (!filterState.dateFrom ||
        moment(item.created_at).isSameOrAfter(moment(filterState.dateFrom))) &&
      (!filterState.dateTo ||
        moment(item.created_at).isSameOrBefore(moment(filterState.dateTo)));

    return (
      matchesSearchQuery &&
      matchesDataType &&
      matchDataFilter &&
      matchLead &&
      matchStatus &&
      matchCountry &&
      matchState &&
      matchDistrict &&
      matchPincode &&
      matchSkills &&
      matchFunctionalArea &&
      matchPosition &&
      matchIndustry &&
      matchEducations &&
      matchInstitutes &&
      matchExperiences &&
      matchExperienceYears &&
      matchDate
    );
  });

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Event handlers
  const toggleRowSelection = (data) => {
    setSelectedRows((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const toggleSelectAll = (isChecked) => {
    setSelectedRows(isChecked ? [...currentRecords] : []);
  };

  const handleTaskChange = (e) => {
    const taskId = e.target.value;
    setSelectedTask(taskId);
    setCurrentPage(1);
    setSelectedRows([]);

    if (taskId) {
      const selectedTaskData = tasks.find(
        (task) => task.taskID === parseInt(taskId)
      );
      const taskName = selectedTaskData ? selectedTaskData.task : taskId;
      addToast("Filtering data for task: " + taskName);
    } else {
      addToast("Showing all tasks", "info");
    }
  };

  const handleLeadTypeChange = (e) => {
    const typeId = e.target.value;
    setSelectedLeadType(typeId);
    setCurrentPage(1);
    setSelectedRows([]);

    if (typeof window !== "undefined") {
      if (typeId) {
        sessionStorage.setItem("selectedLeadType", typeId);
      } else {
        sessionStorage.removeItem("selectedLeadType");
      }
    }

    if (typeId) {
      const selectedLead = leadTypes.find((lead) => lead.typeID == typeId);
      const leadName = selectedLead ? selectedLead.type : typeId;
      addToast("Filtering data for lead: " + leadName);
    } else {
      addToast("Showing all leads", "info");
    }
  };

  const handleResetFilters = () => {
    setFilterState({
      selectedDataFilter: "All",
      selectedLead: "",
      selectedStatus: "",
      dateFrom: "",
      dateTo: "",
      selectedCountry: "",
      selectedState: "",
      selectedDistrict: "",
      selectedPincode: "",
      selectedSkills: [],
      selectedFunctionalArea: "",
      selectedPosition: "",
      selectedIndustry: "",
      selectedEducations: [],
      selectedInstitutes: [],
      selectedExperiences: [],
      experienceYearsFrom: "",
      experienceYearsTo: "",
    });
    setApplyFilters(false);
    setSearchQuery("");
    setSelectedTask("");
    setSelectedLeadType("");
    setDataFilter("all"); // Reset dataFilter to "all"
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("selectedLeadType");
    }
  };

  return (
    <div className="min-h-[100px] font-sans">
      <SearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
        recordsPerPage={recordsPerPage}
        setRecordsPerPage={setRecordsPerPage}
        setIsAddDataFormOpen={setIsAddDataFormOpen}
        handleFileUpload={(event) => {
          const file = event.target.files[0];
          setFile(file);
          if (file) {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const { data, meta } = results;
                const fileHeaders = meta.fields;
                if (fileHeaders.join(",") !== expectedHeaders.join(",")) {
                  addToast(
                    `Invalid columns. Expected: ${expectedHeaders.join(", ")}`,
                    "error"
                  );
                  setCsvData([]);
                  setHeaders([]);
                  return;
                }
                setHeaders(fileHeaders);
                setCsvData(data);
                setShowCsvData(true);
              },
            });
          }
        }}
        downloadSample={() => {
          const data =
            expectedHeaders.join(",") +
            "\n" +
            "P,John Doe,+911234567890,+911234567890,john@example.com,Male,IN,Maharashtra,Mumbai,400001,javascript;python,it,developer,tech,btech,iit,frontend,5,lead1,active,2025-01-15T10:00:00Z\n" +
            "B,Jane Smith,+919876543210,+919876543210,jane@example.com,Female,IN,Karnataka,Bangalore,560001,java,hr,manager,finance,mba,iim,backend,8,lead2,inactive,2025-02-20T12:00:00Z";
          const blob = new Blob([data], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "sample_data.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}
      />

      <CRMSection
        selectedRows={selectedRows}
        addToast={addToast}
        setShowCallSend={setShowCallSend}
        setShowSendWhatsapp={setShowSendWhatsapp}
        setShowEmailSend={setShowEmailSend}
        setShowSmsSend={setShowSmsSend}
        setShowReportCon={setShowReportCon}
        setShowGoogleDataCon={setShowGoogleDataCon}
        dataFilter={dataFilter}
        setDataFilter={setDataFilter}
      />

      <FilterTaskSection
        leadTypes={leadTypes}
        selectedLeadType={selectedLeadType}
        handleLeadTypeChange={handleLeadTypeChange}
        dataDetails={dataDetails}
        tasks={tasks}
        selectedTask={selectedTask}
        handleTaskChange={handleTaskChange}
        filteredData={filteredData}
        handleDelete={handleDelete}
      />

      <FilterComponent
        isFilterOpen={isFilterOpen}
        toggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        handleFilterSearch={() => {
          setApplyFilters(true);
          setCurrentPage(1);
          setIsFilterOpen(false);
        }}
        handleResetFilters={handleResetFilters}
        filterState={filterState}
        setFilterState={setFilterState}
      />

      <DataTable
        currentRecords={currentRecords}
        selectedRows={selectedRows}
        toggleRowSelection={toggleRowSelection}
        toggleSelectAll={toggleSelectAll}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        leadTypes={leadTypes}
        logs={logs}
        fetchLogs={fetchLogs}
        addToast={addToast}
        userID={userID}
        setDataDetails={setDataDetails}
        setEditingData={setEditingData}
        setShowLeadTypeForm={setShowLeadTypeForm}
        sampleDataTypes={sampleDataTypes}
        tasks={tasks}
        fetchData={fetchData}
        dataFilter={dataFilter}
        setDataFilter={setDataFilter}
      />

      <Pagination
        indexOfFirstRecord={indexOfFirstRecord}
        indexOfLastRecord={indexOfLastRecord}
        filteredData={filteredData}
        selectedTask={selectedTask}
        selectedLeadType={selectedLeadType}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      <CSVModal
        showCsvData={showCsvData}
        csvData={csvData}
        headers={headers}
        setShowCsvData={setShowCsvData}
        handleAddLeadFromCsv={() => {
          setShowCsvData(false);
          setDataDetails((prev) => [...prev, ...csvData]);
          addToast("CSV data added successfully!", "success");
        }}
      />

      <CommunicationModals
        showEmailSend={showEmailSend}
        setShowEmailSend={setShowEmailSend}
        showWhatsappSend={showWhatsappSend}
        setShowSendWhatsapp={setShowSendWhatsapp}
        showCallSend={showCallSend}
        setShowCallSend={setShowCallSend}
        showSmsSend={showSmsSend}
        setShowSmsSend={setShowSmsSend}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        userID={userID}
        fetchData={fetchData}
      />

      {/* Add Data Modal */}
      {isAddDataFormOpen && (
        <AddDataForm
          setIsAddDataFormOpen={setIsAddDataFormOpen}
          fetchData={fetchData}
          userID={userID}
        />
      )}

      {/* Lead Type Modal */}
      {showLeadTypeForm && (
        <LeadTypeForm
          selectedLead={editingData}
          setShowLeadTypeForm={setShowLeadTypeForm}
          setUserData={setDataDetails}
          userData={dataDetails}
          userID={userID}
        />
      )}

      {showReportCon && (
        <ReportCon setShow={setShowReportCon} userData={dataDetails} />
      )}
      {showGoogleDataCon && (
        <DataFromGPlaceApi setShow={setShowGoogleDataCon} userID={userID} />
      )}
    </div>
  );
};

export default Dashboard;