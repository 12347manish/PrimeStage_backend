// notificationController.js - Fixed Version
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const { body, validationResult } = require('express-validator');
const cors = require('cors');

// Apply CORS middleware to all routes in this controller
router.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Function to get Firebase access token
async function getAccessToken() {
  try {
    // Create auth client with the proper credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, './homestage-51e95-firebase-adminsdk-x8i89-06c69d334b.json'),
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    });

    // Get client and token correctly
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    // Log the token for debugging
    console.log("Access token retrieved:", tokenResponse.token ? "Token exists" : "Token is missing");
    
    return tokenResponse.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Route to send notification to artist
router.post('/send-notification-artist', async (req, res) => {
  try {
    console.log('Received artist notification request:', req.body);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Check if token exists
    if (!accessToken) {
      throw new Error('Failed to retrieve valid access token');
    }
    
    // Retrieve data from request body
    const { fcm_token, type, status } = req.body;
    console.log(req.body);
    
    // Validate required fields
    if (!fcm_token) {
      return res.status(400).json({
        success: false,
        error: 'FCM token is required'
      });
    }
    
    // Define notification content based on status
    const notificationTitle = status
      ? 'Sorry, User cancelled the booking'
      : 'You have got a booking by the user';
    const notificationBody = status
      ? 'Sorry, User cancelled the booking'
      : 'You have got a booking by the user';
    
    // Prepare the message payload
    const messagePayload = {
      message: {
        notification: {
          title: notificationTitle,
          body: notificationBody
        },
        data: type ? { type } : {},
        token: fcm_token
      }
    };
    
    console.log('Sending notification with payload:', JSON.stringify(messagePayload));
    
    // Send notification via Firebase Cloud Messaging
    const response = await axios.post(
      'https://fcm.googleapis.com/v1/projects/homestage-51e95/messages:send',
      messagePayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return successful response
    return res.status(200).json({
      success: true,
      response: response.data
    });
  } catch (error) {
    console.error('Error sending notification to artist:', error);
    
    // Return error response with more details
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
      details: error.message
    });
  }
});

// Route to send notification to user
router.post('/send-notification-user', async (req, res) => {
  try {
    console.log('Received user notification request:', req.body);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Check if token exists
    if (!accessToken) {
      throw new Error('Failed to retrieve valid access token');
    }
    
    // Retrieve data from request body
    const { user_fcmToken, type, status } = req.body;
    
    // Validate required fields
    if (!user_fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'User FCM token is required'
      });
    }
    
    // Define notification content based on status
    const notificationTitle = status
      ? 'Your booking has been accepted by the artist'
      : 'Your booking has been rejected by the artist';
    const notificationBody = status
      ? 'BOOKING REQUEST ACCEPT FOR THE EVENT'
      : 'BOOKING REQUEST REJECTED FOR THE EVENT';
    
    // Prepare the message payload
    const messagePayload = {
      message: {
        notification: {
          title: notificationTitle,
          body: notificationBody
        },
        data: type ? { type } : {},
        token: user_fcmToken
      }
    };
    
    console.log('Sending notification with payload:', JSON.stringify(messagePayload));
    
    // Send notification via Firebase Cloud Messaging
    const response = await axios.post(
      'https://fcm.googleapis.com/v1/projects/homestage-51e95/messages:send',
      messagePayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return successful response
    return res.status(200).json({
      success: true,
      response: response.data
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
    
    // Return error response with more details
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
      details: error.message
    });
  }
});

module.exports = router;