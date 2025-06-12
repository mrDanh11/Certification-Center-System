const express = require('express');
const router = express.Router();
const phieuthanhtoanController = require('../../modules/NVKT/PhieuThanhToan/phieuthanhtoanController');

router.put('/duyetphieuthanhtoan', phieuthanhtoanController.DuyetPhieuThanhToan);
router.post('/luuphieuthanhtoan', phieuthanhtoanController.LuuPhieuThanhToan);
router.get('/', phieuthanhtoanController.LayPhieuThanhToan);
module.exports = router;