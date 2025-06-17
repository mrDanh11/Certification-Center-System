const {pool, sql_Str, sql_Int} = require('../../../config/db');

const KhachHang = {
  TimKH: async(MaKH) => {
    try{
      const stmt = `
      select * from KhachHang
      where KhachHangID = @MaKH;
      `;

      await pool.connect();
      const result = await pool.request()
        .input('MaKH', sql_Int, MaKH)
        .query(stmt);
      // await pool.close();

      if (result.recordset.length <= 0){
        throw new Error('no customer found')
      }
      return result.recordset;
    }
    catch (err){
			throw new Error('Error get information in khachhang: ' + err.message);
    }
  },
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
    console.log(query);
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
