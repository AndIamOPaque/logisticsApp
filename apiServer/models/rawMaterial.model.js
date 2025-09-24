import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      enum: ["parts", "raw", "recycled", "packaging"],
      required: true,
    },
    unitOfMeasurement: {
      type: String,
      required: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
    },
    reorderLevel: {
      type: Number,
      default: 0,
    },
    intakeLevel: {
      type: Number,
      default: 0,
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

const RawMaterial = mongoose.model("RawMaterial", rawMaterialSchema);

export default RawMaterial;