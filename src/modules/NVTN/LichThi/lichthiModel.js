const { pool } = require('../../../config/db');

const LichThiModel = {
        // Helper method để execute query
    layLichThiTruoc: async (query) => {
        try {
            await pool.connect()
            return await pool.request().query(query);
        } catch (err) {
            throw new Error('Database query error: ' + err.message);
        }
    },
    // Cập nhật method LayDanhSachLichThi để nhất quán:
    LayDanhSachLichThi: async (chungChiID) => {
        try {
            console.log('LayDanhSachLichThi with chungChiID:', chungChiID);
            
            let query = `
                SELECT 
                    lt.BaiThiID as id,
                    lt.BaiThiID as maBaiThi,
                    cc.TenChungChi as tenChungChi,
                    lt.DiaDiemThi as diaDiem,
                    ISNULL(pt.TenPhong, N'Phòng chưa xác định') as phongThi,
                    FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThi,
                    CONVERT(VARCHAR(5), lt.ThoiGianLamBai, 108) as gioThi,
                    (
                        SELECT COUNT(*) 
                        FROM PhieuDuThi pdt 
                        WHERE pdt.LichThi = lt.BaiThiID
                    ) as soLuongDaDangKy
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                LEFT JOIN PhongThi pt ON lt.PhongThiID = pt.PhongThiID
                WHERE lt.ThoiGianThi > CAST(GETDATE() AS DATE)
            `;
            
            if (chungChiID) {
                query += ` AND lt.ChungChiID = ${chungChiID}`;
            }
            
            query += ` ORDER BY lt.ThoiGianThi ASC`;
            
            console.log('Executing query:', query);
            await pool.connect();
            const result = await pool.request().query(query);
            
            // Format data
            const formattedResults = result.recordset.map(item => ({
                ...item,
                diaDiemFull: `${item.diaDiem} - ${item.phongThi}`,
                isAvailable: true
            }));
            
            return formattedResults;
            
        } catch (err) {
            throw new Error('Error fetching LichThi list: ' + err.message);
        }
    },
    DemSoLuongLichThi: async (chungChiID = null) => {
        try {
            await pool.connect();
            
            let query = `
                SELECT COUNT(*) as total
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                WHERE lt.ThoiGianThi >= CAST(GETDATE() AS DATE)
            `;
            
            const request = pool.request();
            
            if (chungChiID) {
                query += ` AND lt.ChungChiID = @chungChiID`;
                request.input('chungChiID', chungChiID);
            }
            
            const result = await request.query(query);
            return result.recordset[0].total;
            
        } catch (error) {
            console.error('Error in DemSoLuongLichThi:', error);
            throw error;
        }
    },

    // Sửa method LayDanhSachLichThiPhanTrang:
    LayDanhSachLichThiPhanTrang: async (chungChiID = null, offset = 0, limit = 10) => {
        try {
            await pool.connect();
            
            let query = `
                SELECT 
                    lt.BaiThiID as id,
                    lt.BaiThiID as maBaiThi,
                    FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThi,
                    CONVERT(VARCHAR(5), lt.ThoiGianLamBai, 108) as gioThi,
                    lt.DiaDiemThi as diaDiem,
                    cc.TenChungChi as tenChungChi
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                LEFT JOIN PhongThi pt ON lt.PhongThiID = pt.PhongThiID
                WHERE lt.ThoiGianThi >= CAST(GETDATE() AS DATE)
            `;
            
            const request = pool.request();
            request.input('offset', offset);
            request.input('limit', limit);
            
            if (chungChiID) {
                query += ` AND lt.ChungChiID = @chungChiID`;
                request.input('chungChiID', chungChiID);
            }
            
            query += `
                ORDER BY lt.ThoiGianThi ASC, lt.ThoiGianLamBai ASC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `;
            
            const result = await request.query(query);
            
            // Format dữ liệu
            return result.recordset.map(item => ({
                id: item.id,
                maBaiThi: item.maBaiThi,
                ngayThi: item.ngayThi,
                gioThi: item.gioThi,
                diaDiem: item.diaDiem,
                tenChungChi: item.tenChungChi
            }));
            
        } catch (error) {
            console.error('Error in LayDanhSachLichThiPhanTrang:', error);
            throw error;
        }
    },
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

    LayAllLichThi: async () => {
        try {
        const stmt = `
        select * from LichThi
        `;

        await pool.connect();
        const result = await pool.request()
            .query(stmt);

        if (result.recordset.length <= 0){
            throw new Error('no lich thi found')
        }
        await pool.close();
        return result.recordset;
        }
        catch (err){
                throw new Error('Error get information in lich thi: ' + err.message);
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