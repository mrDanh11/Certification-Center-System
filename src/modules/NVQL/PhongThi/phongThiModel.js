const { pool, sql_Int } = require('../../../config/db');

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
    }
  };

module.exports = PhongThiModel;
