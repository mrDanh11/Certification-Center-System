const { pool } = require('../../../config/db');

const LichThiModel = {
    // Lấy danh sách lịch thi có thể chọn cho gia hạn
    LayDanhSachLichThiGiaHan: async (giaHanId) => {
        try {
            // Lấy thông tin phiếu gia hạn để biết loại chứng chỉ
            const phieuGiaHanQuery = `
                SELECT 
                    lt_truoc.ChungChiID,
                    lt_truoc.ThoiGianThi as NgayThiCu
                FROM PhieuGiaHan pgh
                INNER JOIN LichThi lt_truoc ON pgh.LichThiTruoc = lt_truoc.BaiThiID
                WHERE pgh.PhieuGiaHanID = @giaHanId
            `;
            
            const phieuRequest = pool.request();
            phieuRequest.input('giaHanId', giaHanId);
            const phieuResult = await phieuRequest.query(phieuGiaHanQuery);
            
            if (phieuResult.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            
            const { ChungChiID, NgayThiCu } = phieuResult.recordset[0];
            
            // Lấy danh sách lịch thi cùng loại chứng chỉ và sau ngày thi cũ
            const lichThiQuery = `
                SELECT 
                    lt.BaiThiID as id,
                    'BT' + RIGHT('000' + CAST(lt.BaiThiID AS VARCHAR), 3) as maBaiThi,
                    lt.DiaDiemThi + ISNULL(' - ' + lt.PhongThi, '') as diaDiem,
                    FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThi,
                    FORMAT(lt.ThoiGianLamBai, 'HH:mm') as gioThi,
                    cc.TenChungChi
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                WHERE lt.ChungChiID = @chungChiId
                  AND lt.ThoiGianThi > @ngayThiCu
                  AND lt.ThoiGianThi > GETDATE()
                ORDER BY lt.ThoiGianThi ASC
            `;
            
            const lichThiRequest = pool.request();
            lichThiRequest.input('chungChiId', ChungChiID);
            lichThiRequest.input('ngayThiCu', NgayThiCu); // Truyền trực tiếp datetime object
            const result = await lichThiRequest.query(lichThiQuery);
            
            return result.recordset;
            
        } catch (err) {
            console.error('Detailed error:', err);
            throw new Error('Error fetching LichThi for extension: ' + err.message);
        }
    },

    // Lấy tất cả lịch thi có sẵn
    LayTatCaLichThi: async () => {
        try {
            const query = `
                SELECT 
                    lt.BaiThiID as id,
                    'BT' + RIGHT('000' + CAST(lt.BaiThiID AS VARCHAR), 3) as maBaiThi,
                    lt.DiaDiemThi + ISNULL(' - ' + lt.PhongThi, '') as diaDiem,
                    FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThi,
                    FORMAT(lt.ThoiGianLamBai, 'HH:mm') as gioThi,
                    cc.TenChungChi,
                    cc.LoaiChungChi
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                WHERE lt.ThoiGianThi > GETDATE()
                ORDER BY lt.ThoiGianThi ASC, cc.TenChungChi ASC
            `;
            
            const result = await pool.request().query(query);
            return result.recordset;
            
        } catch (err) {
            throw new Error('Error fetching all LichThi: ' + err.message);
        }
    },

    // Lấy chi tiết lịch thi theo ID
    LayChiTietLichThi: async (lichThiId) => {
        try {
            const query = `
                SELECT 
                    lt.BaiThiID as id,
                    'BT' + RIGHT('000' + CAST(lt.BaiThiID AS VARCHAR), 3) as maBaiThi,
                    lt.DiaDiemThi,
                    lt.PhongThi,
                    lt.ThoiGianThi,
                    lt.ThoiGianLamBai,
                    cc.TenChungChi,
                    cc.LoaiChungChi,
                    cc.Gia
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                WHERE lt.BaiThiID = ${lichThiId}
            `;
            
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                throw new Error('Không tìm thấy lịch thi');
            }
            
            return result.recordset[0];
            
        } catch (err) {
            throw new Error('Error fetching LichThi detail: ' + err.message);
        }
    },

    // Lấy lịch thi theo loại chứng chỉ
    LayLichThiTheoLoaiChungChi: async (chungChiId) => {
        try {
            const query = `
                SELECT 
                    lt.BaiThiID as id,
                    'BT' + RIGHT('000' + CAST(lt.BaiThiID AS VARCHAR), 3) as maBaiThi,
                    lt.DiaDiemThi + ISNULL(' - ' + lt.PhongThi, '') as diaDiem,
                    FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThi,
                    FORMAT(lt.ThoiGianLamBai, 'HH:mm') as gioThi,
                    cc.TenChungChi
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                WHERE lt.ChungChiID = ${chungChiId}
                  AND lt.ThoiGianThi > GETDATE()
                ORDER BY lt.ThoiGianThi ASC
            `;
            
            const result = await pool.request().query(query);
            return result.recordset;
            
        } catch (err) {
            throw new Error('Error fetching LichThi by ChungChi: ' + err.message);
        }
    }
};

module.exports = LichThiModel;