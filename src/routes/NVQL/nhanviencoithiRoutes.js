const express = require('express');
const router = express.Router();
const NhanVienCoiThiController = require('../../modules/NVQL/NhanVienCoiThi/nhanVienCoiThiController')

// thêm nv coi thi
router.post('/', NhanVienCoiThiController.taoNhanVienCoiThi);
// ktra nv coi thi da co coi thi chua
router.get('/check', NhanVienCoiThiController.checkNVCoiThi)

module.exports = router;
