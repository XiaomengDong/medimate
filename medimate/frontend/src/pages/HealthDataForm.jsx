import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';

function HealthDataForm() {
  // State for form data
  const [formData, setFormData] = useState({
    height: "5'9\"",
    weight: "154.32lb",
    gender: "Male",
    age: "21",
    familyHistory: {
      heartDisease: false,
      diabetes: false,
      cancer: false,
      highBloodPressure: false
    },
    allergenHistory: {
      pollen: false,
      dust: false,
      food: false,
      medication: false
    }
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox change for family history
  const handleFamilyHistoryChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      familyHistory: {
        ...formData.familyHistory,
        [name]: checked
      }
    });
  };

  // Handle checkbox change for allergen history
  const handleAllergenHistoryChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      allergenHistory: {
        ...formData.allergenHistory,
        [name]: checked
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save the data to a database
    alert('Health data saved successfully!');
  };

  return (
    <div className="health-data-form-container">
      <div className="page-header">
        <h1>Health Data Form</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="height">Height</label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <input
              type="text"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-sections">
          <div className="form-section">
            <h2>Family Medical History</h2>
            <p className="section-note">
              Note: The family medical history is an important tool in assessing the risk of genetic diseases and health conditions. It helps doctors understand your predisposition to certain diseases, allowing for early detection, prevention, and tailored treatments.
            </p>

            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="heartDisease"
                  name="heartDisease"
                  checked={formData.familyHistory.heartDisease}
                  onChange={handleFamilyHistoryChange}
                />
                <label htmlFor="heartDisease">Heart Disease</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="diabetes"
                  name="diabetes"
                  checked={formData.familyHistory.diabetes}
                  onChange={handleFamilyHistoryChange}
                />
                <label htmlFor="diabetes">Diabetes</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cancer"
                  name="cancer"
                  checked={formData.familyHistory.cancer}
                  onChange={handleFamilyHistoryChange}
                />
                <label htmlFor="cancer">Cancer</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="highBloodPressure"
                  name="highBloodPressure"
                  checked={formData.familyHistory.highBloodPressure}
                  onChange={handleFamilyHistoryChange}
                />
                <label htmlFor="highBloodPressure">High Blood Pressure</label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Allergen History</h2>
            <p className="section-note">
              Note: Understanding your allergen history is essential for managing allergic reactions and preventing severe symptoms. It helps identify triggers and allows for appropriate treatment or avoidance strategies.
            </p>

            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="pollen"
                  name="pollen"
                  checked={formData.allergenHistory.pollen}
                  onChange={handleAllergenHistoryChange}
                />
                <label htmlFor="pollen">Pollen</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="dust"
                  name="dust"
                  checked={formData.allergenHistory.dust}
                  onChange={handleAllergenHistoryChange}
                />
                <label htmlFor="dust">Dust</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="food"
                  name="food"
                  checked={formData.allergenHistory.food}
                  onChange={handleAllergenHistoryChange}
                />
                <label htmlFor="food">Food</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="medication"
                  name="medication"
                  checked={formData.allergenHistory.medication}
                  onChange={handleAllergenHistoryChange}
                />
                <label htmlFor="medication">Medication</label>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="save-btn">
          <FaSave />
          <span>Save</span>
        </button>
      </form>
    </div>
  );
}

export default HealthDataForm;