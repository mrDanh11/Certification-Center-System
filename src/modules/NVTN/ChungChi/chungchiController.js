const ChungChi = require('./chungchiModel');
const chungchiController = {
  LayDSChungChi: async (req, res) => {
    try {
      const allowedFields = ['ChungChiID', 'LoaiChungChi', 'TenChungChi', 'Gia']; // whitelist

      const requestedFields = req.query.fields
        ? req.query.fields.split(',').map(f => f.trim())
        : null;

      const fields = requestedFields
        ? requestedFields.filter(f => allowedFields.includes(f))
        : allowedFields;

      const result = await ChungChi.LayDSChungChi();

      // Filter each object to include only selected fields
      const filteredData = result.map(obj =>
        Object.fromEntries(
          fields.map(key => [key, obj[key]])
        )
      );

      if (!filteredData || filteredData.length === 0) {
        return res.status(404).json({ error: "Không lấy được danh sách chứng chỉ" });
      }

      res.status(200).json(filteredData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
}
module.exports = chungchiController;
