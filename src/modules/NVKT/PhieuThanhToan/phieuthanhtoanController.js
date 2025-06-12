const PhieuThanhToan = require('./phieuthanhtoanModel');
const phieuthanhtoanController = {
    LayPhieuThanhToan: async (req, res) => {
        try {
            const { maDangKy } = req.query;
            const infoPTT = await PhieuThanhToan.LayPhieuThanhToan(maDangKy);

            if (!infoPTT || infoPTT.length === 0) {
                return res.status(404).json({ error: "Không tìm thấy phiếu thanh toán" });
            }

            res.json(infoPTT[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    LuuPhieuThanhToan: async (req, res) => {
        try {
            const { maDangKy, TongTien, TiemGiam, ThanhTien, NVKeToanLap } = req.body;
            const result = await PhieuThanhToan.LuuPhieuThanhToan(maDangKy, TongTien, TiemGiam, ThanhTien,  NVKeToanLap);
            if (result) {
                res.json({ message: 'Lưu Phiếu Thanh Toán thành công' });
            } else {
                res.status(400).json({ error: 'Lưu Phiếu Thanh Toán không thành công' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    DuyetPhieuThanhToan: async (req, res) => {
        try {
            const { maDangKy } = req.query;
            const { maThanhToan, TinhTrangDuyet } = req.body;
            const result = await PhieuThanhToan.DuyetPhieuThanhToan(maDangKy, maThanhToan, TinhTrangDuyet);
            if (result) {
                res.json({ message: 'Duyệt phiếu thanh toán thành công' });
            } else {
                res.status(400).json({ error: 'Duyệt phiếu thanh toán không thành công' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}
module.exports = phieuthanhtoanController;