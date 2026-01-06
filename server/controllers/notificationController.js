const Notification = require('../models/Notification');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create repaint request notification
// @route   POST /api/notifications/repaint
// @access  Private
exports.createRepaintNotification = async (req, res) => {
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

    // Create notification
    const notification = new Notification({
      user: userId,
      product: productId,
      type: 'repaint_request',
      message: `Repaint request for: ${product.name}`
    });

    await notification.save();
    await notification.populate('user', 'firstname lastname email');
    await notification.populate('product', 'name price images artist category');

    res.status(201).json({
      success: true,
      message: 'Repaint request sent successfully',
      data: { notification: notification.getPublicData() }
    });

  } catch (error) {
    console.error('Error creating repaint notification:', error);
    res.status(500).json({ success: false, message: 'Server error while creating repaint request' });
  }
};

// @desc    Get all notifications (Admin only)
// @route   GET /api/notifications
// @access  Private (Admin)
exports.getAllNotifications = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 50 } = req.query;
    let query = {};

    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .populate('user', 'firstname lastname email phone')
      .populate('product', 'name price images artist category description')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalNotifications = await Notification.countDocuments(query);

    res.json({
      success: true,
      count: notifications.length,
      total: totalNotifications,
      page: parseInt(page),
      pages: Math.ceil(totalNotifications / limit),
      data: { notifications: notifications.map(n => n.getPublicData()) }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notifications' });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private (Admin)
exports.getNotificationById = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId)
      .populate('user', 'firstname lastname email phone')
      .populate('product', 'name price images artist category description size medium');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Mark as read when viewed
    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.json({
      success: true,
      data: { notification: notification.getPublicData() }
    });

  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notification' });
  }
};

// @desc    Update notification (mark as read/unread)
// @route   PUT /api/notifications/:id
// @access  Private (Admin)
exports.updateNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { isRead } = req.body;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (isRead !== undefined) notification.isRead = isRead;

    await notification.save();
    await notification.populate('user', 'firstname lastname email phone');
    await notification.populate('product', 'name price images artist category');

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: { notification: notification.getPublicData() }
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Server error while updating notification' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/count
// @access  Private (Admin)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notification count' });
  }
};

