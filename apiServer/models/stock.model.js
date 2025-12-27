import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel'
  },
  itemModel: {
    type: String,
    required: true,
    enum: ['RawMaterial', 'Product']
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "Stock cannot be negative"] // Optional: Strict mode prevents overdrafts
  }
}, { timestamps: true });

// Compound index is CRITICAL for speed and uniqueness
stockSchema.index({ item: 1, location: 1 }, { unique: true });

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;