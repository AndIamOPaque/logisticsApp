import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must be a valid string'], // Custom error message
    minlength: [3, 'Name must be at least 3 characters'], // Custom error message
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['worker', 'manager', 'driver', 'admin'],
      message: 'Role must be one of: worker, manager, driver, admin' // Custom error
    }
  },
  wage: {
    amount: {
      type: Number,
      required: [true, 'Wage amount is required'],
      min: [0, 'Wage amount must be a positive number']
    },
    type: {
      type: String,
      required: [true, 'Wage type is required'],
      enum: {
        values: ['hourly', 'daily', 'weekly', 'monthly'],
        message: 'Wage type must be one of: hourly, daily, weekly, monthly'
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number']
    },
    email: { // Example of optional field
      type: String,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
      sparse: true // Allows nulls even if unique
    }
  }, 
  joiningDate: {
    type: Date,
    required: [true, 'Joining date must be a valid date (YYYY-MM-DD)']
  }, 
  isActive: {
    type: Boolean,
    default: true,
    select: false // Hides it from default .find() queries
}
}, { timestamps: true });

employeeSchema.index({ name: 1, 'contact.phone': 1 }, { unique: true });


const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;