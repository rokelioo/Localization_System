const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');

router.get('/:userId/house-list', plannerController.list);

router.post('/:userId/houseplan', plannerController.housePlan);
  
module.exports = router;