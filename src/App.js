import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LeaveApprovalDashboard from './Components/Admin.js';

import LeaveRequestForm from './Components/Leave.js'
import Main from './Components/Main.js'
import Employee from './Components/Employee.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path="/leave" element={<LeaveRequestForm />} />
        <Route path="/admin" element={<LeaveApprovalDashboard />} />
        <Route path='/employee' element={<Employee />} />
      </Routes>
    </Router>
  );
}

export default App