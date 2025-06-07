const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.js');
const authenticateToken = require('./middleware/auth.js');
const aiAssistantRoutes = require('./routes/aiAssistant');

const app = express();
const PORT = process.env.PORT || 5050;

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

// Get Nearby Hospitals
app.get('/api/nearby-hospitals', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat & lng required' });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const clientKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || !clientKey) {
    return res.status(500).json({ error: 'Google Maps API keys not configured.' });
  }
  const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json
      ?location=${lat},${lng}
      &radius=5000
      &type=hospital
      &key=${apiKey}`
          .replace(/\s+/g, '');

  try {
    const r = await fetch(url);
    const data = await r.json();
    if (data.status !== 'OK') return res.status(502).json({ error: data.status });

    const hospitals = data.results.map(p => ({
      id:         p.place_id,
      name:       p.name,
      lat:        p.geometry.location.lat,
      lng:        p.geometry.location.lng,
      rating:     p.rating || 0,
      address:    p.vicinity,
      photo:      p.photos?.[0]?.photo_reference || '',
      website:    p.website || `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
    }));
    res.status(200).json({
      hospitals,
      mapsKey: clientKey
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Google Maps API Server Error' });
  }
});

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// AI routes
app.use('/api/ai', aiAssistantRoutes);
