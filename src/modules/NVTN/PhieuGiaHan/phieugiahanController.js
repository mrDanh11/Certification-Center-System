const lichthi = require('../../NVKT/LichThi/lichthiModel');
const PhieuGiaHanModel = require('./phieugiahanModel');

const phieugiahanController = {
    // Lấy danh sách phiếu gia hạn
    LayDanhSachPhieuGiaHan: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const searchValue = req.query.search || '';

            const result = await PhieuGiaHanModel.LayDanhSachPhieuGiaHan(page, limit, searchValue);
            console.log('LayDanhSachPhieuGiaHan result:', result);
            // Tạo dữ liệu phân trang
            const pages = [];
            for (let i = 1; i <= result.totalPages; i++) {
                pages.push({
                    number: i,
                    active: i === result.currentPage
                });
            }

            res.render('NVTNPage/quanligiahan', {
                phieuGiaHan: result.data,
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                pages: pages,
                isFirstPage: result.currentPage === 1,
                isLastPage: result.currentPage === result.totalPages,
                prevPage: result.currentPage > 1 ? result.currentPage - 1 : 1,
                nextPage: result.currentPage < result.totalPages ? result.currentPage + 1 : result.totalPages,
                searchValue: searchValue,
                layout: 'NVTN/NVTNmain'
            });
            
        } catch (err) {
            console.error('Error in LayDanhSachPhieuGiaHan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    LayAllGiaHan: async (req, res) => { 
      try {
        const infoGH = await PhieuGiaHanModel.LayAllGiaHan(); 
        return res.status(200).json(infoGH)
      }
      catch (err){
        return res.status(500).json({ error: err.message });
      }
    },

    // Lấy chi tiết phiếu gia hạn
    LayChiTietPhieuGiaHan: async (req, res) => {
        try {
            const { id } = req.params;
            
            const chiTietGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
            
            res.render('NVTNPage/chitietgiahan', {
                chiTietGiaHan,
                layout: 'NVTN/NVTNmain'
            });
            
        } catch (err) {
            console.error('Error in LayChiTietPhieuGiaHan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Lấy danh sách lịch thi
    LayDanhSachLichThi: async (req, res) => {
        try {
            const { giaHanId } = req.params;
            const { chungChiID } = req.query; // Lấy chungChiID từ query parameter
            
            console.log('LayDanhSachLichThi called with giaHanId:', giaHanId, 'chungChiID:', chungChiID);
            
            // Sử dụng method có sẵn trong PhieuGiaHanModel
            const lichThi = await PhieuGiaHanModel.LayDanhSachLichThi(chungChiID);
            
            res.render('NVTNPage/lichthi', {
                lichThi: lichThi,
                giaHanId: giaHanId || null,
                chungChiID: chungChiID || null,
                title: 'Chọn lịch thi thay thế',
                layout: 'NVTN/NVTNmain'
            });
            
        } catch (err) {
            console.error('Error in LayDanhSachLichThi:', err);
            res.redirect('/NVTN/quanligiahan?error=' + encodeURIComponent('Không thể tải danh sách lịch thi'));
        }
    },

    // Tìm kiếm thí sinh theo SBD
    TimKiemThiSinh: async (req, res) => {
        try {
            const { sbd } = req.query;
            
            if (!sbd) {
                return res.status(400).json({ error: 'Vui lòng nhập SBD' });
            }
            
            const studentData = await PhieuGiaHanModel.TimKiemThiSinhTheoSBD(sbd);
            
            res.json(studentData);
            
        } catch (err) {
            console.error('Error in TimKiemThiSinh:', err);
            res.status(404).json({ error: err.message });
        }
    },

    // Tạo phiếu gia hạn
    TaoPhieuGiaHan: async (req, res) => {
        try {
            console.log('TaoPhieuGiaHan request body:', req.body);
            
            const { sbd, maBaiThi, loaiGiaHan, ngayThayThe, thongTinThiSinh } = req.body;
            
            // Validate input
            if (!thongTinThiSinh) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Thiếu thông tin thí sinh' 
                });
            }
            
            if (!loaiGiaHan) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Vui lòng chọn loại gia hạn' 
                });
            }
            
            // Validate loại gia hạn
            if (!['Bình Thường', 'Đặc biệt'].includes(loaiGiaHan)) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Loại gia hạn không hợp lệ' 
                });
            }
            
            // Lấy thông tin cần thiết từ thongTinThiSinh
            const soBaoDanh = parseInt((sbd || thongTinThiSinh.sbd || '').replace(/\D/g, '')) || 0;
            if (!soBaoDanh) {
                return res.status(400).json({ 
                    success: false,
                    error: 'SBD không hợp lệ' 
                });
            }
            
            // Tìm PhieuID và LichThi hiện tại từ SBD
            const studentInfo = await PhieuGiaHanModel.TimKiemThiSinhTheoSBD(soBaoDanh.toString());
            if (!studentInfo) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Không tìm thấy thông tin thí sinh' 
                });
            }
            
            // Lấy lịch thi hiện tại của thí sinh
            const currentScheduleQuery = `
                SELECT pdt.LichThi as lichThiTruoc
                FROM PhieuDuThi pdt 
                WHERE pdt.SoBaoDanh = ${soBaoDanh}
            `;
            const scheduleResult = await PhieuGiaHanModel.executeQuery(currentScheduleQuery);
            const lichThiTruoc = scheduleResult.recordset[0]?.lichThiTruoc || 1;
            
            // Tạo phiếu gia hạn mới với cấu trúc đúng của bảng PhieuGiaHan
            const phieuGiaHanID = await PhieuGiaHanModel.TaoPhieuGiaHan(
                studentInfo.PhieuID,    // PhieuID từ thông tin thí sinh
                lichThiTruoc,           // LichThiTruoc (lịch thi hiện tại)
                maBaiThi,                   // LichThiSau (sẽ được cập nhật sau khi chọn lịch thi)
                'Chờ duyệt',           // TinhTrang
                loaiGiaHan             // LoaiGiaHan
            );
            
            res.json({ 
                success: true,
                message: 'Tạo yêu cầu gia hạn thành công',
                id: phieuGiaHanID,
                phieuGiaHanID: phieuGiaHanID
            });
            
        } catch (err) {
            console.error('Error in TaoPhieuGiaHan:', err);
            res.status(500).json({ 
                success: false,
                error: err.message || 'Lỗi server khi tạo phiếu gia hạn'
            });
        }
    },

    // Chọn lịch thi
    ChonLichThi: async (req, res) => {
        try {
            const { giaHanId } = req.params;
            const { lichThiId, scheduleData } = req.body;
            
            console.log('ChonLichThi called with:', { giaHanId, lichThiId, scheduleData });
            
            // Validate input
            if (!giaHanId || giaHanId === 'null' || giaHanId === 'undefined') {
                return res.status(400).json({ 
                    success: false,
                    error: 'Mã phiếu gia hạn không hợp lệ' 
                });
            }
            
            if (!lichThiId) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Vui lòng chọn lịch thi' 
                });
            }
            
            // Cập nhật lịch thi cho phiếu gia hạn
            const success = await PhieuGiaHanModel.CapNhatLichThi(giaHanId, lichThiId);
            
            if (success) {
                return res.status(200).json({ 
                    success: true,
                    message: 'Chọn lịch thi thành công',
                    data: {
                        giaHanId,
                        lichThiId,
                        scheduleData
                    }
                });
            } else {
                throw new Error('Không thể cập nhật lịch thi');
            }
            
        } catch (err) {
            console.error('Error in ChonLichThi:', err);
            res.status(500).json({ 
                success: false,
                error: err.message || 'Lỗi server khi chọn lịch thi'
            });
        }
    },
