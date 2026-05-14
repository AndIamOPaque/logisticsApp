import cron from "node-cron";
import Bill from "./models/bill.model.js";
import Employee from "./models/employee.model.js";
import { calculateAttendanceMetrics } from "./services/attendance.service.js";

const setupCronJobs = () => {
    // --- Overdue Bill Check (midnight daily) ---
    cron.schedule('0 0 * * *', async () => {
        console.log("Running Overdue Bill check...");
        
        const today = new Date();
        
        try {
            const result = await Bill.updateMany(
                {
                    status: "PENDING",
                    dueDate: { $lt: today }  
                },
                {
                    $set: { status: "OVERDUE" }
                }
            );
            
            console.log(`Updated ${result.modifiedCount} bills to OVERDUE.`);
        } catch (error) {
            console.error("Overdue Bill cron job failed:", error);
        }
    });

    // --- Attendance Metrics Calculation (11:59 PM daily) ---
    cron.schedule('59 23 * * *', async () => {
        console.log("Running Attendance Metrics calculation...");

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            const activeEmployees = await Employee.find({ isActive: true }).select('_id').lean();
            let successCount = 0;

            for (const emp of activeEmployees) {
                try {
                    await calculateAttendanceMetrics(emp._id, month, year);
                    successCount++;
                } catch (err) {
                    console.error(`Metrics calc failed for employee ${emp._id}:`, err.message);
                }
            }

            console.log(`Calculated attendance metrics for ${successCount}/${activeEmployees.length} employees.`);
        } catch (error) {
            console.error("Attendance Metrics cron job failed:", error);
        }
    });
};

export default setupCronJobs;