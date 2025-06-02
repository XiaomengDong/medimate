import React from 'react';
import { Link } from 'react-router-dom';
import { FaMobileAlt, FaListAlt } from 'react-icons/fa';

function UserProfile() {
  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      <p>Manage your account settings and preferences</p>
      
      <div className="profile-menu">
        <Link to="/my-devices" className="profile-menu-item">
          <div className="menu-icon">
            <FaMobileAlt size={24} />
          </div>
          <div className="menu-content">
            <h3>My Devices</h3>
            <p>Manage connected devices and login sessions</p>
          </div>
        </Link>
        
        <Link to="/health-data-form" className="profile-menu-item">
          <div className="menu-icon">
            <FaListAlt size={24} />
          </div>
          <div className="menu-content">
            <h3>Health Data Form</h3>
            <p>Update your health profile and medical history</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default UserProfile;