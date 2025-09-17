const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Address name is required'],
    trim: true,
    maxlength: [50, 'Address name cannot exceed 50 characters']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number (with or without +91 prefix)']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better performance
addressSchema.index({ user: 1, createdAt: -1 });
addressSchema.index({ user: 1, isDefault: 1 });

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Instance method to get public address data
addressSchema.methods.getPublicData = function() {
  const addressObject = this.toObject();
  return addressObject;
};

// Static method to find addresses by user
addressSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

// Static method to find default address by user
addressSchema.statics.findDefaultByUser = function(userId) {
  return this.findOne({ user: userId, isDefault: true });
};

module.exports = mongoose.model('Address', addressSchema);
