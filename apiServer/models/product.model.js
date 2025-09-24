import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    unit: {
      type: String,
      required: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
    },
    salesPrice: {
      type: Number,
      required: true,
    },
    targetSalesPrice: {
      type: Number,
    },
    rawMaterials: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterial",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    stock: {
      packaged: {
        type: Number,
        default: 0,
      },
      toBePackaged: {
        type: Number,
        default: 0,
      },
    },
    productionRate: {
      type: Number,
    },
    byProduct: [
      {
        name: String,
        producePerUnit: Number,
        unit_measure: String,
      },
    ],
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

const Product = mongoose.model("Product", productSchema);

export default Product;