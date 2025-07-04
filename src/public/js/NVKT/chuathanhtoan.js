const daTich = new Set();
let trangHienTai = 1;
let tongTrang = 1;
let danhSachGoc = [];
let locQuaHan = '';

async function traCuuDanhSach(maDangKy, ngayLap) {
  try {
    daTich.clear();
    document.getElementById("filterOverdue").checked = false;
    const responsePDK = await fetch(`/NVKT/PhieuDangKy/chuathanhtoan?maDangKy=${encodeURIComponent(maDangKy)}&ngayLap=${encodeURIComponent(ngayLap)}`);
    if (!responsePDK.ok) throw new Error("Không tìm thấy thông tin đăng ký.");
    const dataPDK = await responsePDK.json(); // [{PhieuID, KhachHangID, ...}]

    const responseKH = await fetch(`/NVKT/KhachHang/chuathanhtoan?maDangKy=${encodeURIComponent(maDangKy)}&ngayLap=${encodeURIComponent(ngayLap)}`);
    if (!responseKH.ok) throw new Error("Không tìm thấy thông tin khách hàng.");
    const dataKH = await responseKH.json(); // [{PhieuID, Hoten, CCCD, ...}]

    // Đảm bảo PhieuID là số, không phải mảng
    const TTKhachHang = dataPDK.map(pdk => {
      const phieuID = Array.isArray(pdk.PhieuID) ? pdk.PhieuID[0] : pdk.PhieuID;
      const kh = dataKH.find(k => {
        const khPhieuID = Array.isArray(k.PhieuID) ? k.PhieuID[0] : k.PhieuID;
        return khPhieuID === phieuID;
      });

      return {
        ...pdk,
        ...(kh || {}),
        PhieuID: phieuID,
        ThoiGianLap: pdk.ThoiGianLap
          ? new Date(pdk.ThoiGianLap)
          : "Không rõ",
      };
    });

    return TTKhachHang;

  } catch (err) {
    console.error("Lỗi tra cứu:", err);
    return [];
  }
}

function loadPageandPagination(danhSach, trang = 1, locQuaHan = false) {
  trangHienTai = trang;
  const tbody = document.getElementById("tbodyDanhSach");
  tbody.innerHTML = "";

  const dsLoc = locQuaHan == 'qua han'
    ? danhSach.filter(item => {
        const ngay = item.ThoiGianLap;
        return (Date.now() - item.ThoiGianLap.getTime() ) / (1000 * 60 * 60 * 24) > 3;
      })
    : locQuaHan == 'chua qua han'
    ? danhSach.filter(item => {
        return (Date.now() - item.ThoiGianLap.getTime()) / (1000 * 60 * 60 * 24) <= 3;
      })
    : danhSach;

  const batDau = (trang - 1) * 4;
  const ketThuc = batDau + 4;
  const hienThi = dsLoc.slice(batDau, ketThuc);

  hienThi.forEach((item, index) => {
    const phieuID = item.PhieuID;
    const ngay = new Date(item.ThoiGianLap);
    const quaHan = (Date.now() - ngay.getTime()) / (1000 * 60 * 60 * 24) > 3;
    const checked = daTich.has(phieuID.toString()) ? "checked" : "";

    const checkboxHTML = quaHan
      ? `<input type="checkbox" data-id="${phieuID}" class="chon-checkbox accent-blue-600 w-4 h-4 mx-auto" ${checked}>`
      : "";

    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition h-14";
    row.innerHTML = `
      <td class="px-4 py-2 border">${checkboxHTML}</td>
      <td class="px-4 py-2 border">${item.PhieuID}</td>
      <td class="px-4 py-2 border">${item.CCCD || "Không rõ"}</td>
      <td class="px-4 py-2 border">${item.Hoten || "Không rõ"}</td>
      <td class="px-4 py-2 border">${item.ThoiGianLap.toLocaleDateString("vi-VN")}</td>
      <td class="px-4 py-2 border">Chưa thanh toán</td>
    `;
    tbody.appendChild(row);
  });

  // Sự kiện checkbox từng dòng
  document.querySelectorAll(".chon-checkbox").forEach(cb => {
    cb.addEventListener("change", e => {
      const id = e.target.dataset.id;
      if (e.target.checked) daTich.add(id);
      else {daTich.delete(id); document.getElementById("filterOverdue").checked = false;}
      console.log("Da tich:", Array.from(daTich));
      // capNhatSoLuong();
    });
  });

  // Render phân trang
  tongTrang = Math.ceil(dsLoc.length / 4);
  renderPhanTrang();
}

