// Backend: Updated Payment Service using existing payment_details table
// services/paymentService.js
const sequelize = require('../config/database_conn');
const { QueryTypes } = require('sequelize');


/**
 * Create a new payment entry in the database
 */
exports.createPaymentEntry = async (paymentData) => {
  try {
    const { booking_id, order_id } = paymentData;
    
    // Insert query using raw SQL to match your existing table structure
    const insertQuery = `
      INSERT INTO payment_details 
        (booking_id, order_id, created_at, updated_at, Verified) 
      VALUES 
        (:booking_id, :order_id, NOW(), NOW(), 0)
    `;
    
    const [result] = await sequelize.query(insertQuery, {
      replacements: { 
        booking_id, 
        order_id 
      },
      type: QueryTypes.INSERT
    });
    
    // Get the inserted ID
    const paymentId = result;
    
    return paymentId;
  } catch (error) {
    console.error('Error creating payment entry:', error);
    throw error;
  }
};

/**
 * Update payment details after successful payment
 */
exports.updatePaymentDetails = async (order_id, paymentData) => {
  try {
    const { payment_id, signature } = paymentData;

    // Update query
    const updateQuery = `
      UPDATE payment_details 
      SET 
        payment_id = :payment_id, 
        signature = :signature, 
        Verified = 1, 
        updated_at = NOW()
      WHERE 
        order_id = :order_id
    `;
    
    await sequelize.query(updateQuery, {
      replacements: { 
        payment_id, 
        signature, 
        order_id 
      },
      type: QueryTypes.UPDATE
    });
    
    // Get the updated payment details
    const selectQuery = `
      SELECT * FROM payment_details 
      WHERE order_id = :order_id
    `;
    
    const [paymentDetails] = await sequelize.query(selectQuery, {
      replacements: { order_id },
      type: QueryTypes.SELECT
    });
    
    return paymentDetails;
  } catch (error) {
    console.error('Error updating payment details:', error);
    throw error;
  }
};

/**
 * Get payment details by order ID
 */
exports.getPaymentByOrderId = async (order_id) => {
  try {
    const query = `
      SELECT * FROM payment_details 
      WHERE order_id = :order_id
    `;
    
    const [paymentDetails] = await sequelize.query(query, {
      replacements: { order_id },
      type: QueryTypes.SELECT
    });
    
    return paymentDetails;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

/**
 * Create a payment record after booking creation
 */
exports.createPaymentAfterBooking = async (booking_id, order_id) => {
  try {
    // Check if a payment record already exists for this order
    const existingQuery = `
      SELECT * FROM payment_details 
      WHERE order_id = :order_id
    `;
    
    const [existingPayment] = await sequelize.query(existingQuery, {
      replacements: { order_id },
      type: QueryTypes.SELECT
    });
    
    if (existingPayment) {
      // Update the booking_id if payment record exists
      const updateQuery = `
        UPDATE payment_details 
        SET 
          booking_id = :booking_id, 
          updated_at = NOW()
        WHERE 
          order_id = :order_id
      `;
      
      await sequelize.query(updateQuery, {
        replacements: { booking_id, order_id },
        type: QueryTypes.UPDATE
      });
      
      return existingPayment.id;
    } else {
      // Create new payment record if none exists
      return await exports.createPaymentEntry({ booking_id, order_id });
    }
  } catch (error) {
    console.error('Error creating payment after booking:', error);
    throw error;
  }
};