const { pool, sql_Int, sql_Date, sql_Str } = require('../../../config/db');

const PhongThiModel = {
    // Lấy danh sách phòng thi
    async layDSPhongThi() {
      const sql = `
        SELECT *
        FROM PhongThi
        ORDER BY TenPhong
      `;
      try {
        await pool.connect();
        const result = await pool.request().query(sql);
        return result.recordset;
      } catch (err) {
        throw new Error('Error layDSPhongThi: ' + err.message);
      }
    },

    async checkPhongThi(maPhongThi, ngayThi, gioLamBai, diaDiemThi) {
      // định dạng HH:mm:ss
      let t = gioLamBai;
      if (/^\d{2}:\d{2}$/.test(t)) {
        t = `${t}:00`;
      }
      const conn = await pool.connect();
      try {
        const result = await conn.request()
          .input('MaPhongThi',  sql_Int, maPhongThi)
          .input('NgayThi',     sql_Date, ngayThi)
          .input('GioLamBai',   sql_Str,  t)
          .input('DiaDiemThi',  sql_Str,  diaDiemThi)

          .query(`
            SELECT 1
            FROM LichThi
            WHERE PhongThiID      = @MaPhongThi
              AND ThoiGianThi     = @NgayThi
              AND CONVERT(varchar(8), ThoiGianLamBai, 108) = @GioLamBai
              AND (
              PhongThiID  = @MaPhongThi
              OR DiaDiemThi = @DiaDiemThi
            )
          `);
        return result.recordset.length > 0;
      } finally {
        conn.close();
      }
    }
  };

module.exports = PhongThiModel;
