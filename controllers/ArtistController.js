const sequelize = require('../config/database_conn');
const { QueryTypes } = require('sequelize');
const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validateArtistRequest = [
    body('lat').isNumeric().notEmpty(),
    body('lng').isNumeric().notEmpty(),
    body('skill').isString().notEmpty(),
];

// Service regions configuration
const serviceRegions = [
    {
        name: 'Region 1',
        minLat: 30.6618,
        maxLat: 30.7695,
        minLng: 76.7321,
        maxLng: 76.8401,
    },
    {
        name: 'Region 2',
        minLat: 39.69,
        maxLat: 40.80,
        minLng: 81.72,
        maxLng: 84.82,
    },
];

exports.fetchArtistsInServiceRegion = async (req, res) => {
    console.log('⌛ Starting fetchArtistsInServiceRegion request...');
    
    try {
        // Set CORS headers
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation Error:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { lat, lng, skill } = req.body;
       
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        // Find matching service region
        const region = serviceRegions.find(region => 
            latitude >= region.minLat && 
            latitude <= region.maxLat &&
            longitude >= region.minLng && 
            longitude <= region.maxLng
        );

        if (!region) {
            console.log('❌ No service region found for coordinates:', { latitude, longitude });
            return res.status(400).json({ error: 'No Artist found in service region' });
        }

        console.log('📡 Executing database query for region:', region.name);

        // Query to fetch artists with their average ratings
        const query = `
            SELECT 
                a.*,
                ROUND(AVG(r.rating), 1) as average_rating
            FROM 
                artist_information a
            LEFT JOIN 
                reviews r ON a.id = r.artist_id
            WHERE 
                (a.skills LIKE :skill OR a.skill_category LIKE :skill OR a.name LIKE :skill)
                AND a.latitude BETWEEN :minLat AND :maxLat
                AND a.longitude BETWEEN :minLng AND :maxLng
            GROUP BY 
                a.id
        `;

        const artists = await sequelize.query(query, {
            replacements: {
                skill: `%${skill}%`,
                minLat: region.minLat,
                maxLat: region.maxLat,
                minLng: region.minLng,
                maxLng: region.maxLng
            },
            type: QueryTypes.SELECT
        });
        console.log(artists);

        console.log(`✅ Successfully fetched ${artists.length} artists`);
        res.json(artists);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Optional: Helper function to get artist reviews
exports.getArtistReviews = async (req, res) => {
    console.log('⌛ Starting getArtistReviews request...');
    
    try {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        const { artistId } = req.params;
        
        console.log('📡 Executing reviews query for artist:', artistId);
        
        const query = `
            SELECT 
                r.*,
                u.name as reviewer_name
            FROM 
                reviews r
            LEFT JOIN 
                users u ON r.user_id = u.id
            WHERE 
                r.artist_id = :artistId
            ORDER BY 
                r.created_at DESC
        `;

        const reviews = await sequelize.query(query, {
            replacements: { artistId },
            type: QueryTypes.SELECT
        });

        console.log(`✅ Successfully fetched ${reviews.length} reviews`);
        res.json(reviews);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// // Service regions configuration
// const serviceRegions = [
//     {
//         minLat: 30.69,
//         maxLat: 30.80,
//         minLng: 76.72,
//         maxLng: 76.82,
//     }
//     // Add more regions as needed
// ];

exports.getFeaturedArtists = async (req, res) => {
    console.log('⌛ Starting getFeaturedArtists request...');
    
    try {
        // Get coordinates from query parameters
        const latitude = parseFloat(req.query.lat);
        const longitude = parseFloat(req.query.lng);

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                error: 'Invalid coordinates provided'
            });
        }

        // Find matching service region
        const region = serviceRegions.find(region => 
            latitude >= region.minLat && 
            latitude <= region.maxLat &&
            longitude >= region.minLng && 
            longitude <= region.maxLng
        );

        if (!region) {
            return res.status(404).json({
                message: 'No artists found in the specified region.'
            });
        }

        // Query to fetch featured artists with their average ratings
        const query = `
            SELECT 
                a.id,
                a.profile_photo,
                a.name,
                a.skill_category,
                a.price_per_hour,
                ROUND(AVG(r.rating), 1) as average_rating
            FROM 
                artist_information a
            LEFT JOIN 
                reviews r ON a.id = r.artist_id
            WHERE 
                a.featured = 1
                AND a.latitude BETWEEN :minLat AND :maxLat
                AND a.longitude BETWEEN :minLng AND :maxLng
            GROUP BY 
                a.id, a.profile_photo, a.name, a.skill_category, a.price_per_hour
        `;

        const featuredArtists = await sequelize.query(query, {
            replacements: {
                minLat: region.minLat,
                maxLat: region.maxLat,
                minLng: region.minLng,
                maxLng: region.maxLng
            },
            type: QueryTypes.SELECT
        });

        console.log(`✅ Successfully fetched ${featuredArtists.length} featured artists`);

        // Transform null average_ratings to null (in case they come as 0)
        const transformedArtists = featuredArtists.map(artist => ({
            ...artist,
            average_rating: artist.average_rating || null
        }));

        console.log(transformedArtists );
        res.json(transformedArtists);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching featured artist information.',
            message: error.message
        });
    }
};


exports.fetchArtistById = async (req, res) => {
    console.log('⌛ Starting fetchArtistById request...');
    
    try {
        // Set CORS headers
        // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Get artist ID from URL parameter
        const artistId = req.params.artistId;
        console.log(req.params);
        
        if (!artistId) {
            console.log('❌ No artist ID provided');
            return res.status(400).json({ error: 'Artist ID is required' });
        }

        console.log('📡 Executing database query for artist ID:', artistId);

        // Query to fetch artist with average rating
        const query = `
            SELECT 
                a.*,
                ROUND(AVG(r.rating), 1) as average_rating
            FROM 
                artist_information a
            LEFT JOIN 
                reviews r ON a.id = r.artist_id
            WHERE 
                a.id = :artistId
            GROUP BY 
                a.id
        `;

        const artists = await sequelize.query(query, {
            replacements: {
                artistId: artistId
            },
            type: QueryTypes.SELECT
        });

        if (artists.length === 0) {
            console.log('❌ No artist found with ID:', artistId);
            return res.status(404).json({ error: 'Artist not found' });
        }

        const artist = artists[0];
        console.log('✅ Successfully fetched artist details');
        res.json(artist);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};



exports.fetchTeamById = async (req, res) => {
    console.log('⌛ Starting fetchTeamById request...');
    
    try {
        // Set CORS headers
        // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Get artist ID from URL parameter
        const artistId = req.params.artistId;
        console.log(req.params);
        
        if (!artistId) {
            console.log('❌ No Team ID provided');
            return res.status(400).json({ error: 'Team ID is required' });
        }

        console.log('📡 Executing database query for Team ID:', artistId);

        // Query to fetch artist with average rating
        const query = `
            SELECT 
                a.*,
                ROUND(AVG(r.rating), 1) as average_rating
            FROM 
                artist_team_information a
            LEFT JOIN 
                reviews r ON a.id = r.team_id
            WHERE 
                a.id = :artistId
            GROUP BY 
                a.id
        `;

        const artists = await sequelize.query(query, {
            replacements: {
                artistId: artistId
            },
            type: QueryTypes.SELECT
        });

        if (artists.length === 0) {
            console.log('❌ No Team found with ID:', artistId);
            return res.status(404).json({ error: 'Team not found' });
        }

        const artist = artists[0];
        console.log('✅ Successfully fetched team details');
        res.json(artist);

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};