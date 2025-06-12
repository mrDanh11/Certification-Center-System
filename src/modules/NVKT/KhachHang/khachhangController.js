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
}
module.exports = khachhangController;