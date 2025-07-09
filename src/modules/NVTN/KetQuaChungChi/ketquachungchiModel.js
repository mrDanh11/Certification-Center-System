const { pool, sql_Int, sql_Str } = require('../../../config/db');

const KetQuaChungChi = {
  // 1) Lấy Khách từ CCCD
  getKhachHangByCCCD: async (cccd) => {
    const sql = `
      SELECT KhachHangID, Hoten, Email, Dienthoai, LoaiKH
      FROM KhachHang
      WHERE CCCD = @CCCD
    `;
    const conn = await pool.connect();
    const result = await conn.request()
      .input('CCCD', sql_Str, cccd)
      .query(sql);
    return result.recordset[0] || null;
  },

  // 2) Lấy chứng chỉ đã có
  getCertificatesByKhachHang: async (khachHangID) => {
    const sql = `
      SELECT DISTINCT
        kqc.KetQuaID,
        cc.LoaiChungChi,
        cc.TenChungChi,
        lt.ThoiGianThi AS NgayThi,
        lt.DiaDiemThi,
        kqc.TrangThai,
        kqc.NgayCap
      FROM KetQuaChungChi kqc
      JOIN PhieuDangKy pdk ON pdk.PhieuID = kqc.PhieuID
	  JOIN PhieuDuThi pdt ON pdt.PhieuID = pdk.PhieuID
	  JOIN LichThi lt ON pdt.LichThi = lt.BaiThiID
      JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID     
      WHERE pdk.KhachHangID = @khachHangID
      ORDER BY kqc.TrangThai ASC
    `;
    const conn = await pool.connect();
    const result = await conn.request()
      .input('KhachHangID', sql_Int, khachHangID)
      .query(sql);
    return result.recordset;
  },

  // 3) Lấy chi tiết cho trang xác nhận
  getConfirmDetails: async (khachHangID, ketQuaIDs) => {
    if (!Array.isArray(ketQuaIDs) || ketQuaIDs.length === 0) return [];
    // only integers
    const ids = ketQuaIDs.map(i => parseInt(i, 10)).filter(i => i>0);
    if (ids.length === 0) return [];
    const conn = await pool.connect();
    const sql = `
      SELECT
        pdk.PhieuID,
        kqc.KetQuaID,
        ts.CCCD,
        ts.Hoten,
        ts.Phai,
        pdt.Diem,
        pdt.KQ
      FROM KetQuaChungChi kqc
      JOIN PhieuDangKy pdk ON pdk.PhieuID = kqc.NguoiNhanID
      JOIN PhieuDuThi    pdt ON pdk.PhieuID  = pdt.PhieuID
      JOIN ThiSinh       ts  ON pdt.ThiSinhID = ts.ThiSinhID
                            AND pdt.PhieuID   = ts.PhieuID
      WHERE pdk.KhachHangID = @khachHangID
        AND kqc.KetQuaID  IN (${ids.join(',')})
    `;
    const result = await conn.request()
      .input('KhachHangID', sql_Int, khachHangID)
      .query(sql);
    return result.recordset;
  },

  // 4) Cập nhật trạng thái
  updateStatus: async (ketQuaID, newStatus) => {
    const conn = await pool.connect();
    const result = await conn.request()
      .input('KetQuaID',  sql_Int, ketQuaID)
      .input('TrangThai', sql_Str, newStatus)
      .input('XacNhanKH', sql_Int, newStatus === 'Đã cấp' ? 1 : 0)
      .query(`
        UPDATE KetQuaChungChi
        SET TrangThai         = @TrangThai,
            XacNhanKhachHang  = @XacNhanKH,
            NgayCap           = GETDATE()
        WHERE KetQuaID = @KetQuaID
      `);
    return result.rowsAffected[0] > 0;
  }
};

module.exports = KetQuaChungChi;


