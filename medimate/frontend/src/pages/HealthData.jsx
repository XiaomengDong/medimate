import React, { useState } from 'react';
import { FaHeartbeat, FaBed, FaLungs, FaTint } from 'react-icons/fa';

function HealthData() {
  // State for selected health metric
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  
  // Mock health data
  const healthData = {
    heartRate: {
      current: '75',
      unit: 'BPM',
      history: [72, 75, 73, 78, 74, 76, 75],
      status: 'Normal',
      recommendation: 'Your heart rate is within the normal range.',
    },
    sleepQuality: {
      current: '85%',
      unit: '',
      history: [80, 82, 79, 85, 83, 87, 85],
      status: 'Good',
      recommendation: 'Your sleep quality is good. Maintain your current sleep schedule.',
    },
    bloodOxygen: {
      current: '98%',
      unit: '',
      history: [97, 98, 98, 97, 98, 99, 98],
      status: 'Excellent',
      recommendation: 'Your blood oxygen level is excellent.',
    },
    bloodPressure: {
      current: '120/80',
      unit: 'mmHg',
      history: [
        { systolic: 118, diastolic: 78 },
        { systolic: 120, diastolic: 80 },
        { systolic: 122, diastolic: 82 },
        { systolic: 119, diastolic: 79 },
        { systolic: 120, diastolic: 80 },
        { systolic: 121, diastolic: 81 },
        { systolic: 120, diastolic: 80 },
      ],
      status: 'Normal',
      recommendation: 'Your blood pressure is within the normal range.',
    },
  };
  
  const metricData = healthData[selectedMetric];
  
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };
  
  // Get the icon for the selected metric
  const getIcon = (metric) => {
    switch (metric) {
      case 'heartRate':
        return <FaHeartbeat />;
      case 'sleepQuality':
        return <FaBed />;
      case 'bloodOxygen':
        return <FaLungs />;
      case 'bloodPressure':
        return <FaTint />;
      default:
        return null;
    }
  };
  
  return (
    <div>
      <h1>My Health</h1>
      <p>Detailed health metrics and analysis</p>
      
      <div className="metric-tabs">
        <button 
          className={`metric-tab ${selectedMetric === 'heartRate' ? 'active' : ''}`}
          onClick={() => handleMetricChange('heartRate')}
        >
          <FaHeartbeat /> Heart Rate
        </button>
        <button 
          className={`metric-tab ${selectedMetric === 'sleepQuality' ? 'active' : ''}`}
          onClick={() => handleMetricChange('sleepQuality')}
        >
          <FaBed /> Sleep Quality
        </button>
        <button 
          className={`metric-tab ${selectedMetric === 'bloodOxygen' ? 'active' : ''}`}
          onClick={() => handleMetricChange('bloodOxygen')}
        >
          <FaLungs /> Blood Oxygen
        </button>
        <button 
          className={`metric-tab ${selectedMetric === 'bloodPressure' ? 'active' : ''}`}
          onClick={() => handleMetricChange('bloodPressure')}
        >
          <FaTint /> Blood Pressure
        </button>
      </div>
      
      <div className="health-card">
        <div className="metric-header">
          {getIcon(selectedMetric)}
          <h2>{selectedMetric === 'heartRate' ? 'Heart Rate' : 
               selectedMetric === 'sleepQuality' ? 'Sleep Quality' : 
               selectedMetric === 'bloodOxygen' ? 'Blood Oxygen' : 
               'Blood Pressure'}</h2>
        </div>
        
        <div className="metric-value">
          <span className="current-value">{metricData.current}</span>
          <span className="unit">{metricData.unit}</span>
        </div>
        
        <div className="metric-status">
          Status: <span className={`status-${metricData.status.toLowerCase()}`}>{metricData.status}</span>
        </div>
        
        <div className="metric-recommendation">
          <h3>Recommendation:</h3>
          <p>{metricData.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

export default HealthData;