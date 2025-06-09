// src/pages/HealthData.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FaHeartbeat, FaBed, FaLungs, FaTint, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { makeAuthenticatedRequest } from '../services/api';

function HealthData() {
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  /* 新增的编辑状态 */
  const [editing, setEditing] = useState(null);      // {key, id|null, draft:''}

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await makeAuthenticatedRequest('/api/health-data');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Response is not an array');
        setRecords(data);
      } catch (err) {
        setError(err.message);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------- 归并四大指标 -------- */
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
    const latest = arr => arr.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    return {
      heartRate: buildHeartRate(group.heartRate),
      sleepQuality:buildSleepQuality(group.sleepQuality),
      bloodOxygen: buildBloodOxygen(group.bloodOxygen),
      bloodPressure: buildBloodPressure(group.bloodPressure)
    };
  }, [records]);

  const metricData = healthData[selectedMetric];
  const isEditing  = editing?.key === selectedMetric;

  const startEdit = () => {
    if (metricData) {
      setEditing({ key:selectedMetric, id:metricData.id, draft: metricData.current.replace(metricData.unit,'').trim() });
    } else {
      setEditing({ key:selectedMetric, id:null, draft:'' });
    }
  };
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    const payload = { value: editing.draft };
    const typeMap = {
      heartRate:'heart_rate',
      sleepQuality:'sleep_quality',
      bloodOxygen:'blood_oxygen',
      bloodPressure:'blood_pressure'
    };
    try {
      let saved;
      if (editing.id) {
        const res = await makeAuthenticatedRequest(`/api/health-data/${editing.id}`, {
          method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        saved = await res.json();
      } else {
        const res = await makeAuthenticatedRequest('/api/health-data', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            date: new Date().toISOString().slice(0,10),
            type: typeMap[selectedMetric],
            value: editing.draft
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        saved = await res.json();
      }
      // 更新前端缓存
      setRecords(r => {
        const others = r.filter(e => e.id !== saved.id);
        return [...others, saved];
      });
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;

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

      {/* ---- Tabs ---- */}
      <div className="metric-tabs">
        {['heartRate','sleepQuality','bloodOxygen','bloodPressure'].map(key=>(
          <button key={key}
            className={`metric-tab ${selectedMetric===key?'active':''}`}
            onClick={()=>setSelectedMetric(key)}
          >
            {getIcon(key)}{' '}
            {key==='heartRate'?'Heart Rate':
             key==='sleepQuality'?'Sleep Quality':
             key==='bloodOxygen'?'Blood Oxygen':'Blood Pressure'}
          </button>
        ))}
      </div>

      {/* ---- Card ---- */}
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
          {isEditing ? (
            <>
              <input
                className="value-input"
                value={editing.draft}
                onChange={e=>setEditing({...editing,draft:e.target.value})}
              />
              <span className="unit">{metricData?.unit||getUnit(selectedMetric)}</span>
            </>
          ) : metricData ? (
            <>
              <span className="current-value">{metricData.current}</span>
              <span className="unit">{metricData.unit}</span>
            </>
          ) : (
            <span>No data for this metric yet.</span>
          )}
        </div>

        {metricData && (
          <div className="metric-status">
            Status:{' '}
            <span className={`status-${metricData.status.toLowerCase()}`}>
              {metricData.status}
            </span>
          </div>
        )}

        {metricData && (
          <div className="metric-recommendation">
            <h3>Recommendation:</h3>
            <p>{metricData.recommendation}</p>
          </div>
        )}

        {/* ---- Buttons ---- */}
        <div className="flex gap-3 mt-3">
          {!isEditing && (
            <button className="icon-btn" onClick={startEdit}>
              <FaEdit /> Edit
            </button>
          )}
          {isEditing && (
            <>
              <button className="icon-btn text-green-600"
                disabled={editing.draft.trim()===(metricData?.current.replace(metricData.unit,'').trim()||'')}
                onClick={saveEdit}>
                <FaSave /> Save
              </button>
              <button className="icon-btn-cancel text-red-600" onClick={cancelEdit}>
                <FaTimes /> Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- util ---------- */
function getUnit(key){
  return key==='bloodPressure'?'mmHg':
         key==='heartRate'?'BPM':'%';
}

function buildHeartRate(arr){
  if(!arr.length)return null;
  const latest=arr.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const n=Number(latest.value);
  let status,reco;
  if(n<60){ status='Low'; reco='Heart rate below 60 BPM — Seek medical attention if symptoms become apparent.'; }
  else if(n<=100){ status='Normal'; reco='Heart rate within normal range.'; }
  else{ status='High'; reco='Elevated heart rate — Consult your doctor when you are in a relaxed state or if necessary.'; }
  return { id:latest.id,current:`${n}`,unit:'BPM',status,recommendation:reco };
}

function buildSleepQuality(arr){
  if(!arr.length)return null;
  const latest=arr.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const n=Number(latest.value);
  let status,reco;
  if(n>=85){ status='Good'; reco='Great sleep quality—keep your routine.'; }
  else if(n>=70){ status='Average'; reco='Average sleep — Maintain a regular routine..'; }
  else{ status='Poor'; reco='Poor sleep quality — Improving sleep hygiene.'; }
  return { id:latest.id,current:`${n}`,unit:'%',status,recommendation:reco };
}

function buildBloodOxygen(arr){
  if(!arr.length)return null;
  const latest=arr.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const n=Number(latest.value);
  let status,reco;
  if(n>=96){ status='Excellent'; reco='Blood oxygen excellent.'; }
  else if(n>=92){ status='Normal'; reco='Blood oxygen acceptable — Keep monitoring.'; }
  else{ status='Low'; reco='Low SpO₂ — Seek medical attention if necessary.'; }
  return { id:latest.id,current:`${n}`,unit:'%',status,recommendation:reco };
}

function buildBloodPressure(arr){
  if(!arr.length)return null;
  const latest=arr.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const[sys,dia]=latest.value.split('/').map(Number);
  const status=(sys<120&&dia<80)?'Normal':'Elevated';
  return{
    id:latest.id,
    current:latest.value,
    unit:'mmHg',
    status,
    recommendation:
      status==='Normal'?
        'Your blood pressure is within the normal range.'
        :'Consider consulting your physician about blood‑pressure management.'
  };
}

export default HealthData;
