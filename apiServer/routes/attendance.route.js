import express from 'express';
import {
  clockIn,
  clockOut,
  markStatus,
  getDailyReport,
  getEmployeeReport,
  getSingleAttendanceRecord
} from '../controllers/attendance.controller.js';
import { protectHardware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/clock-in', protectHardware, clockIn); 

router.patch('/clock-out', protectHardware, clockOut); 

// admin ke liye hai baaki. protect and admin middleware lagana
router.post('/status', markStatus); // We would add 'protect' and 'admin' middleware here
router.get('/report/daily', getDailyReport); // 'protect', 'admin'
router.get('/report/employee', getEmployeeReport); // 'protect'
router.get('/record', getSingleAttendanceRecord); // 'protect'


export default router;