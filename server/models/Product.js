const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(images) {
        return images && images.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['canvas', 'sketches', 'color', 'all'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  artist: {
    type: String,
    default: 'Chitralaya Artist'
  },
  size: {
    type: String,
    trim: true
  },
  medium: {
    type: String,
    trim: true
  },
  cardClass: {
    type: String,
    default: 'card-default'
  },
  adjustClass: {
    type: String,
    default: ''
  },
  imagePosition: {
    type: String,
    default: 'center',
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

// Instance method to get product data without sensitive info
productSchema.methods.getPublicData = function() {
  const productObject = this.toObject();
  return productObject;
};

// Static method to find active products
productSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, isActive: true });
};

module.exports = mongoose.model('Product', productSchema);
