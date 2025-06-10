import React, { useState, useEffect } from 'react';
import { FaHospital, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaUserCircle, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import {
    fetchDoctors,
    fetchPatientAppointments,
    createAppointment,
    cancelAppointment
} from '../services/api';

function DocAppointment() {
    const { user } = useAuth();
    const [viewType, setViewType] = useState('appointments');
    const [doctors, setDoctors] = useState([]);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const [appointmentForm, setAppointmentForm] = useState({
        appointment_date: '',
        appointment_time: '',
        notes: ''
    });

    useEffect(() => {
        fetchDoctors()
            .then(setDoctors)
            .catch(() => setError('Failed to load doctors'));
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchPatientAppointments(user.id)
                .then(data => setPatientAppointments(data))
                .catch(() => setError('Failed to load your appointments'))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleSchedule = doctor => {
        setSelectedDoctor(doctor);
        setShowScheduleModal(true);
        setAppointmentForm({ appointment_date: '', appointment_time: '', notes: '' });
    };

    const handleAppointmentInputChange = e => {
        const { name, value } = e.target;
        setAppointmentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitAppointment = async e => {
        e.preventDefault();
        if (!appointmentForm.appointment_date || !appointmentForm.appointment_time) {
            alert('Please select both date and time');
            return;
        }
        try {
            await createAppointment({
                userId: user.id,
                doctorId: selectedDoctor.id,
                ...appointmentForm
            });
            alert('Appointment scheduled successfully!');
            setShowScheduleModal(false);
            // Refresh appointments
            const updated = await fetchPatientAppointments(user.id);
            setPatientAppointments(updated);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleCancelAppointment = async id => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await cancelAppointment(id);
            alert('Appointment cancelled successfully');
            const updated = await fetchPatientAppointments(user.id);
            setPatientAppointments(updated);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const formatDate = dateString =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const formatTime = timeString =>
        new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const getStatusColor = status => {
        switch (status) {
            case 'scheduled': return '#27ae60';
            case 'completed': return '#3498db';
            case 'cancelled': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    if (loading) return <div>Loading your appointments...</div>;

    return (
        <div className="patient-container">
            <h1>Doctor Appointments</h1>
            {error && <div className="error">{error}</div>}

            {/* View Toggle */}
            <div className="view-toggle">
                <button
                    className={`toggle-button ${viewType === 'appointments' ? 'active' : ''}`}
                    onClick={() => setViewType('appointments')}
                >
                    My Appointments ({patientAppointments.length})
                </button>
                <button
                    className={`toggle-button ${viewType === 'book' ? 'active' : ''}`}
                    onClick={() => setViewType('book')}
                >
                    Book New Appointment
                </button>
            </div>

            {viewType === 'appointments' ? (
                <div className="appointments-section">
                    <h2>Your Appointments</h2>
                    {patientAppointments.length === 0 ? (
                        <div className="no-appointments">
                            <FaCalendarAlt className="no-apt-icon" />
                            <h3>No Appointments Found</h3>
                            <p>You don't have any appointments scheduled yet.</p>
                            <button
                                className="book-first-btn"
                                onClick={() => setViewType('book')}
                            >
                                Book Your First Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="appointments-list">
                            {patientAppointments.map((appointment) => (
                                <div key={appointment.id} className="patient-appointment-card">
                                    <div className="appointment-main">
                                        <div className="appointment-header">
                                            <div className="doctor-info">
                                                <h3>{appointment.doctor_name}</h3>
                                                <p className="specialty">
                                                    {appointment.doctor_specialty}
                                                </p>
                                            </div>
                                            <div
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(appointment.status) }}
                                            >
                                                {appointment.status}
                                            </div>
                                        </div>

                                        <div className="appointment-details">
                                            <div className="detail-item">
                                                <div>
                                                    <FaCalendarAlt className="apt-icon" />
                                                    <strong>Date & Time</strong>
                                                    <p>{formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}</p>
                                                </div>
                                            </div>

                                            {appointment.notes && (
                                                <div className="detail-item">
                                                    <div className="notes-section">
                                                        <strong>Notes:</strong>
                                                        <p>{appointment.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {appointment.status === 'scheduled' && (
                                            <div className="appointment-actions">
                                                <button
                                                    className="cancel-appointment-btn"
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                >
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="book-section">
                    <h2>Book New Appointment</h2>
                    <p>Choose a doctor and schedule your appointment</p>

                    <div className="doctors-grid">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="doctor-card">
                                <div className="doctor-info">
                                    <div className="doctor-header">
                                        <h3>{doctor.name}</h3>
                                        <div className="doctor-rating">
                                            <FaStar className="star-icon" />
                                            <span>{doctor.rating}</span>
                                        </div>
                                    </div>
                                    <div className="doctor-details">
                                        <p className="specialty">
                                            <FaHospital className="icon" />
                                            {doctor.specialty}
                                        </p>
                                        <p className="experience">
                                            {doctor.experience_years} years experience
                                        </p>
                                        <p className="contact">
                                            <FaPhone className="icon" />
                                            {doctor.phone}
                                        </p>
                                        <p className="address">
                                            <FaMapMarkerAlt className="icon" />
                                            {doctor.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="doctor-actions">
                                    <button
                                        className="schedule-btn"
                                        onClick={() => handleSchedule(doctor)}
                                    >
                                        <FaCalendarAlt className="icon" />
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Schedule Appointment Modal */}
            {showScheduleModal && selectedDoctor && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Book Appointment</h2>
                            <button className="close-btn" onClick={() => setShowScheduleModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="doctor-info-modal">
                                <h3>{selectedDoctor.name}</h3>
                                <p>{selectedDoctor.specialty}</p>
                            </div>


                            <form onSubmit={handleSubmitAppointment} className="appointment-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="appointment_date">Date *</label>
                                        <input
                                            type="date"
                                            id="appointment_date"
                                            name="appointment_date"
                                            value={appointmentForm.appointment_date}
                                            onChange={handleAppointmentInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="appointment_time">Time *</label>
                                        <input
                                            type="time"
                                            id="appointment_time"
                                            name="appointment_time"
                                            value={appointmentForm.appointment_time}
                                            onChange={handleAppointmentInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="notes">Notes</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={appointmentForm.notes}
                                        onChange={handleAppointmentInputChange}
                                        rows="3"
                                        placeholder="Any special notes or requirements..."
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowScheduleModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        Book Appointment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocAppointment;