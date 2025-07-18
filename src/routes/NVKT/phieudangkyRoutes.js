const express = require('express');
const router = express.Router();
const phieudangkyController = require('../../modules/NVKT/PhieuDangKy/phieudangkyController');

router.get('/', phieudangkyController.LayThongTinDK);
router.get('/chuathanhtoan', phieudangkyController.LayDSChuaThanhToan);
router.put('/xacnhanthanhtoan', phieudangkyController.XacNhanThanhToan);
router.put('/huyphieudangky', phieudangkyController.HuyPhieuDangKy);
module.exports = router;