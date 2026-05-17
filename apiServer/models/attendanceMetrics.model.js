import mongoose from 'mongoose';

const attendanceMetricsSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  daysPresent: {
    type: Number,
    default: 0
  },
  daysAbsent: {
    type: Number,
    default: 0
  },
  halfDays: {
    type: Number,
    default: 0
  },
  leaves: {
    type: Number,
    default: 0
  },
  totalMarked: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// One metrics document per employee per month
attendanceMetricsSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const AttendanceMetrics = mongoose.model("AttendanceMetrics", attendanceMetricsSchema);
export default AttendanceMetrics;
