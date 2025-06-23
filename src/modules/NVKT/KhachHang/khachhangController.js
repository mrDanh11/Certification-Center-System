const KhachHang = require('./khachhangModel');
const khachhangController = {
    LayThongTinKH: async (req, res) => {
        try {
            const {maDangKy} = req.query;
            const infoKH = await KhachHang.LayThongTinKH(maDangKy);
            res.json(infoKH[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    LayKHChuaThanhToan: async (req, res) => {
        try {
            const {maDangKy, ngayLap} = req.query;
            const infoKH = await KhachHang.LayKHChuaThanhToan(maDangKy, ngayLap);
            res.json(infoKH);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
module.exports = khachhangController;