const LichThiModel = require('./lichthiModel');

const lichthiController = {
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
