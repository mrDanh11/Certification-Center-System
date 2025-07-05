const express = require('express');
const router = express.Router();
const phongThiController =  require('../../modules/NVQL/PhongThi/phongThiController')

// API: GET http://localhost:3000/NVQL/api/phongthi
router.get('/', phongThiController.layDSPhongThi);

module.exports = router;
