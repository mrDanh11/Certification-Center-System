const express = require('express');
const router = express.Router();
const NhanVienCoiThiController =  require('../../modules/NVQL/NhanVienCoiThi/nhanVienCoiThiController')

// thêm nv coi thi
router.post('/', NhanVienCoiThiController.taoNhanVienCoiThi);

module.exports = router;
