const express = require('express');
const router = express.Router();
const userController = require('../controllers/bookingProcessController');
// const bookingController = require('../controllers/bookingController');
// const paymentController = require('../controllers/paymentController');

// Alternatively, if all controllers are in one file:
// const controllers = require('../controllers/controllers');

// User information routes
router.patch('/info/:id', 
    userController.validateUserInfoUpdate,
    userController.updateUserInfo
);

// Booking routes
router.post('/booking', 
    userController.validateBookingCreation,
    userController.createBooking
);

// Payment routes
router.post('/payment/success', 
    userController.validatePaymentDetails,
    userController.storePaymentDetails
);

// If using a single controller file:
// router.patch('/info/:id', controllers.validateUserInfoUpdate, controllers.updateUserInfo);
// router.post('/booking', controllers.validateBookingCreation, controllers.createBooking);
// router.post('/payment/success', controllers.validatePaymentDetails, controllers.storePaymentDetails);

module.exports = router;