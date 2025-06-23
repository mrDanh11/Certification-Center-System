function tinhTienBanDau(TTBaiThi, TTKhachHang) {
  let TongTien = 0;
  let TienGiam = 0;
  let ThanhTien = 0;
  for (let i = 0; i < TTBaiThi.length; i++) {
  TongTien += Number(TTBaiThi[i].Gia) || 0;
  }

  TienGiam = (TTKhachHang.SoLuong && TTKhachHang.SoLuong > 20) ? TongTien * 0.15 : TTKhachHang.SoLuong ? TongTien * 0.1 : 0;
  ThanhTien = TongTien - TienGiam;

  const tongtienLabel = document.getElementById("tongTien");
  const giamgiaLabel = document.getElementById("giamGia");
  const thanhtienLabel = document.getElementById("thanhTien");

  if (tongtienLabel && giamgiaLabel && thanhtienLabel) {
    tongtienLabel.value = TongTien;
    giamgiaLabel.value = TienGiam;
    thanhtienLabel.value = ThanhTien;
  } else {
    console.warn("Không tìm thấy thẻ DOM cần cập nhật");
  }
}


async function traCuuThongTinKhachHang(maDangKy,TTKhachHang) {
  const khachHangSection = document.getElementById("khachHangSection");
  const cccdSpan = document.getElementById("cccd");
  const tinhTrangSpan = document.getElementById("tinhTrang");
  const loaiKhachHangSpan = document.getElementById("loaiKhachHang");
  const soLuongSpan = document.getElementById("soLuong");
  const hotenSpan = document.getElementById("hoten");
  const emailSpan = document.getElementById("email");
  const sdtSpan = document.getElementById("sdt");
  const ngayLapSpan = document.getElementById("ngaylap");

  try {
    const responsePDK = await fetch(`/NVKT/PhieuDangKy?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!responsePDK.ok) throw new Error("Không tìm thấy thông tin đăng ký.");

    const dataPDK = await responsePDK.json();
    const ngayLap = dataPDK.ThoiGianLap
    ? new Date(dataPDK.ThoiGianLap).toLocaleDateString("vi-VN")
    : "Không rõ";

    const responseKH = await fetch(`/NVKT/KhachHang?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!responseKH.ok) throw new Error("Không tìm thấy thông tin khách hàng.");
    const dataKH = await responseKH.json();
    Object.assign(TTKhachHang, {...dataKH, ...dataPDK});
    TTKhachHang.ThoiGianLap = new Date(TTKhachHang.ThoiGianLap).toLocaleDateString("vi-VN")
    // Hiển thị thông tin
    cccdSpan.value = dataKH.CCCD || "Không rõ";
    tinhTrangSpan.value = dataPDK.TinhTrangThanhToan === true ? "Đã thanh toán" : "Chưa thanh toán";
    loaiKhachHangSpan.value = dataPDK.LoaiPhieu || "Không rõ";
    soLuongSpan.value = dataPDK.SoLuong || 1;
    hotenSpan.value = dataKH.Hoten || "Không rõ";
    emailSpan.value = dataKH.Email || "Không rõ";
    sdtSpan.value = dataKH.Dienthoai || "Không rõ";
    ngayLapSpan.value = ngayLap || "Không rõ";
    return true;
  } catch (error) {
    return false;
  }
}



