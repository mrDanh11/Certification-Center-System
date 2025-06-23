const express = require('express');
const router = express.Router();
const khachhangController = require('../../modules/NVKT/KhachHang/khachhangController');

router.get('/', khachhangController.LayThongTinKH);
router.get('/chuathanhtoan', khachhangController.LayKHChuaThanhToan);
module.exports = router;