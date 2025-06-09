const express = require('express');
const cors = require('cors');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require("../middleware/auth");

// router.use(authMiddleware);

// Get all doctors
router.get('/doctors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, specialty, phone, email, address, rating, experience_years 
            FROM doctors 
            ORDER BY name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// Get doctor by ID
router.get('/doctors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT id, name, specialty, phone, email, address, rating, experience_years 
            FROM doctors 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching doctor:', err);
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.id,
                a.user_id,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.notes,
                a.created_at,
                d.name as doctor_name,
                d.specialty as doctor_specialty
            FROM appointments a
            JOIN users d ON a.doctor_id = d.id
            ORDER BY a.appointment_date, a.appointment_time
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// GET /appointments/:userId
router.get('/appointments/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    const query = `
    SELECT
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      a.notes,
      a.created_at,
      d.name       AS doctor_name,
      d.specialty  AS doctor_specialty
    FROM appointments AS a
    JOIN doctors     AS d ON a.doctor_id = d.id
    WHERE a.user_id = $1
    ORDER BY a.appointment_date, a.appointment_time
  `;

    try {
        const { rows } = await pool.query(query, [userId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching appointments for user', userId, err);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Create new appointment
router.post('/appointments', async (req, res) => {
    try {
        const {
            user_id,
            doctor_id,
            appointment_date,
            appointment_time,
            notes
        } = req.body;

        // Validate required fields
        if (!doctor_id || !user_id || !appointment_date || !appointment_time) {
            return res.status(400).json({
                error: 'Missing required fields: doctor_id, user_id, appointment_date, appointment_time'
            });
        }

        // Check if doctor exists
        const doctorCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctor_id]);
        if (doctorCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check for conflicting appointments
        const conflictCheck = await pool.query(`
            SELECT id FROM appointments 
            WHERE user_id = $1 AND doctor_id = $2 AND appointment_date = $3 AND appointment_time = $4 AND status != 'cancelled'
        `, [user_id, doctor_id, appointment_date, appointment_time]);

        if (conflictCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Time slot already booked' });
        }

        // Create appointment
        const result = await pool.query(`
            INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [user_id, doctor_id, appointment_date, appointment_time, notes]);

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating appointment:', err);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

// Update appointment status
router.patch('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const result = await pool.query(`
            UPDATE appointments 
            SET status = COALESCE($1, status), notes = COALESCE($2, notes)
            WHERE id = $3
            RETURNING *
        `, [status, notes, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({
            message: 'Appointment updated successfully',
            appointment: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating appointment:', err);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

// Delete appointment
router.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error('Error deleting appointment:', err);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

module.exports = router;