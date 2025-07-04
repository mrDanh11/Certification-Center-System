async function savePhieuThanhToan(){
  try {
    const DaGuiPhieu = document.getElementById("given").value.trim();
    if (DaGuiPhieu === "Đã gửi") {
      alert("Đã từng gửi phiếu thanh toán.");
      return;
    } 
    const maDangKy = document.getElementById("maDangKy").value.trim();
    const TongTien = Number(document.getElementById("tongTien").value);
    const TiemGiam = Number(document.getElementById("giamGia").value);
    const ThanhTien = Number(document.getElementById("thanhTien").value);

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
          <span>Tên đơn vị: <span style="font-weight:600;">${document.getElementById("hoten").value}</span></span>
          <span>Tổng tiền: <span style="font-weight:600;">${document.getElementById("tongTien").value}</span></span>
          <span>Email: <span style="font-weight:600;">${document.getElementById("email").value}</span></span>
          <span>Tiền giảm: <span style="font-weight:600;">${document.getElementById("giamGia").value}</span></span>
          <span>Số lượng: <span style="font-weight:600;">${document.getElementById("soLuong").value}</span></span>
          <span>Thành tiền: <span style="font-weight:600;">${document.getElementById("thanhTien").value}</span></span>
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
    formData.append("email", document.getElementById("email").value);
    formData.append("hoten", document.getElementById("hoten").value);
    document.body.removeChild(contentToPrint)
    const response = await fetch("/NVKT/SendEmail", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      alert("Không thể gửi phiếu thanh toán qua email.");
      return
    }

    alert("Phiếu thanh toán đã được gửi qua email!");
  } catch (error) {
    console.error("Lỗi:", error);
    alert("Có lỗi xảy ra khi tạo hoặc gửi phiếu thanh toán.");
  }
}

async function DuyetPhieuThanhToan() {
  try {
    const TinhTrangThanhToan = document.getElementById("tinhTrang").value.trim();
    if (TinhTrangThanhToan === "Đã thanh toán") {
      return;
    } 

    const maDangKy = document.getElementById("maDangKy").value.trim();
    const maThanhToan = document.getElementById("maThanhToan").value.trim();
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

async function btnGuiPhieuThanhToan_Click() {
  const maDangKyInput = document.getElementById("maDangKy");
  const maDangKy = maDangKyInput.value.trim();
  if (!maDangKy) {
    alert("Vui lòng nhập mã đăng ký.");
    return;
  }
  savePhieuThanhToan();
  prinPhieuThanhToanPDF();
  getPhieuThanhToan(maDangKy);
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
    daguiSpan.value = "Đã gửi" || "Không rõ";
    ngayguiSpan.value = phieuThanhToan.NgayLap || "Không rõ";
  } catch (error) {
    console.error("Lỗi khi lấy phiếu thanh toán:", error);
    daguiSpan.value = "Chưa gửi" || "Không rõ";
    ngayguiSpan.value = "Không rõ";
  }
}

async function loadForm() {
  const dialog = document.getElementById("dialogThanhToan");
  const maDangKyInput = document.getElementById("maDangKy");
    const maDangKy = maDangKyInput.value.trim();
    if (!maDangKy) {
      alert("Vui lòng nhập mã đăng ký.");
      return;
    }

    const loaiKhachHang = document.getElementById("loaiKhachHang");
    const loaiKH = loaiKhachHang.value.trim();
    if (loaiKH !== "Đơn Vị") {
      alert("Không thể thanh toán trực tuyến cho loại khách hàng này.");
      return;
    }
    getPhieuThanhToan(maDangKy);
    dialog.classList.remove("hidden");
    dialog.classList.add("flex");
}

async function btnDuyetPhieuThanhToan_Click() {
  const maDangKyInput = document.getElementById("maDangKy");
  if (!document.getElementById("maThanhToan").value||!document.getElementById("tienNhanDialog").value || document.getElementById("tienNhanDialog").value < Number(document.getElementById("thanhTien").value)) {
    alert("Vui lòng điền thông tin mã đăng ký và tiền nhận đầy đủ.");
    return;
  }
  const DaGuiPhieu = document.getElementById("given").value.trim();
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
  btnTimKiem_Click();
}

document.addEventListener("DOMContentLoaded",function () {

    document.getElementById("guiPhieuThanhToan").addEventListener("click",async function () {
      btnGuiPhieuThanhToan_Click()
    });

    document.getElementById("duyetPhieuThanhToan").addEventListener("click",async function () {
      const tienNhan = Number(document.getElementById("tienNhanDialog").value);
      if (isNaN(tienNhan)) {
        alert("Tiền nhận không hợp lệ.");
        return;
      }
      btnDuyetPhieuThanhToan_Click()
    });
});