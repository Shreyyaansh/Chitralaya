const express = require('express');
const router = express.Router();
const razorpayController = require('../controllers/razorpayController');
const { authenticateToken } = require('../middleware/auth');

// All Razorpay routes require authentication
router.use(authenticateToken);

// Razorpay routes
router.post('/create-order', razorpayController.createRazorpayOrder);
router.post('/verify-payment', razorpayController.verifyPayment);
router.get('/key', razorpayController.getRazorpayKey);

module.exports = router;
