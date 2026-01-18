import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema({
  reason: {
    type: String, 
    required: true,
    trim: true,
    minlength: [10, "Reason must be descriptive (min 10 chars)"] 
  },
  type: {
    type: String,
    enum: ['wastage', 'theft', 'count_error', 'expiry', 'damanged'],
    required: true
  },
 item: {
     type: mongoose.Schema.Types.ObjectId,
     required: [true, 'Item ID is required'],
     refPath: 'itemModel'
   },
   itemModel: {
     type: String,
     required: true,
     enum: ['RawMaterial', 'Product'] 
   },
  location:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: [true, "Needed where stock is adjusted"]
  },
  quantity:{
    type: Number,
    required:true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { timestamps: true });

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);
export default StockAdjustment;