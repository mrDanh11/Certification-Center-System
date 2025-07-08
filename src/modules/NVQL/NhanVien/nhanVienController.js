const NhanVienModel = require('./nhanVienModel');

const NhanVienController = {
  // API GET /NVQL/api/nhanvien
  async layDSNhanVien(req, res) {
    try {
      const list = await NhanVienModel.layDSNhanVien();
      res.json(list);
    } catch (err) {
      console.error('Error in layDSNhanVien controller:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = NhanVienController;