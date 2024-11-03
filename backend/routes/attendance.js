const express = require('express');
const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceReport,
} = require('../controllers/attendance');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateTokens } = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

// Route for marking attendance
router.post(
  '/mark',
  authenticateToken,
  [
    check('studentId', 'Student ID is required').notEmpty(),
    check('classId', 'Class ID is required').notEmpty(),
    check('location.latitude', 'Latitude is required and must be a float').isFloat(),
    check('location.longitude', 'Longitude is required and must be a float').isFloat(),
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

// Route for getting attendance records for a specific student
router.get('/:studentId', authenticateToken, getAttendanceRecords);

// Route to get attendance report
router.get('/attendance/report', authenticateTokens, getAttendanceReport);

// Route to generate and download the attendance report in Excel
// router.get('/attendance/excel-report', authenticateTokens, generateAttendanceExcelReport);


module.exports = router;
