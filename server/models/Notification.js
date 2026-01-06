const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['repaint_request'],
    default: 'repaint_request'
  },
  message: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

// Instance method to get public notification data
notificationSchema.methods.getPublicData = function() {
  const notificationObject = this.toObject();
  return notificationObject;
};

module.exports = mongoose.model('Notification', notificationSchema);

