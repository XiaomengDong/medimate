import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaMobileAlt, FaListAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>MEDI<span>MATE+</span></h1>
      </div>
      
      <div className="user-info" ref={dropdownRef}>
        <div className="user-avatar" onClick={toggleDropdown}>
          <FaUser />
          <span>John Doe</span>
        </div>
        
        {dropdownOpen && (
          <div className="user-dropdown">
            <div className="dropdown-user-info">
              <FaUser className="dropdown-avatar" />
              <div>
                <h3>John Doe</h3>
                <p>john.doe@example.com</p>
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
              <li className="dropdown-divider"></li>
              <li className="dropdown-logout">
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