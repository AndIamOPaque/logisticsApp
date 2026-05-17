import * as attendanceService from '../services/attendance.service.js';

export const clockIn = async (req, res, next) => {
  try {
    const { employeeId, inTime } = req.body;
    if (!employeeId || !inTime) throw new Error('employeeId and inTime are required.');

    const record = await attendanceService.clockIn(employeeId, inTime);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    if (error.message.includes('already clocked in')) {
        return res.status(409).json({ success: false, errors: [error.message] });
    }
    next(error);
  }
};

export const clockOut = async (req, res, next) => {
  try {
    const { employeeId, outTime } = req.body;
    if (!employeeId || !outTime) throw new Error('employeeId and outTime are required.');

    const record = await attendanceService.clockOut(employeeId, outTime);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// --- BATCH DAILY ATTENDANCE (Form-based marking) ---
export const markDailyAttendance = async (req, res, next) => {
  try {
    const { date, entries } = req.body;
    if (!date || !entries || !Array.isArray(entries)) {
      throw new Error('date and entries array are required.');
    }

    const result = await attendanceService.markDailyAttendanceBatch(date, entries);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const markStatus = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;
    if (!employeeId || !date || !status) throw new Error('employeeId, date, and status are required.');

    const result = await attendanceService.updateAttendanceStatus(employeeId, date, status);
    res.status(200).json({ success: true, message: 'Attendance status updated.', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { newInTime, newOutTime, newStatus } = req.body;

    const updatedRecord = await attendanceService.updateAttendanceRecord(id, {
      newInTime,
      newOutTime,
      newStatus
    });

    res.status(200).json({ success: true, message: "Attendance corrected successfully", data: updatedRecord });
  } catch (error) {
    next(error);
  }
};

export const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) throw new Error('Date query parameter is required.');

    const records = await attendanceService.getDailyReport(date);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeReport = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;
    if (!employeeId || !month || !year) throw new Error('employeeId, month, and year are required.');

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    const records = await attendanceService.getEmployeeReport(employeeId, parsedMonth, parsedYear);

    // Fetch stored metrics from the AttendanceMetrics collection (populated by scheduler)
    const metrics = await attendanceService.getStoredMetrics(employeeId, parsedMonth, parsedYear);

    res.status(200).json({
      success: true,
      data: {
        records,
        metrics: metrics || { daysPresent: 0, daysAbsent: 0, halfDays: 0, leaves: 0, totalMarked: 0, attendancePercentage: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleAttendanceRecord = async (req, res, next) => {
  try {
    const { employeeId, date } = req.query;
    if (!employeeId || !date) throw new Error('employeeId and date are required.');

    const record = await attendanceService.getSingleRecord(employeeId, date);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};