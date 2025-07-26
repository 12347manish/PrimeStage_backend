const jwt = require('jsonwebtoken');
const sequelize = require('../config/database_conn');
const { QueryTypes } = require('sequelize');

// You should store this in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

exports.login = async (req, res) => {
    console.log('⌛ Starting login request...');
    console.log('📦 Request body:', req.body);

    let { phone_number, fcm_token } = req.body;
    // Add default +91 prefix if missing
    if (!phone_number.startsWith('+91 ')) {
        phone_number = `+91 ${phone_number}`;
    }

    // Validate required fields
    if (!phone_number) {
        console.log('❌ Missing phone number in request');
        return res.status(400).json({
            error: 'Phone number is required'
        });
    }

    try {
        // Check if user exists
        console.log('📱 Checking phone number:', phone_number);
        const findUserQuery = "SELECT * FROM user_information WHERE phone_number = ?";
        const users = await sequelize.query(findUserQuery, {
            replacements: [phone_number],
            type: QueryTypes.SELECT
        });

        if (users && users.length > 0) {
            const user = users[0];

            // Update FCM token
            console.log('🔄 Updating FCM token...');
            const updateQuery = `
                UPDATE user_information 
                SET fcm_token = ?
                WHERE phone_number = ?
            `;
            
            await sequelize.query(updateQuery, {
                replacements: [fcm_token, phone_number],
                type: QueryTypes.UPDATE
            });

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    phoneNumber: user.phone_number
                },
                JWT_SECRET,
                { expiresIn: '7d' } // Token expires in 7 days
            );

            // Return success response with token
            return res.status(200).json({
                message: 'loggedin and FCM token updated successfully.',
                user: {
                    id: user.id,
                    phone_number: user.phone_number
                    // Add any other fields you want to include
                },
                token: token // Include the token in the response
            });
        } else {
            console.log('❌ Phone number not found:', phone_number);
            return res.status(404).json({
                message: 'Phone number not found.'
            });
        }
    } catch (error) {
        console.error('❌ Login Error:', error);
        return res.status(500).json({
            error: 'An error occurred while checking phone number.'
        });
    }
};

// Add this middleware to verify tokens for protected routes
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Add user data to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};