const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// User routes
router.post('/repaint', notificationController.createRepaintNotification);

// Admin routes
router.get('/', notificationController.getAllNotifications);
router.get('/count', notificationController.getUnreadCount);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id', notificationController.updateNotification);

module.exports = router;

