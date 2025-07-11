const { pool } = require('../../../config/db');

const PhieuGiaHanModel = {
    // Lấy danh sách phiếu gia hạn với phân trang
    LayDanhSachPhieuGiaHan: async (page = 1, limit = 10, searchValue = '') => {
        try {
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
                    pgh.LoaiGiaHan as loaiGiaHan,
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
            await pool.connect()
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
            const query = `
                SELECT 
                    pgh.PhieuGiaHanID as id,
                    pdt.SoBaoDanh as sbd,
                    lt_truoc.BaiThiID as maBaiThi,
                    ts.ThiSinhID as maThiSinh,
                    FORMAT(lt_truoc.ThoiGianThi, 'dd/MM/yyyy') as ngayThiCu,
                    ts.CCCD as cccd,
                    CONVERT(VARCHAR(5), lt_truoc.ThoiGianLamBai, 108) as gioThiCu,
                    CONVERT(VARCHAR(5), lt_sau.ThoiGianLamBai, 108) as gioThiMoi,
                    ts.Hoten as hoTen,
                    lt_truoc.DiaDiemThi + ' - ' + ISNULL(pt.TenPhong, N'Phòng chưa xác định') as diaDiemCu,
                    lt_sau.DiaDiemThi + ' - ' + ISNULL(pt.TenPhong, N'Phòng chưa xác định') as diaDiemMoi,
                    cc.Gia as giaChungChi,
                    CASE 
                        WHEN pgh.TinhTrang = N'Chờ duyệt' THEN N'Bệnh nặng'
                        ELSE N'Lý do khác'
                    END as liDoGiaHan,
                    pgh.LoaiGiaHan as loaiGiaHan,
                    ISNULL(FORMAT(lt_sau.ThoiGianThi, 'yyyy-MM-dd'), '') as ngayThayThe,
                    pgh.TinhTrang
                FROM PhieuGiaHan pgh
                INNER JOIN PhieuDangKy pd ON pgh.PhieuID = pd.PhieuID
                INNER JOIN ThiSinh ts ON pd.PhieuID = ts.PhieuID
                INNER JOIN PhieuDuThi pdt ON ts.ThiSinhID = pdt.ThiSinhID AND ts.PhieuID = pdt.PhieuID
                INNER JOIN LichThi lt_truoc ON pgh.LichThiTruoc = lt_truoc.BaiThiID
                LEFT JOIN LichThi lt_sau ON pgh.LichThiSau = lt_sau.BaiThiID
                LEFT JOIN PhongThi pt ON lt_truoc.PhongThiID = pt.PhongThiID
                LEFT JOIN ChungChi cc On lt_sau.ChungChiID = cc.ChungChiID
                WHERE pgh.PhieuGiaHanID = ${id}
            `;
            await pool.connect()
            const result = await pool.request().query(query);
            if (result.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            return result.recordset[0];
            
        } catch (err) {
            throw new Error('Error fetching PhieuGiaHan detail: ' + err.message);
        }
    },

    // Duyệt phiếu gia hạn
    DuyetPhieuGiaHan: async (id, liDoGiaHan, ngayThayThe) => {
        try {
            console.log('DuyetPhieuGiaHan - Params:', { id, liDoGiaHan, ngayThayThe });
            
            // Kiểm tra phiếu gia hạn tồn tại và trạng thái hiện tại
            const checkQuery = `
                SELECT PhieuGiaHanID, TinhTrang 
                FROM PhieuGiaHan 
                WHERE PhieuGiaHanID = ${id}
            `;
            await pool.connect()
            const checkResult = await pool.request().query(checkQuery);
            
            if (checkResult.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            
            const currentStatus = checkResult.recordset[0].TinhTrang;
            // console.log('Current status:', currentStatus);
            
            let newStatus;
            
            // Logic duyệt theo trạng thái hiện tại
            // Theo nghiệp vụ mới: "Chờ duyệt" và "Đã thanh toán" đều có thể được duyệt thành "Đã duyệt"
            if (currentStatus === 'Chờ duyệt' || currentStatus === 'Đã thanh toán') {
                newStatus = 'Đã duyệt';
            } else {
                throw new Error(`Không thể duyệt phiếu gia hạn ở trạng thái: ${currentStatus}`);
            }
            
            // Cập nhật trạng thái
            const updateQuery = `
                UPDATE PhieuGiaHan 
                SET TinhTrang = N'${newStatus}'
                WHERE PhieuGiaHanID = ${id}
            `;
            
            console.log('Executing query:', updateQuery);
            console.log('Chuyển trạng thái từ:', currentStatus, '→', newStatus);
            await pool.connect()
            const result = await pool.request().query(updateQuery);
            
            console.log('Update result:', result);
            
            return result.rowsAffected[0] > 0;
            
        } catch (err) {
            console.error('Error in DuyetPhieuGiaHan:', err);
            throw new Error('Error approving PhieuGiaHan: ' + err.message);
        }
    },

    // Từ chối phiếu gia hạn
    TuChoiPhieuGiaHan: async (id, lyDoTuChoi) => {
        try {
            console.log('TuChoiPhieuGiaHan - Params:', { id, lyDoTuChoi });
            
            // Kiểm tra phiếu gia hạn tồn tại và ở trạng thái chờ duyệt
            const checkQuery = `
                SELECT PhieuGiaHanID, TinhTrang 
                FROM PhieuGiaHan 
                WHERE PhieuGiaHanID = ${id}
            `;
            await pool.connect()
            const checkResult = await pool.request().query(checkQuery);
            
            if (checkResult.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            
            if (checkResult.recordset[0].TinhTrang !== 'Chờ duyệt') {
                throw new Error('Phiếu gia hạn không ở trạng thái chờ duyệt');
            }
            
            // Cập nhật trạng thái
            const updateQuery = `
                UPDATE PhieuGiaHan 
                SET TinhTrang = N'Từ chối'
                WHERE PhieuGiaHanID = ${id}
            `;
            
            console.log('Executing reject query:', updateQuery);
            await pool.connect()
            const result = await pool.request().query(updateQuery);
            
            console.log('Reject result:', result);
            
            return result.rowsAffected[0] > 0;
            
        } catch (err) {
            console.error('Error in TuChoiPhieuGiaHan:', err);
            throw new Error('Error rejecting PhieuGiaHan: ' + err.message);
        }
    },
    CapNhatDaDuyet: async (id) => {
    try {
        const updateQuery = `
            UPDATE PhieuGiaHan
            SET TinhTrang = N'Đã duyệt'
            WHERE PhieuGiaHanID = ${id}
        `;
        await pool.connect();
        const result = await pool.request().query(updateQuery);
        return result.rowsAffected[0] > 0;
    } catch (err) {
        throw new Error('Error updating to Đã duyệt: ' + err.message);
    }
},
    // Cập nhật trạng thái thanh toán
    CapNhatThanhToan: async (id) => {
        try {
            console.log('CapNhatThanhToan - Params:', { id, soTien, tienNhan, tienThoi, phuongThucThanhToan });
            
            // Kiểm tra phiếu gia hạn tồn tại và trạng thái
            const checkQuery = `
                SELECT PhieuGiaHanID, TinhTrang 
                FROM PhieuGiaHan 
                WHERE PhieuGiaHanID = ${id}
            `;
            await pool.connect()
            const checkResult = await pool.request().query(checkQuery);
            
            if (checkResult.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu gia hạn');
            }
            
            const currentStatus = checkResult.recordset[0].TinhTrang;
            if (currentStatus === 'Đã thanh toán') {
                throw new Error('Phiếu gia hạn đã được thanh toán');
            }
            
            if (currentStatus === 'Từ chối') {
                throw new Error('Phiếu gia hạn đã bị từ chối, không thể thanh toán');
            }
            
            if (currentStatus !== 'Chờ duyệt' && currentStatus !== 'Đã duyệt') {
                throw new Error('Phiếu gia hạn không ở trạng thái có thể thanh toán');
            }
            
            // Cập nhật trạng thái thanh toán
            const updateQuery = `
                UPDATE PhieuGiaHan 
                SET TinhTrang = N'Đã thanh toán'
                WHERE PhieuGiaHanID = ${id}
            `;
            
            console.log('Executing payment update query:', updateQuery);
            
            const result = await pool.request().query(updateQuery);
            
            console.log('Payment update result:', result);
            
            return result.rowsAffected[0] > 0;
            
        } catch (err) {
            console.error('Error in CapNhatThanhToan:', err);
            throw new Error('Error updating payment: ' + err.message);
        }
    }
};

module.exports = PhieuGiaHanModel;
