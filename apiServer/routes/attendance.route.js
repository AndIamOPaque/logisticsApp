import express from "express";
import * as AttendanceController from "../controllers/attendance.controller.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// router.use(protect);

// --- DAILY ACTIONS (Workers/Managers) ---
router.post("/clock-in", AttendanceController.clockIn);
router.post("/clock-out", AttendanceController.clockOut);
router.post("/daily", AttendanceController.markDailyAttendance)
// --- MANAGEMENT & CORRECTIONS ---
// Mark status manually (e.g. absent/leave) without clocking in
router.post("/status", AttendanceController.markStatus); 

// Correct a mistake in a specific record (Triggers the Financial Reversal logic)
//admin only bnade
router.patch("/:id", AttendanceController.updateRecord);

// --- REPORTS ---
router.get("/daily", AttendanceController.getDailyReport); // ?date=2023-10-27
router.get("/employee", AttendanceController.getEmployeeReport); // ?employeeId=...&month=10&year=2023
router.get("/single", AttendanceController.getSingleAttendanceRecord); // ?employeeId=...&date=...

export default router;