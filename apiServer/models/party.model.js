import mongoose from "mongoose";

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["buyer", "supplier", "both"],
      required: true,
    },
    address: {
      type: String,
      default: "Not provided",
      set: v => v === "" ? "Not provided" : v,
    },
    contact: [
      {
        person: { type: String, default: "Unknown", set: v => v === "" ? "Unknown" : v },
        phone: { type: String, default: "N/A", set: v => v === "" ? "N/A" : v },
        email: { type: String, default: "N/A", set: v => v === "" ? "N/A" : v },
      },
    ],
    gstin: {
      type: String,
      default: "N/A",
      set: v => v === "" ? "N/A" : v,
    },
    bankingDetails: {
      bankName: { type: String, default: "N/A", set: v => v === "" ? "N/A" : v },
      accountNumber: { type: String, default: "N/A", set: v => v === "" ? "N/A" : v },
      ifscCode: { type: String, default: "N/A", set: v => v === "" ? "N/A" : v },
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

const Party = mongoose.model("Party", partySchema);

export default Party;