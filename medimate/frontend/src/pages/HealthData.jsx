// src/pages/HealthData.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FaHeartbeat, FaBed, FaLungs, FaTint } from 'react-icons/fa';
import { makeAuthenticatedRequest } from '../services/api';

function HealthData() {
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await makeAuthenticatedRequest('/api/health-data');
        const list = await res.json();
        setRecords(list);
      } catch (err) {
        setError(err.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const healthData = useMemo(() => {
    const group = { heartRate: [], sleepQuality: [], bloodOxygen: [], bloodPressure: [] };
    records.forEach(r => {
      switch (r.type) {
        case 'heart_rate':      group.heartRate.push(r);      break;
        case 'sleep_quality':   group.sleepQuality.push(r);   break;
        case 'blood_oxygen':    group.bloodOxygen.push(r);    break;
        case 'blood_pressure':  group.bloodPressure.push(r);  break;
        default: break;
      }
    });

    const latest = arr => arr.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return {
      heartRate: buildSimpleMetric(group.heartRate, 'BPM', v => `${v}`, 'Normal'),
      sleepQuality: buildSimpleMetric(group.sleepQuality, '',  v => `${v}%`, 'Good'),
      bloodOxygen:  buildSimpleMetric(group.bloodOxygen,  '',  v => `${v}%`, 'Excellent'),
      bloodPressure: buildBloodPressure(group.bloodPressure)
    };
  }, [records]);

  const metricData = healthData[selectedMetric];

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;

  const handleMetricChange = metric => setSelectedMetric(metric);

  const getIcon = metric => {
    switch (metric) {
      case 'heartRate':    return <FaHeartbeat />;
      case 'sleepQuality': return <FaBed />;
      case 'bloodOxygen':  return <FaLungs />;
      case 'bloodPressure':return <FaTint />;
      default:             return null;
    }
  };

  return (
    <div>
      <h1>My Health</h1>
      <p>Detailed health metrics and analysis</p>

      <div className="metric-tabs">
        {['heartRate','sleepQuality','bloodOxygen','bloodPressure'].map(key => (
          <button
            key={key}
            className={`metric-tab ${selectedMetric === key ? 'active' : ''}`}
            onClick={() => handleMetricChange(key)}
          >
            {getIcon(key)}{' '}
            {key === 'heartRate' ? 'Heart Rate' :
             key === 'sleepQuality' ? 'Sleep Quality' :
             key === 'bloodOxygen' ? 'Blood Oxygen' : 'Blood Pressure'}
          </button>
        ))}
      </div>

      {metricData ? (
        <div className="health-card">
          <div className="metric-header">
            {getIcon(selectedMetric)}
            <h2>
              {selectedMetric === 'heartRate' ? 'Heart Rate' :
               selectedMetric === 'sleepQuality' ? 'Sleep Quality' :
               selectedMetric === 'bloodOxygen' ? 'Blood Oxygen' : 'Blood Pressure'}
            </h2>
          </div>

          <div className="metric-value">
            <span className="current-value">{metricData.current}</span>
            <span className="unit">{metricData.unit}</span>
          </div>

          <div className="metric-status">
            Status:{' '}
            <span className={`status-${metricData.status.toLowerCase()}`}>
              {metricData.status}
            </span>
          </div>

          <div className="metric-recommendation">
            <h3>Recommendation:</h3>
            <p>{metricData.recommendation}</p>
          </div>
        </div>
      ) : (
        <p>No data for this metric yet.</p>
      )}
    </div>
  );
}

function buildSimpleMetric(arr, unit, fmt, defaultStatus) {
  if (!arr.length) return null;
  const latest = arr.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  return {
    current: fmt(latest.value),
    unit,
    history: arr.map(r => Number(r.value)),
    status: defaultStatus,
    recommendation: `Your ${latest.type.replace('_', ' ')} is within the normal range.`
  };
}

function buildBloodPressure(arr) {
  if (!arr.length) return null;
  const latest = arr.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const [sys, dia] = latest.value.split('/').map(Number);
  const status = (sys < 120 && dia < 80) ? 'Normal' : 'Elevated';
  return {
    current: latest.value,
    unit: 'mmHg',
    history: arr.map(r => {
      const [s, d] = r.value.split('/').map(Number);
      return { systolic: s, diastolic: d };
    }),
    status,
    recommendation:
      status === 'Normal'
        ? 'Your blood pressure is within the normal range.'
        : 'Consider consulting your physician about blood‑pressure management.'
  };
}

export default HealthData;
