import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  inTime: {
    type: Date
  },
  outTime: {
    type: Date
  },
  payableAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["present", "absent", "leave", "half-day"],
    required: [true, "Attendance status is required"]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

attendanceSchema.virtual('hoursWorked').get(function() {
  if (this.inTime && this.outTime) {
    const totalMs = this.outTime - this.inTime;
    return totalMs / (1000 * 60 * 60); // Returns hours
  }
  return 0;
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;