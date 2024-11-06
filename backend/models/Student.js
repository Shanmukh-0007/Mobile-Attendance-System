const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  section: { type: String, required: true },
  year: { type: String, required: true },
  enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  enrolledClassAttendance: [
    {
      classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
      classesAttended: { type: Number, default: 0 }, // Number of times the student attended
    },
  ],
  password: { type: String, required: true },
  faceData: { type: String }, // Placeholder for face recognition data
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true,
    default: 'student',
  },
});

module.exports = mongoose.model('Student', StudentSchema);
