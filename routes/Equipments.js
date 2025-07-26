// routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/EquipmentsController');

router.get('/equipments-kits', equipmentController.getEquipmentsAndKits);

module.exports = router;