const express = require('express');
const router = express.Router();
const phieudonviController = require('../../modules/NVQL/PhieuDonVi/phieuDonViController');

router.get('/', phieudonviController.layDanhSachPhieuDonVi);
router.get('/chitiet/:id', phieudonviController.layChiTietPhieuDonVi); // chưa cần sử dụng


module.exports = router;
