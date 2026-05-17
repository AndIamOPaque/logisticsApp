import * as EmployeeService from "../services/employee.service.js";
import Employee from "../models/employee.model.js"; // Direct access for simple CRUD is acceptable

// --- 1. BASIC MANAGEMENT ---

// GET /employees?role=driver&isActive=true
export const getEmployees = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Simple search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { "contact.phone": { $regex: search, $options: 'i' } }
      ];
    }

    // Sort by name A-Z
    const employees = await Employee.find(query).sort({ name: 1 });
    
    return res.status(200).json({ success: true, data: employees });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /employees
export const createEmployee = async (req, res) => {
  try {
    // Basic validation is handled by Mongoose Schema
    const newEmployee = await Employee.create(req.body);
    return res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    // Handle the "Duplicate Key" error for unique Name+Phone index
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Employee with this Name and Phone already exists." });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /employees/:id (General Info Update)
export const updateEmployeeInfo = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent updating 'balance' or 'wage' via this generic route for safety
    const updates = { ...req.body };
    delete updates.balance;
    delete updates.wage; 

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedEmployee) return res.status(404).json({ success: false, message: "Employee not found" });

    return res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deactivatedEmployee = await Employee.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!deactivatedEmployee) return res.status(404).json({ success: false, message: "Employee not found" });

    return res.status(200).json({ success: true, data: deactivatedEmployee });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// --- 2. FINANCIAL & DASHBOARD ---

// GET /employees/:id
export const getEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await EmployeeService.getEmployeeProfile(id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// PATCH /employees/:id/wage
export const updateWage = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body; // Expect { amount: 500, type: 'daily' }

    const updatedEmployee = await EmployeeService.updateWage(id, { amount, type });
    return res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// POST /employees/:id/payout
// This creates a Bill and clears their balance
export const payEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user._id; // Assumes auth middleware populates req.user
    const { amount, paymentMethod, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    const bill = await EmployeeService.processPayroll(adminUserId, {
      employeeId: id,
      amount,
      paymentMethod,
      notes
    });

    return res.status(201).json({ success: true, message: "Payment processed successfully", data: bill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET /employees/:id/report
export const getLifecycleReport = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await EmployeeService.getEmployeeLifecycleReport(id);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};