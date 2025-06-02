import React, { useState } from 'react';
import { FaHospital, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

function Nearby() {
  const [viewType, setViewType] = useState('list'); // 'list' or 'map'
  
  // Mock hospital data
  const hospitals = [
    {
      id: 1,
      name: 'General Hospital',
      distance: '1.2 miles',
      address: '123 Healthcare Ave, Medical District',
      phone: '(555) 123-4567',
      rating: 4.5,
      specialties: ['Emergency Care', 'Surgery', 'Pediatrics'],
      availability: 'Open 24/7',
    },
    {
      id: 2,
      name: 'Community Medical Center',
      distance: '2.7 miles',
      address: '456 Wellness Blvd, Healing Heights',
      phone: '(555) 987-6543',
      rating: 4.2,
      specialties: ['Family Medicine', 'Orthopedics', 'Cardiology'],
      availability: 'Open 7AM - 10PM',
    },
    {
      id: 3,
      name: 'Wellness Clinic',
      distance: '3.5 miles',
      address: '789 Health Lane, Care Commons',
      phone: '(555) 456-7890',
      rating: 4.8,
      specialties: ['Preventive Care', 'Mental Health', 'Nutrition'],
      availability: 'Open 8AM - 8PM',
    }
  ];

  // Function to render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="star-filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStar key="half-star" className="star-half" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star-empty" />);
    }
    
    return stars;
  };

  // Function to handle scheduling (mock)
  const handleSchedule = (hospitalId) => {
    alert(`Scheduling functionality would be implemented here for hospital ID: ${hospitalId}`);
  };

  return (
    <div className="nearby-container">
      <h1>Nearby Hospitals</h1>
      <p>Find and connect with healthcare facilities near you</p>
      
      <div className="view-toggle">
        <button 
          className={`toggle-button ${viewType === 'list' ? 'active' : ''}`}
          onClick={() => setViewType('list')}
        >
          List View
        </button>
        <button 
          className={`toggle-button ${viewType === 'map' ? 'active' : ''}`}
          onClick={() => setViewType('map')}
        >
          Map View
        </button>
      </div>
      
      {viewType === 'list' ? (
        <div className="hospitals-list">
          {hospitals.map(hospital => (
            <div key={hospital.id} className="hospital-card">
              <div className="hospital-icon">
                <FaHospital size={24} />
              </div>
              <div className="hospital-info">
                <h2>{hospital.name}</h2>
                <p className="distance"><FaMapMarkerAlt /> {hospital.distance}</p>
                <div className="rating">
                  {renderRating(hospital.rating)}
                  <span className="rating-value">{hospital.rating}</span>
                </div>
                <p className="address">{hospital.address}</p>
                <p className="phone"><FaPhone /> {hospital.phone}</p>
                <div className="specialties">
                  <span className="specialties-label">Specialties:</span>
                  {hospital.specialties.join(', ')}
                </div>
                <p className="availability">{hospital.availability}</p>
              </div>
              <button 
                className="schedule-button"
                onClick={() => handleSchedule(hospital.id)}
              >
                <FaCalendarAlt /> Schedule
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="map-view">
          <div className="map-placeholder">
            <p>Map view would be implemented here, showing hospital locations</p>
            <p>This would integrate with a mapping service like Google Maps</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nearby;