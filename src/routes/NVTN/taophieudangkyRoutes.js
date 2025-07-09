const express = require('express');
const router = express.Router();
const KhachHangModel = require('../../modules/NVKT/KhachHang/khachhangModel');

router.get('/', async (req, res) => {
    try {
        const KhachHangList = await KhachHangModel.LayDSKhachHang();
        res.render('NVTNPage/taophieudangky', {
            layout: 'NVTN/NVTNmain',
            title: 'Tiếp nhận khách hàng Page',
            scripts: '<script src="/js/NVTN/taophieudangky.js"></script>',
            KhachHangList : KhachHangList,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

