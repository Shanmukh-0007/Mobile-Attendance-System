const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const createExcelFile = require('../utils/excelHelper');
const fs = require('fs');

const COLLEGE_LATITUDE = 17.196668653873335;
const COLLEGE_LONGITUDE = 78.5981835909269;
const RADIUS_METERS = 100;

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to mark attendance
exports.markAttendance = async (req, res) => {
  const { studentId, classId, location } = req.body;
  const currentTime = new Date();

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrolledClassId = student.enrolledClasses.find((cls) =>
      cls.equals(classId)
    );
    if (!enrolledClassId) {
      return res
        .status(404)
        .json({ message: 'Class not found in enrolled classes' });
    }

    const enrolledClass = await Class.findById(enrolledClassId);
    if (!enrolledClass) {
      return res.status(404).json({ message: 'Class details not found' });
    }

    const dayOfWeek = currentTime.toLocaleString('en-US', { weekday: 'long' });
    const classSchedule = enrolledClass.schedule.find(
      (schedule) => schedule.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!classSchedule) {
      return res.status(400).json({ message: 'No class scheduled for today' });
    }

    const startTime = new Date(
      `${currentTime.toDateString()} ${classSchedule.startTime}`
    );
    const endTime = new Date(
      `${currentTime.toDateString()} ${classSchedule.endTime}`
    );
    const gracePeriodStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    const gracePeriodEnd = new Date(endTime.getTime() + 15 * 60 * 1000);

    if (currentTime < gracePeriodStart || currentTime > gracePeriodEnd) {
      return res.status(400).json({
        message:
          'You can only mark attendance during the class time or within the grace period',
      });
    }

    const distance = getDistanceFromLatLonInMeters(
      location.latitude,
      location.longitude,
      COLLEGE_LATITUDE,
      COLLEGE_LONGITUDE
    );
    if (distance > RADIUS_METERS) {
      return res
        .status(400)
        .json({ message: 'You are outside the allowed college location' });
    }

    const attendanceRecord = new Attendance({
      classId: enrolledClassId,
      studentId: student._id,
      date: currentTime,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      attended: true,
      time: currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    await attendanceRecord.save();

    return res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAttendanceRecords = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceRecords = await Attendance.find({
      studentId: student._id,
    }).populate('classId');

    return res.status(200).json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAttendanceReport = async () => {
  try {
    const attendanceRecords = await Attendance.find({})
      .populate('classId')
      .populate('studentId');
    const reportData = attendanceRecords.map((record) => ({
      studentName: record.studentId.name,
      className: record.classId.name,
      date: record.date,
      time: record.time,
      attended: record.attended,
      latitude: record.location.latitude,
      longitude: record.location.longitude,
    }));

    return reportData; // Return the data for further processing
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    throw new Error('Error fetching attendance report');
  }
};

exports.calculateAttendancePercentage = async (req, res) => {
  const { studentId, classId } = req.params;
  try {
    const student = await Student.findById(studentId);
    const enrolledClass = await Class.findById(classId);
    if (!student || !enrolledClass) {
      return res.status(404).json({ message: 'Student or Class not found' });
    }

    const totalClasses = await Attendance.countDocuments({
      classId: enrolledClass._id,
    });
    const attendedClasses = await Attendance.countDocuments({
      studentId: student._id,
      classId: enrolledClass._id,
      attended: true,
    });

    const attendancePercentage = (
      (attendedClasses / totalClasses) *
      100
    ).toFixed(2);

    return res.status(200).json({
      studentName: student.name,
      className: enrolledClass.name,
      attendancePercentage,
    });
  } catch (error) {
    console.error('Error calculating attendance percentage:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
