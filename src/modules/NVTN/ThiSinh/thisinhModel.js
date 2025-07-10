const { pool, sql_Int, sql_Str } = require('../../../config/db');

const ThiSinh = {
  // Lấy chứng chỉ ID từ SBD của thí sinh
    layChungChiIDTheoSBD: async (sbd) => {
        try {
            const soBaoDanh = parseInt(sbd.replace(/\D/g, '')) || sbd;
            
            const query = `
                SELECT DISTINCT lt.ChungChiID
                FROM ThiSinh ts
                INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
                INNER JOIN LichThi lt ON pdt.LichThi = lt.BaiThiID
                WHERE pdt.SoBaoDanh = ${soBaoDanh}
            `;
            await pool.connect()
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return result.recordset[0].ChungChiID;
        } catch (error) {
            console.error('Error in layChungChiIDTheoSBD:', error);
            throw error;
        }
    },
   // Tìm kiếm thí sinh theo SBD
    TimKiemThiSinhTheoSBD: async (sbd) => {
        try {
            // Trích xuất số từ SBD (bỏ prefix "SB")
            const soBaoDanh = sbd.replace(/\D/g, '');
            
            const query = `
                SELECT 
                    ts.ThiSinhID as id,
                    pdt.SoBaoDanh as sbd,
                    ts.Hoten as hoTen,
                    ts.CCCD as cccd,
                    pd.PhieuID
                FROM ThiSinh ts
                INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
                INNER JOIN PhieuDangKy pd ON ts.PhieuID = pd.PhieuID
                WHERE pdt.SoBaoDanh = ${soBaoDanh}
            `;
            await pool.connect()
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                throw new Error('Không tìm thấy thí sinh với SBD này');
            }
            
            return result.recordset[0];
            
        } catch (err) {
            throw new Error('Error searching student: ' + err.message);
        }
    },
  // Lấy thông tin phiếu đăng ký từ SBD
LayPhieuIDTheoSBD: async (sbd) => {
    try {
        await pool.connect();
        
        const soBaoDanh = parseInt(sbd.replace(/\D/g, '')) || sbd;
        
        const query = `
            SELECT pd.PhieuID, kh.Hoten as tenKhachHang
            FROM ThiSinh ts
            INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
            INNER JOIN PhieuDangKy pd ON ts.PhieuID = pd.PhieuID
            INNER JOIN KhachHang kh ON pd.KhachHangID = kh.KhachHangID
            WHERE pdt.SoBaoDanh = @soBaoDanh
        `;
        
        const request = pool.request();
        request.input('soBaoDanh', soBaoDanh);
        
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            throw new Error('Không tìm thấy phiếu đăng ký');
        }
        
        return result.recordset[0];
        
    } catch (error) {
        console.error('Error in LayPhieuIDTheoSBD:', error);
        throw error;
    }
},
  timThongTinThiSinhTheoSBD: async (sbd) => {
    try {
        console.log('Searching for SBD:', sbd); // Debug log
        
        // Trích xuất số từ SBD để tìm kiếm (VD: "SBD001" -> "1")
        const soBaoDanh = parseInt(sbd.replace(/\D/g, '')) || sbd;
        console.log('Extracted SoBaoDanh:', soBaoDanh); // Debug log
        
        const query = `
            SELECT 
                pdt.SoBaoDanh as sbd,
                lt.BaiThiID as maBaiThi,
                ts.ThiSinhID as maThiSinh,
                ts.Hoten as hoTen,
                ts.CCCD as cccd,
                FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThiCu,
                CONVERT(VARCHAR(5), lt.ThoiGianLamBai, 108) as gioThiCu,
                lt.DiaDiemThi + ' - ' + ISNULL(pt.TenPhong, N'Phòng chưa xác định') as diaDiemCu
            FROM ThiSinh ts
            INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
            INNER JOIN PhieuDangKy pd ON ts.PhieuID = pd.PhieuID
            INNER JOIN LichThi lt ON pdt.LichThi = lt.BaiThiID
            LEFT JOIN PhongThi pt ON lt.PhongThiID = pt.PhongThiID
            WHERE pdt.SoBaoDanh = ${soBaoDanh}
        `;
        
        console.log('Executing SQL Server query with pool:', !!pool); // Debug log
        console.log('Query:', query); // Debug query
        await pool.connect()
        const result = await pool.request().query(query);
        console.log('Query results:', result.recordset); // Debug log
        
        if (result.recordset.length === 0) {
            return null;
        }
        
        return result.recordset[0];
    } catch (error) {
        console.error('Error in timThongTinThiSinhTheoSBD:', error);
        throw error;
    }
},
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
