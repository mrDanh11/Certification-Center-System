const express = require('express');
const router = express.Router();
const danhsachdkController = require('../../modules/NVKT/DanhSachDKThi/danhsachdkthiController');
const danhsachdkModel = require('../../modules/NVKT/DanhSachDKThi/danhsachdkthiModel');
const phieudangkyModel = require('../../modules/NVKT/PhieuDangKy/phieudangkyModel');
const ChungChi = require('../../modules/NVTN/ChungChi/chungchiModel');

router.get('/', async (req, res) => {
    try {
        const phieuDangKyList = await phieudangkyModel.LayDanhSachDK();
        let ChungChiList = await ChungChi.LayDSChungChi();
        ChungChiList = ChungChiList.map(item => ({
            TenChungChi: item.TenChungChi,
            LoaiChungChi: item.LoaiChungChi,
            ChungChiID: item.ChungChiID,  
            Gia: item.Gia.toLocaleString('vi-VN'),
        }));
        res.render('NVTNPage/dangkymon', {
            layout: 'NVTN/NVTNmain',
            title: 'Đăng ký môn thi page',
            scripts: '<script src="/js/NVTN/dangkymon.js"></script>',
            phieuDangKyList: phieuDangKyList,
            ChungChi: ChungChiList,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// router.post('/', phieudangkyController.TaoPhieuDangKy);
module.exports = router;
