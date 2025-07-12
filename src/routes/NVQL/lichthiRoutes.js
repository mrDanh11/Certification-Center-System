const express = require('express');
const router = express.Router();
const lichthiController = require('../../modules/NVQL/LichThi/lichThiController');

router.post('/GanLichThi', lichthiController.ganLichThi);
router.post('/', lichthiController.taoLichThi);

module.exports = router;
