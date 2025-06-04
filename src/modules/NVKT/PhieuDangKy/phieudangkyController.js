const PhieuDangKy = require('./phieudangkyModel');
const phieudangkyController = {
    LayThongTinDK: async (req, res) => {
        try {
            const {maDangKy} = req.query;
            const infoDK = await PhieuDangKy.LayThongTinDK(maDangKy);
            res.json(infoDK[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}
module.exports = phieudangkyController;