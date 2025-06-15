const dsdkt = require('./danhsachdkthiModel');
const dsdktController = {
    LayDanhSachBaiThi: async (req, res) => {
        try {
            const {maDangKy} = req.query;
            const infodsdkt = await dsdkt.LayDanhSachBaiThi(maDangKy);
            res.json(infodsdkt);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}
module.exports = dsdktController;