const express = require('express');
const router = express.Router();
const NhanVienController =  require('../../modules/NVQL/NhanVien/nhanVienController')

router.get('/', NhanVienController.layDSNhanVien);


module.exports = router;
