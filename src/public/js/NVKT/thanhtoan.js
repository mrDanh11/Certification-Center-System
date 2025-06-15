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
    tongtienLabel.textContent = TongTien;
    giamgiaLabel.textContent = TienGiam;
    thanhtienLabel.textContent = ThanhTien;
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

    cccdSpan.textContent = dataKH.CCCD || "Không rõ";
    tinhTrangSpan.textContent = dataPDK.TinhTrangThanhToan === true ? "Đã thanh toán" : "Chưa thanh toán";
    loaiKhachHangSpan.textContent = dataPDK.LoaiPhieu || "Không rõ";
    soLuongSpan.textContent = dataPDK.SoLuong || 1;
    hotenSpan.textContent = dataKH.Hoten || "Không rõ";
    emailSpan.textContent = dataKH.Email || "Không rõ";
    sdtSpan.textContent = dataKH.Dienthoai || "Không rõ";
    ngayLapSpan.textContent = ngayLap || "Không rõ";
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

function tinhTienThoi(tiennhan) {
  const thanhTienSection = document.getElementById("thanhTien");
  const tienthoiSpan = document.getElementById("tienThoi");
  const tongTien =  thanhTienSection.textContent;
  console.log(tongTien, tiennhan)
  tienthoiSpan.textContent = tiennhan - Number(tongTien);
}

async function updateTinhTrangThanhToan() {
  try {
    const TTThanhToan = document.getElementById("tinhTrang").textContent.trim();
    if (TTThanhToan === "Đã thanh toán") {
      return;
    }
    const maDangKy = document.getElementById("maDangKy").value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký trước khi xác nhận thanh toán.");
      return;
    }
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
    const TinhTrangThanhToan = document.getElementById("tinhTrang").textContent.trim();
    if (TinhTrangThanhToan === "Đã thanh toán") {
      return;
    } 
    const maDangKy = document.getElementById("maDangKy").value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký trước khi lưu hóa đơn.");
      return;
    }
    const TongTien = Number(document.getElementById("tongTien").textContent);
    const TiemGiam = Number(document.getElementById("giamGia").textContent);
    const ThanhTien = Number(document.getElementById("thanhTien").textContent);
    const TienNhan = Number(document.getElementById("tienNhan").value.trim());
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
    console.log(1);
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
            <p><strong>Họ tên:</strong> ${document.getElementById("hoten").textContent}</p>
            <p><strong>Email:</strong> ${document.getElementById("email").textContent}</p>
            <p><strong>Ngày thanh toán:</strong> ${formattedDateTime}</p>
            <p><strong>Loại khách hàng:</strong> ${document.getElementById("loaiKhachHang").textContent}</p>
            <p><strong>Số lượng người thi:</strong> ${document.getElementById("soLuong").textContent}</p>
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
            <p><strong>Tổng tiền:</strong> ${document.getElementById("tongTien").textContent}</p>
            <p><strong>Tiền nhận:</strong> ${document.getElementById("tienNhan").value}</p>
            <p><strong>Tiền giảm:</strong> ${document.getElementById("giamGia").textContent}</p>
            <p><strong>Tiền thối:</strong> ${document.getElementById("tienThoi").textContent}</p>
            <p><strong>Thành tiền:</strong> ${document.getElementById("thanhTien").textContent}</p>
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

document.addEventListener("DOMContentLoaded",function () {
  const btnTraCuu = document.getElementById("btnTraCuu");
  const maDangKyInput = document.getElementById("maDangKy");
  const tiennhanInput = document.getElementById("tienNhan");
  btnTraCuu.addEventListener("click",async function () {
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
  });

  tiennhanInput.addEventListener("input",async function () {
    const tiennhan = Number(tiennhanInput.value.trim());
    tinhTienThoi(tiennhan);
  });

  document.getElementById("btnThanhToan").addEventListener("click",async function () {
    if (!document.getElementById("tienNhan").value || document.getElementById("tienNhan").value < Number(document.getElementById("thanhTien").textContent)) {
      alert("Vui lòng nhận đủ tiền trước khi xác nhận thanh toán và in hóa đơn.");
      return;
    }
    updateTinhTrangThanhToan();
    saveHoaDon();
    printHoaDonPDF();
  });

  document.getElementById("thanhtoantructuyen").addEventListener("click",async function () {
    const loaiKhachHang = document.getElementById("loaiKhachHang").textContent.trim();
    console.log(loaiKhachHang);
    if (loaiKhachHang !== "Đơn Vị") {
      alert("Không phải là khách hàng đơn vị, không thể thanh toán trực tuyến.");
      return;
    } 
    // Chuyển hướng đến trang thanh toán trực tuyến
    location.href = `/NVKT/ThanhToan/thanhtoantructuyen`;
  });
});