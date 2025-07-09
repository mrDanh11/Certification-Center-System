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

  TimKHCCCD: async (cccd) => {
    const conn = await pool.connect();
    const result = await conn.request()
      .input("CCCD", cccd)
      .query("SELECT KhachHangID FROM KhachHang WHERE CCCD = @CCCD");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  },

  ThemKH: async (data) => {
    const { tenKhachHang, gioiTinh, cccd, sdt, email, loaiKhachHang } = data;

    const conn = await pool.connect();
    const result = await conn.request()
      .input("HoTen", tenKhachHang)
      .input("Phai", gioiTinh)
      .input("CCCD", cccd)
      .input("Dienthoai", sdt)
      .input("Email", email)
      .input("LoaiKH", loaiKhachHang)
      .query(`
        INSERT INTO KhachHang (HoTen, Phai, CCCD, Dienthoai, Email, LoaiKH)
        OUTPUT INSERTED.KhachHangID
        VALUES (@HoTen, @Phai, @CCCD, @DienThoai, @Email, @LoaiKH)
      `);

    return result.recordset[0].KhachHangID;
  },

  LayDSKhachHang: async () => {
    try {
      const stmt = `
      select * from KhachHang
      `;

      await pool.connect();
      const result = await pool.request()
        .query(stmt);

      if (result.recordset.length <= 0){
        throw new Error('no customer found')
      }
      await pool.close();
      return result.recordset;
    }
    catch (err){
			throw new Error('Error get information in khachhang: ' + err.message);
    }
  }
}

module.exports = KhachHang;
