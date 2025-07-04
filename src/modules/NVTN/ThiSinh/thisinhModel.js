const { pool, sql_Int, sql_Str } = require('../../../config/db');

const ThiSinh = {
  ThemThiSinh: async (phieuID, thiSinhList) => {
    await pool.connect();
    const transaction = pool.transaction();
    try {
      await transaction.begin();

      let request;
      for (const thiSinh of thiSinhList) {
        request = transaction.request();
        await request
          .input('PhieuID', sql_Int, phieuID)
          .input('CCCD', sql_Str, thiSinh.cccd)
          .input('Hoten', sql_Str, thiSinh.hoTen)
          .input('Phai', sql_Str, thiSinh.phai)
          .query(`
          INSERT INTO ThiSinh (PhieuID, CCCD, Hoten, Phai)
          VALUES (@PhieuID, @CCCD, @Hoten, @Phai)
        `);
      }

      await transaction.commit();
      return { success: true };
    } catch (err) {
      try {
        await transaction.rollback(); 
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
      console.error('Error inserting ThiSinh:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = ThiSinh;
