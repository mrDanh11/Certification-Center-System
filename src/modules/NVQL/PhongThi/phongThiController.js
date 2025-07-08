const PhongThiModel = require('./phongThiModel');

const PhongThiController = {
  // GET /NVQL/api/phongthi
  async layDSPhongThi(req, res) {
    try {
      const list = await PhongThiModel.layDSPhongThi();
      res.json(list);
    } catch (err) {
      console.error('Error in layDSPhongThi controller:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = PhongThiController;
