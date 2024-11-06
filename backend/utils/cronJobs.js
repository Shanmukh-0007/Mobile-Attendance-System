const cron = require('node-cron');
const Class = require('../models/Class');

// Schedule to run every half-hour
cron.schedule('0,30 * * * *', async () => {
  const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' });
  const currentDate = new Date();

  try {
    // Find classes scheduled for today
    const classes = await Class.find({ 'schedule.day': dayOfWeek });

    for (const cls of classes) {
      // Loop through today's schedule to check start times
      const todaySchedule = cls.schedule.filter(
        (schedule) => schedule.day.toLowerCase() === dayOfWeek.toLowerCase()
      );

      for (const schedule of todaySchedule) {
        // Combine today's date with the class start time
        const [startHour, startMinute] = schedule.startTime
          .split(':')
          .map(Number);
        const classStartTime = new Date(currentDate);
        classStartTime.setHours(startHour, startMinute, 0, 0);

        // Check if current time is past the start time and if it hasn't been incremented today
        if (currentDate >= classStartTime) {
          // Check if last increment was today
          const lastIncrementDate = cls.lastAttendanceIncremented;
          const isSameDay =
            lastIncrementDate &&
            lastIncrementDate.toLocaleDateString() ===
              currentDate.toLocaleDateString();

          if (!isSameDay) {
            cls.totalClassesConducted += 1;
            cls.lastAttendanceIncremented = currentDate; // Update the last increment date
            await cls.save();
            console.log(
              `Incremented totalClassesConducted for class ${cls.name} scheduled at ${schedule.startTime} on ${dayOfWeek}`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating totalClassesConducted:', error);
  }
});
