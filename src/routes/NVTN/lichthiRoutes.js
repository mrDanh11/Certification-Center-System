const express = require('express');
const router = express.Router();
const lichthiController = require('../../modules/NVKT/LichThi/lichthiController');
router.get('/', lichthiController.LayDSLichThi);
// Route cho trang lịch thi
router.get('/', lichthiController.LayTatCaLichThi);

// Route cho lịch thi theo loại chứng chỉ
router.get('/loai/:chungChiId', lichthiController.APILayLichThiTheoLoai);

// Route cho chi tiết lịch thi
router.get('/chitiet/:lichThiId', lichthiController.APILayChiTietLichThi);
module.exports = router;

