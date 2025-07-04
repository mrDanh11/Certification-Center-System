const btnTimKiemKH_Click = async () => {
  const maKhachHangInput = document.querySelector("#maKhachHang");

  const maKhachHang = maKhachHangInput.value.trim();

  if (!maKhachHang) {
    alert("Vui lòng nhập Mã khách hàng.");
    return;
  }
  console.log(maKhachHang);

  try {
    const url = `/NVTN/api/khachhang/${maKhachHang}`

    const response = await fetch(url);
    if (!response.ok) throw new Error("Không tìm thấy thông tin khách hàng.");

    const data_res = await response.json();
    const data = data_res[0];

    // Fill the form with customer data
    console.log(data);

    document.getElementById("tenKhachHang").value = data.Hoten || "";
    document.getElementById("gioiTinh").value = data.Phai || "";
    document.getElementById("cccd").value = data.CCCD || "";
    document.getElementById("sdt").value = data.Dienthoai || "";
    document.getElementById("email").value = data.Email || "";
    document.getElementById("loaiKhachHang").value = data.LoaiKH || "";

    txtLoaiKhachHang_OnChange();
  } catch (err) {
    console.error(err);
    alert("Không thể lấy thông tin khách hàng.");
  }
};

const LayDSChungChi = async () => {

  let ChungChi = {
    ChungChiID: undefined, // int
    TenChungChi: undefined, // string
    Gia: undefined, // float
    LoaiChungChi: undefined, // string
  };

  const url = `/NVTN/api/chungchi?fields=ChungChiID,TenChungChi`

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Không lấy được danh sách chứng chỉ.");

    const data = await response.json();
    console.log(data);
    const loaiBaiThi = document.querySelector('#loaiBaiThi');
    loaiBaiThi.innerHTML = data.map(item => `<option value="${item.ChungChiID}">${item.TenChungChi}</option>`);

  } catch (err) {
    console.error(err);
    alert("Không thể lấy danh sách chứng chỉ");
  }
};

const txtLoaiKhachHang_OnChange = async () => {
  const txtLoaiKhachHang = document.querySelector('#loaiKhachHang');
  console.log(txtLoaiKhachHang.value);
  if (txtLoaiKhachHang.value === "Đơn Vị") {
    console.log('lifted');
    document.querySelector('#loaiBaiThi').disabled = false;
    document.querySelector('#ngayThi').disabled = false;
    document.querySelector('#yeuCau').disabled = false;

    document.querySelector('#secThongTinBaiThi').style.height = "auto";
    document.querySelector('#secThongTinBaiThi').style.opacity = "1";
    document.querySelector('#secThongTinBaiThi').style.marginBottom = "1.5rem";
    document.querySelector('#secThongTinBaiThi').style.paddingTop = "1.5rem";
    document.querySelector('#secThongTinBaiThi').style.paddingBottom = "1.5rem";
  }
  else {
    console.log('blocked');
    document.querySelector('#loaiBaiThi').disabled = true;
    document.querySelector('#ngayThi').disabled = true;
    document.querySelector('#yeuCau').disabled = true;

    document.querySelector('#ngayThi').value = '';
    document.querySelector('#yeuCau').value = '';

    document.querySelector('#loaiBaiThi').disabled = true;
    document.querySelector('#ngayThi').disabled = true;
    document.querySelector('#yeuCau').disabled = true;

    document.querySelector('#secThongTinBaiThi').style.opacity = "0";
    document.querySelector('#secThongTinBaiThi').style.height = "0";
    document.querySelector('#secThongTinBaiThi').style.marginBottom = "0";
    document.querySelector('#secThongTinBaiThi').style.paddingTop = "0rem";
    document.querySelector('#secThongTinBaiThi').style.paddingBottom = "0rem";
  }
};

const addThiSinhBtn_Click = async () => {
  const container = document.getElementById("thiSinhContainer");
  const newRow = document.createElement("div");
  newRow.className = "max-w-full flex flex-row gap-4 space-y-2 relative thiSinhRow";

  newRow.innerHTML = `
    <div class="flex flex-col items-left min-w-[30%]">
      <input type="text" name="thiSinhHoTen" class="mt-auto ml-0 h-9 px-2 border-2 border-gray-200 bg-white rounded-lg" value="">
    </div>
    <div class="flex flex-col items-left min-w-[30%]">
      <input type="text" name="thiSinhCCCD" minlength="12" maxlength="12" name="thiSinhCCCD" class="ml-0 h-9 px-2 border-2 border-gray-200 bg-white rounded-lg" required>
    </div>
    <div class="flex flex-col items-left min-w-[15%]">
      <select name="thiSinhGioiTinh" class="ml-0 h-9 px-2 border-2 border-gray-200 bg-white rounded-lg">
        <option value="">Phái</option>
        <option value="Nam">Nam</option>
        <option value="Nữ">Nữ</option>
      </select>
    </div>
    <button type="button" class="w-[5%] h-9 mt-auto mx-auto p-1 px-2 text-white rounded deleteBtn hover:-translate-y-1 active:-translate-y-0.5 shadow-xl transition-all">❌ </button>
  `;

  container.appendChild(newRow);

  // Attach input sanitization to the newly added CCCD input
  const cccdInput = newRow.querySelector('input[name="thiSinhCCCD"]');
  if (cccdInput) {
    cccdInput.addEventListener("input", function() {
      this.value = this.value.replace(/\D/g, '');
      console.log("Sanitized CCCD:", this.value);
    });
  }
};

