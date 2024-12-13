import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTrash, FaEdit} from "react-icons/fa";
import Pagination, {getPaginationData} from '../utils/Pagination';

export default function Employee({ employeeId = 'MTL1014' }) {
  const [leaveRequests, setLeaveRequests] = useState([])
  const navigate = useNavigate();
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(3);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      let employeeId= 'MTL1014';
      try {
        const response = await axios.get(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/employee/${employeeId}`);
        // Sort leave requests to put the most recent requests on top
        const leaves = response.data
        setLeaveRequests(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
  
      }
      catch (error) {
        console.log("Error fetching in leave requests", error)
      }
    }
    fetchLeaveRequests();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className="text-green-500" />
      case 'REJECTED':
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaHourglassHalf className="text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleEditRequest = (request) => {
    navigate("/Leave", {
      state: {
        edit: true,
        ...request // passing all details for editing
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/delete/${id}`);
      setLeaveRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );
      alert('Leave request cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      alert('Failed to cancel leave request. Please try again.');
    }
  };

  const headers = ["Start Date", "End Date", "Type", "Status", "Action"];

  // Get paginate data
  const {totalPages, currentItems} = getPaginationData(leaveRequests, currentPage, employeesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
       
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header) => (
                  <th key={header} className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{header}</th>
                ))}

              </tr>
            </thead>

            <tbody>
              {currentItems.map((request => (
                <tr key={request.id} className="bg-white hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-xs">
                    <p className="text-gray-900 whitespace-nowrap">{request.leaveStartDate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-xs">
                    <p className="text-gray-900 whitespace-nowrap">{request.leaveEndDate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-xs">
                    <p className="text-gray-900 whitespace-nowrap">{request.leaveType}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-xs">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.leaveStatus)}`}>
                      {getStatusIcon(request.leaveStatus)}
                      <span className="ml-1">{request.leaveStatus}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-xs">
                    {request.leaveStatus === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <FaEdit className="mr-1 h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          <FaTrash className="mr-1 h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
     {/* Pagination controls */}
     <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </div>
  )
}