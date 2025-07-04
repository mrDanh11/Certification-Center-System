const express = require('express');
const router = express.Router();
const danhsachDKThiController = require('../../modules/NVKT/DanhSachDKThi/danhsachdkthiController');
router.post('/', danhsachDKThiController.DangKyBaiThiMoi);
module.exports = router;
