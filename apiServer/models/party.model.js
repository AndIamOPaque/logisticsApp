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
    },
    contact: [
      {
        person: String,
        phone: String,
        email: String,
      },
    ],
    gstin: {
      type: String,
    },
    bankingDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
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