const {pool} = require('../../../config/db');

const PhieuDangKy = {
	LayThongTinDK: async (maDangKy) => {
		const query = `
		select * from PhieuDangKy pdk
		left join PhieuDonVi pdv on pdv.PhieuID=pdk.PhieuID
		where pdk.PhieuID = '${maDangKy}' AND (pdv.TinhTrangHuy is null or pdv.TinhTrangHuy = 0);
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
		UPDATE PhieuDonVi
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
	}
}

module.exports = PhieuDangKy;