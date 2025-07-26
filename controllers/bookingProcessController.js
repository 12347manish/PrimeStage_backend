const sequelize = require('../config/database_conn');
const { QueryTypes } = require('sequelize');
const { body, validationResult } = require('express-validator');

// Validation middleware for user information update
exports.validateUserInfoUpdate = [
    body('first_name').isString().notEmpty().withMessage('First name is required')
];

// Validation middleware for booking creation
exports.validateBookingCreation = [
    body('user_id').notEmpty().withMessage('User ID is required'),
    body('booking_date').notEmpty().withMessage('Booking date is required'),
    body('booked_from').notEmpty().withMessage('Booking start time is required'),
    body('booked_to').notEmpty().withMessage('Booking end time is required'),
    body('formattedAddress').notEmpty().withMessage('Location is required'),
    body('total_amount').isNumeric().withMessage('Total amount must be a number')
];

// Validation middleware for payment details
exports.validatePaymentDetails = [
    body('payment_id').notEmpty().withMessage('Payment ID is required'),
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('signature').notEmpty().withMessage('Signature is required'),
    body('booking_id').notEmpty().withMessage('Booking ID is required')
];

// Update user information by ID
exports.updateUserInfo = async (req, res) => {
    console.log('⌛ Starting updateUserInfo request...');
    
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation Error:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        
        // Check if user information exists
        const checkQuery = `
            SELECT * FROM user_information
            WHERE id = :id
        `;
        
        const userInfo = await sequelize.query(checkQuery, {
            replacements: { id },
            type: QueryTypes.SELECT
        });

        if (userInfo.length === 0) {
            console.log('❌ User information not found with ID:', id);
            return res.status(404).json({ error: 'User information not found' });
        }

        // Prepare field updates
        const updateFields = Object.keys(req.body)
            .map(key => `${key} = :${key}`)
            .join(', ');
        


        // Update query
        const updateQuery = `
            UPDATE user_information
            SET ${updateFields}, updated_at = NOW()
            WHERE id = :id
        `;
        
        // Execute update query
        const [updatedInfo] = await sequelize.query(updateQuery, {
            replacements: { ...req.body, id },
            type: QueryTypes.UPDATE
        });
        
        // Fetch updated record
        const fetchQuery = `
            SELECT * FROM user_information
            WHERE id = :id
        `;
        
        const updatedUserInfo = await sequelize.query(fetchQuery, {
            replacements: { id },
            type: QueryTypes.SELECT
        });

        console.log('✅ User information updated successfully');
        res.status(200).json(updatedUserInfo[0]);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new booking
// Backend: Add this function to your bookingProcessController.js

/**
 * Modified createBooking function to work with Razorpay payments
 */
exports.createBooking = async (req, res) => {
    console.log('⌛ Starting createBooking request...');
    
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation Error:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        console.log(req.body);

        // Extract only the relevant fields for booking creation
        const bookingData = {
            user_id: req.body.user_id,
            artist_id: req.body.artist_id,
            team_id: req.body.team_id || null,
            audience_size: req.body.audience_size,
            booking_date: req.body.booking_date,
            booked_from: req.body.booked_from,
            booked_to: req.body.booked_to,
            duration: req.body.duration,
            location: req.body.location || req.body.formattedAddress,
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null,
            special_request: req.body.special_request || '',
            category: req.body.category,
            status: req.body.status || 0,
            total_amount: req.body.total_amount
        };

        // Filter out undefined values
        const filteredData = Object.fromEntries(
            Object.entries(bookingData).filter(([_, v]) => v !== undefined)
        );
        
        // Prepare column names and values for insertion
        const columns = Object.keys(filteredData).join(', ');
        const valuePlaceholders = Object.keys(filteredData).map(key => `:${key}`).join(', ');
        
        // Insert query
        const insertQuery = `
            INSERT INTO bookings (${columns}, created_at, updated_at)
            VALUES (${valuePlaceholders}, NOW(), NOW())
        `;
        
        // Execute insert query with only the validated and filtered data
        const [bookingId] = await sequelize.query(insertQuery, {
            replacements: filteredData,
            type: QueryTypes.INSERT
        });

        console.log('New booking ID:', bookingId);
        
        if (!bookingId) {
            throw new Error('Failed to create booking');
        }
        
        // Fetch the created booking
        const fetchQuery = `
            SELECT * FROM bookings
            WHERE id = :bookingId
        `;
        
        const [createdBooking] = await sequelize.query(fetchQuery, {
            replacements: { bookingId },
            type: QueryTypes.SELECT
        });

        // Handle Razorpay order_id if it's provided
        if (req.body.order_id) {
            try {
                // Assuming you have imported the paymentService
                const paymentService = require('../services/paymentService');
                
                // Link the booking to the payment
                await paymentService.createPaymentAfterBooking(
                    bookingId,
                    req.body.order_id
                );
                
                console.log('✅ Payment linked to booking:', req.body.order_id);
            } catch (paymentError) {
                console.error('⚠️ Warning: Error linking payment to booking:', paymentError);
                // We don't want to fail the booking creation if payment linking fails
                // Just log the error and continue
            }
        }

        console.log('✅ Booking created successfully with ID:', bookingId);
        res.status(201).json({
            ...createdBooking,
            id: bookingId
        });

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};
// Store payment details for successful transaction
exports.storePaymentDetails = async (req, res) => {
    console.log('⌛ Starting storePaymentDetails request...');
    
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation Error:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract payment data from request body
        const {
            payment_id,
            order_id,
            signature,
            booking_id
        } = req.body;

        // Prepare column names and values for insertion
        const columns = Object.keys(req.body).join(', ');
        const valuePlaceholders = Object.keys(req.body).map(key => `:${key}`).join(', ');
        
        // Insert query
        const insertQuery = `
            INSERT INTO payment_details (${columns}, status, created_at, updated_at)
            VALUES (${valuePlaceholders}, 'completed', NOW(), NOW())
            RETURNING *
        `;
        
        // Execute insert query
        const [result] = await sequelize.query(insertQuery, {
            replacements: req.body,
            type: QueryTypes.INSERT
        });
        
        // Fetch the created payment detail
        const paymentDetailId = result[0].id;
        
        const fetchQuery = `
            SELECT * FROM payment_details
            WHERE id = :paymentDetailId
        `;
        
        const createdPaymentDetail = await sequelize.query(fetchQuery, {
            replacements: { paymentDetailId },
            type: QueryTypes.SELECT
        });

        console.log('✅ Payment details stored successfully with ID:', paymentDetailId);
        res.status(201).json(createdPaymentDetail[0]);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};