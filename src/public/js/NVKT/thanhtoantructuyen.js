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
  const tinhTrangSpan = document.getElementById("tinhTrang");
  const soLuongSpan = document.getElementById("soLuong");
  const hotenSpan = document.getElementById("hoten");
  const emailSpan = document.getElementById("email");
  try {
    const responsePDK = await fetch(`/NVKT/PhieuDangKy?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!responsePDK.ok) throw new Error("Không tìm thấy thông tin đăng ký.");
    const dataPDK = await responsePDK.json();
    if(dataPDK.LoaiPhieu === "Cá Nhân") return false;

    const responseKH = await fetch(`/NVKT/KhachHang?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!responseKH.ok) throw new Error("Không tìm thấy thông tin khách hàng.");

    const dataKH = await responseKH.json();
    Object.assign(TTKhachHang, {...dataKH, ...dataPDK});
    TTKhachHang.ThoiGianLap = new Date(TTKhachHang.ThoiGianLap).toLocaleDateString("vi-VN")
    // Hiển thị thông tin
     tinhTrangSpan.textContent = dataPDK.TinhTrangThanhToan === true ? "Đã thanh toán" : "Chưa thanh toán";
    soLuongSpan.textContent = dataPDK.SoLuong || 1;
    hotenSpan.textContent = dataKH.Hoten || "Không rõ";
    emailSpan.textContent = dataKH.Email || "Không rõ";
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
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài thi:", error);
    document.getElementById("dsBaiThi").innerHTML = `<div class="text-red-500">Lỗi khi tải danh sách bài thi.</div>`;
  }
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
    const HinhThucThanhToan = "Trực tuyến";
    const NVKeToanLap = sessionStorage.getItem("userID") || null;
    const response = await fetch(`/NVKT/HoaDon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ maDangKy, TongTien, TiemGiam, ThanhTien, TienNhan, NVKeToanLap, HinhThucThanhToan })
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

async function savePhieuThanhToan(){
  try {
    const maDangKy = document.getElementById("maDangKy").value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký trước khi lưu hóa đơn.");
      return;
    }
    const TongTien = Number(document.getElementById("tongTien").textContent);
    const TiemGiam = Number(document.getElementById("giamGia").textContent);
    const ThanhTien = Number(document.getElementById("thanhTien").textContent);

    const NVKeToanLap = sessionStorage.getItem("userID") || null;
    const response = await fetch(`/NVKT/PhieuThanhToan/luuphieuthanhtoan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ maDangKy, TongTien, TiemGiam, ThanhTien, NVKeToanLap })
    });

    if (!response.ok) {
      throw new Error("Không thể lưu hóa đơn.");
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    alert("Đã lưu phiếu thanh toán!");
  } catch (error) {
    console.error("Lỗi lưu phiếu thanh toán:", error);
    alert("Đã xảy ra lỗi khi lưu phiếu thanh toán.");
  }
}

