"use client"
const Pagination = ({
  indexOfFirstRecord,
  indexOfLastRecord,
  filteredData,
  selectedTask,
  selectedLeadType,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPaginationRange = () => {
    const totalPageNumbers = 5;
    const halfRange = Math.floor(totalPageNumbers / 2);
    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + totalPageNumbers - 1, totalPages);
    if (endPage - startPage + 1 < totalPageNumbers) {
      startPage = Math.max(endPage - totalPageNumbers + 1, 1);
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="text-sm font-semibold text-gray-600">
        Showing {indexOfFirstRecord + 1} to{" "}
        {Math.min(indexOfLastRecord, filteredData.length)} of{" "}
        {filteredData.length} Records
        {(selectedTask || selectedLeadType) && (
          <span className="ml-2 text-blue-600">(Filtered)</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
          }`}
        >
          {"<<"} Previous
        </button>
        {getPaginationRange().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 ${
              currentPage === page
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
            } rounded-lg shadow-md`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
          }`}
        >
          Next {">>"}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
