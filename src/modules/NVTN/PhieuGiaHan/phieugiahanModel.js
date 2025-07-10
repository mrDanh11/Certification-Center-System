const { pool } = require('../../../config/db');
const ThiSinh =  require('../ThiSinh/thisinhModel');
const PhieuGiaHanModel = {
    LayAllGiaHan: async () => {
        try {
        const stmt = `
        select * from PhieuGiaHan
        `;

        await pool.connect();
        const result = await pool.request()
            .query(stmt);

        if (result.recordset.length <= 0){
            throw new Error('no gia han found')
        }
        await pool.close();
        return result.recordset;
        }
        catch (err){
                throw new Error('Error get information in gia han: ' + err.message);
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
                LEFT JOIN PhongThi pt ON lt_truoc.PhongThiID = pt.PhongThiID
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
                    pdt.SoBaoDanh as sbd,
                    lt_truoc.BaiThiID as maBaiThi,
                    ts.ThiSinhID as maThiSinh,
                    FORMAT(lt_truoc.ThoiGianThi, 'dd/MM/yyyy') as ngayThiCu,
                    ts.CCCD as cccd,
                    CONVERT(VARCHAR(5), lt_truoc.ThoiGianLamBai, 108) as gioThiCu,
                    ts.Hoten as hoTen,
                    lt_truoc.DiaDiemThi + ' - ' + ISNULL(pt.TenPhong, N'Phòng chưa xác định') as diaDiemCu,
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
                LEFT JOIN PhongThi pt ON lt_truoc.PhongThiID = pt.PhongThiID
                WHERE pgh.PhieuGiaHanID = ${id}
            `;
            
            const result = await pool.request().query(query);
            // console.log('Query results:', result.recordset); // Debug log
            if (result.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            
            return result.recordset[0];
            
        } catch (err) {
            throw new Error('Error fetching PhieuGiaHan detail: ' + err.message);
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
            await pool.connect()
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
            console.log(query)
            await pool.connect()
            const result = await pool.request().query(query);
            return result.rowsAffected[0] > 0;
            
        } catch (err) {
            throw new Error('Error updating PhieuGiaHan: ' + err.message);
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
        await pool.connect()
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
// Kiểm tra số lần gia hạn của một phiếu đăng ký
KiemTraSoLanGiaHan: async (phieuID) => {
    try {
        await pool.connect();
        
        const query = `
            SELECT COUNT(*) as soLanGiaHan
            FROM PhieuGiaHan 
            WHERE PhieuID = @phieuID
        `;
        
        const request = pool.request();
        request.input('phieuID', phieuID);
        
        const result = await request.query(query);
        return result.recordset[0].soLanGiaHan;
        
    } catch (error) {
        console.error('Error in KiemTraSoLanGiaHan:', error);
        throw error;
    }
},

// Kiểm tra thời gian còn lại đến giờ thi
KiemTraThoiGianGiaHan: async (sbd) => {
    try {
        await pool.connect();
        
        const soBaoDanh = parseInt(sbd.replace(/\D/g, '')) || sbd;
        
        const query = `
            SELECT 
                lt.ThoiGianThi,
                lt.ThoiGianLamBai,
                DATEDIFF(HOUR, GETDATE(), 
                    CAST(CONCAT(
                        FORMAT(lt.ThoiGianThi, 'yyyy-MM-dd'), 
                        ' ', 
                        CONVERT(VARCHAR(8), lt.ThoiGianLamBai, 108)
                    ) AS DATETIME)
                ) as gioConLai
            FROM ThiSinh ts
            INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
            INNER JOIN LichThi lt ON pdt.LichThi = lt.BaiThiID
            WHERE pdt.SoBaoDanh = @soBaoDanh
        `;
        
        const request = pool.request();
        request.input('soBaoDanh', soBaoDanh);
        
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            throw new Error('Không tìm thấy lịch thi của thí sinh');
        }
        
        return result.recordset[0];
        
    } catch (error) {
        console.error('Error in KiemTraThoiGianGiaHan:', error);
        throw error;
    }
},



// Validation tổng hợp trước khi tạo phiếu gia hạn
ValidateGiaHan: async (sbd) => {
    try {
        const errors = [];
        
        // 1. Kiểm tra thông tin cơ bản
        const phieuInfo = await ThiSinh.LayPhieuIDTheoSBD(sbd);
        const phieuID = phieuInfo.PhieuID;
        
        // 2. Kiểm tra số lần gia hạn (tối đa 2 lần)
        const soLanGiaHan = await PhieuGiaHanModel.KiemTraSoLanGiaHan(phieuID);
        if (soLanGiaHan >= 2) {
            errors.push({
                field: 'soLanGiaHan',
                message: `Khách hàng "${phieuInfo.tenKhachHang}" đã gia hạn ${soLanGiaHan} lần. Không thể gia hạn thêm (tối đa 2 lần).`
            });
        }
        
        // // 3. Kiểm tra thời gian (ít nhất 24 giờ trước khi thi)
        // const thoiGianInfo = await PhieuGiaHanModel.KiemTraThoiGianGiaHan(sbd);
        // if (thoiGianInfo.gioConLai < 24) {
        //     const ngayThi = new Date(thoiGianInfo.ThoiGianThi).toLocaleDateString('vi-VN');
        //     const gioThi = thoiGianInfo.ThoiGianLamBai;
        //     errors.push({
        //         field: 'thoiGian',
        //         message: `Chỉ còn ${thoiGianInfo.gioConLai} giờ đến kỳ thi (${ngayThi} lúc ${gioThi}). Cần ít nhất 24 giờ để gia hạn.`
        //     });
        // }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            phieuID: phieuID,
            soLanGiaHanHienTai: soLanGiaHan,
            //gioConLai: thoiGianInfo.gioConLai,
            tenKhachHang: phieuInfo.tenKhachHang
        };
        
    } catch (error) {
        console.error('Error in ValidateGiaHan:', error);
        throw error;
    }
},
    
    
};

module.exports = PhieuGiaHanModel;
