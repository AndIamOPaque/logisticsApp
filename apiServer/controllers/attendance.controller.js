import Attendance  from '../models/attendance.model.js';
import Employee  from '../models/employee.model.js';
import mongoose from 'mongoose';

export const clockIn = async (req, res) => {
  const { employeeId, inTime } = req.body;

  if (!employeeId || !inTime) {
    return res.status(400).json({
      success: false,
      errors: ['employeeId and inTime are required.']
    });
  }
const serverTime = new Date();
const clientTime = new Date(inTime);
const fiveMinutesInMs = 5 * 60 * 1000;

const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());

if (timeDiff > fiveMinutesInMs) {
  return res.status(400).json({
    success: false,
    errors: ['inTime must be within 5 minutes of the current time.']
  });
}
    const normalizedDate = new Date(clientTime);
    normalizedDate.setHours(0, 0, 0, 0);

  try {
    const newRecord = new Attendance({
      employee: employeeId,
      date: normalizedDate,       
      inTime: new Date(inTime),   
      status: 'present'           
    });
    await newRecord.save();
    
    res.status(201).json({ success: true, data: newRecord });

  } catch (error) {
    if (error.code === 11000) { //unique index violation ke liye
      return res.status(409).json({ // 409 creation is causing a  Conflict
        success: false,
        errors: ['Employee has already clocked in today.']
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};


export const clockOut = async (req, res) => {
  const { employeeId, outTime } = req.body;

  if (!employeeId || !outTime) {
    return res.status(400).json({
      success: false,
      errors: ['employeeId and outTime are required.']
    });
  }

  const serverTime = new Date();
const clientTime = new Date(outTime);
const fiveMinutesInMs = 5 * 60 * 1000;

const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());

if (timeDiff > fiveMinutesInMs) {
  return res.status(400).json({
    success: false,
    errors: ['inTime must be within 5 minutes of the current time.']
  });
}

  const normalizedDate = new Date(clientTime);
  normalizedDate.setHours(0, 0, 0, 0);

  try {

    const record = await Attendance.findOne({
      employee: employeeId,
      date: normalizedDate
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        errors: ['No clock-in record found for today.']
      });
    }

    if (!record.inTime) {
      return res.status(400).json({
          success: false,
          errors: ['Cannot clock out without a clock-in time.']
      });
    }

    if (clientTime < record.inTime) {
      return res.status(400).json({
        success: false,
        errors: ['Clock-out time cannot be before clock-in time.']
      });
    }
    
    record.outTime = clientTime;
    await record.save(); 

    res.status(200).json({ success: true, data: record });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};



export const markStatus = async (req, res) => {
  const { employeeId, date, status } = req.body;

  if (!employeeId || !date || !status) {
    return res.status(400).json({ success: false, errors: ['employeeId, date, and status are required.'] });
  }
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
     return res.status(400).json({ success: false, errors: ['Invalid Employee ID format'] });
  }
  const employeeExists = await Employee.findById(employeeId);
  if (!employeeExists) {
      return res.status(404).json({ success: false, errors: ['Employee not found.'] });
  }
  
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const updateOperation = {
    $set: {
      status: status 
    },
    $setOnInsert: {
      employee: employeeId,
      date: normalizedDate
    }
  };

  if (status === 'absent' || status === 'leave') {
    updateOperation.$unset = { inTime: "", outTime: "" };
  }
  
  try {
    await Attendance.updateOne(
      { employee: employeeId, date: normalizedDate }, 
      updateOperation,                                
      { upsert: true, runValidators: true }            
    );

    res.status(200).json({ success: true, message: 'Attendance status updated.' });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};

export const getDailyReport = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      errors: ['Date query parameter is required in YYYY-MM-DD format.']
    });
  }

  const normalizedDate = new Date(date);
  if (isNaN(normalizedDate.getTime())) { 
    return res.status(400).json({
      success: false,
      errors: ['Invalid date format. Use YYYY-MM-DD.']
    });
  }
  
  normalizedDate.setHours(0, 0, 0, 0); 

  try {
    const records = await Attendance.find({ date: normalizedDate })
      .populate('employee', 'name role contact.phone'); 

    res.status(200).json({ success: true, data: records });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};

export const getEmployeeReport = async (req, res) => {
  const { employeeId, month, year } = req.query;

  if (!employeeId || !month || !year) {
    return res.status(400).json({
      success: false,
      errors: ['employeeId, month, and year query parameters are required.']
    });
  }

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ success: false, errors: ['Invalid Employee ID format'] });
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ success: false, errors: ['Invalid month. Must be 1-12.'] });
  }
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 3000) {
    return res.status(400).json({ success: false, errors: ['Invalid year.'] });
  }

  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 1); 

  try {
    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lt: endDate } 
    })
    .sort({ date: 'asc' }) 
    .populate('employee', 'name role'); 

    res.status(200).json({ success: true, data: records });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};

export const getSingleAttendanceRecord = async (req, res) => {
  const { employeeId, date } = req.query;

  if (!employeeId || !date) {
    return res.status(400).json({
      success: false,
      errors: ['employeeId and date query parameters are required.']
    });
  }

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ success: false, errors: ['Invalid Employee ID format'] });
  }
    const normalizedDate = new Date(date);
    if (isNaN(normalizedDate.getTime())) { 
      return res.status(400).json({
        success: false,
        errors: ['Invalid date format. Use YYYY-MM-DD.']
      });
    }
    normalizedDate.setHours(0, 0, 0, 0);

  try {
    const records = await Attendance.findOne({
      employee: employeeId,
      date: normalizedDate
    })
    .populate('employee', 'name role contact.phone'); 

    res.status(200).json({ success: true, data: records });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};