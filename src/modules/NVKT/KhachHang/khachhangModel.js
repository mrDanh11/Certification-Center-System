const {pool} = require('../../../config/db');

const KhachHang = {
	LayThongTinKH: async (maDangKy) => {
		const query = `
		select * from KhachHang kh
		join PhieuDangKy pdk on pdk.KhachHangID=kh.KhachHangID
		where pdk.PhieuID = '${maDangKy}'
		ORDER BY pdk.ThoiGianLap DESC;
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error get information in khachhang: ' + err.message);
		}
	},

	LayKHChuaThanhToan: async (maDangKy, ngayLap) => {
		if (!maDangKy) {
			maDangKy = '';
		}
		if (!ngayLap) {
			ngayLap = '';
		}
		const query = `
		select * from KhachHang kh
		join PhieuDangKy pdk on pdk.KhachHangID=kh.KhachHangID
		where (pdk.PhieuID = '${maDangKy}' OR '' = '${maDangKy}')
		AND (pdk.ThoiGianLap = '${ngayLap}' OR '' = '${ngayLap}')
		AND (pdk.TinhTrangThanhToan is null or pdk.TinhTrangThanhToan = 0);
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error get information in khachhang: ' + err.message);
		}
	},
}

module.exports = KhachHang;