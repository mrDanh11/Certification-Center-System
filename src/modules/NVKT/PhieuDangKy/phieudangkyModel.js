const { pool, sql_Int, sql_Str, sql_DateTime } = require('../../../config/db');

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
	},

  TaoPhieuDangKy: async (khachHangID, loaiPhieu = 'Cá Nhân', nvTiepNhanLap = null) => {
    try {
      await pool.connect();
      const transaction = pool.transaction()
      await transaction.begin();
      const request = transaction.request();
      const result = await request 
        .input('KhachHangID', sql_Int, khachHangID)
        .input('ThoiGianLap', sql_DateTime, new Date())
        .input('LoaiPhieu', sql_Str, loaiPhieu)
        .input('NVTiepNhanLap', sql_Int, nvTiepNhanLap)
        .query(`
        INSERT INTO PhieuDangKy (KhachHangID, ThoiGianLap, LoaiPhieu, NVTiepNhanLap)
        OUTPUT INSERTED.PhieuID
        VALUES (@KhachHangID, @ThoiGianLap, @LoaiPhieu, @NVTiepNhanLap)
      `);

      await transaction.commit();
      return { success: true, phieuID: result.recordset[0].PhieuID };
    } catch (err) {
      console.error('Error creating PhieuDangKy:', err);
      return { success: false, error: err.message + ' In Model ' };
    }
  },
}

module.exports = PhieuDangKy;
