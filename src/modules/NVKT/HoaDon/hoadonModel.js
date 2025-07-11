const {pool} = require('../../../config/db');

const HoaDon = {
	LuuHoaDon: async (maDangKy, TongTien, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap, HinhThucThanhToan) => {
        const query = `
            INSERT INTO HoaDon(PhieuID, ThoiGianLap, SoTienTong, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap, HinhThucThanhToan)
            VALUES (@PhieuID, GETDATE(), @SoTienTong, @SoTienGiam, @ThanhTien, @TienNhan, @NVKeToanLap, @HinhThucThanhToan)
        `;
        try {
            console.log('HoaDon model received:', { maDangKy, TongTien, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap, HinhThucThanhToan });
            await pool.connect();
            const result = await pool.request()
                .input('PhieuID', maDangKy)
                .input('SoTienTong', TongTien)
                .input('SoTienGiam', SoTienGiam)
                .input('ThanhTien', ThanhTien)
                .input('TienNhan', TienNhan)
                .input('NVKeToanLap', NVKeToanLap)
                .input('HinhThucThanhToan', HinhThucThanhToan)
                .query(query);
            console.log('HoaDon insert success:', result.rowsAffected);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('HoaDon model error:', err); // Thêm log lỗi chi tiết
            throw new Error('Error saving HoaDon: ' + err.message);
        }
    }
}

module.exports = HoaDon;