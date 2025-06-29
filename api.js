const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Endpoint for image upload and healing
router.post('/heal', imageController.healImage);

module.exports = router;