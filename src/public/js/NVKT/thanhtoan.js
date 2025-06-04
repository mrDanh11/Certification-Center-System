async function traCuuThongTinKhachHang(maDangKy) {
  const khachHangSection = document.getElementById("khachHangSection");
  const cccdSpan = document.getElementById("cccd");
  const tinhTrangSpan = document.getElementById("tinhTrang");
  const loaiKhachHangSpan = document.getElementById("loaiKhachHang");
  const soLuongSpan = document.getElementById("soLuong");

  try {
    const response = await fetch(`/NVKT/PhieuDangKy?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!response.ok) throw new Error("Không tìm thấy thông tin khách hàng.");

    const data = await response.json();
    // Hiển thị thông tin
    cccdSpan.textContent = data.Hoten || "Không rõ";
    tinhTrangSpan.textContent = data.TinhTrangThanhToan === true ? "Đã thanh toán" : "Chưa thanh toán";
    loaiKhachHangSpan.textContent = data.LoaiKH || "Không rõ";
    soLuongSpan.textContent = data.SoLuong || 1;

    khachHangSection.classList.remove("hidden");
  } catch (error) {
    alert(error.message);
    khachHangSection.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const btnTraCuu = document.getElementById("btnTraCuu");
  const maDangKyInput = document.getElementById("maDangKy");

  btnTraCuu.addEventListener("click", function () {
    const maDangKy = maDangKyInput.value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký.");
      return;
    }

    traCuuThongTinKhachHang(maDangKy);
  });
});
