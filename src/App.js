import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import components
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/member-dashboard" element={<MemberDashboard />} />
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
