"use client"
const CSVModal = ({
  showCsvData,
  csvData,
  headers,
  setShowCsvData,
  handleAddLeadFromCsv,
}) => {
  if (!showCsvData || csvData.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white shadow-xl rounded-xl overflow-x-auto overflow-y-auto max-h-[700px] w-3/4 p-6">
        <div className="flex justify-end space-x-4 mb-4">
          <button
            onClick={() => setShowCsvData(false)}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddLeadFromCsv}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
          >
            Add All Data
          </button>
        </div>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white text-center">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="py-3 px-4 text-justify uppercase font-semibold text-sm"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="py-3 px-4 text-justify text-base font-normal"
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSVModal;
