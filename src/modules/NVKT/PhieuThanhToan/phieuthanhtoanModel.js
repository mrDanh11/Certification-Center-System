const {pool} = require('../../../config/db');

const PhieuThanhToan = {
	LayPhieuThanhToan: async (maDangKy) => {
		const query = `
		select * from PhieuThanhToan ptt
		where ptt.PhieuDonViID = '${maDangKy}';
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset;
			return test 
		} catch (err) {
			throw new Error('Error get information in phieuthanhtoan: ' + err.message);
		}
	},

	LuuPhieuThanhToan: async (maDangKy, TongTien, TiemGiam, ThanhTien, NVKeToanLap) => {
		const query = `
		INSERT INTO PhieuThanhToan(SoTienTong, SoTienGiam, ThanhTien, NgayLap, TinhTrangDuyet, PhieuDonViID, NVKeToanLap)
        VALUES (${TongTien}, ${TiemGiam}, ${ThanhTien}, GETDATE(), '0', '${maDangKy}', '${NVKeToanLap}');
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
			return result.rowsAffected > 0;
		} catch (err) {
			throw new Error('Error get information in phieuthanhtoan: ' + err.message);
		}
	},

	DuyetPhieuThanhToan: async (maDangKy, maThanhToan, TinhTrangDuyet) => {
		const query = `
		UPDATE PhieuThanhToan
		SET TinhTrangDuyet = '${TinhTrangDuyet}', MaThanhToan = '${maThanhToan}'
		WHERE PhieuDonViID = '${maDangKy}';
		`;
		try {
			const result = await pool.request().query(query);
			return result.rowsAffected > 0;
		} catch (err) {
			throw new Error('Error updating payment status: ' + err.message);
		}
	}
}

module.exports = PhieuThanhToan;