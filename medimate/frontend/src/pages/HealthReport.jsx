import React, { useState, useEffect } from 'react';
import { FaChartLine, FaHeartbeat, FaFileMedical, FaDownload, FaHistory, FaSpinner, FaCheckCircle, FaExclamationCircle, FaSun, FaTint, FaLungs, FaBed } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { makeAuthenticatedRequest, aiAPI } from '../services/api';
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
} from 'lucide-react';
import Loader from '../components/Loader';

function HealthReport() {
  const { user, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [healthReport, setHealthReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [reportType, setReportType] = useState('comprehensive');
  const [healthScore, setHealthScore] = useState(85);
  const [downloading, setDownloading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      fetchHealthData();
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch user's health data
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response =  await makeAuthenticatedRequest('/api/health-data');
      
      if (!response.ok) throw new Error('Failed to fetch health data');
      
      const data = await response.json();
      setHealthData(data);
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

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await makeAuthenticatedRequest('/api/health-profile');
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }

  const generateReport = async () => {
    if (!userProfile) {
      setError("Please update your profile first before generating a report");
      return;
    }
    if (!healthData) {
      setError("Please add your health data first before generating a report");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { heartRate, sleepQuality, bloodOxygen, bloodPressure } = getHealthMetrics();
      const healthData = {
        heartRate,
        sleepQuality,
        bloodOxygen,
        bloodPressure,
        temperature: 98.5,
      }
      const userInfo = {
        height: userProfile.height,
        weight: userProfile.weight,
        age: userProfile.age,
        gender: userProfile.gender,
      }
      const token = localStorage.getItem('token');
      const response = await aiAPI.generateHealthReport(healthData, userInfo);
      if (!response.success) throw new Error('Failed to generate report');
      console.log(response.report);
      setHealthReport(response);
      setShowReport(true);
    } catch (err) {
      console.error('Error generating report:', err);
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

  const getHealthMetrics = () => {
    if (!healthData) return [];
    let heartRate = 0;
    let sleepQuality = 0;
    let bloodOxygen = 0;
    let bloodPressure = 0;
    for (let i = 0; i < healthData.length; i++) {
      if (healthData[i].type === 'heart_rate') {
        heartRate = healthData[i].value;
      }
      if (healthData[i].type === 'sleep_quality') {
        sleepQuality = healthData[i].value;
      }
      if (healthData[i].type === 'blood_oxygen') {
        bloodOxygen = healthData[i].value;
      }
      if (healthData[i].type === 'blood_pressure') {
        bloodPressure = healthData[i].value;
      }
    }
    return { heartRate, sleepQuality, bloodOxygen, bloodPressure };
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal': case 'good': case 'excellent': return 'status-normal';
      case 'elevated': case 'high': case 'fair': return 'status-warning';
      case 'low': case 'poor': return 'status-danger';
      default: return 'status-neutral';
    }
  };

  const getRiskClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'risk-low';
      case 'moderate': return 'risk-moderate';
      case 'high': return 'risk-high';
      default: return 'risk-neutral';
    }
  };

  const VitalSignCard = ({ title, icon: Icon, data }) => (
      <div className="vital-sign-card">
        <div className="vital-sign-header">
          <h3 className="vital-sign-title">
            <Icon className="vital-icon" />
            {title}
          </h3>
          <span className={`status-badge ${getStatusClass(data?.status)}`}>
          {data?.status || 'N/A'}
        </span>
        </div>
        <div className="vital-sign-content">
          <div className="vital-sign-value">
            {data?.value || data?.systolic || 'N/A'}
          </div>
          <p className="vital-sign-analysis">{data?.analysis || 'No analysis available'}</p>
        </div>
      </div>
  );

  const AlertCard = ({ type, alerts, className, icon: Icon }) => (
      alerts && alerts.length > 0 && (
          <div className={`alert-card ${className}`}>
            <div className="alert-header">
              <Icon className="icon" />
              <h4 className="alert-title">{type}</h4>
            </div>
            <ul className="alert-list">
              {alerts.map((alert, index) => (
                  <li key={index} className="alert-item">• {alert}</li>
              ))}
            </ul>
          </div>
      )
  );
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
    {loading && <Loader />}
    {!loading && (
      <div>
        <h1>AI Health Report</h1>
        <p>Generate comprehensive health insights based on your data</p>
        <p>Let's check your health status today! 🏥</p>

        <div id="report-pdf-content">
          {/* Health Score Card */}
          {/*<div className="health-card" style={{ textAlign: 'center', marginBottom: '20px' }}>*/}
          {/*  <FaCheckCircle style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '10px' }} />*/}
          {/*  <h2>Your Health Score</h2>*/}
          {/*  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#3083ff' }}>*/}
          {/*    {healthScore}*/}
          {/*  </div>*/}
          {/*  <p style={{ color: '#777' }}>out of 100</p>*/}
          {/*</div>*/}

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

                {healthReport && (
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

          {/* Generated Report */}
          {showReport && (
            <div className="report-sections">
              {/* Report Summary */}
              <div className="report-summary">
                <div className="summary-header">
                  <h2 className="section-title">Report Summary</h2>
                  <div className="report-timestamp">
                    <Clock className="icon" />
                    Generated: {new Date(healthReport.report.generatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="summary-grid">
                  <div className="summary-item">
                    <User className="summary-icon" />
                    <div className="summary-label">Overall Status</div>
                    <div className={`summary-value ${getStatusClass(healthReport.report.patientSummary?.overallHealthStatus)}`}>
                      {healthReport.report.patientSummary?.overallHealthStatus || 'N/A'}
                    </div>
                  </div>
                  <div className="summary-item">
                    <Activity className="summary-icon" />
                    <div className="summary-label">Data Points</div>
                    <div className="summary-value">
                      {healthReport.metadata?.dataPointsAnalyzed || 0}
                    </div>
                  </div>
                  <div className="summary-item">
                    <FileText className="summary-icon" />
                    <div className="summary-label">Overall Score</div>
                    <div className="summary-value report-score">
                      {healthReport.report.patientSummary?.overallHealthScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="vital-signs-section">
                <h2 className="section-title">Vital Signs</h2>
                <div className="vital-signs-grid">
                  <VitalSignCard
                      title="Heart Rate"
                      icon={Heart}
                      data={healthReport.report.vitalSigns?.heartRate}
                  />
                  <VitalSignCard
                      title="Blood Pressure"
                      icon={Droplets}
                      data={healthReport.report.vitalSigns?.bloodPressure}
                  />
                  <VitalSignCard
                      title="Temperature"
                      icon={Thermometer}
                      data={healthReport.report.vitalSigns?.temperature}
                  />
                  <VitalSignCard
                      title="Oxygen Saturation"
                      icon={Activity}
                      data={healthReport.report.vitalSigns?.oxygenSaturation}
                  />
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="risk-assessment">
                <h2 className="section-title">Risk Assessment</h2>
                <div className="risk-grid">
                  <div className="risk-item">
                    <div className="risk-label">Cardiovascular Risk</div>
                    <span className={`risk-badge ${getRiskClass(healthReport.report.riskAssessment?.cardiovascularRisk)}`}>
                    {healthReport.report.riskAssessment?.cardiovascularRisk || 'N/A'}
                  </span>
                  </div>
                  <div className="risk-item">
                    <div className="risk-label">Diabetes Risk</div>
                    <span className={`risk-badge ${getRiskClass(healthReport.report.riskAssessment?.diabetesRisk)}`}>
                    {healthReport.report.riskAssessment?.diabetesRisk || 'N/A'}
                  </span>
                  </div>
                  <div className="risk-item">
                    <div className="risk-label">Overall Risk</div>
                    <span className={`risk-badge ${getRiskClass(healthReport.report.riskAssessment?.overallRisk)}`}>
                    {healthReport.report.riskAssessment?.overallRisk || 'N/A'}
                  </span>
                  </div>
                </div>
                {healthReport.report.riskAssessment?.riskFactors && healthReport.report.riskAssessment.riskFactors.length > 0 && (
                    <div className="risk-factors">
                      <h4 className="risk-factors-title">Identified Risk Factors:</h4>
                      <ul className="risk-factors-list">
                        {healthReport.report.riskAssessment.riskFactors.map((factor, index) => (
                            <li key={index} className="risk-factor-item">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                )}
              </div>

              {/* Alerts */}
              <div className="alerts-section">
                <h2 className="section-title">Alerts & Notifications</h2>
                <div className="alerts-container">
                  <AlertCard
                      type="Critical"
                      alerts={healthReport.report.alerts?.critical}
                      className="alert-critical"
                      icon={AlertTriangle}
                  />
                  <AlertCard
                      type="Warnings"
                      alerts={healthReport.report.alerts?.warnings}
                      className="alert-warning"
                      icon={AlertTriangle}
                  />
                  <AlertCard
                      type="Notifications"
                      alerts={healthReport.report.alerts?.notifications}
                      className="alert-info"
                      icon={CheckCircle}
                  />
                </div>
              </div>

              {/* Recommendations */}
              <div className="recommendations-section">
                <div className="recommendations-card">
                  <h3 className="card-title">Recommendations</h3>
                  <div className="recommendations-content">
                    {healthReport.report.recommendations?.immediate && (
                        <div className="recommendation-group">
                          <h4 className="recommendation-title immediate">Immediate Actions:</h4>
                          <ul className="recommendation-list">
                            {healthReport.report.recommendations.immediate.map((rec, index) => (
                                <li key={index} className="recommendation-item">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                    )}
                    {healthReport.report.recommendations?.lifestyle && (
                        <div className="recommendation-group">
                          <h4 className="recommendation-title lifestyle">Lifestyle Changes:</h4>
                          <ul className="recommendation-list">
                            {healthReport.report.recommendations.lifestyle.map((rec, index) => (
                                <li key={index} className="recommendation-item">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                    )}
                  </div>
                </div>

                {/*Health Trends*/}
                {/*<div className="trends-card">*/}
                {/*  <h3 className="card-title">Health Trends</h3>*/}
                {/*  <div className="trends-content">*/}
                {/*    {healthReport.report.trends?.improving && healthReport.report.trends.improving.length > 0 && (*/}
                {/*        <div className="trend-group">*/}
                {/*          <h4 className="trend-title improving">*/}
                {/*            <TrendingUp className="icon" />*/}
                {/*            Improving:*/}
                {/*          </h4>*/}
                {/*          <ul className="trend-list">*/}
                {/*            {healthReport.report.trends.improving.map((trend, index) => (*/}
                {/*                <li key={index} className="trend-item">• {trend}</li>*/}
                {/*            ))}*/}
                {/*          </ul>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*    {healthReport.report.trends?.declining && healthReport.report.trends.declining.length > 0 && (*/}
                {/*        <div className="trend-group">*/}
                {/*          <h4 className="trend-title declining">*/}
                {/*            <TrendingDown className="icon" />*/}
                {/*            Declining:*/}
                {/*          </h4>*/}
                {/*          <ul className="trend-list">*/}
                {/*            {healthReport.report.trends.declining.map((trend, index) => (*/}
                {/*                <li key={index} className="trend-item">• {trend}</li>*/}
                {/*            ))}*/}
                {/*          </ul>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>

              {/* Disclaimer */}
              <div className="disclaimer">
                <p className="disclaimer-text">
                  {healthReport.report.disclaimer}
                </p>
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
    )}
  </div>
);
}

export default HealthReport;