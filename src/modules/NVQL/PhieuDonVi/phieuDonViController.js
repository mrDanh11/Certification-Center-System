const PhieuDonViModel = require('./phieuDonViModel');

module.exports = {
  // API: GET /NVQL/api/phieudonvi
  async layDanhSachPhieuDonVi(req, res) {
    try {
      const list = await PhieuDonViModel.layDanhSachPhieuDonVi();
      res.json(list);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // API: GET /NVQL/api/phieudonvi/:id
  async layChiTietPhieuDonVi(req, res) {
    try {
      const phieuID = parseInt(req.params.id, 10);
      const detail = await PhieuDonViModel.layChiTietPhieuDonVi(phieuID);
      if (!detail) return res.status(404).json({ error: 'Không tìm thấy phiếu' });
      res.json(detail);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};
