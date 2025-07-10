const express = require('express');
const router = express.Router();
const lichthiController = require('../../modules/NVTN/LichThi/lichthiController');

// Route cho trang lịch thi
router.get('/', lichthiController.LayTatCaLichThi);

router.get('/AllLicThi', lichthiController.LayAllLichThi);

// Route cho lịch thi theo loại chứng chỉ
router.get('/loai/:chungChiId', lichthiController.APILayLichThiTheoLoai);

// Route cho chi tiết lịch thi
router.get('/chitiet/:lichThiId', lichthiController.APILayChiTietLichThi);

module.exports = router;

