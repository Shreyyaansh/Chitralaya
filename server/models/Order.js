const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'cod'],
    required: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isRepaintRequest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

// Instance method to get public order data
orderSchema.methods.getPublicData = function() {
  const orderObject = this.toObject();
  return orderObject;
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema);
