import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      unique: true, 
    },
    code: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ["parts", "raw", "recycled", "packaging"],
        message: 'Category must be one of: parts, raw, recycled, packaging'
      },
    },
    unitOfMeasurement: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: {
        values: ['kg', 'g', 'litre', 'ml', 'unit', 'meter', 'cm'],
        message: 'Unit must be one of: kg, g, litre, ml, unit, meter, cm'
      }
    },
    costPerUnit: {
      type: mongoose.Schema.Types.Decimal128, 
      required: [true, 'Cost per unit is required'],
      validate: {
        validator: (v) => v >= 0,
        message: 'Cost must be a positive number'
      }
    },
    quantityOnHand: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: [0, 'Reorder level cannot be negative']
    },
    reorderQuantity: { 
      type: Number,
      default: 0,
      min: [0, 'Reorder quantity cannot be negative']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'createdBy User is required'],
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

rawMaterialSchema.index({ code: 1 }, { unique: true, sparse: true });

rawMaterialSchema.index({ name: 'text' });

const RawMaterial = mongoose.model("RawMaterial", rawMaterialSchema);

export default RawMaterial;