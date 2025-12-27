import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "Party",
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Party",
    },

    content: [
      { 
        itemType: { type: String, enum: ["rawMaterial", "product"], required: true },
        itemId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],

    locationId: { type: Schema.Types.ObjectId, ref: "Location" , required: true },
    billIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bill",
      },
    ],

    vehicleId: { type: Schema.Types.ObjectId, ref: "Asset" },
    driverId: { type: Schema.Types.ObjectId, ref: "Staff" },

    departureTime: { type: Date },
    arrivalTime: { type: Date },

    status: {
      type: String,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },

    notes: { type: String },

    // audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;