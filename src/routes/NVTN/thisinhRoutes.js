const express = require('express');
const router = express.Router();
const thisinhController = require('../../modules/NVTN/ThiSinh/thisinhController')

router.post('/', thisinhController.themThiSinh);

// Route tìm thông tin thí sinh theo SBD
router.get('/tim-thi-sinh/:sbd', thisinhController.timThongTinThiSinh);

// Route lấy chứng chỉ ID theo SBD
router.get('/lay-chung-chi/:sbd', thisinhController.layChungChiIDTheoSBD);

// Route tìm kiếm thí sinh theo SBD
router.get('/timkiem', thisinhController.TimKiemThiSinh);
module.exports = router;

