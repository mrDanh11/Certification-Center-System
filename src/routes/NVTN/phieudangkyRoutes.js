const express = require('express');
const router = express.Router();
const phieudangkyController = require('../../modules/NVKT/PhieuDangKy/phieudangkyController');

router.get('/', phieudangkyController.LayThongTinDK);
router.post('/', phieudangkyController.TaoPhieuDangKy);
module.exports = router;
