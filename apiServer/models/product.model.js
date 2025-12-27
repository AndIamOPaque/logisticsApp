import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Product unit is required'],
      enum: {
        values: ['unit', 'kg', 'g', 'litre'],
        message: 'Unit must be one of: unit, kg, g, litre'
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
    salesPrice: {
      type: mongoose.Schema.Types.Decimal128, // <-- FIX 2
      required: [true, 'Sales price is required'],
      validate: {
        validator: (v) => v >= 0,
        message: 'Sales price must be a positive number'
      }
    },
    targetSalesPrice: {
      type: mongoose.Schema.Types.Decimal128,
      validate: {
        validator: (v) => v >= 0,
        message: 'Target sales price must be a positive number'
      }
    },
    // add product batch size maybe baadme
    rawMaterials: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterial",
          required: [true, 'Material ID is required']
        },
        quantity: {
          type: Number, 
          required: [true, 'Material quantity is required'],
          min: [0.001, 'Quantity must be greater than 0']
        },
      },
    ],
    dailyProductionTarget: {
      type: Number,
      min: [0, 'Production rate cannot be negative'],
    },
    byProduct: [
      {
        name: String,
        producePerUnit: Number,
        unit_measure: { 
          type: String,
          enum: ['unit', 'kg', 'g', 'litre']
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'createdBy User is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: { 
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text' });
productSchema.index({ code: 1 }, { unique: true, sparse: true });

const Product = mongoose.model("Product", productSchema);

export default Product;