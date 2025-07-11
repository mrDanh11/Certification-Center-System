const { pool, sql_Int, sql_Str, sql_DateTime, sql_Date } = require('../../../config/db');

const PhieuDangKy = {

  LayDanhSachDK: async () => {
    const query = `
		select * from PhieuDangKy pdk
    join khachhang kh on pdk.KhachHangID = kh.KhachHangID
		`;
    try {
      await pool.connect()
      const result = await pool.request().query(query);
      const test = result.recordset;
      return test;
    } catch (err) {
      throw new Error('Error get information in phieudangky: ' + err.message);
    }
  },

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

  TaoPhieuDonVi: async (transaction, phieuID, baiThiInfo, soLuong) => {
    const infoRequest = transaction.request();
    await infoRequest
      .input('PhieuID', sql_Int, phieuID)
      .input('ChungChiID', sql_Str, baiThiInfo.loaiBaiThi)
      .input('NgayMongMuon', sql_Date, baiThiInfo.ngayThi)
      .input('YeuCau', sql_Str, baiThiInfo.yeuCau || '')
      .input('SoLuong', sql_Int, soLuong)
      .query(`
        INSERT INTO PhieuDonVi (PhieuID, ChungChiID, NgayMongMuon, YeuCau, SoLuong)
        VALUES (@PhieuID, @ChungChiID, @NgayMongMuon, @YeuCau, @SoLuong)
      `);
  },

  TaoPhieuCaNhan: async (transaction, phieuID) => {
    const infoRequest = transaction.request();
    await infoRequest
      .input('PhieuID', sql_Int, phieuID)
      .query(`
        INSERT INTO PhieuCaNhan (PhieuID)
        VALUES (@PhieuID)
      `);
  },

  TaoPhieuDangKy: async (khachHangID, loaiPhieu, nvTiepNhanLap, baiThiInfo, soLuong) => {
    const connection = await pool.connect();
    const transaction = connection.transaction();

    try {
      await transaction.begin();

      const request = transaction.request();

      // const result = await request
      //   .input('KhachHangID', sql_Int, khachHangID)
      //   .input('ThoiGianLap', sql_DateTime, new Date())
      //   .input('LoaiPhieu', sql_Str, loaiPhieu)
      //   .input('NVTiepNhanLap', sql_Int, nvTiepNhanLap)
      //   .query(
      //   INSERT INTO PhieuDangKy (KhachHangID, ThoiGianLap, LoaiPhieu, NVTiepNhanLap)
      //   OUTPUT INSERTED.PhieuID
      //   VALUES (@KhachHangID, @ThoiGianLap, @LoaiPhieu, @NVTiepNhanLap)
      // );

      const result = await request
        .input('KhachHangID', sql_Int, khachHangID)
        .input('ThoiGianLap', sql_DateTime, new Date())
        .input('LoaiPhieu', sql_Str, loaiPhieu)
        .query(`
          INSERT INTO PhieuDangKy (KhachHangID, ThoiGianLap, LoaiPhieu)
          OUTPUT INSERTED.PhieuID
          VALUES (@KhachHangID, @ThoiGianLap, @LoaiPhieu)
        `);

      const phieuID = result.recordset[0].PhieuID;

      // TODO: check for eligible loaiBaiThi
      // TODO: Add fields to database and fix schema (draw.io)
      // so luong thi sinh
      if (loaiPhieu === "Đơn Vị" && baiThiInfo?.loaiBaiThi) {
        await PhieuDangKy.TaoPhieuDonVi(transaction, phieuID, baiThiInfo, soLuong);
      } else {
        await PhieuDangKy.TaoPhieuCaNhan(transaction, phieuID);
      }

      await transaction.commit();
      return { success: true, phieuID };
    } catch (err) {
      await transaction.rollback();
      console.error('Error creating PhieuDangKy:', err);
      return { success: false, error: err.message };
    } finally {
      connection.close();
    }
  },
}

module.exports = PhieuDangKy;
