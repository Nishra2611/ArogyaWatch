const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`\x1b[36m[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}\x1b[0m`);
    // console.log('Headers:', req.headers); // Uncomment if token is suspected missing
    next();
});

const { initializeDB } = require('./config/db');
initializeDB();

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'ArogyaStock Sentinel API is running.' });
});

// Diagnostic Route
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', port: PORT, database: process.env.DB_USER });
});

// Setup Routes mapping
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// Global 404 Handler for undefined routes
app.use((req, res) => {
    console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Generic Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`🚀 ArogyaStock Backend running on http://localhost:${PORT}`);
    console.log(`   - API PREFIX: /api`);
});
