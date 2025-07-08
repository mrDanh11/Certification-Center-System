const { pool, sql_Int } = require('../../../config/db');

const NhanVienModel = {
  // Lấy danh sách nhân viên 
  async layDSNhanVien() {
    const sql = `
      SELECT *
      FROM NhanVien nv
    `;
    try {
      await pool.connect();
      const result = await pool.request().query(sql);
      return result.recordset;
    } catch (err) {
      throw new Error('Error layDSNhanVien: ' + err.message);
    }
  }
};

module.exports = NhanVienModel;
