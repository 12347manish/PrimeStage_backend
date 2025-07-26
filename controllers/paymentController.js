// Backend: Updated Payment Controller for your existing payment_details table
// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const paymentService = require('./paymentService');
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
/**
 * Create a Razorpay order
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      artist_id,
      user_id,
      team_id,
      amount,
      currency = 'INR',
      receipt = uuidv4(),
      booking_details = {}
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
        user_id,
        artist_id: artist_id || null, 
        team_id: team_id || null,
        booking_details: JSON.stringify(booking_details)
      }
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);
    
    // At this point, we don't create a payment_details record yet 
    // since we don't have a booking_id
    // We'll create it after the booking is created and payment is verified
    
    res.status(200).json({
      order_id: order.id,
      currency: order.currency,
      amount: order.amount / 100, // Convert back to main currency unit for display
      key: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify payment callback from Razorpay
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id // Optional: If booking is already created
    } = req.body;


    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;

    console.log(sign);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'QXJiLk56a1KPl8HBOxAuKDB8')
      .update(sign)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid payment signature' 
      });
    }
    
    // If booking_id is provided, create/update payment entry
    if (booking_id) {
      await paymentService.createPaymentAfterBooking(
        booking_id, 
        razorpay_order_id
      );
      
      // Update with payment details
      await paymentService.updatePaymentDetails(
        razorpay_order_id, 
        {
          payment_id: razorpay_payment_id,
          signature: razorpay_signature
        }
      );
    } else {
      // Store just the order_id and verification info for now
      // Note: In your database design, booking_id is required, 
      // so we'll need to link this later
      console.log(
        'Payment verified but booking not yet created:', 
        razorpay_order_id
      );
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Link a payment to a booking after booking creation
 */
exports.linkPaymentToBooking = async (req, res) => {
  try {
    const { order_id, booking_id } = req.body;
    
    if (!order_id || !booking_id) {
      return res.status(400).json({ error: 'Order ID and booking ID are required' });
    }
    
    // Create or update payment record with booking ID
    const paymentId = await paymentService.createPaymentAfterBooking(
      booking_id, 
      order_id
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment linked to booking successfully',
      payment_id: paymentId
    });
  } catch (error) {
    console.error('❌ Error linking payment to booking:', error);
    res.status(500).json({ error: error.message });
  }
};