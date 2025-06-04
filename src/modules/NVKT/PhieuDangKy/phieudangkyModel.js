const {pool} = require('../../../config/db');

const PhieuDangKy = {
	LayThongTinDK: async (maDangKy) => {
		const query = `
		SELECT *
		FROM PhieuDangKy pdk
		join KhachHang kh on pdk.KhachHangID = kh.KhachHangID
		left join PhieuDonVi pdv on pdv.PhieuID = pdk.PhieuID
		where pdk.PhieuID = '${maDangKy}';
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
}

module.exports = PhieuDangKy;