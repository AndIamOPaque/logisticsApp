import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["EXPENSE", "INCOME"],
      required: true,
      index: true, 
    },
    category: {
      type: String, 
      required: true, 
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CREDIT_CARD", "BANK_TRANSFER", "CHEQUE", "UPI", "OTHER"],
      default: "CASH",
    },
    paymentDate: Date,
    items: [
      {
        itemRef: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "items.modelRef", 
        },
        modelRef: {
          type: String,
          enum: ["Product", "RawMaterial", "Asset"],
        },
        
        name: { 
          type: String, 
          required: true 
        },

        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true }, 
        total: { type: Number },
      },
    ],

    grandTotal: {
      type: Number,
      default: 0, 
    },

    from: {
      name: String,
      party: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'from.model' 
      },
      model: {
        type: String,
        required: true,
        enum: ['Party', 'Employee', 'User'] 
      }
    },

    to: {
      name: String,
      party: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'to.model' 
      },
      model: {
        type: String,
        required: true,
        enum: ['Party', 'Employee', 'User']
      }
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "OVERDUE"],
      default: "PENDING",
      index: true,
    },
    dueDate: Date,
    linkedDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery'
    },
    notes: String, 
    attachments: [
      {
        url: { type: String, required: true },
        fileType: { type: String, enum: ['image', 'pdf'], default: 'image' },
        caption: { type: String }
      }
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
  { timestamps: true }
);

billSchema.pre('save', function(next) {
  this.items.forEach(item => {
    item.total = item.quantity * item.price;
  });
  
  this.grandTotal = this.items.reduce((acc, item) => acc + item.total, 0);
  
  next();
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;