import mongoose from 'mongoose';

const inventoryMoveSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location', 
    required: [true, 'Location is required'],
  },
 purpose: {
    type: String,
    required: true,
    enum: ['intake', 'production', 'transfer', 'sale', 'waste', 'correction']
  },

  // The "Event" that caused this move
  referenceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'referenceModel' // Dynamic reference
  },
  referenceModel: {
    type: String,
    required: true,
    enum: ['ProductionOrder', 'Bill', 'Delivery', 'Adjustment'] 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const InventoryMove = mongoose.model('InventoryMove', inventoryMoveSchema);
export default InventoryMove;