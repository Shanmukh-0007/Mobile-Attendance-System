const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const enrollmentRoutes = require('./routes/enrollment');
const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance'); // Import attendance routes
//const cronJobs = require('./utils/cronJobs'); // Import cron jobs
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register routes
console.log('Server started and routes are being registered...');
app.use('/api/auth', authRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes); // Register attendance route

// Start the cron jobs
//cronJobs(); // Call the function to start the cron jobs

const PORT = process.env.PORT || 7474;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
