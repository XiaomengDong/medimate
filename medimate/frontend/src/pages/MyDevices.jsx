import React, { useState } from 'react';
import { FaMobile, FaDesktop, FaClock, FaTimes, FaPlus } from 'react-icons/fa';
// 修复：使用 FaClock 替换不存在的 FaWatch

function MyDevices() {
  // Mock devices data
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "User's phone",
      type: "mobile",
      status: "online",
      lastSeen: "Now"
    },
    {
      id: 2,
      name: "User's PC",
      type: "desktop",
      status: "online",
      lastSeen: "Now"
    },
    {
      id: 3,
      name: "User's smart watch",
      type: "watch",
      status: "offline",
      lastSeen: "04/15 01:00 p.m."
    }
  ]);

  // Function to get icon based on device type
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile':
        return <FaMobile size={32} />;
      case 'desktop':
        return <FaDesktop size={32} />;
      case 'watch':
        return <FaClock size={32} />; // 修复：使用 FaClock 替换不存在的 FaWatch
      default:
        return <FaMobile size={32} />;
    }
  };

  // Function to handle device removal
  const handleRemoveDevice = (id) => {
    setDevices(devices.filter(device => device.id !== id));
  };

  // Function to handle adding a new device
  const handleAddDevice = () => {
    alert("This feature is not available yet. Stay tuned for updates!");
  };

  return (
    <div className="my-devices-container">
      <div className="page-header">
        <h1>My Devices</h1>
      </div>

      <div className="devices-list">
        {devices.map(device => (
          <div key={device.id} className="device-item">
            <div className="device-icon">
              {getDeviceIcon(device.type)}
            </div>
            
            <div className="device-info">
              <h3>{device.name}</h3>
              {device.status === "online" ? (
                <span className="status online">• Online</span>
              ) : (
                <span className="status offline">Last seen: {device.lastSeen}</span>
              )}
            </div>
            
            <button 
              className="remove-device-btn"
              onClick={() => handleRemoveDevice(device.id)}
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <button className="add-device-btn" onClick={handleAddDevice}>
        <FaPlus />
        <span>Add new device</span>
      </button>
    </div>
  );
}

export default MyDevices;