// Backend: Payment Routes
// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { body } = require('express-validator');

// Create a Razorpay order
router.post('/create-order', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('user_id').notEmpty().withMessage('User ID is required')
], paymentController.createOrder);

// Verify payment after Razorpay callback
router.post('/verify-payment', [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
], paymentController.verifyPayment);

// Link payment to booking after booking creation
router.post('/link-payment-to-booking', [
  body('order_id').notEmpty().withMessage('Order ID is required'),
  body('booking_id').notEmpty().withMessage('Booking ID is required')
], paymentController.linkPaymentToBooking);

module.exports = router;