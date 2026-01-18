import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, 
    },
    category: {
      type: String,
      enum: ["machinery", "vehicle", "it", "furniture"], //it nahi hai IT hai. camera computer wagera
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "retired", "sold"], 
      default: "active",
    },
    purchaseDate: {
      type: Date, 
    },
    cost: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },

    serviceRecords: [
      {
        date: {
          type: Date,
          required: true,
        },
        description: String, 
        bills: [
             { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
        ],
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

assetSchema.index({ location: 1, status: 1 });

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;