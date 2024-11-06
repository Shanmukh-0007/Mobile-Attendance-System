const express = require('express');
const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceReport,
  calculateAttendancePercentage,
} = require('../controllers/attendance');
const router = express.Router();
const {
  authenticateToken,
  authorizeAdmin,
} = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');
const createExcelFile = require('../utils/excelHelper');

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await markAttendance(req, res);
  }
);

router.get('/records/:studentId', authenticateToken, getAttendanceRecords);

router.get('/report', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const reportData = await getAttendanceReport();
    return res.status(200).json({ reportData });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ message: 'Error generating attendance report' });
  }
});

router.get(
  '/report/excel',
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const attendanceData = await getAttendanceReport();
      const excelFilePath = createExcelFile(attendanceData);

      res.download(excelFilePath, (err) => {
        if (err) {
          console.error('Error downloading the file:', err);
          res.status(500).send('File download failed');
        }
      });
    } catch (error) {
      console.error('Error generating Excel file:', error);
      res.status(500).send('Error generating attendance report');
    }
  }
);

router.get(
  '/attendance/percentage/:studentId/:classId',
  calculateAttendancePercentage
);

module.exports = router;