function renderPhanTrang() {
  const container = document.getElementById("pagination-controls");
  container.innerHTML = "";

  if (tongTrang <= 1) return;

  // Nút prev
  container.innerHTML += `
    <button onclick="loadPageandPagination(danhSachGoc, ${trangHienTai - 1})"
      class="px-3 py-1 rounded-md ${trangHienTai === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}"
      ${trangHienTai === 1 ? 'disabled' : ''}>
      ⬅
    </button>
  `;

  let start = Math.max(1, trangHienTai - 2);
  let end = Math.min(tongTrang, trangHienTai + 2);

  if (trangHienTai <= 3) {
    end = Math.min(5, tongTrang);
  }
  if (trangHienTai >= tongTrang - 2) {
    start = Math.max(tongTrang - 4, 1);
  }

  // Trang đầu + dấu ...
  if (start > 1) {
    container.innerHTML += nutTrang(1);
    if (start > 2) {
      container.innerHTML += `<span class="px-2 text-gray-500">...</span>`;
    }
  }

  // Các nút từ start đến end
  for (let i = start; i <= end; i++) {
    container.innerHTML += nutTrang(i, i === trangHienTai);
  }

  // Dấu ... + trang cuối
  if (end < tongTrang) {
    if (end < tongTrang - 1) {
      container.innerHTML += `<span class="px-2 text-gray-500">...</span>`;
    }
    container.innerHTML += nutTrang(tongTrang);
  }

  // Nút next
  container.innerHTML += `
    <button onclick="loadPageandPagination(danhSachGoc, ${trangHienTai + 1})"
      class="px-3 py-1 rounded-md ${trangHienTai === tongTrang ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}"
      ${trangHienTai === tongTrang ? 'disabled' : ''}>
      ➡
    </button>
  `;

  // Hàm tạo nút trang số
  function nutTrang(so, active = false) {
    return `
      <button onclick="loadPageandPagination(danhSachGoc, ${so})"
        class="px-3 py-1 rounded-md ${active ? 'bg-blue text-white' : 'hover:bg-blue hover:text-white bg-babyblue text-black'}">
        ${so}
      </button>
    `;
  }
}

async function loadForm() {
  danhSachGoc = await traCuuDanhSach('', '');
  loadPageandPagination(danhSachGoc);
}

async function btnTimKiem_Click() {
  const maDangKy = document.getElementById("maDangKy").value.trim();
  const ngayLap = document.getElementById("ngayDangKy").value.trim();
  danhSachGoc = await traCuuDanhSach(maDangKy,ngayLap);
  loadPageandPagination(danhSachGoc);
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
  } catch (error) {
    console.error("Lỗi hủy phiếu đăng ký:", error);
    alert("Đã xảy ra lỗi khi hủy phiếu đăng ký.");
  }
}

async function btnHuyDangKy_Click() {
  if (daTich.size === 0) {
    alert("Vui lòng chọn ít nhất một phiếu để hủy.");
    return;
  }

  const xacNhan = confirm(`Bạn có chắc chắn muốn hủy ${daTich.size} phiếu đã chọn?`);
  if (!xacNhan) return;

  let thanhCong = 0;
  for (let maDangKy of daTich) {
    try {
      await huyPhieuDangKy(maDangKy); // dùng lại hàm của bạn
      thanhCong++;
    } catch (error) {
      console.error(`Lỗi khi hủy phiếu ${maDangKy}:`, error);
    }
  }

  alert(`Đã hủy thành công ${thanhCong} phiếu.`);

  daTich.clear();
  document.getElementById("filterOverdue").checked = false;
  loadForm()
}

document.addEventListener("DOMContentLoaded",async function () {
  loadForm()

  document.getElementById("btnTimKiem").addEventListener("click",async function () {
    btnTimKiem_Click();
  });

  document.getElementById("btnHuyDangKy").addEventListener("click",async function () {
    btnHuyDangKy_Click();
  });

  document.getElementById("filterTime").addEventListener("change", function () {
    const selected = this.value;
    daTich.clear();
    document.getElementById("filterOverdue").checked = false;
    if (selected === "Quá thời gian") locQuaHan = 'qua han';
    else if (selected === "Chưa quá thời gian") locQuaHan = "chua qua han";
    else locQuaHan = '';

    // Gọi lại phân trang với filter mới
    loadPageandPagination(danhSachGoc, 1, locQuaHan);
  });

  document.getElementById("filterOverdue").addEventListener("change", (e) => {
    if (locQuaHan === 'chua qua han') {
      e.preventDefault();
      // e.target.checked = false;
      // alert("Vui lòng chọn ít nhất một phiếu để hủy.");
      return;
    }

    const check = e.target.checked;

    // Lọc toàn bộ danh sách dựa vào trạng thái lọc hiện tại
    const dsLoc = danhSachGoc.filter(item => (Date.now() - new Date(item.ThoiGianLap).getTime()) / (1000 * 60 * 60 * 24) > 3)


    // Cập nhật daTich toàn bộ
    dsLoc.forEach(item => {
      const id = item.PhieuID.toString();
      if (check) daTich.add(id);
      else daTich.delete(id);
    });
    
    trangHienTai = 1;
    // Gọi lại loadPage để render lại đúng các checkbox
    loadPageandPagination(danhSachGoc, trangHienTai, locQuaHan);
  });


});