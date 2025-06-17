const express = require('express');
const router = express.Router();
const khachhangController = require('../../modules/NVKT/KhachHang/khachhangController');

router.get('/', khachhangController.LayThongTinKH);
router.get('/:MaKH', khachhangController.TimKH);

module.exports = router;
