import mongoose from 'mongoose';
import Attendance from '../models/attendance.model.js';
import Employee from '../models/employee.model.js';
import AttendanceMetrics from '../models/attendanceMetrics.model.js';

const normalizeDate = (dateInput) => {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
};


export const clockIn = async (employeeId, inTime) => {
  const serverTime = new Date();
  const clientTime = new Date(inTime);
  const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());
  const fiveMinutesInMs = 5 * 60 * 1000;

  if (timeDiff > fiveMinutesInMs) {
    throw new Error('Clock-in time must be within 5 minutes of server time.');
  }

  const normalizedDate = normalizeDate(clientTime);

  const exists = await Attendance.exists({ employee: employeeId, date: normalizedDate });
  if (exists) {
    throw new Error('Employee has already clocked in today.');
  }

  const newRecord = await Attendance.create({
    employee: employeeId,
    date: normalizedDate,
    inTime: clientTime,
    status: 'present'
  });

  return newRecord;
};

export const clockOut = async (employeeId, outTime) => {
  const serverTime = new Date();
  const clientTime = new Date(outTime);
  const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());
  
  if (timeDiff > 5 * 60 * 1000) {
    throw new Error('Clock-out time must be within 5 minutes of server time.');
  }

  const normalizedDate = normalizeDate(clientTime);

  const record = await Attendance.findOne({
    employee: employeeId,
    date: normalizedDate
  });

  if (!record) {
    throw new Error('No clock-in record found for today.');
  }
  if (record.outTime) {
     throw new Error('Employee has already clocked out. Use "Update Attendance" to correct errors.');
  }
  if (!record.inTime) {
    throw new Error('Cannot clock out without a clock-in time.'); 
  }
  if (clientTime < record.inTime) {
    throw new Error('Clock-out time cannot be before clock-in time.');
  }

  record.outTime = clientTime;

  const employee = await Employee.findById(employeeId);
  if (employee && employee.wage && employee.wage.type === 'hourly') {
    const wageEarned = record.hoursWorked * employee.wage.amount;
    employee.balance += wageEarned;
    record.payableAmount = wageEarned;
    await employee.save();
  }
  else if (employee && employee.wage && employee.wage.type === 'daily') {
    employee.balance += employee.wage.amount;
    record.payableAmount = employee.wage.amount;
    await employee.save();
  }
  await record.save();
  return record;  
};

// added hourly and daily wage calculation when clocking out. monthly. ugh. no need. trip is not related to attendance

export const updateAttendanceStatus = async (employeeId, date, status) => {
  const normalizedDate = normalizeDate(date);

  const employeeExists = await Employee.exists({ _id: employeeId });
  if (!employeeExists) throw new Error('Employee not found.');

  const updateOperation = {
    $set: { status: status },
    $setOnInsert: { employee: employeeId, date: normalizedDate }
  };

  if (['absent', 'leave'].includes(status)) {
    updateOperation.$unset = { inTime: "", outTime: "" };
  }

  const result = await Attendance.findOneAndUpdate(
    { employee: employeeId, date: normalizedDate },
    updateOperation,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return result;
};

export const updateAttendanceRecord = async (recordId, { newInTime, newOutTime, newStatus }) => {
  const record = await Attendance.findById(recordId).populate('employee');
  if (!record) throw new Error("Record not found");

  const employee = record.employee;
  
  if (record.payableAmount > 0) {
    employee.balance -= record.payableAmount;
    // We don't save employee yet, we wait for the final calc.
  }

  if (newInTime) record.inTime = new Date(newInTime);
  if (newOutTime) record.outTime = new Date(newOutTime);
  if (newStatus) record.status = newStatus;

  let newEarnings = 0;

  if (['present', 'half-day'].includes(record.status) && record.inTime && record.outTime) {
    const hours = (record.outTime - record.inTime) / (1000 * 60 * 60);

    if (employee.wage.type === 'hourly') {
      newEarnings = hours * employee.wage.amount;
    } else if (employee.wage.type === 'daily') {
      newEarnings = record.status === 'half-day' 
        ? employee.wage.amount / 2 
        : employee.wage.amount;
    }
  }

  record.payableAmount = newEarnings; 
  await record.save();

  employee.balance += newEarnings; 
  await employee.save();

  return record;
};

export const getDailyReport = async (dateStr) => {
  const normalizedDate = normalizeDate(dateStr);
  if (isNaN(normalizedDate.getTime())) throw new Error('Invalid date format.');

  return await Attendance.find({ date: normalizedDate })
    .populate('employee', 'name role contact.phone');
};

export const getEmployeeReport = async (employeeId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lt: endDate }
  })
  .sort({ date: 'asc' })
  .populate('employee', 'name role');
};

