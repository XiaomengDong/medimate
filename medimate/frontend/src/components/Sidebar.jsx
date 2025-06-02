import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHeartbeat, FaRobot, FaHospital } from 'react-icons/fa';

function Sidebar() {
  const location = useLocation();
  
  // Helper function to determine active class
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li className={isActive('/')}>
          <Link to="/dashboard" className='sidebar-link'>
            <div className='sidebar-item'>
              <FaHome />
              <span>Dashboard</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/health-data')}>
          <Link to="/health-data" className='sidebar-link'>
            <div className='sidebar-item'>
              <FaHeartbeat />
              <span>Health Data</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/ai-assistant')}>
          <Link to="/ai-assistant" className='sidebar-link'>
            <div className='sidebar-item'>
              <FaRobot />
              <span>AI Assistant</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/nearby')}>
          <Link to="/nearby" className='sidebar-link'>
            <div className='sidebar-item'>
              <FaHospital />
              <span>Nearby</span>
            </div>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;