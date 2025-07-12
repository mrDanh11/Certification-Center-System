document.addEventListener('DOMContentLoaded', () => {
  const fld = id => document.getElementById(id);

  // khi chọn phiếu đơn vị → fill tự động
  fld('phieuDangKyInput').addEventListener('input', () => {
    const val = fld('phieuDangKyInput').value.trim();
    const opt = Array.from(document.querySelectorAll('#phieuDangKy option'))
      .find(o => o.value === val);
    if (!opt) return;

    fld('cmbChungChiID').value = opt.dataset.chungchiid || '';
    fld('txtTenDonVi').value = opt.dataset.tendonvi || '';
    fld('txtMaDonVi').value = opt.dataset.khachhangid || '';
    fld('txtTenChungChi').value = opt.dataset.tenchungchi || '';
    fld('txtNgayMongMuon').value = opt.dataset.ngaymongmuon || '';
    fld('txtSoThiSinh').value = opt.dataset.sol || '';

    // xử lý yêu cầu
    const yc = opt.dataset.yeucau;
    if (yc) {
      fld('txtYeuCau').value = yc;
      fld('yeuCauContainer').classList.remove('hidden');
    } else {
      fld('yeuCauContainer').classList.add('hidden');
    }
  });

  // xử lý khi đổi chọn nhân viên coi thi (còn bug chọn 2 lần chưa có reset)
  fld('cmbChonNhanVienCoiThi').addEventListener('change', async () => {
    const nvId = fld('cmbChonNhanVienCoiThi').value;
    const ngay = fld('cmbNgayThi').value;
    if (!nvId || !ngay) return;

    try {
      const res = await fetch(`/NVQL/api/nhanviencoithi/check?nhanVienID=${nvId}&ngayThi=${ngay}`);
      const { exists } = await res.json();
      if (exists) {
        alert('⚠️ Nhân viên này đã được phân công coi thi vào ngày ' + ngay + '. Vui lòng chọn người khác.');
        fld('cmbChonNhanVienCoiThi').value = '';
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra NV coi thi:', err);
    }
  });

  async function checkPhongThi() {
    const pID = fld('cmbChonPhongThi').value;
    const ngay = fld('cmbNgayThi').value;
    const bd = fld('cmbThoiGianBD').value;
    if (!pID || !ngay || !bd) return;

    // đảm bảo định dạng HH:mm:ss
    const gioLamBai = bd.length === 5 ? `${bd}:00` : bd;

    console.log('→ checkPhongThi', { pID, ngay, gioLamBai });

    try {
      const res = await fetch(
        `/NVQL/api/phongthi/check?` +
        `maPhongThi=${encodeURIComponent(pID)}` +
        `&ngayThi=${encodeURIComponent(ngay)}` +
        `&gioLamBai=${encodeURIComponent(gioLamBai)}` +
        `&diaDiemThi=${encodeURIComponent(fld('cmbDiaDiemThi').value)}`
      );

      if (!res.ok) throw new Error('Server trả về ' + res.status);
      const { exists } = await res.json();

      if (exists) {
        alert(
          `⚠️ Phòng thi này đã được xếp lịch vào ngày ${ngay} lúc ${bd}.` +
          ' Vui lòng chọn phòng khác.'
        );
        fld('cmbChonPhongThi').value = '';
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra phòng thi:', err);
    }
  }

  fld('cmbChonPhongThi').addEventListener('change', checkPhongThi);
  fld('cmbThoiGianBD').addEventListener('change', checkPhongThi);

  // khi submit: tính giờ kết thúc rồi gọi 2 API
  fld('formTaoLichThi').addEventListener('submit', async e => {
    e.preventDefault();

    // tính giờ kết thúc
    const [h, m] = fld('cmbThoiGianBD').value.split(':').map(Number);
    const totalM = h * 60 + m + 120;
    const eh = String(Math.floor(totalM / 60) % 24).padStart(2, '0');
    const em = String(totalM % 60).padStart(2, '0');
    const end = `${eh}:${em}`;

    // payload tạo Lịch thi
    const lichPayload = {
      cmbChungChiID: Number(fld('cmbChungChiID').value) || null,
      cmbThoiGianBD: fld('cmbThoiGianBD').value,
      cmbThoiGianKT: end,
      cmbNgayThi: fld('cmbNgayThi').value,
      txtDiaDiemThi: fld('cmbDiaDiemThi').value,
      cmbMaPhongThi: Number(fld('cmbChonPhongThi').value)
    };

    try {
      // tạo lịch thi
      let res = await fetch('/NVQL/api/lichthi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lichPayload)
      });
      if (!res.ok) throw await res.json();
      const { baiThiID } = await res.json();

      // gán nhân viên coi thi
      const nhanVienID = Number(fld('cmbChonNhanVienCoiThi').value);
      res = await fetch('/NVQL/api/nhanviencoithi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baiThiID,
          assignments: [{ nhanVienID, maPhongThi: lichPayload.cmbMaPhongThi }]
        })
      });
      if (!res.ok) throw await res.json();

      const val = fld('phieuDangKyInput').value.trim();
      res = await fetch('/NVQL/api/lichthi/GanLichThi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baiThiID,
          phieuDangKy: val,
        })
      });
      if (!res.ok) throw await res.json();

      alert('✅ Tạo lịch & gán nhân viên coi thi thành công!');
      location.reload();
    } catch (err) {
      console.error(err);
      alert('❌ Lỗi: ' + (err.error || err.message));
    }
  });
});
