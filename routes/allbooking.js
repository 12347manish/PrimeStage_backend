const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/allbookingController');
// const authController = require('../controllers/authController');

// Apply token verification middleware to protect these routes
// router.use(authController.verifyToken);

// Booking routes
router.post('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);

// Additional routes can be added as needed
// router.post('/', bookingController.createBooking);
// router.put('/:id', bookingController.updateBooking);
// router.delete('/:id', bookingController.deleteBooking);

module.exports = router;