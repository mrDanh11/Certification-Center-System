const express = require('express');
const router = express.Router();
const thisinhController = require('../../modules/NVTN/ThiSinh/thisinhController')

router.post('/', thisinhController.themThiSinh);

module.exports = router;

