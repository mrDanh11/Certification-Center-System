const btnDangKy_Click = async () => {
  // {
  //   "tenKhachHang": "Nguyễn Văn A",
  //   "gioiTinh": "Nam",
  //   "cccd": "012345678901",
  //   "sdt": "0912345678",
  //   "email": "a@example.com",
  //   "loaiKhachHang": "Cá nhân"
  // }

  const btnDangKy = document.querySelector('#btnDangKy');
  const originalText = btnDangKy.innerText;

  // Disable and show loading
  btnDangKy.disabled = true;
  btnDangKy.innerText = "Đang xử lý...";
  btnDangKy.classList.add("opacity-50", "cursor-not-allowed");

  const tenKhachHang = document.querySelector('#tenKhachHang')?.value?.trim();
  const gioiTinh = document.querySelector('input[name="gioiTinh"]:checked')?.value?.trim();
  const cccd = document.querySelector('#cccd')?.value?.trim();
  const sdt = document.querySelector('#sdt')?.value?.trim();
  const email = document.querySelector('#email')?.value?.trim();
  const loaiKhachHang = document.querySelector('input[name="loaiKhachHang"]:checked')?.value?.trim();

  // Validation
  if (!tenKhachHang || !gioiTinh || !cccd || !sdt || !email || !loaiKhachHang) {
    alert('⚠️ Vui lòng nhập đầy đủ thông tin khách hàng và chọn giới tính / loại khách hàng.');
    resetButton();
    return;
  }

  // Build data object
  const formData = {
    tenKhachHang,
    gioiTinh,
    cccd,
    sdt,
    email,
    loaiKhachHang
  };

  try {
    // Send to backend
    const response = await fetch('/NVTN/api/khachhang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Không thể lưu thông tin khách hàng.");
    }

    alert('🎉 Thông tin khách hàng đã được lưu!');
    console.log('✅ Kết quả:', result);

  } catch (err) {
    console.error(err);
    alert('❌ Lỗi: ' + err.message);
  } finally {
    resetButton();
  }

  function resetButton() {
    btnDangKy.disabled = false;
    btnDangKy.innerText = originalText;
    btnDangKy.classList.remove("opacity-50", "cursor-not-allowed");
  }
};

document.addEventListener("DOMContentLoaded", function() {
  const btnDangKy = document.querySelector('#btnDangKy');
  const cccdInput = document.querySelector('#cccd')
  if (btnDangKy) {
    btnDangKy.addEventListener("click", btnDangKy_Click);
  }
  cccdInput.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, '');
    console.log("Sanitized CCCD:", this.value);
  });

});


