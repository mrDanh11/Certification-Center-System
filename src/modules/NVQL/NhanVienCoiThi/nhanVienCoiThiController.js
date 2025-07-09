const NhanVienCoiThiModel = require('./nhanVienCoiThiModel');

const NhanVienCoiThiController = {
  async taoNhanVienCoiThi(req, res) {
    try {
      const { baiThiID, assignments } = req.body;
      if (
        !baiThiID ||
        !Array.isArray(assignments) ||
        assignments.length === 0
      ) {
        return res
          .status(400)
          .json({ error: 'Vui lòng cung cấp baiThiID và assignments' });
      }

      // ép kiểu
      const id = parseInt(baiThiID, 10);
      const list = assignments.map(a => ({
        nhanVienID: parseInt(a.nhanVienID, 10),
        // maPhongThi: parseInt(a.maPhongThi, 10)
      }));

      await NhanVienCoiThiModel.themNhanVienCoiThi(id, list);
      return res.json({ success: true });
    } catch (err) {
      console.error('Error addCoThi:', err);
      return res.status(500).json({ error: err.message });
    }
  }
};

module.exports = NhanVienCoiThiController;
