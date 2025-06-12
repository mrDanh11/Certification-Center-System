const {pool} = require('../../../config/db');

const HoaDon = {
	LuuHoaDon: async (maDangKy, TongTien, TiemGiam, ThanhTien, TienNhan, NVKeToanLap,HinhThucThanhToan) => {
		const query = `
		INSERT INTO HoaDon(PhieuID, ThoiGianLap, SoTienTong, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap, HinhThucThanhToan)
        VALUES ('${maDangKy}', GETDATE(), ${TongTien}, ${TiemGiam}, ${ThanhTien}, ${TienNhan}, '${NVKeToanLap}', N'${HinhThucThanhToan}');
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
			return result.rowsAffected > 0;
		} catch (err) {
			throw new Error('Error get information in hoadon: ' + err.message);
		}
	}
}

module.exports = HoaDon;