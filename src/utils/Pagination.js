// components/PaginationWithHelper.jsx

import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


export const getPaginationData = (data, currentPage, itemsPerPage) => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  return {
    totalItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
  };
};


const Pagination = ({ currentPage, totalPages, paginate, darkMode }) => {
  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {/* Previous Button */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-white text-gray-500 border-gray-300"} hover:bg-gray-50`}
            >
              <span className="sr-only">Previous</span>
              <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  index + 1 === currentPage
                    ? `z-10 ${darkMode ? "bg-blue-700 text-white border-blue-500" : "bg-blue-50 text-blue-600 border-blue-500"}`
                    : `${darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-white text-gray-500 border-gray-300"} hover:bg-gray-50`
                }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-white text-gray-500 border-gray-300"} hover:bg-gray-50`}
            >
              <span className="sr-only">Next</span>
              <FaChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
