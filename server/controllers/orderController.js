const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create repaint request
// @route   POST /api/orders/repaint
// @access  Private
exports.createRepaintRequest = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get user's default address or create minimal address
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    // Create repaint request order
    const order = new Order({
      user: userId,
      items: [{
        product: product._id,
        quantity: 1,
        price: product.price
      }],
      totalAmount: product.price,
      shippingAddress: {
        fullName: `${user.firstname} ${user.lastname}`,
        email: user.email,
        phone: user.phone || 'Not provided',
        address: 'To be provided',
        city: 'To be provided',
        state: 'To be provided',
        pincode: 'To be provided'
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      isRepaintRequest: true,
      notes: `Repaint request for: ${product.name}`
    });

    await order.save();
    await order.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Repaint request sent successfully',
      data: { order: order.getPublicData() }
    });

  } catch (error) {
    console.error('Error creating repaint request:', error);
    res.status(500).json({ success: false, message: 'Server error while creating repaint request' });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId, notes, paymentStatus } = req.body;
    const userId = req.user._id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Calculate total amount and validate products
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: `Product ${item.product} not found or inactive` 
        });
      }


      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId,
      notes,
      paymentStatus: paymentStatus || 'pending'
    });

    await order.save();


    // Populate the order with product details
    await order.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: order.getPublicData() }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order' });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.findByUser(userId);

    res.json({
      success: true,
      count: orders.length,
      data: { orders: orders.map(order => order.getPublicData()) }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: { order: order.getPublicData() }
    });

  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching order' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus, paymentStatus, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update fields if provided
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes) order.notes = notes;

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: order.getPublicData() }
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Server error while updating order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow deletion of pending payment orders
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete order with completed payment'
      });
    }

    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting order'
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('user', 'firstname lastname email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page: parseInt(page),
      pages: Math.ceil(totalOrders / limit),
      data: { orders: orders.map(order => order.getPublicData()) }
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
};
