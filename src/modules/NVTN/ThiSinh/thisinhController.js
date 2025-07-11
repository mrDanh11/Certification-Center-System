const thisinh = require('./thisinhModel');
const PhieuGiaHanModel = require('../PhieuGiaHan/phieugiahanModel');
const thisinhController = {
      // Tìm kiếm thí sinh theo SBD
      // Lấy chứng chỉ ID theo SBD
      // Tìm thông tin thí sinh theo SBD
      timThongTinThiSinh: async (req, res) => {
          try {
              const { sbd } = req.params;
              
              if (!sbd) {
                  return res.json({
                      success: false,
                      message: 'Số báo danh không được để trống'
                  });
              }
              
              const thongTin = await thisinh.timThongTinThiSinhTheoSBD(sbd);
              
              if (!thongTin) {
                  return res.json({
                      success: false,
                      message: 'Không tìm thấy thông tin thí sinh với số báo danh này'
                  });
              }
              const validation = await PhieuGiaHanModel.ValidateGiaHan(sbd);
              res.json({
                  success: true,
                  data: thongTin,
                  validation: validation
              });
          } catch (error) {
              console.error('Error in timThongTinThiSinh:', error);
              res.json({
                  success: false,
                  message: 'Có lỗi xảy ra khi tìm kiếm thông tin thí sinh'
              });
          }
      },
      layChungChiIDTheoSBD: async (req, res) => {
          try {
              const { sbd } = req.params;
              
              if (!sbd) {
                  return res.json({
                      success: false,
                      message: 'Số báo danh không được để trống'
                  });
              }
              
              const chungChiID = await thisinh.layChungChiIDTheoSBD(sbd);
              
              if (!chungChiID) {
                  return res.json({
                      success: false,
                      message: 'Không tìm thấy chứng chỉ cho SBD này'
                  });
              }
              
              res.json({
                  success: true,
                  chungChiID: chungChiID
              });
          } catch (error) {
              console.error('Error in layChungChiIDTheoSBD:', error);
              res.json({
                  success: false,
                  message: 'Có lỗi xảy ra khi lấy chứng chỉ ID'
              });
          }
      },
    TimKiemThiSinh: async (req, res) => {
        try {
            const { sbd } = req.query;
            
            if (!sbd) {
                return res.status(400).json({ error: 'Vui lòng nhập SBD' });
            }
            
            const studentData = await thisinh.TimKiemThiSinhTheoSBD(sbd);
            
            res.json(studentData);
            
        } catch (err) {
            console.error('Error in TimKiemThiSinh:', err);
            res.status(404).json({ error: err.message });
        }
    },
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
