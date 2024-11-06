const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create Excel file from attendance data
const createExcelFile = (attendanceData) => {
  const exportDir = path.join(
    'C:',
    'Users',
    'varsh',
    'Desktop',
    'projectcopy',
    'Mobile-Attendance-System',
    'backend',
    'exports'
  );

  // Ensure the export directory exists
  if (!fs.existsSync(exportDir)) {
    console.log('Directory does not exist. Creating now...');
    fs.mkdirSync(exportDir, { recursive: true });
    console.log('Directory created successfully.');
  } else {
    console.log('Directory already exists.');
  }

  // Path for the Excel file
  const filePath = path.join(exportDir, `Attendance_Report_${Date.now()}.xlsx`);

  // Prepare data for the Excel file
  const workSheetData = [
    [
      'Student Name',
      'Class Name',
      'Date',
      'Time',
      'Attended',
      'Latitude',
      'Longitude',
    ],
    ...attendanceData.map((record) => [
      record.studentName,
      record.className,
      record.date.toLocaleDateString(),
      record.time,
      record.attended ? 'Yes' : 'No',
      record.latitude,
      record.longitude,
    ]),
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  // Attempt to write the Excel file
  try {
    console.log('Attempting to write Excel file...');
    XLSX.writeFile(workbook, filePath);
    console.log('Excel file written successfully');

    if (fs.existsSync(filePath)) {
      console.log('File verified to be created at:', filePath);
    } else {
      console.error('File was not created as expected.');
    }
  } catch (error) {
    console.error('Error while creating Excel file:', error);
  }

  return filePath; // Return the path to the file for later download
};

module.exports = createExcelFile;
