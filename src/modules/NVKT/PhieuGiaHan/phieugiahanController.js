const PhieuGiaHanModel = require('./PhieuGiaHanModel');

const phieugiahanController = {
    // Lấy danh sách phiếu gia hạn
    LayDanhSachPhieuGiaHan: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const searchValue = req.query.search || '';

            const result = await PhieuGiaHanModel.LayDanhSachPhieuGiaHan(page, limit, searchValue);
            
            // Tạo dữ liệu phân trang
            const pages = [];
            for (let i = 1; i <= result.totalPages; i++) {
                pages.push({
                    number: i,
                    active: i === result.currentPage
                });
            }

            res.render('NVKTPage/quanligiahan', {
                phieuGiaHan: result.data,
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                pages: pages,
                isFirstPage: result.currentPage === 1,
                isLastPage: result.currentPage === result.totalPages,
                prevPage: result.currentPage > 1 ? result.currentPage - 1 : 1,
                nextPage: result.currentPage < result.totalPages ? result.currentPage + 1 : result.totalPages,
                searchValue: searchValue,
                layout: 'NVKT/NVKTMain'
            });
            
        } catch (err) {
            console.error('Error in LayDanhSachPhieuGiaHan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Lấy chi tiết phiếu gia hạn
    LayChiTietGiaHan: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('LayChiTietGiaHan - ID:', id);
            
            const chiTietGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
            console.log('Chi tiết gia hạn từ database:', chiTietGiaHan);
            
            res.render('NVKTPage/chitietgiahan', {
                chiTietGiaHan,
                layout: 'NVKT/NVKTMain'
            });
            
        } catch (err) {
            console.error('Error in LayChiTietGiaHan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Duyệt gia hạn
    DuyetGiaHan: async (req, res) => {
        try {
            const { id } = req.params;
            const { extensionReason, replacementDate } = req.body;
            
            console.log('DuyetGiaHan - ID:', id);
            console.log('DuyetGiaHan - Body:', req.body);
            
            // Kiểm tra phiếu gia hạn tồn tại
            const phieuGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
            console.log('Phiếu gia hạn tìm thấy:', phieuGiaHan);
            
            if (!phieuGiaHan) {
                console.log('Không tìm thấy phiếu gia hạn với ID:', id);
                return res.status(404).json({ error: 'Không tìm thấy phiếu gia hạn' });
            }
            
            console.log('Trạng thái hiện tại:', phieuGiaHan.TinhTrang);
            console.log('Kiểm tra trạng thái === "Chờ duyệt":', phieuGiaHan.TinhTrang === 'Chờ duyệt');
            
            // Kiểm tra trạng thái có thể duyệt
            // Theo nghiệp vụ: "Chờ duyệt" và "Đã thanh toán" có thể được duyệt
            if (phieuGiaHan.TinhTrang !== 'Chờ duyệt' && phieuGiaHan.TinhTrang !== 'Đã thanh toán') {
                console.log('Phiếu gia hạn không ở trạng thái có thể duyệt. Trạng thái hiện tại:', phieuGiaHan.TinhTrang);
                
                let errorMessage = '';
                switch(phieuGiaHan.TinhTrang) {
                    case 'Đã duyệt':
                        errorMessage = 'Phiếu gia hạn đã được duyệt trước đó';
                        break;
                    case 'Từ chối':
                        errorMessage = 'Phiếu gia hạn đã bị từ chối, không thể duyệt';
                        break;
                    default:
                        errorMessage = `Phiếu gia hạn đang ở trạng thái "${phieuGiaHan.TinhTrang}", không thể duyệt`;
                }
                
                return res.status(400).json({ 
                    success: false,
                    error: errorMessage
                });
            }
            
            const success = await PhieuGiaHanModel.DuyetPhieuGiaHan(id, extensionReason, replacementDate);
            
            if (success) {
                res.json({ 
                    success: true,
                    message: 'Duyệt gia hạn thành công' 
                });
            } else {
                res.status(500).json({ error: 'Không thể duyệt phiếu gia hạn' });
            }
            
        } catch (err) {
            console.error('Error in DuyetGiaHan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Từ chối gia hạn
    TuChoiGiaHan: async (req, res) => {
        try {
            const { id } = req.params;
            const { lyDoTuChoi } = req.body;
            
            console.log('TuChoiGiaHan - ID:', id);
            console.log('TuChoiGiaHan - Body:', req.body);
            
            // Kiểm tra phiếu gia hạn tồn tại
            const phieuGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
            if (!phieuGiaHan) {
                return res.status(404).json({ error: 'Không tìm thấy phiếu gia hạn' });
            }
            
            // Kiểm tra trạng thái có thể từ chối
            if (phieuGiaHan.TinhTrang !== 'Chờ duyệt') {
                return res.status(400).json({ error: 'Phiếu gia hạn không ở trạng thái chờ duyệt' });
            }
            
            const success = await PhieuGiaHanModel.TuChoiPhieuGiaHan(id, lyDoTuChoi);
            
            if (success) {
                res.json({ 
                    success: true,
                    message: 'Từ chối gia hạn thành công' 
                });
            } else {
                res.status(500).json({ error: 'Không thể từ chối phiếu gia hạn' });
            }
            
        } catch (err) {
            console.error('Error in TuChoiGiaHan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Lấy thông tin thanh toán gia hạn
    LayThongTinThanhToan: async (req, res) => {
        try {
            const { id } = req.params;
            
            const chiTietGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
            
            // Kiểm tra trạng thái có thể thanh toán
            if (chiTietGiaHan.TinhTrang === 'Đã thanh toán') {
                return res.status(400).render('error', {
                    message: 'Phiếu gia hạn đã được thanh toán',
                    layout: 'NVKT/NVKTMain'
                });
            }
            
            if (chiTietGiaHan.TinhTrang === 'Từ chối') {
                return res.status(400).render('error', {
                    message: 'Phiếu gia hạn đã bị từ chối, không thể thanh toán',
                    layout: 'NVKT/NVKTMain'
                });
            }
            
            // Chuyển đổi thông tin cho trang thanh toán
            const thongTinGiaHan = {
                id: chiTietGiaHan.id,
                sbd: chiTietGiaHan.sbd,
                maBaiThi: chiTietGiaHan.maBaiThi,
                maThiSinh: chiTietGiaHan.maThiSinh,
                ngayThiMoi: chiTietGiaHan.ngayThayThe,
                cccd: chiTietGiaHan.cccd,
                gioThiMoi: '14:00', // Có thể lấy từ lịch thi mới
                hoTen: chiTietGiaHan.hoTen,
                diaDiemMoi: 'Phòng 102 - Tòa B' // Có thể lấy từ lịch thi mới
            };
            
            const thanhToan = {
                soTien: 500000, // Phí gia hạn cố định hoặc tính toán
                tienNhan: 0,
                tienThoi: 0
            };

            res.render('NVKTPage/thanhtoangiahan', {
                thongTinGiaHan,
                thanhToan,
                layout: 'NVKT/NVKTMain'
            });
            
        } catch (err) {
            console.error('Error in LayThongTinThanhToan:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Xử lý thanh toán gia hạn
    XuLyThanhToan: async (req, res) => {
        try {
            const { id } = req.params;
            const { soTien, tienNhan, tienThoi, phuongThucThanhToan } = req.body;
            
            // Kiểm tra phiếu gia hạn tồn tại và trạng thái
            const chiTietGiaHan = await PhieuGiaHanModel.LayChiTietPhieuGiaHan(id);
            
            if (!chiTietGiaHan) {
                return res.status(404).json({ error: 'Không tìm thấy phiếu gia hạn' });
            }
            
            // Kiểm tra trạng thái có thể thanh toán
            if (chiTietGiaHan.TinhTrang === 'Đã thanh toán') {
                return res.status(400).json({ error: 'Phiếu gia hạn đã được thanh toán' });
            }
            
            if (chiTietGiaHan.TinhTrang === 'Từ chối') {
                return res.status(400).json({ error: 'Phiếu gia hạn đã bị từ chối, không thể thanh toán' });
            }
            
            if (chiTietGiaHan.TinhTrang !== 'Chờ duyệt' && chiTietGiaHan.TinhTrang !== 'Đã duyệt') {
                return res.status(400).json({ error: 'Phiếu gia hạn không ở trạng thái có thể thanh toán' });
            }
            
            // Validate payment
            if (tienNhan < soTien) {
                return res.status(400).json({ error: 'Số tiền nhận không đủ' });
            }
            
            const success = await PhieuGiaHanModel.CapNhatThanhToan(id, soTien, tienNhan, tienThoi, phuongThucThanhToan);
            
            if (success) {
                res.json({ 
                    message: 'Thanh toán gia hạn thành công',
                    data: {
                        id,
                        soTien,
                        tienNhan,
                        tienThoi,
                        phuongThucThanhToan,
                        thoiGianThanhToan: new Date()
                    }
                });
            } else {
                res.status(500).json({ error: 'Không thể cập nhật thanh toán' });
            }
            
        } catch (err) {
            console.error('Error in XuLyThanhToan:', err);
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = phieugiahanController;