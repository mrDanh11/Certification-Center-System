const {pool, sql_Int} = require('../../../config/db');

const dsdkt = {
	LayDanhSachBaiThi: async (maDangKy) => {
		const query = `
		SELECT dsbt.BaiThiID, lt.ChungChiID, lt.DiaDiemThi, cc.Gia, cc.LoaiChungChi,
    dsbt.PhieuID, cc.TenChungChi, lt.ThoiGianLamBai, lt.ThoiGianThi 
    FROM DanhSachDKThi dsbt
    JOIN LichThi lt ON dsbt.BaiThiID = lt.BaiThiID
    JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
        WHERE dsbt.PhieuID = '${maDangKy}'
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
            if(test) return test 
            else return [];
		} catch (err) {
			throw new Error('Error get information in dsdkthi: ' + err.message);
		}
	},
  DangKyBaiThiMoi: async(phieuID, BaiThiID) => {
    const connection = await pool.connect();
    const transaction = connection.transaction();

    try {
      await transaction.begin();

      const request = transaction.request();

      await request
        .input('PhieuID', sql_Int, phieuID)
        .input('BaiThiID', sql_Int, BaiThiID)
        .query(`
          INSERT INTO danhsachDKThi (PhieuID, BaiThiID)
          VALUES (@PhieuID, @BaiThiID)
        `);

      await transaction.commit();
      return { success: true };
    } catch (err) {
      await transaction.rollback();
      console.error('Error creating danhsachDKThi:', err);
      return { success: false, error: err.message };
    } finally {
      connection.close();
    }
  },

  XoaDangKyThi: async(phieuID, BaiThiID) => {
    const connection = await pool.connect();
    const transaction = connection.transaction();

    try {
      await transaction.begin();

      const request = transaction.request();

      await request
        .input('PhieuID', sql_Int, phieuID)
        .input('BaiThiID', sql_Int, BaiThiID)
        .query(`
          DELETE FROM danhsachDKThi 
          WHERE PhieuID = @PhieuID
          AND BaiThiID = @BaiThiID
        `);

      await transaction.commit();
      return { success: true };
    } catch (err) {
      await transaction.rollback();
      console.error('Error deleting danhsachDKThi:', err);
      return { success: false, error: err.message };
    } finally {
      connection.close();
    }
  },
}

module.exports = dsdkt;
