import mongoose from "mongoose";

const stockSnapSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },
    itemType: {
      type: String,
      required: true,
      enum: ["Product", "RawMaterial"],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StockSnap = mongoose.model("StockSnap", stockSnapSchema);

export default StockSnap;