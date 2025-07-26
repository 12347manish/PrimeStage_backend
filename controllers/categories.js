const sequelize = require('../config/database_conn');
const { QueryTypes } = require('sequelize');

exports.getAllArtists = async (req, res) => {
    console.log('⌛ Starting getAllArtists request...');
    try {
        // Set CORS headers specifically for this route if needed
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        console.log('📡 Executing database query...');
        const query = "SELECT * FROM items WHERE section_id=1";
        const artists = await sequelize.query(query, { type: QueryTypes.SELECT });
        
        res.json(artists);
    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.bestTeam= async (req,res) =>{
    console.log('⌛ Starting getAllArtists request...');
    try {
        // Set CORS headers specifically for this route if needed
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        console.log('📡 Executing database query...');
        const query = "SELECT * FROM items WHERE section_id=3";
        const artists = await sequelize.query(query, { type: QueryTypes.SELECT });
        
        res.json(artists);
    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.bestArtist= async (req,res) =>{
    console.log('⌛ Starting getAllArtists request...');
    try {
        // Set CORS headers specifically for this route if needed
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        console.log('📡 Executing database query...');
        const query = "SELECT * FROM items WHERE section_id=4";
        const artists = await sequelize.query(query, { type: QueryTypes.SELECT });
        
        res.json(artists);
    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: error.message });
    }
};