import mongoose from "mongoose";
import Employee from "../models/employee.model.js";
import Bill from "../models/bill.model.js"; 
import Attendance from "../models/attendance.model.js";
import { createNewBill } from "./bill.service.js"; // Reuse your existing Bill logic

// 1. THE DASHBOARD (Get Profile + Financial Health)
export const getEmployeeProfile = async (employeeId) => {
    const employee = await Employee.findById(employeeId).lean();
    if (!employee) throw new Error("Employee not found");

    // Get simple stats for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1); 
    startOfMonth.setHours(0,0,0,0);

    const attendanceStats = await Attendance.aggregate([
        { 
            $match: { 
                employee: new mongoose.Types.ObjectId(employeeId),
                date: { $gte: startOfMonth }
            } 
        },
        { 
            $group: { 
                _id: null, 
                daysPresent: { $sum: 1 },
                totalHours: { $sum: "$hoursWorked" }, // Using the virtual if stored, or calculate
                earnedThisMonth: { $sum: "$payableAmount" }
            } 
        }
    ]);

    return {
        ...employee,
        stats: {
            currentBalance: employee.balance, // The Source of Truth
            thisMonth: attendanceStats[0] || { daysPresent: 0, earnedThisMonth: 0 }
        }
    };
};

// 2. THE RAISE (Update Wage)
// Safe because Attendance uses "Snapshots". Changing this DOES NOT change past records.
export const updateWage = async (employeeId, newWage) => {
    const { amount, type } = newWage;
    
    if (amount < 0) throw new Error("Wage cannot be negative");
    if (!['hourly', 'daily', 'monthly', 'per_trip'].includes(type)) {
        throw new Error("Invalid wage type");
    }

    const employee = await Employee.findByIdAndUpdate(
        employeeId, 
        { 
            $set: { "wage.amount": amount, "wage.type": type } 
        },
        { new: true }
    );
    
    return employee;
};

// 3. THE PAYOUT (Create a Bill)
// This is a wrapper around your Bill System. It ensures the data is formatted correctly.
export const processPayroll = async (adminUserId, { employeeId, amount, paymentMethod, notes }) => {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error("Employee not found");

    // Optional: Warning if paying more than balance (Advance)
    // if (amount > employee.balance) { ... warning logic ... }

    const billData = {
        type: "EXPENSE",
        category: "Payroll",
        paymentMethod: paymentMethod || "CASH",
        status: "PAID", // Payroll is usually immediate
        paymentDate: new Date(),
        
        // Dynamic References (The logic we finalized)
        from: {
            name: "Office Cash", // Or fetch from Admin User preference
            party: adminUserId, // Using the Admin ID or a specific 'Office Cash' Party ID
            model: "User" // or 'Party'
        },
        to: {
            name: employee.name,
            party: employeeId,
            model: "Employee"
        },
        
        items: [
            {
                name: `Wage Payment - ${new Date().toLocaleDateString()}`,
                price: Number(amount),
                quantity: 1,
                // No itemRef needed for generic labor
            }
        ],
        notes: notes
    };

    // This calls your Bill Service, which handles the transaction 
    // AND triggers the Balance Deduction logic we wrote earlier.
    const bill = await createNewBill(billData, adminUserId);
    
    return bill;
};

// 4. THE REPORT (Cost Analysis)
// "How much has Ramesh cost me in total vs how much work he did?"
export const getEmployeeLifecycleReport = async (employeeId) => {
    // A. Total Work Value (Attendance + Deliveries)
    // We can sum the 'payableAmount' from attendance history
    const workHistory = await Attendance.aggregate([
        { $match: { employee: new mongoose.Types.ObjectId(employeeId) } },
        { $group: { _id: null, totalValue: { $sum: "$payableAmount" } } }
    ]);

    // B. Total Cash Paid (Bills)
    const paymentHistory = await Bill.aggregate([
        { 
            $match: { 
                "to.party": new mongoose.Types.ObjectId(employeeId),
                "to.model": "Employee",
                status: "PAID"
            } 
        },
        { $group: { _id: null, totalPaid: { $sum: "$grandTotal" } } }
    ]);

    return {
        lifetimeEarnings: workHistory[0]?.totalValue || 0,
        lifetimePaid: paymentHistory[0]?.totalPaid || 0,
        currentBalance: (workHistory[0]?.totalValue || 0) - (paymentHistory[0]?.totalPaid || 0)
    };
};