export const getSingleRecord = async (employeeId, dateStr) => {
  const normalizedDate = normalizeDate(dateStr);
  if (isNaN(normalizedDate.getTime())) throw new Error('Invalid date format.');

  return await Attendance.findOne({
    employee: employeeId,
    date: normalizedDate
  })
  .populate('employee', 'name role contact.phone');
};

// --- BATCH DAILY ATTENDANCE (Form-based marking) ---
// Reuses updateAttendanceStatus for record upsert, then handles wages
// following the same balance pattern from clockOut
export const markDailyAttendanceBatch = async (dateStr, entries) => {
  const normalizedDate = normalizeDate(dateStr);
  if (isNaN(normalizedDate.getTime())) throw new Error('Invalid date format.');

  // Block future dates
  const today = normalizeDate(new Date());
  if (normalizedDate > today) {
    throw new Error('Cannot mark attendance for future dates.');
  }

  const results = { marked: 0, errors: [] };

  for (const entry of entries) {
    try {
      const { employeeId, status } = entry;
      if (!employeeId || !status) {
        results.errors.push({ employeeId, message: 'employeeId and status are required.' });
        continue;
      }

      // Check if a record already exists (for wage reversal)
      const existingRecord = await Attendance.findOne({
        employee: employeeId,
        date: normalizedDate
      });

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        results.errors.push({ employeeId, message: 'Employee not found.' });
        continue;
      }

      // --- Reverse previous payableAmount if record existed ---
      // Same reversal pattern as updateAttendanceRecord
      if (existingRecord && existingRecord.payableAmount > 0) {
        employee.balance -= existingRecord.payableAmount;
      }

      // --- Upsert the attendance record ---
      const record = await updateAttendanceStatus(employeeId, dateStr, status);

      // --- Calculate wage based on status ---
      // Reuses the wage logic pattern from clockOut
      let payableAmount = 0;

      if (employee.wage) {
        if (status === 'present') {
          if (employee.wage.type === 'daily') {
            payableAmount = employee.wage.amount;
          } else if (employee.wage.type === 'hourly') {
            // Form-based marking doesn't have in/out times
            // Use standard 8hr workday for hourly workers
            payableAmount = employee.wage.amount * 8;
          }
          // monthly / per_trip: handled elsewhere, payableAmount stays 0
        } else if (status === 'half-day') {
          if (employee.wage.type === 'daily') {
            payableAmount = employee.wage.amount / 2;
          } else if (employee.wage.type === 'hourly') {
            payableAmount = employee.wage.amount * 4; // half-day = ~4hrs
          }
        }
        // absent / leave: payableAmount stays 0
      }

      // --- Update record payableAmount ---
      record.payableAmount = payableAmount;
      await record.save();

      // --- Update employee balance (same pattern as clockOut) ---
      employee.balance += payableAmount;
      await employee.save();

      results.marked++;
    } catch (err) {
      results.errors.push({ employeeId: entry.employeeId, message: err.message });
    }
  }

  return results;
};

// --- SCHEDULED METRICS CALCULATION ---
// Called by scheduler.js cron job, uses MongoDB sessions for consistency
export const calculateAttendanceMetrics = async (employeeId, month, year) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lt: endDate }
    }).session(session);

    const daysPresent = records.filter(r => r.status === 'present').length;
    const daysAbsent = records.filter(r => r.status === 'absent').length;
    const halfDays = records.filter(r => r.status === 'half-day').length;
    const leaves = records.filter(r => r.status === 'leave').length;
    const totalMarked = records.length;

    const attendancePercentage = totalMarked > 0
      ? Math.round(((daysPresent + halfDays * 0.5) / totalMarked) * 100)
      : 0;

    const metrics = await AttendanceMetrics.findOneAndUpdate(
      { employee: employeeId, month, year },
      {
        $set: {
          daysPresent,
          daysAbsent,
          halfDays,
          leaves,
          totalMarked,
          attendancePercentage
        }
      },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();
    return metrics;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// --- FETCH STORED METRICS ---
export const getStoredMetrics = async (employeeId, month, year) => {
  return await AttendanceMetrics.findOne({ employee: employeeId, month, year }).lean();
};