const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON bodies

// Register Routes
app.use('/api/items', itemRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('TigerTrack Backend is Running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});