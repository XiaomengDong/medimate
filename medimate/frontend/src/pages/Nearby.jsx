import React, { useState, useEffect } from 'react';
import { FaHospital, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {getNearbyHospitals} from "../services/api";

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

function Nearby() {
    const [viewType, setViewType] = useState('list');
    const [hospitals, setHospitals] = useState([]);
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                try {
                    const list = await getNearbyHospitals(latitude, longitude);
                    setHospitals(list);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error(error);
                setLoading(false);
            }
        );
    }, []);

    const renderRating = (rating) => {
        const stars = [];
        const full = Math.floor(rating);
        const half = rating % 1 !== 0;
        for (let i = 0; i < full; i++) stars.push(<FaStar key={`star-${i}`} className="star-filled" />);
        if (half) stars.push(<FaStar key="half-star" className="star-half" />);
        for (let i = stars.length; i < 5; i++) stars.push(<FaStar key={`empty-${i}`} className="star-empty" />);
        return stars;
    };

    const handleSchedule = (id) => alert(`Scheduling for hospital ID: ${id}`);

    if (loading) return <p>Loading nearby hospitals...</p>;

    return (
        <div className="nearby-container">
            <h1>Nearby Hospitals</h1>
            <div className="view-toggle">
                <button className={`toggle-button ${viewType==='list'?'active':''}`} onClick={()=>setViewType('list')}>List View</button>
                <button className={`toggle-button ${viewType==='map'?'active':''}`} onClick={()=>setViewType('map')}>Map View</button>
            </div>

            {viewType === 'list' ? (
                <div className="hospitals-list">
                    {hospitals?.hospitals?.length > 0 ?
                        hospitals.hospitals.map(h => (
                        <div key={h.id} className="hospital-card">
                            <FaHospital size={24} />
                            <div>
                                <h2>{h.name}</h2>
                                <p><FaMapMarkerAlt /> {h.address}</p>
                                <div className="rating">{renderRating(h.rating)} <span>{h.rating}</span></div>
                                <button className="schedule-button" onClick={()=>handleSchedule(h.id)}><FaCalendarAlt /> Schedule</button>
                            </div>
                        </div>
                    )): (
                            <p>No hospitals found nearby.</p>
                        )
                    }
                </div>
            ) : (
                <div className="map-view">
                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={coords} zoom={13}>
                            {hospitals.hospitals.map(h => <Marker key={h.id} position={{ lat: h.lat, lng: h.lng }} />)}
                        </GoogleMap>
                    </LoadScript>
                </div>
            )}
        </div>
    );
}

export default Nearby;
