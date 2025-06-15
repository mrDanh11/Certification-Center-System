const express = require('express');
const router = express.Router();
const dsdktControllerController = require('../../modules/NVKT/DanhSachDKThi/danhsachdkthiController');

router.get('/', dsdktControllerController.LayDanhSachBaiThi);
module.exports = router;