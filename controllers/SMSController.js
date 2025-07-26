const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');

class SMSController {
    constructor() {
        this.apiKey = 'MhWCaEPDK6v1U7BtpOgkbRnlNrL8HucXjQw2TmiGJdY5z0I43sRh0kPpSEvt54TnmGVfUgKNoi86sFy9';
        this.baseUrl = 'https://www.fast2sms.com/dev/bulkV2';
        this.specialNumbers = {
            '9999999999': '123456' // Add your special numbers here
        };
        // Store OTPs with their expiry time
        this.otpStore = new Map();
    }

    // Store OTP with 5-minute expiry
    storeOTP(phone, otp) {
        this.otpStore.set(phone, {
            otp,
            expiry: Date.now() + (5 * 60 * 1000) // 5 minutes in milliseconds
        });
    }

    // Get OTP if it exists and hasn't expired
    getOTP(phone) {
        const otpData = this.otpStore.get(phone);
        if (otpData && otpData.expiry > Date.now()) {
            return otpData.otp;
        }
        // Clean up expired OTP
        this.otpStore.delete(phone);
        return null;
    }

    validatePhone() {
        return [
            body('numbers')
                .isLength({ min: 10, max: 10 })
                .matches(/^\d+$/)
                .withMessage('Phone number must be exactly 10 digits')
        ];
    }

    validateOTP() {
        return [
            body('numbers')
                .isLength({ min: 10, max: 10 })
                .matches(/^\d+$/)
                .withMessage('Phone number must be exactly 10 digits'),
            body('otp')
                .isLength({ min: 6, max: 6 })
                .matches(/^\d+$/)
                .withMessage('OTP must be exactly 6 digits')
        ];
    }

    async sendOTP(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const phone = req.body.numbers;
           

            // Handle special test numbers
            if (this.specialNumbers[phone]) {
                this.storeOTP(phone, this.specialNumbers[phone]);
                return res.status(200).json({
                    message: 'OTP sent successfully',
                    phone
                });
            }

            // Generate OTP
            const otp = String(Math.floor(100000 + Math.random() * 900000));
            

            // Send OTP via Fast2SMS
            const response = await axios.get(this.baseUrl, {
                params: {
                    authorization: this.apiKey,
                    route: 'otp',
                    variables_values: otp,
                    numbers: phone,
                    flash: '0'
                }
            });
           
            if (response.data.return === true) {
                this.storeOTP(phone, otp);
                return res.status(200).json({
                    message: 'OTP sent successfully',
                    phone
                });
            } else {
                return res.status(400).json({
                    message: 'Failed to send OTP',
                    details: response.data
                });
            }
        } catch (error) {
             console.log(error);
            return res.status(500).json({
                message: 'An error occurred while sending OTP',
                error: error.message,
            });
            
        }
    }

    async verifyOTP(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { numbers: phone, otp: submittedOtp } = req.body;
            const storedOtp = this.getOTP(phone);

            if (storedOtp && storedOtp === submittedOtp) {
                // Remove the OTP after successful verification
                this.otpStore.delete(phone);
                return res.status(200).json({
                    message: 'OTP verified successfully',
                    phone
                });
            } else {
                return res.status(400).json({
                    message: 'Invalid or expired OTP'
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: 'An error occurred while verifying OTP',
                error: error.message
            });
        }
    }
}

module.exports = new SMSController();