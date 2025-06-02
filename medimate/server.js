// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 1) Middleware: parse incoming JSON bodies
app.use(express.json());

// 2) Enable CORS (so React can fetch from localhost:5000)
app.use(cors({
  origin: 'http://localhost:3000', // React development server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 3) Example: a simple “health check” route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 4) Example: a “users” route group (you can break this out later)
//    You could also import from ./routes/users.js
app.get('/api/users', (req, res) => {
  // In a real app, you’d fetch from a database. Here, we send dummy data:
  const dummyUsers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' }
  ];
  res.json(dummyUsers);
});

// 5) (Optional) In production, serve React’s build files
// if (process.env.NODE_ENV === 'production') {
//   // Serve any static files from the React app
//   app.use(express.static(path.join(__dirname, '../frontend/build')));

//   // Handle React routing, return all requests to React’s index.html
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
//   });
// }

// 6) Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});