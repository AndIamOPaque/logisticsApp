        import express from "express";
        import * as EmployeeController from "../controllers/employee.controller.js";
        // import { protect, adminOnly } from "../middleware/authMiddleware.js"; 

        const router = express.Router();

        // All employee routes require login
        // router.use(protect);

        // --- 1. BASIC MANAGEMENT ---
        router.get("/", EmployeeController.getEmployees);      // List/Search
        router.post("/", EmployeeController.createEmployee);   // Add new worker
        router.patch("/:id", EmployeeController.updateEmployeeInfo); // Update phone/address/notes

        // --- 2. FINANCIALS & DASHBOARD ---
        router.get("/:id", EmployeeController.getEmployeeProfile); // Profile + Current Month Stats

        // Critical Financial Actions (Admin Only recommended)
        router.patch("/:id/wage", EmployeeController.updateWage); // Give Raise
        router.post("/:id/payout", EmployeeController.payEmployee); // Process Payroll Bill

        // --- 3. REPORTING ---
        router.get("/:id/report", EmployeeController.getLifecycleReport); // Lifetime Cost Analysis

        export default router;