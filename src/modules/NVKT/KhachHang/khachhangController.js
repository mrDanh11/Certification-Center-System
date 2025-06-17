const KhachHang = require('./khachhangModel');
const khachhangController = {
    TimKH: async (req, res) => { 
      try {
        const {MaKH} = req.params;
        const infoKH = await KhachHang.TimKH(parseInt(MaKH)); 
        res.status(200).json(infoKH)
      }
      catch (err){
        res.status(500).json({ error: err.message });
      }
    },
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
