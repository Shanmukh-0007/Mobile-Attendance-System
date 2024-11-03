const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  attended: {
    type: Boolean,
    default: false,
    required:true,
  },
  time: {
    // Include time to store when attendance was marked
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
