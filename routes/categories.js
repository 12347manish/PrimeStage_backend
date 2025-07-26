const express = require('express');
const router = express.Router();
const artistController = require('../controllers/categories'); // Ensure this path is correct

router.get('/artists', artistController.getAllArtists);
router.get('/bestTeam', artistController.bestTeam);
router.get('/bestArtist', artistController.bestArtist);
module.exports = router; // ✅ Make sure you are exporting only the router
