const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Firebase
const { initializeFirebase } = require('./config/firebase');
try {
  initializeFirebase();
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Route files
const authRoutes = require('./routes/auth');
const choiceRoutes = require('./routes/choices');
const habitRoutes = require('./routes/habits');
const suggestionRoutes = require('./routes/suggestions');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/choices', choiceRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/suggestions', suggestionRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Initialize scheduled notifications
const scheduledNotificationService = require('./services/scheduledNotificationService');
try {
  scheduledNotificationService.initializeScheduledNotifications();
} catch (error) {
  console.error('Scheduled notifications initialization failed:', error);
}

module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
