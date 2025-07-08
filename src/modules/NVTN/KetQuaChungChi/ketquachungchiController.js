const KQCModel = require('./ketquachungchiModel');

const kqcController = {
  // 1) Trang chính “Cấp chứng chỉ”
  renderPage: (req, res) => {
    // nếu vừa lưu thành công, show alert
    const success = req.query.success === '1';
    const alertScript = success
      ? `<script>alert("Cập nhật thành công");</script>`
      : '';
    res.render('NVTNPage/ketquachungchi', {
      layout: 'NVTN/NVTNmain',
      title: 'Cấp chứng chỉ',
      scripts: alertScript + '<script src="/js/NVTN/ketquachungchi.js"></script>'
    });
  },

  // 2) API trả về JSON khách + certificates
  getData: async (req, res) => {
    const { cccd } = req.query;
    if (!cccd) return res.status(400).json({ error: 'Thiếu CCCD' });
    try {
      const kh = await KQCModel.getKhachHangByCCCD(cccd);
      if (!kh) return res.status(404).json({ error: 'Không tìm thấy khách' });
      const certs = await KQCModel.getCertificatesByKhachHang(kh.KhachHangID);
      res.json({
        customer: {
          CCCD:      cccd,
          Hoten:     kh.Hoten,
          Email:     kh.Email,
          Dienthoai: kh.Dienthoai,
          LoaiKH:    kh.LoaiKH,
          SoLuong:   certs.length
        },
        certificates: certs
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 3) Trang xác nhận “Xác nhận tình trạng chứng chỉ”
  renderConfirm: async (req, res) => {
    const { cccd, ids } = req.query;
    if (!cccd || !ids) {
      return res.redirect('/NVTN/KetQuaChungChi');
    }
    try {
      const kh = await KQCModel.getKhachHangByCCCD(cccd);
      const arr = ids.split(',');
      const detailsRaw = await KQCModel.getConfirmDetails(kh.KhachHangID, arr);
      const details = detailsRaw.map((r, i) => ({
        STT:        i+1,
        KetQuaID:   r.KetQuaID,
        CCCD:       r.CCCD,
        Hoten:      r.Hoten,
        Phai:       r.Phai,
        Diem:       r.Diem,
        KQ:         r.KQ
      }));
      res.render('NVTNPage/confirmKetQuaChungChi', {
        layout: 'NVTN/NVTNMain',
        title: 'Xác nhận tình trạng chứng chỉ',
        customer: { CCCD: cccd, Hoten: kh.Hoten, Email: kh.Email, LoaiKH: kh.LoaiKH },
        details
      });
    } catch (err) {
      res.redirect('/NVTN/KetQuaChungChi');
    }
  },

 // 4) Xử lý Lưu
  saveConfirm: async (req, res) => {
    let { ketQuaIDs } = req.body;
    if (!ketQuaIDs) {
      // không có ô nào tick thì quay về trang chính
      return res.redirect('/NVTN/KetQuaChungChi');
    }
    // nếu chỉ 1 giá trị thì nó là string, ép thành mảng
    if (!Array.isArray(ketQuaIDs)) {
      ketQuaIDs = [ketQuaIDs];
    }

    try {
      // cập nhật từng chứng chỉ thành "Đã cấp"
      await Promise.all(
        ketQuaIDs.map(id =>
          KQCModel.updateStatus(parseInt(id, 10), 'Đã cấp')
        )
      );
      // redirect về trang chính với flag success
      return res.redirect('/NVTN/KetQuaChungChi?success=1');
    } catch (err) {
      console.error('Lỗi khi lưu chứng chỉ:', err);
      return res.redirect('/NVTN/KetQuaChungChi');
    }
  }

};

module.exports = kqcController;

