import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'], // Basic Regex
    },
    phone: {
      type: String,
      trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number.'], 
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
      index: true,
     },
    permissions: [{
      type: String,
      trim: true,
      lowercase: true 
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;