// qrCodeController.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const axios = require('axios');

// Initialize Razorpay with your key credentials
const razorpay = new Razorpay({
  key_id:  'rzp_test_HOznD0kcU57LIw',
  key_secret:  'ZjEJR47tBc7PVBiC4rVMPyI'
});

/**
 * @route POST /api/payments/qr-code
 * @desc Generate a UPI QR code for payment
 * @access Private (Vendor only)
 */


router.post('/qr-code', async (req, res) => {
  try {
    const expiryTime = Math.floor(Date.now() / 1000) + 86400;
    
    // Create request payload
    const payload = {
      type: "upi_qr",
      name: "Mohit",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: 20000,
      description: "Payment for Mohit",
      close_by: expiryTime,
      notes: {
        billId: 'bill_123',
        purpose: "Test UPI QR Code"
      }
    };
    
    // Set up auth credentials
    const username = 'rzp_test_HOznD0kcU57Llw';
    const password = 'ZjEJR47tBc7PVBiC4rVMPyI';
    
    // Make API request
    const response = await axios({
        method: 'post',
        url: 'https://api.razorpay.com/v1/payments/qr_codes',
        headers: {
          'Content-Type': 'application/json',
          // Create a Base64 encoded Authorization header
          'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        },
        data: payload
      });
    
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message || 'Failed to generate QR code'
    });
  }
});

/**
 * @route GET /api/payments/qr-code/:id
 * @desc Fetch QR code details by ID
 * @access Private
 */
router.get('/qr-code/:id', async (req, res) => {
  try {
    const qrCodeId = req.params.id;
    
    if (!qrCodeId) {
      return res.status(400).json({
        success: false,
        error: 'QR code ID is required'
      });
    }

    const qrCode = await razorpay.qrCode.fetch(qrCodeId);
    
    return res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('QR Code Fetch Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch QR code details'
    });
  }
});

/**
 * @route POST /api/payments/qr-code/:id/close
 * @desc Close an active QR code
 * @access Private (Vendor only)
 */
router.post('/qr-code/:id/close', async (req, res) => {
  try {
    const qrCodeId = req.params.id;
    
    if (!qrCodeId) {
      return res.status(400).json({
        success: false,
        error: 'QR code ID is required'
      });
    }

    const qrCode = await razorpay.qrCode.close(qrCodeId);
    
    return res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('QR Code Close Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to close QR code'
    });
  }
});

module.exports = router;