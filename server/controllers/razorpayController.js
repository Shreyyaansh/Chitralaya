const Razorpay = require('razorpay');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/razorpay/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency, orderId } = req.body;

        // Validate required fields
        if (!amount || !currency || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Amount, currency, and orderId are required'
            });
        }

        // Create Razorpay order
        const options = {
            amount: amount, // Amount in paise
            currency: currency,
            receipt: orderId,
            notes: {
                orderId: orderId
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            data: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt
            }
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order'
        });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/razorpay/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature, razorpayOrderId } = req.body;

        // Validate required fields
        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({
                success: false,
                message: 'Order ID, payment ID, and signature are required'
            });
        }

        // Verify payment signature using Razorpay order ID
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId || orderId}|${paymentId}`)
            .digest('hex');


        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update order status in database
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order with payment details
        order.paymentStatus = 'completed';
        order.paymentId = paymentId;
        order.paymentMethod = 'upi';
        order.orderStatus = 'confirmed';
        
        await order.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                orderId: order._id,
                paymentId: paymentId,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
};

// @desc    Get Razorpay key
// @route   GET /api/razorpay/key
// @access  Private
exports.getRazorpayKey = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Error getting Razorpay key:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting payment key'
        });
    }
};
