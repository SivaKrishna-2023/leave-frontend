import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import Pagination, {getPaginationData} from '../utils/Pagination';

export default function LeaveApprovalDashboard({managerId = 'MTL1006'}) {
  const [Data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [count, setCount] = useState(0);
  const [statusCount, setStatusCount] = useState({pending: 0, approved: 0, rejected: 0,});
  const [isEditing, setIsEditing] = useState({}); //state to track editing
  //state varaiables for managing modal, rejection reason, and leave date
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);

  // open modal and set selected leave ID
  const openRejectModal = (id) => {
    setSelectedLeaveId(id);
    setShowModal(true);
  };
  
  // close the modal reset reason
  const closeModal = () => {
    setShowModal(false);
    setRejectionReason("");
  };
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/manager/${managerId}`);
        const leaves = response.data;
        // Sort leaves with new entries at the top
        setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id))); // Assuming 'createdAt' is available
        setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
        const total = leaves.length;
        const pending = leaves.filter(leave => leave.leaveStatus === 'PENDING').length;
        const approved = leaves.filter(leave => leave.leaveStatus === 'APPROVED').length;
        const rejected = leaves.filter(leave => leave.leaveStatus === 'REJECTED').length;

        setCount(total);
        setStatusCount({ pending, approved, rejected });
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchData();
  }, [managerId]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/approve/${id}`);
      const response = await axios.get(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/manager/${managerId}`);
      const leaves = response.data;
      // Sort leaves with new entries at the top
      setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setIsEditing({ ...isEditing, [id]: false }); //exit edit mode after approval
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };
  
  // Handle rejection with backend integration
  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      console.log(rejectionReason);
      // Encode the rejectionReason to ensure proper handling of special characters
    //const encodedReason = encodeURIComponent(rejectionReason);
      await axios.put(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/reject/${selectedLeaveId}/${rejectionReason}`);
      const response = await axios.get(`https://leave-backend-app-d2fve9dsdjb4hgev.germanywestcentral-01.azurewebsites.net/leave/manager/${managerId}`);
      const leaves = response.data;
      // Sort leaves with new entries at the top
      setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setRejectionReason(response.data)
      setIsEditing({ ...isEditing, [selectedLeaveId]: false }); // exit edit mode after rejection

      // Optionally refresh data here (for instance, refetch the leave data)
      // Close modal after rejection
      closeModal();
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  const filterByStatus = (status) => {
    if (status === 'ALL') {
      setFilteredData(Data);
    } else {
      const filtered = Data.filter(leave => leave.leaveStatus === status);
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  const toggleEdit = (id) => {
    setIsEditing({ ...isEditing, [id]: !isEditing[id] });
  }

  // Get paginate data
  const {totalPages, currentItems} = getPaginationData(filteredData, currentPage, employeesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const headers = ["Employee", "Employee ID", "Start Date", "End Date", "Days", "Status", "Action"];
  const renderRowData = (data) => {
    const rowData = [
      { key: "firstName", value: data.firstName },
      { key: "employeeId", value: data.employeeId },
      { key: "leaveStartDate", value: data.leaveStartDate },
      { key: "leaveEndDate", value: data.leaveEndDate },
      { key: "duration", value: data.duration },
    ];
  
    return rowData.map((item) => (
      <div key={item.key} className="p-2 text-xs">
        {item.value}
      </div>
    ));
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600";
      case "PENDING":
        return "text-yellow-600";
      case "REJECTED":
        return "text-red-600";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <FaCheckCircle />;
      case "PENDING":
        return <FaHourglassHalf />;
      case "REJECTED":
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  const renderActions = (data) => {
    if (data.leaveStatus === "PENDING" || isEditing[data.id]) {
      return (
        <>
          <button
            className="bg-green-500 text-white text-xs px-3 py-2 rounded"
            onClick={() => handleApprove(data.id)}
          >
            Approve
          </button>
          <button
            className="bg-red-500 text-white text-xs px-3 py-2 rounded"
            onClick={() => openRejectModal(data.id)}
          >
            Reject
          </button>
        </>
      );
    }
  
    return (
      <button
        className="bg-blue-500 text-white text-xs px-3 py-2 rounded"
        onClick={() => toggleEdit(data.id)}
      >
        Edit
      </button>
    );
  };
  

  return (
    <div>
        <h1 className="text-2xl font-bold text-center">LEAVE APPROVAL DASHBOARD</h1>
      
      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-300 p-4">
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-gray-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('ALL')}>Total Requests</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-yellow-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('PENDING')}>Pending</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-blue-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('APPROVED')}>Approved</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-red-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('REJECTED')}>Rejected</button>
        </div>
        <div className='text-center text-sm'>{count}</div>
        <div className='text-center text-sm'>{statusCount.pending}</div>
        <div className='text-center text-sm'>{statusCount.approved}</div>
        <div className='text-center text-sm'>{statusCount.rejected}</div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-7 bg-gray-100">
          <div className="col-span-7 text-center text-md font-bold p-2 bg-gray-200">LEAVE REQUESTS</div>

          {/* Table Header */}
          {headers.map((header) => (
    <div key={header} className="p-2 border-b border-gray-300 text-center text-sm font-bold">
      {header}
    </div>
  ))}
        </div>

        {/* Table Body */}
{filteredData && currentItems.map((data) => (
  <div 
    key={data.id} 
    className="grid grid-cols-1 sm:grid-cols-7 text-center p-2 border-b border-gray-200 items-center bg-gray-100"
  >
    {/* Render Row Data */}
    {renderRowData(data)}

    {/* Render Status */}
    <div 
      className={`p-2 text-xs flex items-center justify-center space-x-1 ${
        getStatusClass(data.leaveStatus)
      }`}
    >
      {getStatusIcon(data.leaveStatus)}
      {data.leaveStatus}
    </div>

    {/* Render Actions */}
    <div className="p-2 flex justify-center space-x-2">
      {renderActions(data)}
    </div>
    <div>{
      data.medicalDocument ? (
        <AttachmentItem
            key={data.employeeId}
            filename="medical Document"
            fileUrl={data.medicalDocument}
            icon={< MdOutlineFileDownload className="h-6 w-6 text-gray-400" />}
        />
      ):null
      }
    </div>
  </div>
))}
   </div>

     {/* Pagination controls */}
     <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
        
      />
     
      {/* Rejection Reason Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-75">
          <div className="bg-white p-4 rounded-md shadow-md w-11/12 sm:w-1/3">
            <h2 className="text-xl font-bold mb-4">Reject Leave Request</h2>
            <textarea
              name='leaveReason'
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 dark:bg-gray-700 text-black"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectionReason.leaveReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2 mt-4">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={closeModal}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentItem({ filename, icon, fileUrl }) {
  const handleDownload = () => {
      if (!fileUrl) {
          console.error("File URL is invalid");
          return;
      }
      // filename="medical_document.pdf"


      console.log("Downloading file:", fileUrl, filename);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", filename); // Set download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
              <button variant="outline" size="lg" onClick={handleDownload}>
                  {icon}
              </button>
  );
}



