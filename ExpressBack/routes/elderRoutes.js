const express = require('express');
const router = express.Router();
const elderController = require('../controllers/elderController')

router.post('/delete', elderController.deleteElder);

router.post('/:userId/add', elderController.addElder);

router.post('/:userId/configure', elderController.configureElder);

router.get('/:userId/list', elderController.list);

module.exports = router;