const Product = require('../models/Product');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalProducts = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products: products.map(product => product.getPublicData()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts,
          hasNext: skip + products.length < totalProducts,
          hasPrev: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is no longer available'
      });
    }
    
    res.json({
      success: true,
      data: {
        product: product.getPublicData()
      }
    });
    
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      images,
      category,
      artist,
      size,
      medium
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !description || !images || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, description, images, category'
      });
    }
    
    // Create new product
    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      images: Array.isArray(images) ? images : [images],
      category,
      artist: artist || 'Chitralaya Artist',
      size,
      medium
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: product.getPublicData()
      }
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: product.getPublicData()
      }
    });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete - just mark as inactive
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
