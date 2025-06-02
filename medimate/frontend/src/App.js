import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import HealthData from './pages/HealthData';
import AIAssistant from './pages/AIAssistant';
import Nearby from './pages/Nearby';
import HealthReport from './pages/HealthReport';
import RemoteConsult from './pages/RemoteConsult';
import Login from './components/Login';
import UserProfile from './pages/UserProfile';
import MyDevices from './pages/MyDevices';
import HealthDataForm from './pages/HealthDataForm';

function App() {
  // Simple state to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Mock login function
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div className="app">
        {isLoggedIn ? (
          // Main application layout when logged in
          <>
            <Header />
            <div className="main-container">
              <Sidebar />
              <main className="content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/health-data" element={<HealthData />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="/nearby" element={<Nearby />} />
                  <Route path="/health-report" element={<HealthReport />} />
                  <Route path="/remote-consult" element={<RemoteConsult />} />
                  
                  {/* New routes for user profile */}
                  <Route path="/user-profile" element={<UserProfile />} />
                  <Route path="/my-devices" element={<MyDevices />} />
                  <Route path="/health-data-form" element={<HealthDataForm />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </>
        ) : (
          // Show login page when not logged in
          <Routes>
            <Route path="*" element={<Home onLogin={handleLogin} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;