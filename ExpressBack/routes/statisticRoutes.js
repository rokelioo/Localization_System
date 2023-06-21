const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statisticController');

router.get('/:elderId/Emergency', statisticController.emergency);

router.get('/:elderId/TimeSpent', statisticController.timeSpent);

router.get('/:elderId/RoomChange', statisticController.roomChange);

module.exports = router;