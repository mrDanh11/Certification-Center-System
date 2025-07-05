const { pool, sql_Int} = require('../../../config/db');

const PhieuDonViModel = {
  // Lấy danh sách phiếu đơn vị
  async layDanhSachPhieuDonVi() {
    const sql = `
      SELECT pdk.PhieuID,
             kh.Hoten        AS TenDonVi,
             kh.KhachHangID AS MaDonVi,
             pdv.NgayMongMuon,
             pdv.SoLuong,
             pdv.YeuCau,
             pdv.ChungChiID,
             cc.LoaiChungChi,
             cc.TenChungChi

      FROM PhieuDangKy pdk
      INNER JOIN PhieuDonVi pdv ON pdv.PhieuID = pdk.PhieuID
      INNER JOIN KhachHang kh ON kh.KhachHangID = pdk.KhachHangID
      INNER JOIN ChungChi cc ON cc.ChungChiID = pdv.ChungChiID
      WHERE pdk.LoaiPhieu = N'Đơn Vị'
        AND (pdk.TinhTrangHuy = 0 OR pdk.TinhTrangHuy IS NULL)
    `;
    try {
      await pool.connect();
      const result = await pool.request().query(sql);
      return result.recordset;
    } catch (err) {
      throw new Error('Error getDanhSach PhieuDonVi: ' + err.message);
    }
  },

  // Lấy chi tiết 1 phiếu đơn vị theo PhieuID
  async layChiTietPhieuDonVi(phieuID) {
    const sql = `
      SELECT pdk.PhieuID,
             kh.KhachHangID,
             kh.Hoten        AS TenDonVi,
             pdv.LoaiBaiThi,
             CONVERT(varchar(10), pdv.NgayMongMuon, 23) AS NgayMongMuon,
             pdv.SoLuong,
             pdv.YeuCau
      FROM PhieuDangKy pdk
      INNER JOIN PhieuDonVi pdv     ON pdv.PhieuID = pdk.PhieuID
      INNER JOIN KhachHang kh       ON kh.KhachHangID = pdk.KhachHangID
      WHERE pdk.PhieuID = @PhieuID
        AND pdk.LoaiPhieu = N'Đơn Vị'
    `;
    try {
      await pool.connect();
      const { recordset } = await pool.request()
        .input('PhieuID', sql_Int, phieuID)
        .query(sql);
      return recordset[0] || null;
    } catch (err) {
      throw new Error('Error getById PhieuDonVi: ' + err.message);
    }
  }
};

module.exports = PhieuDonViModel;
