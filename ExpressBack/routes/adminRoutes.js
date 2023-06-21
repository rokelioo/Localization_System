const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/userlist', adminController.userList);

router.get('/person/config/:id', adminController.configureUser);

router.post('/blockuser', adminController.blockUser);

router.post('/person/config/submit/:id',adminController.sumbitChanges);

router.post('/planConfig/:userId/:houseId', adminController.configureUsersPlan);

module.exports = router;