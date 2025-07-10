const express = require('express');
const router = express.Router();
const phieugiahanController = require('../../modules/NVTN/PhieuGiaHan/phieugiahanController');

// Route cho trang quản lý gia hạn
router.get('/', phieugiahanController.LayDanhSachPhieuGiaHan);

// Route tạo phiếu gia hạn - GET (hiển thị form)

router.get('/api/ALLGiaHan', phieugiahanController.LayAllGiaHan);

// Route xem chi tiết
router.get('/chitiet/:id', phieugiahanController.chiTietPhieuGiaHan);
router.get('/chitiet-tao', phieugiahanController.taoPhieuGiaHan);

// Route tạo yêu cầu gia hạn
router.post('/tao', phieugiahanController.TaoPhieuGiaHan);

// Route xử lý chọn lịch thi
router.post('/chonlichthi/:giaHanId', phieugiahanController.ChonLichThi);

router.put('/capnhat/:giaHanId', phieugiahanController.CapNhatLichThi);

// Route xử lý chọn lịch thi khi không có giaHanId (cho trường hợp tạo mới)
router.post('/chonlichthi', (req, res) => {
    res.json({ 
        success: true,
        message: 'Đã ghi nhận lựa chọn lịch thi. Vui lòng hoàn tất tạo phiếu gia hạn.',
        data: req.body
    });
});

// Route xử lý tìm kiếm
router.get('/search', (req, res) => {
    const searchValue = req.query.search;
    res.redirect(`/NVTN/quanligiahan?search=${searchValue}`);
});

module.exports = router;
