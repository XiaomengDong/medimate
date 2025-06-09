const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.js');
const authenticateToken = require('./middleware/auth.js');
const healthDataRoutes = require('./routes/healthData.js');
const AIAssistant = require('./models/AIAssistant');
const aiAssistantRoutes = require('./routes/aiAssistant.js');
const healthProfileRoutes = require('./routes/healthProfile.js');
const app = express();
const PORT = process.env.PORT || 5050;
const assistant   = new AIAssistant();
app.set('aiAssistant', assistant);

app.use(cors({
  origin: [
    'https://medimate-chi.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

//
app.use('/api/health-data', healthDataRoutes);
app.use('/api/health-profile', healthProfileRoutes);
//app.use('/api/devices', devicesRoutes);
//app.use('/api/hospitals', hospitalsRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'MediMate Backend API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});