// Hiển thị form tạo phiếu gia hạn
hienThiFormTao: async (req, res) => {
    try {
        res.render('NVKTPage/taophieugiahan', {
            title: 'Tạo phiếu gia hạn'
        });
    } catch (error) {
        console.error('Error in hienThiFormTao:', error);
        res.status(500).render('error', { 
            message: 'Có lỗi xảy ra khi hiển thị form tạo phiếu gia hạn' 
        });
    }
},

// Tìm thông tin thí sinh theo SBD
timThongTinThiSinh: async (req, res) => {
    try {
        const { sbd } = req.params;
        
        if (!sbd) {
            return res.json({
                success: false,
                message: 'Số báo danh không được để trống'
            });
        }
        
        const thongTin = await PhieuGiaHanModel.timThongTinThiSinhTheoSBD(sbd);
        
        if (!thongTin) {
            return res.json({
                success: false,
                message: 'Không tìm thấy thông tin thí sinh với số báo danh này'
            });
        }
        const validation = await PhieuGiaHanModel.ValidateGiaHan(sbd);
        res.json({
            success: true,
            data: thongTin,
            validation: validation
        });
    } catch (error) {
        console.error('Error in timThongTinThiSinh:', error);
        res.json({
            success: false,
            message: 'Có lỗi xảy ra khi tìm kiếm thông tin thí sinh'
        });
    }
},
chiTietPhieuGiaHan: async (req, res) => {
    try {
        const { id } = req.params;
        
        // Nếu id = 'tao', hiển thị form tạo mới
        if (id === 'tao') {
            return res.render('NVTNPage/chitietgiahan', {
                title: 'Tạo phiếu gia hạn mới',
                isNewExtension: true,
                chiTietGiaHan: {}, // Empty object for new creation,
                layout: 'NVTN/NVTNmain'
            });
        }
        
        // Nếu không, lấy thông tin chi tiết phiếu gia hạn
        const chiTietGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
        
        if (!chiTietGiaHan) {
            return res.status(404).json( { 
                message: 'Không tìm thấy phiếu gia hạn' 
            });
        }
        
        res.render('NVTNPage/chitietgiahan', {
            title: 'Chi tiết phiếu gia hạn',
            isNewExtension: false,
            chiTietGiaHan: chiTietGiaHan,
            layout: 'NVTN/NVTNmain'
        });
        
    } catch (error) {
        console.error('Error in chiTietPhieuGiaHan:', error);
        res.status(500).json({ 
            message: 'Có lỗi xảy ra khi hiển thị chi tiết phiếu gia hạn' 
        });
    }
},
// API: Lấy danh sách lịch thi (trả về JSON)
// Cập nhật method APILayDanhSachLichThi:

