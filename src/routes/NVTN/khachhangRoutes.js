const express = require('express');
const router = express.Router();
const khachhangController = require('../../modules/NVKT/KhachHang/khachhangController');


router.get('/', khachhangController.LayThongTinKH);

router.get('/AllDSKhachHang', khachhangController.LayDSKhachHang);

router.get('/:MaKH', khachhangController.TimKH);

router.post('/', khachhangController.ThemKH);

module.exports = router;
