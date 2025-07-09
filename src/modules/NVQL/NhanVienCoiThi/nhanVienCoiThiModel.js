// src/modules/NVQL/NhanVienCoiThi/nhanVienCoiThiModel.js
const { pool, sql_Int } = require('../../../config/db');

const NhanVienCoiThiModel = {
  /**
   * Gán nhân viên coi thi kèm phòng cho một lịch thi
   * @param {number} baiThiID 
   * @param {{ nhanVienID: number, maPhongThi: number }[]} assignments 
   */
  async themNhanVienCoiThi(baiThiID, assignments) {
    const conn = await pool.connect();
    const tx   = conn.transaction();
    try {
      await tx.begin();

      for (const { nhanVienID, maPhongThi } of assignments) {
        await tx.request()
          .input('NhanVienID', sql_Int, nhanVienID)
          .input('BaiThiID',   sql_Int, baiThiID)
          // .input('MaPhongThi', sql_Int, maPhongThi)
          .query(`
            INSERT INTO NhanVienCoiThi (NhanVienID, BaiThiID)
            VALUES (@NhanVienID, @BaiThiID)
          `);
          // INSERT INTO NhanVienCoiThi (NhanVienID, BaiThiID, MaPhongThi)
          //   VALUES (@NhanVienID, @BaiThiID, @MaPhongThi)
      }

      await tx.commit();
      return { success: true };
    } catch (err) {
      await tx.rollback();
      throw err;
    } finally {
      conn.close();
    }
  }
};

module.exports = NhanVienCoiThiModel;