APILayDanhSachLichThi: async (req, res) => {
    try {
        const { chungChiID } = req.params;
        const { chungChiID: queryChungChiID, page = 1, limit = 10 } = req.query;
        
        const finalChungChiID = chungChiID || queryChungChiID;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        console.log('APILayDanhSachLichThi called with:', { 
            chungChiID: finalChungChiID, 
            page: pageNum, 
            limit: limitNum,
            offset 
        });
        
        // Lấy tổng số records
        const totalCount = await PhieuGiaHanModel.DemSoLuongLichThi(finalChungChiID);
        
        // Lấy dữ liệu với phân trang
        const lichThi = await PhieuGiaHanModel.LayDanhSachLichThiPhanTrang(
            finalChungChiID, 
            offset, 
            limitNum
        );
        
        const totalPages = Math.ceil(totalCount / limitNum);
        
        res.json({
            success: true,
            data: lichThi,
            pagination: {
                currentPage: pageNum,
                totalPages: totalPages,
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            chungChiID: finalChungChiID
        });
        
    } catch (err) {
        console.error('Error in APILayDanhSachLichThi:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Không thể tải danh sách lịch thi'
        });
    }
},
// Lấy chứng chỉ ID theo SBD
layChungChiIDTheoSBD: async (req, res) => {
    try {
        const { sbd } = req.params;
        
        if (!sbd) {
            return res.json({
                success: false,
                message: 'Số báo danh không được để trống'
            });
        }
        
        const chungChiID = await PhieuGiaHanModel.layChungChiIDTheoSBD(sbd);
        
        if (!chungChiID) {
            return res.json({
                success: false,
                message: 'Không tìm thấy chứng chỉ cho SBD này'
            });
        }
        
        res.json({
            success: true,
            chungChiID: chungChiID
        });
    } catch (error) {
        console.error('Error in layChungChiIDTheoSBD:', error);
        res.json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy chứng chỉ ID'
        });
    }
},
  CapNhatLichThi: async (req, res) => {
    try {
        const { giaHanId } = req.params;
        const { lichThiId } = req.body;
        
        if (!giaHanId) {
            return res.status(400).json({
                success: false,
                message: 'giaHanId không được trống'
            });
        }

        if (!lichThiId) {
            return res.status(400).json({
                success: false,
                message: 'LichThiID không được trống'
            });
        }
        
        await PhieuGiaHanModel.CapNhatLichThi(giaHanId, lichThiId);
        
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error('Error in CapNhatLichThi:', error);
        res.json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật phiếu gia hạn'
        });
    }
},

};

module.exports = phieugiahanController;
