const LichThiModel = require('./lichthiModel');

const lichthiController = {
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
            const totalCount = await LichThiModel.DemSoLuongLichThi(finalChungChiID);
            
            // Lấy dữ liệu với phân trang
            const lichThi = await LichThiModel.LayDanhSachLichThiPhanTrang(
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
    // Lấy danh sách lịch thi
    LayDanhSachLichThi: async (req, res) => {
        try {
            const { giaHanId } = req.params;
            const { chungChiID } = req.query; // Lấy chungChiID từ query parameter
            
            console.log('LayDanhSachLichThi called with giaHanId:', giaHanId, 'chungChiID:', chungChiID);
            
            // Sử dụng method có sẵn trong PhieuGiaHanModel
            const lichThi = await LichThiModel.LayDanhSachLichThi(chungChiID);
            
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
    // Lấy danh sách lịch thi cho gia hạn
    LayDanhSachLichThiGiaHan: async (req, res) => {
        try {
            const { giaHanId } = req.params;
            
            if (!giaHanId) {
                return res.status(400).json({ error: 'Thiếu ID phiếu gia hạn' });
            }
            
            const lichThi = await LichThiModel.LayDanhSachLichThiGiaHan(giaHanId);
            
            res.render('NVTNPage/lichthi', {
                lichThi,
                giaHanId,
                title: 'Chọn lịch thi gia hạn',
                layout: 'NVTN/NVTNmain'
            });
            
        } catch (err) {
            console.error('Error in LayDanhSachLichThiGiaHan:', err);
            res.status(500).json({ 
            error: err.message,
            message: 'Không thể tải danh sách lịch thi'
        });
        }
    },

    LayAllLichThi: async (req, res) => { 
      try {
        const infoLT = await LichThiModel.LayAllLichThi(); 
        return res.status(200).json(infoLT)
      }
      catch (err){
        return res.status(500).json({ error: err.message });
      }
    },

    // Lấy tất cả lịch thi
    LayTatCaLichThi: async (req, res) => {
        try {
            const lichThi = await LichThiModel.LayTatCaLichThi();
            
            res.render('NVTNPage/lichthi', {
                lichThi,
                title: 'Danh sách lịch thi',
                layout: 'NVTN/NVTNmain'
            });
            
        } catch (err) {
            console.error('Error in LayTatCaLichThi:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // API: Lấy lịch thi theo loại chứng chỉ
    APILayLichThiTheoLoai: async (req, res) => {
        try {
            const { chungChiId } = req.params;
            
            const lichThi = await LichThiModel.LayLichThiTheoLoaiChungChi(chungChiId);
            
            res.json({
                success: true,
                data: lichThi
            });
            
        } catch (err) {
            console.error('Error in APILayLichThiTheoLoai:', err);
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    // API: Lấy chi tiết lịch thi
    APILayChiTietLichThi: async (req, res) => {
        try {
            const { lichThiId } = req.params;
            
            const lichThi = await LichThiModel.LayChiTietLichThi(lichThiId);
            
            res.json({
                success: true,
                data: lichThi
            });
            
        } catch (err) {
            console.error('Error in APILayChiTietLichThi:', err);
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    }
};

module.exports = lichthiController;