const btnDangKy_Click = async () => {
  const btnDangKy = document.querySelector('#btnDangKy');
  const originalText = btnDangKy.innerText;

  // Disable and show loading
  btnDangKy.disabled = true;
  btnDangKy.innerText = "Đang xử lý...";
  btnDangKy.classList.add("opacity-50", "cursor-not-allowed");

  const khachHangID = document.querySelector('#maKhachHang')?.value?.trim();
  const loaiKhachHang = document.querySelector('#loaiKhachHang')?.value?.trim();
  const thiSinhElements = document.querySelectorAll('.thiSinhRow');
  const soLuong = thiSinhElements.length;
  const thiSinhList = [];
  let hasMissingField = false;

  if (!khachHangID) {
    alert('⚠️ Vui lòng chọn hoặc tạo khách hàng trước khi đăng ký.');
    resetButton();
    return;
  }

  if (!loaiKhachHang) {
    alert(`⚠️ Thiếu loại khách hàng trong dữ liệu, hãy thông báo với quản trị viên với Mã khách hàng: ${khachHangID}.`);
    resetButton();
    return;
  }

  if (thiSinhElements.length === 0) {
    alert('⚠️ Vui lòng thêm ít nhất một thí sinh trước khi đăng ký.');
    resetButton();
    return;
  }

  thiSinhElements.forEach(row => {
    const hoTenInput = row.querySelector('input[name="thiSinhHoTen"]');
    const cccdInput = row.querySelector('input[name="thiSinhCCCD"]');
    const phaiSelect = row.querySelector('select[name="thiSinhGioiTinh"]');

    const hoTen = hoTenInput?.value?.trim();
    const cccd = cccdInput?.value?.trim();
    const phai = phaiSelect?.value?.trim();

    // Reset styles
    hoTenInput.classList.remove('border-red-500');
    cccdInput.classList.remove('border-red-500');
    phaiSelect.classList.remove('border-red-500');

    if (!hoTen) {
      hoTenInput.classList.add('border-red-500');
      hasMissingField = true;
    }

    if (!cccd) {
      cccdInput.classList.add('border-red-500');
      hasMissingField = true;
    }

    if (!phai) {
      phaiSelect.classList.add('border-red-500');
      hasMissingField = true;
    }

    thiSinhList.push({ hoTen, cccd, phai });
  });

  if (hasMissingField) {
    alert("⚠️ Vui lòng nhập đầy đủ thông tin thí sinh.");
    resetButton();
    return;
  }

  try {
    // Step 1: Create PhieuDangKy
    const phieuBody = { khachHangID, loaiPhieu: loaiKhachHang };

    // Add extra info if đơn vị
    if (loaiKhachHang === 'Đơn Vị') {
      phieuBody.baiThiInfo = {
        loaiBaiThi: document.querySelector('#loaiBaiThi')?.value?.trim(),
        ngayThi: document.querySelector('#ngayThi')?.value,
        yeuCau: document.querySelector('#yeuCau')?.value?.trim(),
      };

      phieuBody.soLuong = soLuong;
    }

    console.log(phieuBody);

    const phieuResponse = await fetch('/NVTN/api/phieudangky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phieuBody)
    });

    const phieuResult = await phieuResponse.json();
    if (!phieuResponse.ok || !phieuResult.phieuID) {
      throw new Error(phieuResult.error || 'Không thể tạo phiếu.');
    }

    const newPhieuID = phieuResult.phieuID;
    console.log('✅ Mã phiếu mới:', newPhieuID);

    // Step 2: Insert ThiSinh
    const thisinhResponse = await fetch('/NVTN/api/thisinh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phieuID: newPhieuID, thiSinhList })
    });

    const tsResult = await thisinhResponse.json();
    if (thisinhResponse.ok) {
      alert('🎉 Đăng ký thành công!');
    } else {
      throw new Error(tsResult.error || 'Không thể thêm danh sách thí sinh.');
    }

  } catch (err) {
    console.error(err);
    alert('❌ Có lỗi xảy ra: ' + err.message);
  } finally {
    resetButton();
  }

  function resetButton() {
    btnDangKy.disabled = false;
    btnDangKy.innerText = originalText;
    btnDangKy.classList.remove("opacity-50", "cursor-not-allowed");
  }
};

document.addEventListener("DOMContentLoaded", function() { // OnLoad() function
  const btnTimKiem = document.querySelector('#btnTimKiemKH');
  const addButton = document.getElementById("addThiSinhBtn");
  const container = document.getElementById("thiSinhContainer");
  // const txtthiSinhCCCD = document.querySelector('#thiSinhCCCD');

  btnTimKiem.addEventListener("click", btnTimKiemKH_Click);

  addButton.addEventListener("click", addThiSinhBtn_Click);

  container.addEventListener("click", function(e) {
    if (e.target.classList.contains("deleteBtn")) {
      const row = e.target.closest(".thiSinhRow");
      if (row) row.remove();
    }
  });

  const btnDangKy = document.querySelector('#btnDangKy');
  btnDangKy.addEventListener("click", btnDangKy_Click);

  LayDSChungChi();
  txtLoaiKhachHang_OnChange();
  addThiSinhBtn_Click();
});

