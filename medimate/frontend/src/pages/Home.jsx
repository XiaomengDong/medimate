import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import '../styles/App.css';

// Import components
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Import pages
import Dashboard from '../pages/Dashboard';
import HealthData from '../pages/HealthData';
import AIAssistant from '../pages/AIAssistant';
import Nearby from '../pages/Nearby';
import HealthReport from '../pages/HealthReport';
import RemoteConsult from '../pages/RemoteConsult';
import UserProfile from '../pages/UserProfile';
import MyDevices from '../pages/MyDevices';
import HealthDataForm from '../pages/HealthDataForm';

// Component to handle navigation logic
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is at root path or login path, redirect to dashboard
    if (location.pathname === '/' || location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-data" element={<HealthData />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/nearby" element={<Nearby />} />
            <Route path="/health-report" element={<HealthReport />} />
            <Route path="/remote-consult" element={<RemoteConsult />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/my-devices" element={<MyDevices />} />
            <Route path="/health-data-form" element={<HealthDataForm />} />
            {/* All other route redirect to dashboard */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Home() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default Home;