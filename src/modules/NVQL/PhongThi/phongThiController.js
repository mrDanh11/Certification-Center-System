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
  },

  async checkPhongThi(req,res){
    const { maPhongThi, ngayThi, gioLamBai, diaDiemThi } = req.query;
      if (!maPhongThi || !ngayThi || !gioLamBai || !diaDiemThi) {
        return res.status(400).json({ error: 'Thiếu tham số' });
      }
      try {
        const exists = await PhongThiModel.checkPhongThi(
          parseInt(maPhongThi,10),
          ngayThi,
          gioLamBai,   // đã là "HH:mm:ss"
          diaDiemThi
        );
        res.json({ exists });
      } catch (e) {
        console.error('Error checkPhongThi:', e);
        res.status(500).json({ error: e.message });
      }
  }
};

module.exports = PhongThiController;
