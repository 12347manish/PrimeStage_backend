// Backend: Create a route for order creation (in your Express routes)
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid'); // You'll need to install uuid package

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Hb4hFCm46361XC',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret_key'
});

// Create an order
router.post('/create-order', async (req, res) => {
  try {
    const {
      artist_id,
      user_id,
      amount,
      currency = 'INR',
      receipt = uuidv4(),
      booking_details
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Convert to smallest currency unit (paise for INR)
    const amountInSmallestUnit = Math.round(amount * 100);

    const options = {
      amount: amountInSmallestUnit,
      currency,
      receipt,
      notes: {
        artist_id,
        user_id,
        booking_details: JSON.stringify(booking_details)
      }
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    // Store order details in your database if needed
    // await storeOrderInDatabase(order, user_id, artist_id, booking_details);

    res.status(200).json({
      order_id: order.id,
      currency: order.currency,
      amount: order.amount / 100, // Convert back to main currency unit for display
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_Hb4hFCm46361XC'
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment after Razorpay callback
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret_key')
      .update(sign)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is legitimate, update your database
      // await updatePaymentStatus(razorpay_order_id, razorpay_payment_id, 'success');
      
      res.status(200).json({ success: true });
    } else {
      // Payment verification failed
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;