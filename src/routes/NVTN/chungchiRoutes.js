const express = require('express');
const router = express.Router();
const chungchiController = require('../../modules/NVTN/ChungChi/chungchiController');

router.get('/', chungchiController.LayDSChungChi);
// router.get('/:MaKH', khachhangController.TimKH);

module.exports = router;