async function prinPhieuThanhToanPDF() {
  try {
    const { jsPDF } = window.jspdf;

    const contentToPrint = document.createElement("div");
    contentToPrint.innerHTML = `
      <div style="border: 1px solid #ccc; border-radius: 6px; padding: 16px; font-family: sans-serif;">
        <h2 style="font-weight:600; margin-bottom: 8px;">Thông tin khách hàng</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); row-gap: 8px; font-size: 14px;">
          <span>Tên đơn vị: <span style="font-weight:600;">${document.getElementById("hoten").textContent}</span></span>
          <span>Tổng tiền: <span style="font-weight:600;">${document.getElementById("tongTien").textContent}</span></span>
          <span>Email: <span style="font-weight:600;">${document.getElementById("email").textContent}</span></span>
          <span>Tiền giảm: <span style="font-weight:600;">${document.getElementById("giamGia").textContent}</span></span>
          <span>Số lượng: <span style="font-weight:600;">${document.getElementById("soLuong").textContent}</span></span>
          <span>Thành tiền: <span style="font-weight:600;">${document.getElementById("thanhTien").textContent}</span></span>
        </div>

        <h2 style="font-size: 16px; font-weight:600; margin-top: 16px;">Thông tin đăng ký</h2>
        <div style="border: 1px solid #ccc; margin-top: 8px; max-height: 220px; overflow-y: auto; padding: 8px; background-color: white;">
          ${Array.from(document.querySelectorAll("#dsBaiThi > div")).map(div => `
            <div style="border:1px solid #ddd; padding:5px; margin-bottom:8px;">
              ${div.innerHTML}
            </div>
          `).join("")}
        </div>

        <p style="font-size: 13px; margin-top: 12px; color: #555;">
          Lưu ý: Vui lòng thanh toán sau 3 ngày nhận được phiếu thanh toán. <br/>
          Nếu không sẽ bị hủy đăng ký thi.
        </p>
      </div>
    `;

    contentToPrint.style.padding = "10px";
    contentToPrint.style.width = "800px";
    document.body.appendChild(contentToPrint);

    const canvas = await html2canvas(contentToPrint, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const fileName = `PhieuThanhToan_${document.getElementById("maDangKy").value}.pdf`;

    // 💾 Lưu về máy
    pdf.save(fileName);

    // 📩 Gửi về server
    const pdfBlob = pdf.output("blob");
    const formData = new FormData();
    formData.append("pdf", pdfBlob, fileName);
    formData.append("email", document.getElementById("email").textContent);
    formData.append("hoten", document.getElementById("hoten").textContent);

    const response = await fetch("/NVKT/SendEmail", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      alert("Không thể gửi phiếu thanh toán qua email.");
      return
    }

    alert("Phiếu thanh toán đã được gửi qua email!");
    document.body.removeChild(contentToPrint);
  } catch (error) {
    console.error("Lỗi:", error);
    alert("Có lỗi xảy ra khi tạo hoặc gửi phiếu thanh toán.");
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
            <p><strong>Loại khách hàng:</strong> Đơn vị</p>
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
            <p><strong>Tiền thối:</strong> ${Number(document.getElementById("tienNhan").value) - Number(document.getElementById("thanhTien").textContent)}</p>
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

async function huyPhieuDangKy() {
  try {
    const maDangKy = document.getElementById("maDangKy").value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký trước khi hủy.");
      return;
    }
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

async function DuyetPhieuThanhToan() {
  try {
    const TinhTrangThanhToan = document.getElementById("tinhTrang").textContent.trim();
    if (TinhTrangThanhToan === "Đã thanh toán") {
      return;
    } 

    const maDangKy = document.getElementById("maDangKy").value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký trước khi duyệt phiếu thanh toán.");
      return;
    }
    const maThanhToan = document.getElementById("maThanhToan").value.trim();
    if (!maThanhToan) {
      alert("Vui lòng nhập mã thanh toán.");
      return;
    }
    const TinhTrangDuyet = 1;
    const response = await fetch(`/NVKT/PhieuThanhToan/duyetphieuthanhtoan?maDangKy=${encodeURIComponent(maDangKy)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ maThanhToan, TinhTrangDuyet })
    });
    if (!response.ok) {
      throw new Error("Không thể duyệt phiếu thanh toán.");
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    alert("Đã duyệt phiếu thanh toán thành công!");
  } catch (error) {
    console.error("Lỗi duyệt phiếu thanh toán:", error);
    alert("Đã xảy ra lỗi khi duyệt phiếu thanh toán.");
  }
}

async function getPhieuThanhToan(maDangKy) {
  const daguiSpan = document.getElementById("given");
  const ngayguiSpan = document.getElementById("ngayGui");
  try {
    const response = await fetch(`/NVKT/PhieuThanhToan?maDangKy=${encodeURIComponent(maDangKy)}`);
    if (!response.ok) {
      throw new Error("Không tìm thấy phiếu thanh toán.");
    }
    const phieuThanhToan = await response.json();
    if (!phieuThanhToan || Object.keys(phieuThanhToan).length === 0) {
      alert("Phiếu thanh toán không tồn tại hoặc chưa được tạo.");
    }
    phieuThanhToan.NgayLap = new Date(phieuThanhToan.NgayLap).toLocaleDateString("vi-VN")
    daguiSpan.textContent = "Đã gửi" || "Không rõ";
    ngayguiSpan.textContent = phieuThanhToan.NgayLap || "Không rõ";
  } catch (error) {
    console.error("Lỗi khi lấy phiếu thanh toán:", error);
    daguiSpan.textContent = "Chưa gửi" || "Không rõ";
    ngayguiSpan.textContent = "Không rõ";
  }
}

async function loadFormData() {
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
  getPhieuThanhToan(maDangKy);
  await renderDanhSachBaiThi(maDangKy,TTBaiThi);
  tinhTienBanDau(TTBaiThi,TTKhachHang);
}
document.addEventListener("DOMContentLoaded",function () {
    const btnTraCuu = document.getElementById("btnTraCuu");
    const maDangKyInput = document.getElementById("maDangKy");

    btnTraCuu.addEventListener("click",async function () {
        loadFormData()
    });

  document.getElementById("guiPhieuThanhToan").addEventListener("click",async function () {
    const maDangKy = maDangKyInput.value.trim();
        if (!maDangKy) {
        alert("Vui lòng nhập mã đăng ký.");
        return;
        }
    const DaGuiPhieu = document.getElementById("given").textContent.trim();
    if (DaGuiPhieu === "Đã gửi") {
      alert("Phiếu thanh toán đã được gửi không thể gửi lại.");
      return;
    } 
    savePhieuThanhToan();
    prinPhieuThanhToanPDF();
    loadFormData();
  });

  document.getElementById("huyPhieuDangKy").addEventListener("click",async function () {
    const maDangKy = maDangKyInput.value.trim();
    if (!maDangKy) {
    alert("Vui lòng nhập mã đăng ký.");
    return;
    }
    const NgayGuiText = document.getElementById("ngayGui").textContent.trim();
    if (NgayGuiText === "Không rõ") {
    alert("Phiếu thanh toán chưa được gửi hoặc chưa đủ thời gian để hủy.");
    return;
    }
    const [day, month, year] = NgayGuiText.split('/');
    const ngayGui = new Date(`${year}-${month}-${day}`);
    const today = new Date();

    // Tính số ngày chênh lệch
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor((today - ngayGui) / msPerDay);

    if (diffDays < 3) {
      alert("Phiếu thanh toán chưa được gửi hoặc chưa đủ thời gian để hủy.");
      return;
    }
    huyPhieuDangKy();
    location.reload();
  });

  document.getElementById("duyetPhieuThanhToan").addEventListener("click",async function () {
    if (!document.getElementById("maThanhToan").value||!document.getElementById("tienNhan").value || document.getElementById("tienNhan").value < document.getElementById("thanhTien").textContent) {
      alert("Vui lòng điền thông tin mã đăng ký và tiền nhận đầy đủ.");
      return;
    }
    const DaGuiPhieu = document.getElementById("given").textContent.trim();
    if (DaGuiPhieu !== "Đã gửi") {
      alert("Chưa gửi phiếu thanh toán, không thể duyệt.");
      return;
    }
    const maDangKy = maDangKyInput.value.trim();
        if (!maDangKy) {
        alert("Vui lòng nhập mã đăng ký.");
        return;
        }
    DuyetPhieuThanhToan();
    updateTinhTrangThanhToan();
    saveHoaDon();
    printHoaDonPDF();
    loadFormData();
  });
});