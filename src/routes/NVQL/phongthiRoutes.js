const express = require('express');
const router = express.Router();
const phongThiController = require('../../modules/NVQL/PhongThi/phongThiController')

// API: GET http://localhost:3000/NVQL/api/phongthi
router.get('/', phongThiController.layDSPhongThi);
// check phong thi đã có lịch thi chưa || API: GET http://localhost:3000/NVQL/api/phongthi/check
router.get('/check', phongThiController.checkPhongThi)

module.exports = router;
