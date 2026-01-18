import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: { 
      type: String,
      enum: ["factory", "warehouse", "office"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      manager: { 
          type: String, 
          trim: true 
      },
      phone: { 
          type: String, 
          trim: true,
          match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'] 
      },
      email: { 
          type: String, 
          trim: true,
          lowercase: true,
          match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
      },
    },
    capacity: {
      maxStockUnits: { type: Number, min: 0 },
      productionCapacity: { type: Number, min: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;