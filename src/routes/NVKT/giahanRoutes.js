const express = require('express');
const router = express.Router();
const phieugiahanController = require('../../modules/NVKT/PhieuGiaHan/phieugiahanController');

// Route cho trang quản lý gia hạn
router.get('/', phieugiahanController.LayDanhSachPhieuGiaHan);

// Route xem chi tiết
router.get('/chitiet/:id', phieugiahanController.LayChiTietGiaHan);

// Route duyệt gia hạn
router.put('/duyet/:id', phieugiahanController.DuyetGiaHan);

// Route từ chối gia hạn
router.put('/tuchoi/:id', phieugiahanController.TuChoiGiaHan);

// Route cho trang thanh toán gia hạn
router.get('/thanhtoan/:id', phieugiahanController.LayThongTinThanhToan);

// Route xử lý thanh toán gia hạn
router.post('/thanhtoan/:id', phieugiahanController.XuLyThanhToan);

// Route xử lý tìm kiếm
router.get('/search', (req, res) => {
    const searchValue = req.query.search;
    res.redirect(`/NVKT/quanligiahan?search=${searchValue}`);
});

module.exports = router;