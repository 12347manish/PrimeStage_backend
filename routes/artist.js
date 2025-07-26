const express = require('express');
const router = express.Router();
const { validateArtistRequest, fetchArtistsInServiceRegion, getArtistReviews } = require('../controllers/ArtistController');
const { getFeaturedArtists } = require('../controllers/ArtistController');
const { fetchArtistById } = require('../controllers/ArtistController');
const { fetchTeamById } = require('../controllers/ArtistController');

router.get('/featured', getFeaturedArtists);
router.post('/fetch-artists', validateArtistRequest, fetchArtistsInServiceRegion);
router.get('/artist-reviews/:artistId', getArtistReviews);
router.get('/artists/:artistId', fetchArtistById);
router.get('/team/:artistId', fetchTeamById);

module.exports = router;