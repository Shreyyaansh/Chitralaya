const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Address = require('../models/Address');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstname lastname email');

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      artist, 
      size, 
      medium, 
      cardClass,
      adjustClass,
      isActive 
    } = req.body;

    // Get uploaded files
    const uploadedFiles = req.files || [];

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category'
      });
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    // Create image URLs from uploaded files
    const images = uploadedFiles.map(file => {
      // Map category to assets folder path
      let assetsPath = 'assets/';
      switch(category) {
        case 'canvas':
          assetsPath += 'canvas/';
          break;
        case 'sketches':
          assetsPath += 'sketch/';
          break;
        case 'color':
          assetsPath += 'color paint/';
          break;
        default:
          assetsPath += 'canvas/';
      }
      return `${assetsPath}${file.filename}`;
    });

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      images,
      artist: artist || 'Chitralaya Artist',
      size: size || undefined,
      medium: medium || undefined,
      cardClass: cardClass || 'card-default',
      adjustClass: adjustClass || '',
      isActive: isActive === 'true'
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      updates,
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
      data: { product }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

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
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'firstname lastname email')
      .populate('items.product', 'name price images artist category description');

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('user', 'firstname lastname email phone')
      .populate('items.product', 'name price images artist category description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Update order
// @route   PUT /api/admin/orders/:id
// @access  Private (Admin)
exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      updates,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Don't allow password updates through this route
    if (updates.password) {
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// @desc    Get all addresses
// @route   GET /api/admin/addresses
// @access  Private (Admin)
exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find()
      .populate('user', 'firstname lastname email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    console.error('Error getting all addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses'
    });
  }
};

// @desc    Get address by ID
// @route   GET /api/admin/addresses/:id
// @access  Private (Admin)
exports.getAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;

    const address = await Address.findById(addressId)
      .populate('user', 'firstname lastname email');

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('Error getting address by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching address'
    });
  }
};

// @desc    Update address
// @route   PUT /api/admin/addresses/:id
// @access  Private (Admin)
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const updates = req.body;

    const address = await Address.findByIdAndUpdate(
      addressId,
      updates,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating address'
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/admin/addresses/:id
// @access  Private (Admin)
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const address = await Address.findByIdAndDelete(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address'
    });
  }
};
