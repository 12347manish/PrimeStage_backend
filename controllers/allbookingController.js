const sequelize = require('../config/database_conn');
const { QueryTypes } = require('sequelize');

exports.getAllBookings = async (req, res) => {
    console.log('⌛ Fetching all bookings...');
    console.log('📦 Request body:', req.body);
    
    try {
        // Get user ID from the request body
        const userId = req.body.userId;
        
        if (!userId) {
            return res.status(400).json({
                error: 'User ID is required'
            });
        }
        
        // First, let's debug by checking the booking records and their artist_id values
        const debugQuery = `
            SELECT id, artist_id FROM bookings WHERE user_id = ?
        `;
        
        const debugResults = await sequelize.query(debugQuery, {
            replacements: [userId],
            type: QueryTypes.SELECT
        });
        
        console.log('Debug - Bookings with artist_id values:', debugResults);
        
        // SQL query to get all bookings with artist information - fixed JOIN
        const bookingsQuery = `
            SELECT 
                b.id,
                b.booking_date,
                b.booked_from,
                b.booked_to,
                b.location,
                b.duration,
                b.special_request,
                b.latitude,
                b.longitude,
                b.status,
                b.category,
                b.audience_size,
                b.total_amount,
                b.created_at,
                b.updated_at,
                b.artist_id,
                a.id AS artist_id,
                a.name AS artist_name,
                a.profile_photo AS artist_image,
                a.skill_category AS artist_skill,
                u.first_name AS customer_name
            FROM 
                bookings b
            LEFT JOIN 
                artist_information a ON b.artist_id = a.id
            LEFT JOIN 
                user_information u ON b.user_id = u.id
            WHERE 
                b.user_id = ?
            ORDER BY 
                b.booking_date DESC
        `;
        
        const bookings = await sequelize.query(bookingsQuery, {
            replacements: [userId],
            type: QueryTypes.SELECT
        });
        
        console.log(`📊 Found ${bookings.length} bookings for user ${userId}`);
        
        // Add debug logging to check artist_ids
        const artistIds = bookings.map(b => b.artist_id);
        console.log('Artist IDs in results:', artistIds);
        
        // Process the booking data
        const processedBookings = bookings.map(booking => {
            // Convert status code to a readable format
            let statusText;
            switch(booking.status) {
                case 1:
                    statusText = "initiated";
                    break;
                case 2:
                    statusText = "responded";
                    break;
                case 3:
                    statusText = "completed";
                    break;
                default:
                    statusText = "initiated";
            }
            
            // Format the time
            const bookedFrom = new Date('1970-01-01T' + booking.booked_from);
            const bookedTo = new Date('1970-01-01T' + booking.booked_to);
            
            // Calculate payment status (placeholder logic - implement actual logic based on your requirements)
            let paymentStatus = "unpaid";
            if (booking.total_amount) {
                paymentStatus = "paid"; // Simplification - implement actual payment status logic
            }
            
            // Format duration to be more readable
            let duration = booking.duration;
            if (duration && typeof duration === 'string' && !duration.includes('hours') && !duration.includes('minutes')) {
                // Try to parse as minutes if it's just a number
                const mins = parseInt(duration);
                if (!isNaN(mins)) {
                    const hours = Math.floor(mins / 60);
                    const remainingMins = mins % 60;
                    duration = `${hours} hours ${remainingMins} minutes`;
                }
            }
            
            return {
                id: booking.id,
                customerName: booking.customer_name,
                artistName: booking.artist_name,
                artistId: booking.artist_id,
                artistImage: booking.artist_image || "/7266cfb4de074ef895d07206c66e16b3.jpg",
                artistSkill: booking.artist_skill,
                date: booking.booking_date,
                time: booking.booked_from,
                duration: duration,
                eventType: booking.category,
                address: booking.location,
                latitude: booking.latitude,
                longitude: booking.longitude,
                specialRequest: booking.special_request,
                audienceSize: booking.audience_size,
                amount: parseFloat(booking.total_amount || 0),
                paymentStatus: paymentStatus,
                status: statusText,
                createdAt: booking.created_at,
                updatedAt: booking.updated_at
            };
        });
        
        return res.status(200).json({
            message: 'Bookings fetched successfully',
            bookings: processedBookings
        });
        
    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        return res.status(500).json({
            error: 'An error occurred while fetching bookings',
            details: error.message
        });
    }
};
// Get a single booking by ID
exports.getBookingById = async (req, res) => {
    console.log('⌛ Fetching booking by ID...');
    console.log('📦 Request body:', req.body);
    
    try {
        const bookingId = req.body.bookingId;
        const userId = req.body.userId;
        
        if (!bookingId || !userId) {
            return res.status(400).json({
                error: 'Booking ID and User ID are required'
            });
        }
        
        // SQL query to get a specific booking with artist information
        const bookingQuery = `
            SELECT 
                b.id,
                b.booking_date,
                b.booked_from,
                b.booked_to,
                b.location,
                b.duration,
                b.special_request,
                b.latitude,
                b.longitude,
                b.status,
                b.category,
                b.audience_size,
                b.total_amount,
                b.created_at,
                b.updated_at,
                a.id AS artist_id,
                a.name AS artist_name,
                a.profile_image AS artist_image,
                a.skill AS artist_skill,
                u.name AS customer_name
            FROM 
                booking b
            LEFT JOIN 
                artist_information a ON b.artist_id = a.id
            LEFT JOIN 
                user_information u ON b.user_id = u.id
            WHERE 
                b.id = ? AND b.user_id = ?
        `;
        
        const bookings = await sequelize.query(bookingQuery, {
            replacements: [bookingId, userId],
            type: QueryTypes.SELECT
        });
        
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                error: 'Booking not found'
            });
        }
        
        const booking = bookings[0];
        
        // Convert status code to a readable format
        let statusText;
        switch(booking.status) {
            case 1:
                statusText = "initiated";
                break;
            case 2:
                statusText = "responded";
                break;
            case 3:
                statusText = "completed";
                break;
            default:
                statusText = "initiated";
        }
        
        // Calculate payment status (placeholder logic)
        let paymentStatus = "unpaid";
        if (booking.total_amount) {
            paymentStatus = "paid"; // Simplification
        }
        
        const processedBooking = {
            id: booking.id,
            customerName: booking.customer_name,
            artistName: booking.artist_name,
            artistId: booking.artist_id,
            artistImage: booking.artist_image || "/default-artist-image.jpg",
            artistSkill: booking.artist_skill,
            date: booking.booking_date,
            time: booking.booked_from,
            duration: booking.duration,
            eventType: booking.category,
            address: booking.location,
            latitude: booking.latitude,
            longitude: booking.longitude,
            specialRequest: booking.special_request,
            audienceSize: booking.audience_size,
            amount: parseFloat(booking.total_amount || 0),
            paymentStatus: paymentStatus,
            status: statusText,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at
        };
        
        return res.status(200).json({
            message: 'Booking fetched successfully',
            booking: processedBooking
        });
        
    } catch (error) {
        console.error('❌ Error fetching booking:', error);
        return res.status(500).json({
            error: 'An error occurred while fetching the booking'
        });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    console.log('⌛ Deleting booking...');
    console.log('📦 Request body:', req.body);
    
    try {
        const bookingId = req.body.bookingId;
        const userId = req.body.userId;
        
        if (!bookingId || !userId) {
            return res.status(400).json({
                error: 'Booking ID and User ID are required'
            });
        }
        
        // First check if the booking exists and belongs to the user
        const checkQuery = `
            SELECT id FROM booking 
            WHERE id = ? AND user_id = ?
        `;
        
        const bookings = await sequelize.query(checkQuery, {
            replacements: [bookingId, userId],
            type: QueryTypes.SELECT
        });
        
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                error: 'Booking not found or you do not have permission to delete it'
            });
        }
        
        // Delete the booking
        const deleteQuery = `
            DELETE FROM booking
            WHERE id = ? AND user_id = ?
        `;
        
        await sequelize.query(deleteQuery, {
            replacements: [bookingId, userId],
            type: QueryTypes.DELETE
        });
        
        console.log(`🗑️ Deleted booking ${bookingId} for user ${userId}`);
        
        return res.status(200).json({
            message: 'Booking deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting booking:', error);
        return res.status(500).json({
            error: 'An error occurred while deleting the booking'
        });
    }
};