const express = require('express');
const router  = express.Router();
const ctrl    = require('../../modules/NVTN/KetQuaChungChi/ketquachungchiController');

// Trang chính
router.get('/',          ctrl.renderPage);

// API JSON tìm khách + chứng chỉ
router.get('/api',       ctrl.getData);

// Trang xác nhận chọn xong
router.get('/confirm',   ctrl.renderConfirm);

// Xử lý lưu sau xác nhận
router.post('/confirm/save', ctrl.saveConfirm);

module.exports = router;

