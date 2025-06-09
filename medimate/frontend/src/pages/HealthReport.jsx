import React, { useState, useEffect } from 'react';
import { FaChartLine, FaHeartbeat, FaFileMedical, FaDownload, FaHistory, FaSpinner, FaCheckCircle, FaExclamationCircle, FaSun, FaTint, FaLungs, FaBed } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function HealthReport() {
  const { user, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [report, setReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [reportType, setReportType] = useState('comprehensive');
  const [healthScore, setHealthScore] = useState(85);
  const [downloading, setDownloading] = useState(false);

  // Fetch health data on component mount
  useEffect(() => {
    if (user) {
      fetchHealthData();
      fetchReportHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/health-report/data/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch health data');
      
      const data = await response.json();
      setHealthData(data);
      calculateHealthScore(data.healthMetrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/health-report/history/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch report history');
      
      const data = await response.json();
      setReportHistory(data.reports);
    } catch (err) {
      console.error('Error fetching report history:', err);
    }
  };

  const calculateHealthScore = (metrics) => {
    let score = 100;
    
    if (metrics.heartRate.average < 60 || metrics.heartRate.average > 100) {
      score -= 10;
    }
    
    if (metrics.bloodPressure.systolic.average > 130 || metrics.bloodPressure.diastolic.average > 80) {
      score -= 15;
    }
    
    if (metrics.bloodOxygen.average < 95) {
      score -= 20;
    }
    
    setHealthScore(Math.max(0, score));
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/health-report/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          healthData,
          reportType
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('report-pdf-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`health-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getChartData = () => {
    if (!healthData || !healthData.healthMetrics) return [];
    
    switch (selectedMetric) {
      case 'heartRate':
        return healthData.healthMetrics.heartRate.data;
      case 'bloodOxygen':
        return healthData.healthMetrics.bloodOxygen.data;
      case 'sleepQuality':
        return healthData.healthMetrics.sleepQuality.data;
      case 'weight':
        return healthData.healthMetrics.weight.data;
      default:
        return [];
    }
  };

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

  if (loading && !healthData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div>Loading health data...</div>
      </div>
    );
  }

  return (
    <div>
      {user && isAuthenticated ? (
        <h1>Hello, {user.username}!</h1>
      ) : (
        <h1>AI Health Report</h1>
      )}
      <p>Generate comprehensive health insights based on your data</p>
      <p>Let's check your health status today! 🏥</p>

      <div id="report-pdf-content">
        {/* Health Score Card */}
        <div className="health-card" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <FaCheckCircle style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '10px' }} />
          <h2>Your Health Score</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#3083ff' }}>
            {healthScore}
          </div>
          <p style={{ color: '#777' }}>out of 100</p>
        </div>

        {/* Report Controls */}
        <div className="health-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
              <label style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>Report Type:</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '16px',
                  minWidth: '150px'
                }}
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="monthly">Monthly Summary</option>
                <option value="quarterly">Quarterly Review</option>
                <option value="focused">Focused Analysis</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button 
                onClick={generateReport}
                disabled={loading || !healthData}
                style={{ 
                  backgroundColor: '#3083ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  opacity: (loading || !healthData) ? '0.6' : '1'
                }}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaFileMedical />
                    Generate Report
                  </>
                )}
              </button>

              {report && (
                <button 
                  onClick={downloadPDF}
                  disabled={downloading}
                  style={{ 
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    opacity: downloading ? '0.6' : '1'
                  }}
                >
                  {downloading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <FaDownload />
                      Download PDF
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="health-card" style={{ backgroundColor: '#fee', color: '#c00' }}>
            {error}
          </div>
        )}

        {/* Health Metrics Tabs */}
        {healthData && (
          <>
            <div className="metric-tabs">
              <button 
                className={`metric-tab ${selectedMetric === 'heartRate' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('heartRate')}
              >
                <FaHeartbeat /> Heart Rate
              </button>
              <button 
                className={`metric-tab ${selectedMetric === 'sleepQuality' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('sleepQuality')}
              >
                <FaBed /> Sleep Quality
              </button>
              <button 
                className={`metric-tab ${selectedMetric === 'bloodOxygen' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('bloodOxygen')}
              >
                <FaLungs /> Blood Oxygen
              </button>
              <button 
                className={`metric-tab ${selectedMetric === 'bloodPressure' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('bloodPressure')}
              >
                <FaTint /> Blood Pressure
              </button>
            </div>

            <div className="health-card">
              <div className="metric-header">
                {getIcon(selectedMetric)}
                <h2>
                  {selectedMetric === 'heartRate' ? 'Heart Rate' : 
                   selectedMetric === 'sleepQuality' ? 'Sleep Quality' : 
                   selectedMetric === 'bloodOxygen' ? 'Blood Oxygen' : 
                   'Blood Pressure'}
                </h2>
              </div>

              {/* Display current metric values */}
              <div className="metric-value">
                <span className="current-value">
                  {selectedMetric === 'heartRate' && `${healthData.healthMetrics.heartRate.average}`}
                  {selectedMetric === 'bloodPressure' && `${healthData.healthMetrics.bloodPressure.systolic.average}/${healthData.healthMetrics.bloodPressure.diastolic.average}`}
                  {selectedMetric === 'bloodOxygen' && `${healthData.healthMetrics.bloodOxygen.average}`}
                  {selectedMetric === 'sleepQuality' && `${healthData.healthMetrics.sleepQuality.average}`}
                </span>
                <span className="unit">
                  {selectedMetric === 'heartRate' && 'BPM'}
                  {selectedMetric === 'bloodPressure' && 'mmHg'}
                  {selectedMetric === 'bloodOxygen' && '%'}
                  {selectedMetric === 'sleepQuality' && '/10'}
                </span>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3083ff" 
                    strokeWidth={2}
                    dot={{ fill: '#3083ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Generated Report */}
        {report && (
          <div className="health-card" style={{ marginTop: '30px' }}>
            <h2>Your Health Report</h2>
            <div style={{ lineHeight: '1.8', marginTop: '20px' }}>
              <ReactMarkdown>{report.content}</ReactMarkdown>
            </div>
            <div style={{ 
              marginTop: '30px', 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeeba',
              borderRadius: '5px',
              color: '#856404'
            }}>
              <strong>Disclaimer:</strong> This report is generated by AI and should not replace professional medical advice. 
              Always consult with healthcare professionals for medical decisions.
            </div>
          </div>
        )}

        {/* Report History */}
        {reportHistory.length > 0 && (
          <div className="health-card" style={{ marginTop: '30px' }}>
            <h2><FaHistory /> Previous Reports</h2>
            {reportHistory.map(historyReport => (
              <div key={historyReport.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize' }}>
                    {historyReport.reportType} Report
                  </h4>
                  <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>
                    Generated: {new Date(historyReport.generatedAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#555' }}>
                    {historyReport.summary}
                  </p>
                </div>
                <button className="btn" style={{ backgroundColor: '#3083ff', color: 'white' }}>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthReport;