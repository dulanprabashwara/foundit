const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FoundIt API server running on port ${PORT}`);
});

module.exports = app;
