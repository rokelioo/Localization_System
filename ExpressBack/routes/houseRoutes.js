const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');

router.get('/:userId/list', houseController.list);

router.post('/:userId/add', houseController.addHouse);

router.get('/show', houseController.showHouse);

module.exports = router;