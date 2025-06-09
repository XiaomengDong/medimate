// src/pages/HealthDataForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaSave } from 'react-icons/fa';
import { makeAuthenticatedRequest } from '../services/api';

const EMPTY_FORM = {
  height: '',
  weight: '',
  gender: '',
  age: '',
  familyHistory: {
    heartDisease: false,
    diabetes: false,
    cancer: false,
    highBloodPressure: false,
    other: false,
    otherText: ''
  },
  allergenHistory: {
    pollen: false,
    dust: false,
    food: false,
    medication: false,
    other: false,
    otherText: ''
  }
};

export default function HealthDataForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [original, setOriginal] = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error,  setError]      = useState(null);
  const mounted = useRef(false);

  /* ---------- 初次加载：拉档案 ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await makeAuthenticatedRequest('/api/health-profile');
        if (res.status === 404) {
          return;
        }
        if (res.ok) {
          const p = await res.json();
          // 后端字段 → 前端形状
          setFormData({
            height: p.height ?? '',
            weight: p.weight ?? '',
            gender: p.gender ?? '',
            age:    p.age?.toString() ?? '',
            familyHistory: { ...EMPTY_FORM.familyHistory, ...(p.family_history || {}) },
            allergenHistory:{ ...EMPTY_FORM.allergenHistory, ...(p.allergen_history||{}) }
          });
          setOriginal(p);    // 保存对比基准
        }
      } catch (err) {
        setError(err.message);
      } finally {
        mounted.current = true;
      }
    })();
  }, []);

  /* ---------- 字段更新工具 ---------- */
  const updateField = (name, value) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const updateNested = (group, name, value) =>
    setFormData(prev => ({
      ...prev,
      [group]: { ...prev[group], [name]: value }
    }));

  /* ---------- dirty 计算 ---------- */
  const dirty =
    mounted.current &&
    JSON.stringify(formData) !== JSON.stringify({
      ...EMPTY_FORM,
      ...original,
      familyHistory: { ...EMPTY_FORM.familyHistory, ...(original.family_history || {}) },
      allergenHistory:{ ...EMPTY_FORM.allergenHistory, ...(original.allergen_history || {}) }
    });

  /* ---------- 提交 ---------- */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        height: formData.height,
        weight: formData.weight,
        gender: formData.gender,
        age:    formData.age ? Number(formData.age) : null,
        family_history:   formData.familyHistory,
        allergen_history: formData.allergenHistory
      };
      const res = await makeAuthenticatedRequest('/api/health-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOriginal(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- 渲染 ---------- */
  return (
    <div className="health-data-form-container">
      <div className="page-header">
        <h1>Health Data Form</h1>
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* ===== 基本信息 ===== */}
        <div className="form-grid">
          <Input label="Height"  name="height" value={formData.height}
                 onChange={e => updateField('height', e.target.value)} />
          <Input label="Weight"  name="weight" value={formData.weight}
                 onChange={e => updateField('weight', e.target.value)} />
          <Input label="Gender"  name="gender" value={formData.gender}
                 onChange={e => updateField('gender', e.target.value)} />
          <Input label="Age"     name="age" type="number" value={formData.age}
                 onChange={e => updateField('age', e.target.value)} />
        </div>

        {/* ===== Family History ===== */}
        <Section
          title="Family Medical History"
          note="Note: The family medical history is an important tool in assessing the risk of genetic diseases and health conditions. It helps doctors understand your predisposition to certain diseases, allowing for early detection, prevention, and tailored treatments."
        >
          {['heartDisease','diabetes','cancer','highBloodPressure'].map(key => (
            <Checkbox
              key={key}
              id={key}
              label={toLabel(key)}
              checked={formData.familyHistory[key]}
              onChange={e => updateNested('familyHistory', key, e.target.checked)}
            />
          ))}
          <Checkbox
            id="familyOther"
            label="Other"
            checked={formData.familyHistory.other}
            onChange={e => updateNested('familyHistory','other',e.target.checked)}
          />
          {formData.familyHistory.other && (
            <textarea
              className="form-control mt-2 w-full"
              placeholder="Describe other conditions"
              value={formData.familyHistory.otherText}
              onChange={e => updateNested('familyHistory','otherText',e.target.value)}
            />
          )}
        </Section>

        {/* ===== Allergen History ===== */}
        <Section
          title="Allergen History"
          note="Note: Understanding your allergen history is essential for managing allergic reactions and preventing severe symptoms. It helps identify triggers and allows for appropriate treatment or avoidance strategies."
        >
          {['pollen','dust','food','medication'].map(key => (
            <Checkbox
              key={key}
              id={key}
              label={toLabel(key)}
              checked={formData.allergenHistory[key]}
              onChange={e => updateNested('allergenHistory', key, e.target.checked)}
            />
          ))}
          <Checkbox
            id="allergenOther"
            label="Other"
            checked={formData.allergenHistory.other}
            onChange={e => updateNested('allergenHistory','other',e.target.checked)}
          />
          {formData.allergenHistory.other && (
            <textarea
              className="form-control mt-2 w-full"
              placeholder="Describe other allergens"
              value={formData.allergenHistory.otherText}
              onChange={e => updateNested('allergenHistory','otherText',e.target.value)}
            />
          )}
        </Section>

        {/* ===== Save ===== */}
        <button type="submit" className="save-btn" disabled={!dirty || saving}>
          <FaSave />
          <span>{saving ? 'Saving…' : 'Save'}</span>
        </button>
      </form>
    </div>
  );
}

/* ========== 辅助子组件 ========== */
const Input = ({ label, ...rest }) => (
  <div className="form-group">
    <label htmlFor={rest.name}>{label}</label>
    <input {...rest} className="form-control" />
  </div>
);

const Checkbox = ({ id, label, ...rest }) => (
  <div className="checkbox-item">
    <input type="checkbox" id={id} {...rest} />
    <label htmlFor={id}>{label}</label>
  </div>
);

const Section = ({ title, note, children }) => (
  <div className="form-section">
    <h2>{title}</h2>
    <p className="section-note">{note}</p>
    <div className="checkbox-group">{children}</div>
  </div>
);

const toLabel = str =>
  str.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase());
