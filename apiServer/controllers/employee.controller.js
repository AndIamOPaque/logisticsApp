import mongoose from "mongoose";
import Employee from "../models/employee.model.js";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getEmployees = async (req, res, next) => {
  const {name, role} = req.query;
  const query = {isActive: true};
  if (name) {
    const safeName = escapeRegExp(name);
    query.name = new RegExp('^' + safeName, 'i'); 
  }
  if (role) {
      const validRoles = Employee.schema.path('role').enumValues;

      if (validRoles.includes(role)) {
        query.role = role;
      } else {
        return res.status(400).json({
          success: false,
          errors: [`Invalid role specified. Must be one of: ${validRoles.join(', ')}`]
        });
      }
    }
  try {
    const employees = await Employee.find(query);
    res.status(200).json({success: true, data: employees});
  } catch (error) {
    console.error("Failed to get employees:", error); 
    res.status(500).json({
    success: false,
    errors: ['Server error. Failed to retrieve data.']               
      }
    );
  };
}
export const getEmployeeById = async (req, res, next) => {
  const { id } = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return  res.status(400).json({ success: false, errors: ['Invalid Employee ID format'] });
  }
  try {
    const employee = await Employee.findOne({_id: id, isActive: true});
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        errors: ['Employee not found'] });
    }
    res.status(200).json({success: true, data: employee});
  } catch (error) {
    console.error("Failed to get employee by ID:", error);
    res.status(500).json({
      success: false,
      errors: ['Server error. Failed to retrieve data.']
    });
  }
};


export const createEmployee = async (req, res, next) => {

  try {
    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();
    res.status(201).json({ success: true, data: savedEmployee });
    console.log("Employee created:", savedEmployee);

  } catch (error) {
    if (error.code === 11000) {
      
      const existingEmployee = await Employee.findOne({
        name: req.body.name,
        'contact.phone': req.body.phone
      }).select('+isActive'); 

      // 
      if (existingEmployee && !existingEmployee.isActive) {
        return res.status(409).json({
          success: false,
          errors: [`Employee exists but is inactive: ${existingEmployee._id} `]
        });
      }
      return res.status(409).json({
        success: false,
        errors: ['An active employee with this name and phone number combination already exists.']
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

export const updateEmployee = async (req, res, next) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,            
        runValidators: true   
      }
    ).select('+isActive');

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        errors: ["Employee not found"]
      });
    }

    res.json({ success: true, data: updatedEmployee });
    console.log("Employee updated:", updatedEmployee);

  } catch (error) {
   if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        errors: ['An employee with this name and phone number combination already exists.']
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

export const getEmployeeStats = async (req, res, next) => {
  try {
    const stats = await Employee.aggregate([
      {
        $match: { isActive: true } 
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }, 
          totalWageAmount: { $sum: '$wage.amount' }, 
          avgWageAmount: { $avg: '$wage.amount' } 
        }
      },
      {
        $sort: { _id: 1 } 
      }
    ]);

    if (!stats || stats.length === 0) {
      return res.status(404).json({ success: false, errors: ['No employee data found to aggregate.'] });
    }

    res.status(200).json({ success: true, data: stats });

  } catch (error) {
    console.error("Failed to get employee stats:", error);
    res.status(500).json({
      success: false,
      errors: ['Server error. Failed to retrieve statistics.']
    });
  }
};