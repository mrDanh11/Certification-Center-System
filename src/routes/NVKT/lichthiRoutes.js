const express = require('express');
const router = express.Router();
const lichthiController = require('../../modules/NVKT/LichThi/lichthiController');

router.get('/LayTTLichThi', lichthiController.LayTTLichThi);
module.exports = router;