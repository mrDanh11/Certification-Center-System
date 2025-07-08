const express = require('express');
const router = express.Router();
const phieudangkyModel = require('../../modules/NVKT/PhieuDangKy/phieudangkyModel');
const lichThiController = require('../../modules/NVQL/LichThi/lichThiController')

router.get('/', async (req, res) => {
    try {
        const phieuDangKyList = await phieudangkyModel.LayDanhSachDK();
        console.log('check phieuDangKyList: ', phieuDangKyList)

        res.render('NVQLPage/home', {
            layout: 'NVQL/NVQLMain',
            title: 'Nhân viên quản lý Page',
            phieuDangKyList: phieuDangKyList,
            scripts: '<script src="/js/NVQL/taolichthi.js"></script>'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;