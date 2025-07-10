const HoaDon = require('./hoadonModel');
const hoadonController = {
    LuuHoaDon: async (req, res) => {
        try {
            console.log('Received data:', req.body);
            const { maDangKy, TongTien, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap,HinhThucThanhToan } = req.body;
            const result = await HoaDon.LuuHoaDon(maDangKy, TongTien, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap,HinhThucThanhToan);
            if (result) {
                res.json({ message: 'Lưu Hóa Đơn thành công' });
            } else {
                res.status(400).json({ error: 'Lưu Hóa Đơn không thành công' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
module.exports = hoadonController;