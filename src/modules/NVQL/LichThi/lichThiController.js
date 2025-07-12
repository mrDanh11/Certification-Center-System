const LichThiModel = require('./lichThiModel');

const LichThiController = {
  // POST /NVQL/api/lichthi
  async taoLichThi(req, res) {
    try {
      const {
        cmbChungChiID,
        cmbThoiGianBD,
        cmbThoiGianKT,
        cmbNgayThi,
        txtDiaDiemThi,
        // txtPhongThi,
        cmbMaPhongThi
      } = req.body;
      console.log('check req.body: ', req.body)
      // chuyển sang số 
      const baiThiID = await LichThiModel.taoLichThi({
        chungChiID:       cmbChungChiID  ? parseInt(cmbChungChiID, 10) : null,
        thoiGianBD:       cmbThoiGianBD,
        thoiGianKT:       cmbThoiGianKT,
        cmbNgayThi,      // tên key trùng với input name
        txtDiaDiemThi,
        // txtPhongThi,
        cmbMaPhongThi:    cmbMaPhongThi  ? parseInt(cmbMaPhongThi, 10) : null
      });

      return res.json({ success: true, baiThiID });
    } catch (err) {
      console.error('Error create LichThi:', err);
      return res.status(500).json({ error: err.message });
    }
  },

  async ganLichThi(req, res) {
    try {
      const {
        baiThiID,
        phieuDangKy,
      } = req.body;
      console.log('Controller:', { baiThiID, phieuDangKy});
      const baithi = await LichThiModel.LichThiToiDonVi({
        baiThiID,
        phieuDangKy,
      });

      return res.json({ success: true, baithi });
    } catch (err) {
      console.error('Error gan LichThi:', err);
      return res.status(500).json({ error: err.message });
    }
  }
};

module.exports = LichThiController;
