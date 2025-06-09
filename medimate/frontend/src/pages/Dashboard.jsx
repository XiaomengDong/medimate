import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import { FaHeartbeat, FaComment, FaChartLine, FaStethoscope, FaHospital} from 'react-icons/fa';

function Dashboard() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  return (
    <div>
      {user && isAuthenticated ? 
      (<h1>Hello, {user.username}!</h1>):
      (<h1>Hello!</h1>)
      }
      <p>Welcome back to your AI Health Dashboard</p>
      <p>How are you feeling today? 😊</p>
      
      <div className="dashboard-grid">
        <Card
          icon={FaComment}
          style={{ backgroundColor: '#C8E7FF' }}
          iconColor="#007bff"
          title="AI Health Assistant" 
          description="Ask questions and get instant insights about your health"
          btn="Chat Now"
          page="/ai-assistant"
        />
        
        <Card 
          icon={FaHeartbeat}
          style={{ backgroundColor: '#D0FCC8'}}
          iconColor="#28a745"
          title="My Health Data" 
          description="View and manage your medical records, metrics, and history"
          btn="View Data"
          page="/health-data"
        />
        
        <Card 
          icon={FaChartLine}
          style={{ backgroundColor: '#FFF5C9'}}
          iconColor="#ffc107"
          title="AI Health Report" 
          description="Ask questions and get instant insights about your health"
          btn="Generate Report"
          page="/health-report"
        />

        <Card 
          icon={FaStethoscope}
          style={{ backgroundColor: '#F4C9C9'}}
          iconColor="#dc3545"
          title="Doctor Appointment"
          description="Connect to healthcare professionals and schedule appointments"
          btn="Book Now"
          page="/doctor-appointment"
        />

        <Card 
          icon={FaHospital}
          style={{ backgroundColor: '#E6BFFA'}}
          iconColor="#6f42c1"
          title="Search Nearby Hospitals" 
          description="Find and connect with healthcare facilities near you"
          btn="Search Now"
          page="/nearby"
        />
      </div>
      
      <div className="health-card">
        <h2>Recent Activity</h2>
        <p>Your health metrics have been stable over the past week.</p>
      </div>
    </div>
  );
}

export default Dashboard;