// Hiển thị danh sách bài thi ra giao diện
async function renderDanhSachBaiThi(maDangKy, arrTTBaiThi) {
  try {
    const response = await fetch(`/NVKT/danhsachDKThi?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!response.ok) throw new Error("Không tìm thấy đăng ký bài thi nào");
    const baiThiList = await response.json();

    const baiThiDiv = document.getElementById("dsBaiThi");

    if (!baiThiList || baiThiList.length === 0) {
      baiThiDiv.innerHTML = `<div class="text-red-500">Không có bài thi nào!</div>`;
      return;
    }
    let html = '';

    for (const baithi of baiThiList) {
      try {
        const responseTT = await fetch(`/NVKT/lichthi/LayTTLichThi?maLichThi=${encodeURIComponent(baithi.BaiThiID)}`);
        if (!responseTT.ok) throw new Error("Không tìm thấy thông tin bài thi");
        const TTBaiThi = await responseTT.json();
        TTBaiThi.ThoiGianLamBai = (() => {
          const d = new Date(TTBaiThi.ThoiGianLamBai);
          const h = d.getUTCHours().toString().padStart(2, '0');
          const m = d.getUTCMinutes().toString().padStart(2, '0');
          return `${h}:${m}`;
        })();
        TTBaiThi.ThoiGianThi = new Date(TTBaiThi.ThoiGianThi).toLocaleDateString("vi-VN")
        arrTTBaiThi.push(TTBaiThi);
        html += `
          <div class="flex border p-2 space-x-4 items-center">
            <div class="flex-1 text-sm">
              <div class="font-semibold">${TTBaiThi.TenChungChi}</div>
              <div>Loại: ${TTBaiThi.LoaiChungChi} &nbsp;&nbsp;|&nbsp;&nbsp; Thời gian làm bài: ${TTBaiThi.ThoiGianLamBai}</div>
              <div>Thời gian thi: ${TTBaiThi.ThoiGianThi}</div>
              <div>Địa điểm thi: ${TTBaiThi.DiaDiemThi}</div>
            </div>
            <div class="text-right font-semibold text-sm">Giá: ${Number(TTBaiThi.Gia).toLocaleString()} VNĐ</div>
          </div>
        `;
      } catch (err) {
        html += `<div class="text-red-500">Lỗi khi tải thông tin bài thi mã: ${baithi.BaiThiID}</div>`;
        console.error("Chi tiết lỗi:", err);
      }
    }

    // html = `<div class="border mt-2 max-h-56 overflow-y-auto p-2 space-y-4 bg-white">${html}</div>`;
    baiThiDiv.innerHTML = html;

    const dangKySection = document.getElementById("dangKySection");
    dangKySection.classList.remove("hidden");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài thi:", error);
    document.getElementById("dsBaiThi").innerHTML = `<div class="text-red-500">Lỗi khi tải danh sách bài thi.</div>`;
  }
}

function txtTienNhan_Changed(tiennhan) {
  const thanhTienSection = document.getElementById("thanhTien");
  const tienthoiSpan = document.getElementById("tienThoi");
  const tongTien =  thanhTienSection.value;
  console.log(tongTien, tiennhan)
  tienthoiSpan.value = tiennhan - Number(tongTien);
}

async function updateTinhTrangThanhToan() {
  try {
    const TTThanhToan = document.getElementById("tinhTrang").value.trim();
    if (TTThanhToan === "Đã thanh toán") {
      return;
    }
    const maDangKy = document.getElementById("maDangKy").value.trim();
    const TinhTrangThanhToan = 1;
    const response = await fetch(`/NVKT/PhieuDangKy/xacnhanthanhtoan?maDangKy=${encodeURIComponent(maDangKy)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ TinhTrangThanhToan })
    });
    if (!response.ok) {
      throw new Error("Không thể cập nhật trạng thái thanh toán.");
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái thanh toán:", error);
    alert("Đã xảy ra lỗi khi cập nhật trạng thái thanh toán.");
  }
}

