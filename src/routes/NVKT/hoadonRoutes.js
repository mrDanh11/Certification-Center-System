const express = require('express');
const router = express.Router();
const hoadonController = require('../../modules/NVKT/HoaDon/hoadonController');

router.post('/', hoadonController.LuuHoaDon);
module.exports = router;