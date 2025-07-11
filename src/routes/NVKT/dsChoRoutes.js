const express = require('express');
const router = express.Router();
const dsChoController = require('../../modules/NVKT/DanhSachCho/dsChoController');

router.post('/', dsChoController.LuuDanhSachCho);

module.exports = router;