async function saveHoaDon(){
  try {
    const TinhTrangThanhToan = document.getElementById("tinhTrang").value.trim();
    if (TinhTrangThanhToan === "Đã thanh toán") {
      return;
    } 
    const maDangKy = document.getElementById("maDangKy").value.trim();
    const TongTien = Number(document.getElementById("tongTien").value);
    const TiemGiam = Number(document.getElementById("giamGia").value);
    const ThanhTien = Number(document.getElementById("thanhTien").value);
    const TienNhan = Number(document.getElementById("tienNhan").value.trim())||Number(document.getElementById("tienNhanDialog").value.trim());
    const HinhThucThanhToan = "Trực tiếp";
    const NVKeToanLap = sessionStorage.getItem("userID") || null;
    const response = await fetch(`/NVKT/HoaDon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ maDangKy, TongTien, TiemGiam, ThanhTien, TienNhan, NVKeToanLap,HinhThucThanhToan })
    });

    if (!response.ok) {
      throw new Error("Không thể lưu hóa đơn.");
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    alert("Thanh toán thành công!");
  } catch (error) {
    console.error("Lỗi lưu hóa đơn:", error);
    alert("Đã xảy ra lỗi khi lưu hóa đơn.");
  }
}

async function printHoaDonPDF(){
  try {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('vi-VN');
    // Hiển thị loading nếu cần
    const { jsPDF } = window.jspdf;
    // Tạo bản sao DOM của phần cần in PDF
    const contentToPrint = document.createElement("div");
    contentToPrint.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 700px; margin: auto; font-size: 14px;">
        <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px;">HÓA ĐƠN THANH TOÁN</h2>
        <hr style="margin-bottom: 20px;" />

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Thông tin khách hàng</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 8px;">
            <p><strong>Mã đăng ký:</strong> ${document.getElementById("maDangKy").value}</p>
            <p><strong>Họ tên:</strong> ${document.getElementById("hoten").value}</p>
            <p><strong>Email:</strong> ${document.getElementById("email").value}</p>
            <p><strong>Ngày thanh toán:</strong> ${formattedDateTime}</p>
            <p><strong>Loại khách hàng:</strong> ${document.getElementById("loaiKhachHang").value}</p>
            <p><strong>Số lượng người thi:</strong> ${document.getElementById("soLuong").value}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Danh sách bài thi</h3>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #fafafa;">
            ${Array.from(document.querySelectorAll("#dsBaiThi > div"))
              .map(div => `<div style="border-bottom: 1px dashed #ddd; padding: 6px 0;">${div.innerHTML}</div>`)
              .join("")}
          </div>
        </div>

        <div>
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Thông tin thanh toán</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 8px;">
            <p><strong>Tổng tiền:</strong> ${document.getElementById("tongTien").value}</p>
            <p><strong>Tiền nhận:</strong> ${document.getElementById("tienNhan").value||document.getElementById("tienNhanDialog").value}</p>
            <p><strong>Tiền giảm:</strong> ${document.getElementById("giamGia").value}</p>
            <p><strong>Tiền thối:</strong> ${document.getElementById("tienNhanDialog").value?Number(document.getElementById("tienNhanDialog").value) - Number(document.getElementById("thanhTien").value): document.getElementById("tienThoi").value}</p>
            <p><strong>Thành tiền:</strong> ${document.getElementById("thanhTien").value}</p>
          </div>
        </div>
      </div>
    `;


    // Thêm vào DOM ẩn để chụp ảnh
    contentToPrint.style.padding = "10px";
    contentToPrint.style.width = "800px";
    document.body.appendChild(contentToPrint);

    const canvas = await html2canvas(contentToPrint, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`HoaDon_${document.getElementById("maDangKy").value}.pdf`);

    // Xoá DOM tạm
    document.body.removeChild(contentToPrint);

  } catch (error) {
    console.error("Lỗi tạo PDF:", error);
    alert("Đã xảy ra lỗi khi tạo PDF.");
  }
}

async function btnTimKiem_Click() {
  const maDangKyInput = document.getElementById("maDangKy");
  const maDangKy = maDangKyInput.value.trim();
  if (!maDangKy) {
    alert("Vui lòng nhập mã đăng ký.");
    return;
  }
  let TTKhachHang = {};
  let TTBaiThi = [];
  const checkPDK = await traCuuThongTinKhachHang(maDangKy,TTKhachHang);
  if (!checkPDK) {
    alert("Không tìm thấy thông tin đăng ký hoặc khách hàng.");
    return;
  }
  await renderDanhSachBaiThi(maDangKy,TTBaiThi);
  tinhTienBanDau(TTBaiThi,TTKhachHang);
}

async function huyPhieuDangKy(maDangKy) {
  try {
    const TinhTrangHuy = 1;
    const response = await fetch(`/NVKT/PhieuDangKy/huyphieudangky?maDangKy=${encodeURIComponent(maDangKy)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ TinhTrangHuy })
    });
    if (!response.ok) {
      throw new Error("Không thể hủy phiếu đăng ký.");
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    alert("Đã hủy phiếu đăng ký thành công!");
  } catch (error) {
    console.error("Lỗi hủy phiếu đăng ký:", error);
    alert("Đã xảy ra lỗi khi hủy phiếu đăng ký.");
  }
}

async function btnThanhToan_Click() {
  const maDangKyInput = document.getElementById("maDangKy");
  const maDangKy = maDangKyInput.value.trim();
  if (!maDangKy) {
    alert("Vui lòng nhập mã đăng ký.");
    return;
  }
  if (!document.getElementById("tienNhan").value || document.getElementById("tienNhan").value < Number(document.getElementById("thanhTien").value)) {
    alert("Vui lòng nhận đủ tiền trước khi xác nhận thanh toán và in hóa đơn.");
    return;
  }
  updateTinhTrangThanhToan();
  saveHoaDon();
  printHoaDonPDF();
}

async function btnHuyPhieuDangKy_Click() {
  const maDangKyInput = document.getElementById("maDangKy");
  const maDangKy = maDangKyInput.value.trim();
    if (!maDangKy) {
    alert("Vui lòng nhập mã đăng ký.");
    return;
  }
  const NgayLapext = document.getElementById("ngaylap").value.trim();
  const [day, month, year] = NgayLapext.split('/');
  const ngayLap = new Date(`${year}-${month}-${day}`);
  const today = new Date();

  // Tính số ngày chênh lệch
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((today - ngayLap) / msPerDay);

  if (diffDays < 3) {
    alert("Thời gian đăng ký chưa đủ thời gian để hủy.");
    return;
  }
  huyPhieuDangKy(maDangKy);
  location.reload();
}

document.addEventListener("DOMContentLoaded",function () {
  const btnTraCuu = document.getElementById("btnTraCuu");
  const tiennhanInput = document.getElementById("tienNhan");
  const dialog = document.getElementById("dialogThanhToan");
  const btnDongDialog = document.getElementById("btnHuyDialog");

  // Đóng dialog khi nhấn "Hủy"
  btnDongDialog.addEventListener("click", () => {
    dialog.classList.add("hidden");
  });

  btnTraCuu.addEventListener("click",async function () {
    await btnTimKiem_Click();
  });

  tiennhanInput.addEventListener("input",async function () {
    const tiennhan = Number(tiennhanInput.value.trim());
    txtTienNhan_Changed(tiennhan);
  });

  document.getElementById("huyPhieuDangKy").addEventListener("click",async function () {
    if(document.getElementById("cccd").value.trim() === "Không có"){
      alert("Vui lòng chọn phiếu đăng ký.");
      return;
    }
    btnHuyPhieuDangKy_Click()
  });

  document.getElementById("btnThanhToan").addEventListener("click",async function () {
    if(document.getElementById("cccd").value.trim() === "Không có"){
      alert("Vui lòng chọn phiếu đăng ký.");
      return;
    }
    const tienNhan = Number(document.getElementById("tienNhan").value);
    if (isNaN(tienNhan)) {
      alert("Tiền nhận không hợp lệ.");
      return;
    }
    btnThanhToan_Click();
  });

  document.getElementById("thanhtoantructuyen").addEventListener("click",async function () {
    if(document.getElementById("cccd").value.trim() === "Không có"){
      alert("Vui lòng chọn phiếu đăng ký.");
      return;
    }
    loadForm();
  });
});