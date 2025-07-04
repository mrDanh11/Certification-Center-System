const KhachHang = require('./khachhangModel');
const khachhangController = {
    TimKH: async (req, res) => { 
      try {
        const {MaKH} = req.params;
        const infoKH = await KhachHang.TimKH(parseInt(MaKH)); 
        return res.status(200).json(infoKH)
      }
      catch (err){
        return res.status(500).json({ error: err.message });
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
    },
  ThemKH: async(req, res) => {
    try {
      const { tenKhachHang, gioiTinh, cccd, sdt, email, loaiKhachHang } = req.body;

      if (!tenKhachHang || !gioiTinh || !cccd || !sdt || !email || !loaiKhachHang) {
        return res.status(400).json({ error: "Thiếu thông tin khách hàng." });
      }

      const existing = await KhachHang.TimKHCCCD(cccd);
      if (existing) {
        return res.status(409).json({ error: "⚠️ CCCD đã tồn tại trong hệ thống." });
      }

      const newID = await KhachHang.ThemKH({
        tenKhachHang,
        gioiTinh,
        cccd,
        sdt,
        email,
        loaiKhachHang
      });

      res.status(201).json({ message: "Thêm khách hàng thành công.", khachHangID: newID });

    } catch (err) {
      console.error("❌ Lỗi khi thêm khách hàng:", err);
      res.status(500).json({ error: "Lỗi máy chủ." });
    }
  },
}
module.exports = khachhangController;
