const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');

router.get('/elder/:elderId/location', monitorController.location);

module.exports = router;