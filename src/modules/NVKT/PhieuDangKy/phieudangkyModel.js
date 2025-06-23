const {pool} = require('../../../config/db');

const PhieuDangKy = {
	LayThongTinDK: async (maDangKy) => {
		const query = `
		select * from PhieuDangKy pdk
		left join PhieuDonVi pdv on pdv.PhieuID=pdk.PhieuID
		where pdk.PhieuID = '${maDangKy}' AND (pdk.TinhTrangHuy is null or pdk.TinhTrangHuy = 0)
		ORDER BY pdk.ThoiGianLap DESC;
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error get information in phieudangky: ' + err.message);
		}
	},

	XacNhanThanhToan: async (maDangKy, TinhTrangThanhToan) => {
		const query = `
		UPDATE PhieuDangKy
		SET TinhTrangThanhToan = ${TinhTrangThanhToan}
		WHERE PhieuID = ${maDangKy};
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
			return result.rowsAffected > 0;
		} catch (err) {
			throw new Error('Error get information in phieudangky: ' + err.message);
		}
	},

	HuyPhieuDangKy: async (maDangKy,TinhTrangHuy) => {
		const query = `
		UPDATE PhieuDangKy
		SET TinhTrangHuy = ${TinhTrangHuy}
		WHERE PhieuID = ${maDangKy};
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
			return result.rowsAffected > 0;
		} catch (err) {
			throw new Error('Error get information in huy phieu dang ky model: ' + err.message);
		}
	},

	LayDSChuaThanhToan: async (maDangKy,ngayLap) => {
		if (!maDangKy) {
			maDangKy = '';
		}
		if (!ngayLap) {
			ngayLap = '';
		}
		const query = `
		select * from PhieuDangKy pdk
		left join PhieuDonVi pdv on pdv.PhieuID=pdk.PhieuID
		where (pdk.PhieuID = '${maDangKy}' OR '' = '${maDangKy}')
		AND (pdk.ThoiGianLap = '${ngayLap}' OR '' = '${ngayLap}')
		AND (pdk.TinhTrangThanhToan is null or pdk.TinhTrangThanhToan = 0)
		AND (pdk.TinhTrangHuy is null or pdk.TinhTrangHuy = 0);
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error get information in phieudangky: ' + err.message);
		}
	}
}

module.exports = PhieuDangKy;