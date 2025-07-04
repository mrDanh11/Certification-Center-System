const thisinh = require('./thisinhModel');

const thisinhController = {
  themThiSinh: async (req, res) => {
    // { body structure guide
    //   "phieuID": 5,
    //     "thiSinhList": [
    //       { "hoTen": "Nguyen Van A", "cccd": "123456789", "phai": "Nam" },
    //       { "hoTen": "Tran Thi B", "cccd": "987654321", "phai": "Nữ" }
    //     ]
    // }
    try {
      const { phieuID, thiSinhList } = req.body;

      if (!phieuID || !Array.isArray(thiSinhList) || thiSinhList.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid data' });
      }

      for (const thiSinh of thiSinhList) {
        if (!thiSinh.cccd || !thiSinh.hoTen || !thiSinh.phai) {
          throw new Error('Thông tin thí sinh không hợp lệ.');
        }
      }

      const result = await thisinh.ThemThiSinh(phieuID, thiSinhList);

      if (result.success) {
        return res.status(201).json({ message: 'ThiSinh inserted successfully' });
      } else {
        throw new error(result.error);
      }
    }
    catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
module.exports = thisinhController;
