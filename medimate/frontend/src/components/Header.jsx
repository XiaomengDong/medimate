// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaMobileAlt, FaListAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Toggle dropdown open/closed
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Generic nav handler
  const handleNavigation = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  // When "Log Out" is clicked - use window.location for reliable redirect
  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    // Force page redirect - this will work even if routing gets confused
    window.location.href = '/login';
  };

  // If user is not defined (not logged in yet), you could return null or a placeholder.
  // But in a protected layout, user should always exist here.
  if (!user) return null;

  return (
    <header className="header">
      <div className="logo">
        <h1>MEDI<span>MATE+</span></h1>
      </div>
      
      <div className="user-info" ref={dropdownRef}>
        <div className="user-avatar" onClick={toggleDropdown}>
          <FaUser />
          {/* Show the logged‐in user's name */}
          <span>{user.username}</span>
        </div>
        
        {dropdownOpen && (
          <div className="user-dropdown">
            <div className="dropdown-user-info">
              <FaUser className="dropdown-avatar" />
              <div>
                <h3>{user.username}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            
            <ul className="dropdown-menu">
              <li onClick={() => handleNavigation('/user-profile')}>
                <FaUser />
                <span>Profile</span>
              </li>
              <li onClick={() => handleNavigation('/my-devices')}>
                <FaMobileAlt />
                <span>My Devices</span>
              </li>
              <li onClick={() => handleNavigation('/health-data-form')}>
                <FaListAlt />
                <span>Health Data</span>
              </li>
              <li onClick={() => handleNavigation('/settings')}>
                <FaCog />
                <span>Settings</span>
              </li>
              <li className="dropdown-logout" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Log Out</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;