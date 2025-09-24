import mongoose from "mongoose";

const productionLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    state: {
      type: String,
      enum: ["packaged", "toBePackaged"],
      required: true,
    },
    rawMaterialsConsumed: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterial",
        },
        quantity: Number,
      },
    ],
    quantityProduced: {
      type: Number,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    expectedWaste: {
      type: Number,
    },
    actualWaste: {
      type: Number,
    },
    defectiveUnits: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
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

const ProductionLog = mongoose.model("ProductionLog", productionLogSchema);

export default ProductionLog;