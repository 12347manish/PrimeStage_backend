require('dotenv').config(); // Load environment variables
const { verifyToken } = require('./controllers/UserController');


// // In your routes file
// router.get('/protected-route', verifyToken, (req, res) => {
//     // Access authenticated user data through req.user
//     // Handle protected route logic
// });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database_conn'); // Sequelize database connection
const categoryRoutes = require('./routes/categories').default || require('./routes/categories');
const artistRoutes = require('./routes/artist');
const Auth = require('./routes/otpVerification');
const login = require('./routes/login');
const qrCodeRoutes = require('./controllers/QRCode');
const equipmentRoutes = require('./routes/Equipments');
const notificationRoutes = require('./controllers/notificationController');
const bookingProcess = require('./routes/bookingProcess');
const allbooking = require('./routes/allbooking');

const { QueryTypes } = require('sequelize');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// // Middleware
// app.use(cors()); // Enable Cross-Origin Resource Sharing
// app.use(bodyParser.json()); // Parse JSON request bodies
// app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

// Test Database Connection
async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
}
testDatabaseConnection();

// CORS Configuration
app.use(cors({
    origin: "http://localhost:3000", // Your React app URL
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));


 app.use('/api', categoryRoutes);
 app.use('/api/login', login);
 app.use('/api/search', artistRoutes);
 app.use('/api/auth', Auth);
 app.use('/api/payments', qrCodeRoutes);
 app.use('/api/kits', equipmentRoutes);
 app.use('/api/notifications', notificationRoutes);
app.use('/api/booking', bookingProcess);
app.use('/api/payments', require('./routes/payment'));
app.use('/api/allbookings', allbooking);


// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
