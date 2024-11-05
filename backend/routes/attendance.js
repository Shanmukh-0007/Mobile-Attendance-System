const express = require('express');
const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceReport,
} = require('../controllers/attendance');
const router = express.Router();
const {
  authenticateToken,
  authorizeAdmin,
} = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

// Route for marking attendance (accessible by any authenticated user)
router.post(
  '/mark',
  authenticateToken,
  [
    check('studentId', 'Student ID is required').notEmpty(),
    check('classId', 'Class ID is required').notEmpty(),
    check(
      'location.latitude',
      'Latitude is required and must be a float'
    ).isFloat(),
    check(
      'location.longitude',
      'Longitude is required and must be a float'
    ).isFloat(),
  ],
  async (req, res) => {
    // Validate request fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Call the markAttendance function from attendance controller
    await markAttendance(req, res);
  }
);

// Route for getting attendance records for a specific student (accessible by any authenticated user)
router.get('/records/:studentId', authenticateToken, getAttendanceRecords);

// Route to get general attendance report (admin-only access)
router.get('/report', authenticateToken, authorizeAdmin, getAttendanceReport);

module.exports = router;
