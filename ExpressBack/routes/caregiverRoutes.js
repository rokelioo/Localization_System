const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
router.get('/:userId/settings', caregiverController.caregiverSettings);

router.post('/:userId/settings-change', caregiverController.caregiverChange);

module.exports = router;