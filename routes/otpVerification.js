const express = require('express');
const router = express.Router();
const SMSController = require('../controllers/SMSController');
// Send OTP route
router.post('/send-otp', 
    SMSController.validatePhone(),
    (req, res) => SMSController.sendOTP(req, res)
);

// Verify OTP route
router.post('/verify-otp',
    SMSController.validateOTP(),
    (req, res) => SMSController.verifyOTP(req, res)
);

module.exports = router;