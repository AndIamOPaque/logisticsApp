import mongoose from "mongoose";

const productionOrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantityToProduce: { // <-- Renamed for clarity
    type: Number,
    required: [true, 'Quantity is required'],
    validate: {
      validator: (v) => v > 0,
      message: 'Quantity must be a positive number'
    },
  },
  actualQuantity: {
    type: Number,
    default: 0,
    validate: {
      validator: (v) => v > 0,
      message: 'Quantity must be a positive number'
    },
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Production location is required']
  },
  
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending'
  },
  producedQuantity: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    trim: true
  },
  consumedMaterials: [
    {
      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RawMaterial',
        required: [true, 'Material is required']
      },
      quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        validate: {
          validator: (v) => v >= 0,
          message: 'Quantity must be a non-negative number'
        }
      },
      waste: {
        type: Number,
        default: 0,
        validate: {
          validator: (v) => v >= 0,
          message: 'Waste must be a non-negative number'
        },
      }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order creator is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

productionOrderSchema.index({ product: 1 });
productionOrderSchema.index({ location: 1 });
productionOrderSchema.index({ status: 1 });

const ProductionOrder = mongoose.model('ProductionOrder', productionOrderSchema);
export default ProductionOrder;