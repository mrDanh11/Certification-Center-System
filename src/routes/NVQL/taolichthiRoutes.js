const express = require('express');
const router = express.Router();
const phieudangkyModel = require('../../modules/NVKT/PhieuDangKy/phieudangkyModel');
const phieudonviModel = require('../../modules/NVQL/PhieuDonVi/phieuDonViModel');
const lichThiController = require('../../modules/NVQL/LichThi/lichThiController')
const nhanvienModel = require('../../modules/NVQL/NhanVien/nhanVienModel')
const PhongThiModel = require('../../modules/NVQL/PhongThi/phongThiModel')

router.get('/', async (req, res) => {
    try {
        const phieuDangKyList = await phieudangkyModel.LayDanhSachDK();
        const DSachPhieuDonVi = await phieudonviModel.layDanhSachPhieuDonVi()
        const DSNhanVien = await nhanvienModel.layDSNhanVien()
        const DSPhongThi = await PhongThiModel.layDSPhongThi()
        // console.log('check: DSachPhieuDonVi: ', DSachPhieuDonVi)
        const optionsBatDau = ['08:00','10:30','13:30','15:30'].map(t => ({ value: t, label: t }));
        const optionsKetThuc = [...optionsBatDau];
        const optionsDiaDiem = [
            { value: 'Hà Nội',      label: 'Hà Nội' },
            { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
            { value: 'Đà Nẵng',     label: 'Đà Nẵng' },
            { value: 'Hải Phòng',   label: 'Hải Phòng' }
          ];

        res.render('NVQLPage/taolichthi', {
            layout: 'NVQL/NVQLMain',
            title: 'Tạo lịch thi Page',
            // phieuDangKyList: phieuDangKyList,
            DSachPhieuDonVi: DSachPhieuDonVi,
            DSNhanVien: DSNhanVien,
            DSPhongThi: DSPhongThi,
            optionsBatDau,
            optionsKetThuc,
            optionsDiaDiem,
            scripts: '<script src="/js/NVQL/taolichthi.js"></script>'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;