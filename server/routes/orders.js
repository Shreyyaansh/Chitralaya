const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.route('/')
  .get(orderController.getUserOrders)
  .post(orderController.createOrder);

router.post('/repaint', orderController.createRepaintRequest);

router.route('/:id')
  .get(orderController.getOrderById)
  .put(orderController.updateOrderStatus)
  .delete(orderController.deleteOrder);

// Admin routes
router.get('/admin/all', orderController.getAllOrders);

module.exports = router;
