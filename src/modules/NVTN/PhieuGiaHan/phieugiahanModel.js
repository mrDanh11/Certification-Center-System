const { pool } = require('../../../config/db');

const PhieuGiaHanModel = {
    // Helper method để execute query
    executeQuery: async (query) => {
        try {
            return await pool.request().query(query);
        } catch (err) {
            throw new Error('Database query error: ' + err.message);
        }
    },

    // Lấy danh sách phiếu gia hạn với phân trang
    LayDanhSachPhieuGiaHan: async (page = 1, limit = 10, searchValue = '') => {
        try {
            await pool.connect();
            const offset = (page - 1) * limit;
            
            let whereCondition = '';
            if (searchValue) {
                whereCondition = `WHERE pgh.PhieuGiaHanID LIKE '%${searchValue}%' 
                                 OR kh.Hoten LIKE N'%${searchValue}%'`;
            }
            
            const query = `
                SELECT 
                    pgh.PhieuGiaHanID as id,
                    'PH' + CAST(pgh.PhieuGiaHanID AS VARCHAR) as maYeuCau,
                    kh.Hoten as hoTenKhachHang,
                    pd.PhieuID as maPhieu,
                    FORMAT(lt_truoc.ThoiGianThi, 'HH:mm dd/MM/yyyy') as ngayThiGoc,
                    pgh.LoaiGiaHan as liDoGiaHan,
                    pgh.TinhTrang as tinhTrang,
                    CASE 
                        WHEN pgh.TinhTrang = N'Chờ duyệt' THEN 'status-pending'
                        WHEN pgh.TinhTrang = N'Đã duyệt' THEN 'status-approved'
                        WHEN pgh.TinhTrang = N'Từ chối' THEN 'status-rejected'
                        ELSE 'status-payment'
                    END as statusClass
                FROM PhieuGiaHan pgh
                INNER JOIN PhieuDangKy pd ON pgh.PhieuID = pd.PhieuID
                INNER JOIN KhachHang kh ON pd.KhachHangID = kh.KhachHangID
                INNER JOIN LichThi lt_truoc ON pgh.LichThiTruoc = lt_truoc.BaiThiID
                ${whereCondition}
                ORDER BY pgh.NgayLap DESC
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
            `;
            
            const result = await pool.request().query(query);
            
            // Đếm tổng số bản ghi
            const countQuery = `
                SELECT COUNT(*) as total
                FROM PhieuGiaHan pgh
                INNER JOIN PhieuDangKy pd ON pgh.PhieuID = pd.PhieuID
                INNER JOIN KhachHang kh ON pd.KhachHangID = kh.KhachHangID
                ${whereCondition}
            `;
            
            const countResult = await pool.request().query(countQuery);
            const total = countResult.recordset[0].total;
            
            return {
                data: result.recordset,
                total: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
            
        } catch (err) {
            throw new Error('Error fetching PhieuGiaHan list: ' + err.message);
        }
    },

    // Lấy chi tiết phiếu gia hạn
    LayChiTietPhieuGiaHan: async (id) => {
        try {
            await pool.connect();
            const query = `
                SELECT 
                    pgh.PhieuGiaHanID as id,
                    'SB' + RIGHT('000' + CAST(pdt.SoBaoDanh AS VARCHAR), 3) as sbd,
                    'BT' + RIGHT('000' + CAST(lt_truoc.BaiThiID AS VARCHAR), 3) as maBaiThi,
                    'TS' + RIGHT('000' + CAST(ts.ThiSinhID AS VARCHAR), 3) as maThiSinh,
                    FORMAT(lt_truoc.ThoiGianThi, 'dd/MM/yyyy') as ngayThiCu,
                    ts.CCCD as cccd,
                    CONVERT(VARCHAR(5), lt_truoc.ThoiGianLamBai, 108) as gioThiCu,
                    ts.Hoten as hoTen,
                    lt_truoc.DiaDiemThi + ' - ' + ISNULL(lt_truoc.PhongThi, 'Phòng chưa xác định') as diaDiemCu,
                    pgh.LoaiGiaHan as loaiGiaHan,
                    CASE 
                        WHEN pgh.TinhTrang = N'Chờ duyệt' THEN N'Bệnh nặng'
                        ELSE N'Lý do khác'
                    END as liDoGiaHan,
                    ISNULL(FORMAT(lt_sau.ThoiGianThi, 'yyyy-MM-dd'), '') as ngayThayThe,
                    pgh.TinhTrang
                FROM PhieuGiaHan pgh
                INNER JOIN PhieuDangKy pd ON pgh.PhieuID = pd.PhieuID
                INNER JOIN ThiSinh ts ON pd.PhieuID = ts.PhieuID
                INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
                INNER JOIN LichThi lt_truoc ON pgh.LichThiTruoc = lt_truoc.BaiThiID
                LEFT JOIN LichThi lt_sau ON pgh.LichThiSau = lt_sau.BaiThiID
                WHERE pgh.PhieuGiaHanID = ${id}
            `;
            
            const result = await pool.request().query(query);
            console.log('Query results:', result.recordset); // Debug log
            if (result.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            
            return result.recordset[0];
            
        } catch (err) {
            throw new Error('Error fetching PhieuGiaHan detail: ' + err.message);
        }
    },

    // Lấy danh sách lịch thi có thể chọn
    LayDanhSachLichThi: async (chungChiID) => {
        try {
            console.log('LayDanhSachLichThi with chungChiID:', chungChiID);
            
            const query = `
                SELECT 
                    lt.BaiThiID as id,
                    'BT' + RIGHT('000' + CAST(lt.BaiThiID AS VARCHAR), 3) as maBaiThi,
                    cc.TenChungChi as tenChungChi,
                    lt.DiaDiemThi as diaDiem,
                    ISNULL(lt.PhongThi, 'Phòng chưa xác định') as phongThi,
                    FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThi,
                    FORMAT(lt.ThoiGianLamBai, 'HH:mm') as gioThi,
                    (
                        SELECT COUNT(*) 
                        FROM PhieuDuThi pdt 
                        WHERE pdt.LichThi = lt.BaiThiID
                    ) as soLuongDaDangKy
                FROM LichThi lt
                INNER JOIN ChungChi cc ON lt.ChungChiID = cc.ChungChiID
                WHERE lt.ThoiGianThi > GETDATE()
                ${chungChiID ? `AND lt.ChungChiID = ${chungChiID}` : ''}
                ORDER BY lt.ThoiGianThi ASC
            `;
            
            console.log('Executing query:', query);
            const result = await pool.request().query(query);
            console.log('Query results:', result.recordset.length, 'records');
            
            // Format data
            const formattedResults = result.recordset.map(item => ({
                ...item,
                diaDiemFull: `${item.diaDiem} - ${item.phongThi}`,
                isAvailable: true // Giả sử tất cả đều available vì không có giới hạn số lượng trong DB
            }));
            
            return formattedResults;
            
        } catch (err) {
            throw new Error('Error fetching LichThi list: ' + err.message);
        }
    },

    // Tạo phiếu gia hạn mới
    TaoPhieuGiaHan: async (phieuID, lichThiTruoc, lichThiSau, tinhTrang = 'Chờ duyệt', loaiGiaHan = 'Bình Thường') => {
        try {
            console.log('Creating PhieuGiaHan with params:', { phieuID, lichThiTruoc, lichThiSau, tinhTrang, loaiGiaHan });
            
            let query;
            if (lichThiSau) {
                query = `
                    INSERT INTO PhieuGiaHan (LoaiGiaHan, TinhTrang, NgayLap, PhieuID, LichThiTruoc, LichThiSau)
                    OUTPUT INSERTED.PhieuGiaHanID
                    VALUES (N'${loaiGiaHan}', N'${tinhTrang}', GETDATE(), ${phieuID}, ${lichThiTruoc}, ${lichThiSau})
                `;
            } else {
                query = `
                    INSERT INTO PhieuGiaHan (LoaiGiaHan, TinhTrang, NgayLap, PhieuID, LichThiTruoc)
                    OUTPUT INSERTED.PhieuGiaHanID
                    VALUES (N'${loaiGiaHan}', N'${tinhTrang}', GETDATE(), ${phieuID}, ${lichThiTruoc})
                `;
            }
            
            console.log('Executing query:', query);
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                throw new Error('Không thể tạo phiếu gia hạn');
            }
            
            return result.recordset[0].PhieuGiaHanID;
            
        } catch (err) {
            console.error('Error in TaoPhieuGiaHan:', err);
            throw new Error('Error creating PhieuGiaHan: ' + err.message);
        }
    },

    // Cập nhật lịch thi cho phiếu gia hạn
    CapNhatLichThi: async (phieuGiaHanID, lichThiSauID) => {
        try {
            const query = `
                UPDATE PhieuGiaHan 
                SET LichThiSau = ${lichThiSauID},
                    TinhTrang = N'Chờ duyệt'
                WHERE PhieuGiaHanID = ${phieuGiaHanID}
            `;
            
            const result = await pool.request().query(query);
            return result.rowsAffected[0] > 0;
            
        } catch (err) {
            throw new Error('Error updating PhieuGiaHan: ' + err.message);
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
                    'SB' + RIGHT('000' + CAST(pdt.SoBaoDanh AS VARCHAR), 3) as sbd,
                    ts.Hoten as hoTen,
                    ts.CCCD as cccd,
                    pd.PhieuID
                FROM ThiSinh ts
                INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
                INNER JOIN PhieuDangKy pd ON ts.PhieuID = pd.PhieuID
                WHERE pdt.SoBaoDanh = ${soBaoDanh}
            `;
            
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                throw new Error('Không tìm thấy thí sinh với SBD này');
            }
            
            return result.recordset[0];
            
        } catch (err) {
            throw new Error('Error searching student: ' + err.message);
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
                'SB' + RIGHT('000' + CAST(pdt.SoBaoDanh AS VARCHAR), 3) as sbd,
                'BT' + RIGHT('000' + CAST(lt.BaiThiID AS VARCHAR), 3) as maBaiThi,
                'TS' + RIGHT('000' + CAST(ts.ThiSinhID AS VARCHAR), 3) as maThiSinh,
                ts.Hoten as hoTen,
                ts.CCCD as cccd,
                FORMAT(lt.ThoiGianThi, 'dd/MM/yyyy') as ngayThiCu,
                CONVERT(VARCHAR(5), lt.ThoiGianLamBai, 108) as gioThiCu,
                lt.DiaDiemThi + ' - ' + ISNULL(lt.PhongThi, 'Phòng chưa xác định') as diaDiemCu
            FROM ThiSinh ts
            INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
            INNER JOIN PhieuDangKy pd ON ts.PhieuID = pd.PhieuID
            INNER JOIN LichThi lt ON pdt.LichThi = lt.BaiThiID
            WHERE pdt.SoBaoDanh = ${soBaoDanh}
        `;
        
        console.log('Executing SQL Server query with pool:', !!pool); // Debug log
        console.log('Query:', query); // Debug query
        
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
// Tạo mã phiếu tự động (sử dụng SQL Server syntax)
taoMaPhieuTuDong: async () => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const prefix = `GH${year}${month}${day}`;
        
        // Lấy số thứ tự cuối cùng trong ngày
        const query = `
            SELECT TOP 1 MaPhieu 
            FROM PhieuGiaHan 
            WHERE MaPhieu LIKE '${prefix}%' 
            ORDER BY MaPhieu DESC
        `;
        
        const result = await pool.request().query(query);
        
        let nextNumber = 1;
        if (result.recordset.length > 0) {
            const lastMaPhieu = result.recordset[0].MaPhieu;
            const lastNumber = parseInt(lastMaPhieu.substr(prefix.length));
            nextNumber = lastNumber + 1;
        }
        
        return `${prefix}${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error in taoMaPhieuTuDong:', error);
        throw error;
    }
},

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
            
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return result.recordset[0].ChungChiID;
        } catch (error) {
            console.error('Error in layChungChiIDTheoSBD:', error);
            throw error;
        }
    }
};

module.exports = PhieuGiaHanModel;
