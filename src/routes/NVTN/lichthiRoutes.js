const express = require('express');
const router = express.Router();
const lichthiController = require('../../modules/NVKT/LichThi/lichthiController');
router.get('/', lichthiController.LayDSLichThi);
module.exports = router;
