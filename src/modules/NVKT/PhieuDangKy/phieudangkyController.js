const PhieuDangKy = require('./phieudangkyModel');
const KhachHangModel = require('../KhachHang/khachhangModel');
const phieudangkyController = {
  LayThongTinDK: async (req, res) => {
    try {
      const { maDangKy } = req.query;
      const infoDK = await PhieuDangKy.LayThongTinDK(maDangKy);

      if (!infoDK || infoDK.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy phiếu đăng ký" });
      }

      return res.status(200).json(infoDK[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  XacNhanThanhToan: async (req, res) => {
    try {
      const { maDangKy } = req.query;
      const { TinhTrangThanhToan } = req.body;
      const result = await PhieuDangKy.XacNhanThanhToan(maDangKy, TinhTrangThanhToan);
      if (result) {
        res.json({ message: 'Cập nhật thành công' });
      } else {
        res.status(400).json({ error: 'Cập nhật không thành công' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  HuyPhieuDangKy: async (req, res) => {
    try {
      const { maDangKy } = req.query;
      const { TinhTrangHuy } = req.body;
      const result = await PhieuDangKy.HuyPhieuDangKy(maDangKy, TinhTrangHuy);
      if (result) {
        res.json({ message: 'Hủy phiếu đăng ký thành công' });
      } else {
        res.status(400).json({ error: 'Hủy phiếu đăng ký không thành công' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  LayDSChuaThanhToan: async (req, res) => {
    try {
      const { maDangKy, ngayLap } = req.query;
      const infoDK = await PhieuDangKy.LayDSChuaThanhToan(maDangKy, ngayLap);

      if (!infoDK || infoDK.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy phiếu đăng ký" });
      }

      res.json(infoDK);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  LayDanhSachDK: async (req, res) => {
    try {
      const infoDK = await PhieuDangKy.LayDanhSachDK();

      if (!infoDK || infoDK.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy phiếu đăng ký" });
      }

      res.json(infoDK);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  XacNhanThanhToan: async (req, res) => {
    try {
      const { maDangKy } = req.query;
      const { TinhTrangThanhToan } = req.body;
      const result = await PhieuDangKy.XacNhanThanhToan(maDangKy, TinhTrangThanhToan);
      if (result) {
        res.json({ message: 'Cập nhật thành công' });
      } else {
        res.status(400).json({ error: 'Cập nhật không thành công' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  HuyPhieuDangKy: async (req, res) => {
    try {
      const { maDangKy } = req.query;
      const { TinhTrangHuy } = req.body;
      const result = await PhieuDangKy.HuyPhieuDangKy(maDangKy, TinhTrangHuy);
      if (result) {
        res.json({ message: 'Hủy phiếu đăng ký thành công' });
      } else {
        res.status(400).json({ error: 'Hủy phiếu đăng ký không thành công' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  TaoPhieuDangKy: async (req, res) => {
    const { khachHangID, loaiPhieu, baiThiInfo, soLuong, NVTiepNhan } = req.body;

    if (!khachHangID) {
      return res.status(400).json({ error: 'KhachHangID is required' });
    }

    if (!loaiPhieu) {
      return res.status(400).json({ error: 'loaiPhieu is required' });
    }

    if (loaiPhieu === "Đơn Vị") {
      if (!baiThiInfo) {
        return res.status(400).json({ error: 'baiThiInfo is required' });
      }
      if (!baiThiInfo.loaiBaiThi) {
        return res.status(400).json({ error: 'loaiBaiThi is required' });
      }
      if (!baiThiInfo.ngayThi) {
        return res.status(400).json({ error: 'ngayThi is required' });
      }
      if (!baiThiInfo.yeuCau) {
        return res.status(400).json({ error: 'yeuCau is required' });
      }
      if (!soLuong) {
        return res.status(400).json({ error: 'soLuong is required' });
      }
    }

    // TODO: add nhan vien tiep nhan lap 
    const result = await PhieuDangKy.TaoPhieuDangKy(
      khachHangID,
      loaiPhieu,
      baiThiInfo,
      soLuong,
      NVTiepNhan
    );

    if (result.success) {
      res.status(201).json({ phieuID: result.phieuID });
    } else {
      res.status(500).json({ error: result.error + 'In controller' });
    }
  },
}
module.exports = phieudangkyController;
