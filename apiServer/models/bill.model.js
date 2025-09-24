import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["toll", "tax", "expenses", "maintenance", "purchase", "sale"],
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    from: {
      name: String,
      party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party",
      },
    },
    to: {
      name: String,
      party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party",
      },
    },
    dueDate: {
      type: Date,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "itemType",
        },
        itemType: {
          type: String,
          enum: ["Product", "RawMaterial"],
        },
        quantity: Number,
        price: Number,
      },
    ],
    notes: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "late", "paid"],
      default: "pending",
    },
    photo_url: {
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

const Bill = mongoose.model("Bill", billSchema);

export default Bill;