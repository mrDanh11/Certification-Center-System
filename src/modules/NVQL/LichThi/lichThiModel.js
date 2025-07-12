const { pool, sql_Int, sql_Str, sql_Date } = require('../../../config/db');

const LichThiModel = {
  async taoLichThi(data) {
    const conn = await pool.connect();
    const tx   = conn.transaction();
    try {
      await tx.begin();

      // nếu định dạng 'HH:mm', thêm ':00'
      const fmtTime = t => /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;

      const result = await tx.request()
        .input('ChungChiID', sql_Int,  data.chungChiID)
        .input('TG_BD',      sql_Str,  fmtTime(data.thoiGianBD))
        .input('TG_KT',      sql_Str,  fmtTime(data.thoiGianKT))
        .input('NgayThi',    sql_Date, data.cmbNgayThi)
        .input('DiaDiemThi', sql_Str,  data.txtDiaDiemThi || '')
        // .input('PhongThi',   sql_Str,  data.txtPhongThi   || '')
        .input('MaPhongThi', sql_Int,  data.cmbMaPhongThi)
        .query(`
          INSERT INTO LichThi
            -- (ChungChiID, ThoiGianLamBai, ThoiGianThi, DiaDiemThi, PhongThi, MaPhongThi)
            (ChungChiID, ThoiGianLamBai, ThoiGianThi, DiaDiemThi, PhongThiID)
          OUTPUT INSERTED.BaiThiID
          VALUES
            (@ChungChiID, @TG_BD, @NgayThi, @DiaDiemThi, @MaPhongThi)
        `);

      await tx.commit();
      return result.recordset[0].BaiThiID;
    } catch (err) {
      await tx.rollback();
      throw err;
    } finally {
      conn.close();
    }
  },

  async LichThiToiDonVi(data) {
    const conn = await pool.connect();
    const tx   = conn.transaction();
    try {
      await tx.begin();
      console.log('Controller:', data.baiThiID, data.phieuDangKy);
      const result = await tx.request()
        .input('BaiThiID', sql_Int,  data.baiThiID)
        .input('PhieuID',      sql_Int,  data.phieuDangKy)
        .query(`
          INSERT INTO DanhSachDKThi
            (PhieuID, BaiThiID)
          OUTPUT INSERTED.BaiThiID
          VALUES
            (@PhieuID, @BaiThiID)
        `);

      await tx.commit();
      return result.recordset[0].BaiThiID;
    } catch (err) {
      await tx.rollback();
      throw err;
    } finally {
      conn.close();
    }
  }
};

module.exports = LichThiModel;
