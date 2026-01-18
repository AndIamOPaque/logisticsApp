import cron from "node-cron";
import Bill from "./models/bill.model.js";

const setupCronJobs = () => {
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
            console.error("Cron job failed:", error);
        }
    });
};

export default setupCronJobs;