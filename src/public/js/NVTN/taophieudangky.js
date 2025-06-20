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

    document.querySelector('#secThongTinBaiThi').style.display = "block";
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

    document.querySelector('#secThongTinBaiThi').style.display = "none";
  }
};

const addThiSinhBtn_Click = async () => {
  const container = document.getElementById("thiSinhContainer");
  const newRow = document.createElement("div");
  newRow.className = "grid grid-cols-3 gap-4 m-4 relative thiSinhRow";

  newRow.innerHTML = `
    <div>
      <label>* Họ tên</label>
      <input type="text" name="thiSinhHoTen" class="ml-auto w-50 px-2 border border-gray-200 bg-gray-100 rounded-lg" value="">
    </div>
    <div>
      <label>* CCCD (Chỉ số)</label>
      <input type="text" name="thiSinhCCCD" minlength="12" maxlength="12" name="thiSinhCCCD" class="ml-auto w-50 px-2 border border-gray-200 bg-gray-100 rounded-lg" required>
    </div>
    <div>
      <label>* Giới tính</label>
      <select name="thiSinhGioiTinh" class="ml-auto w-60 px-2 border border-gray-200 bg-gray-100 rounded-lg">
        <option value="">Chọn giới tính</option>
        <option value="Nam">Nam</option>
        <option value="Nữ">Nữ</option>
      </select>
    </div>
    <button type="button" class="absolute -right-10 top-4 p-1 px-2 bg-red-500 text-white rounded deleteBtn">X</button>
  `;

  container.appendChild(newRow);

  // Attach input sanitization to the newly added CCCD input
  const cccdInput = newRow.querySelector('input[name="thiSinhCCCD"]');
  if (cccdInput) {
    cccdInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, '');
      console.log("Sanitized CCCD:", this.value);
    });
  }
};

const btnDangKy_Click = async () => {
  try {
    const khachHangID = document.querySelector('#maKhachHang').value;
    // Step 1: Gửi yêu cầu tạo phiếu
    const phieuResponse = await fetch('/NVTN/api/phieudangky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ khachHangID: khachHangID })
    });

    const phieuResult = await phieuResponse.json();
    if (!phieuResponse.ok) throw new Error(phieuResult.error + 'Không thể tạo phiếu');

    const newPhieuID = phieuResult.phieuID;
    console.log('Phiếu ID mới là: ',newPhieuID);

    // Step 2: Lấy danh sách thí sinh từ DOM
    const thiSinhElements = document.querySelectorAll('.thiSinhRow');
    const thiSinhList = [];

    for (const row of thiSinhElements) {
      const hoTen = row.querySelector('input[name="thiSinhHoTen"]').value.trim();
      const cccd = row.querySelector('input[name="thiSinhCCCD"]').value.trim();
      const phai = row.querySelector('select[name="thiSinhGioiTinh"]').value;

      if (!hoTen || !cccd || !phai) {
        alert('Vui lòng nhập đầy đủ thông tin thí sinh');
        return;
      }

      thiSinhList.push({ hoTen, cccd, phai });
    }

    // Step 3: Gửi danh sách thí sinh kèm PhieuID
    const thisinhResponse = await fetch('/NVTN/api/thisinh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phieuID: newPhieuID, thiSinhList: thiSinhList })
    });

    const tsResult = await thisinhResponse.json();
    if (thisinhResponse.ok) {
      alert('Đăng ký thí sinh thành công!');
    } else {
      alert('Lỗi khi thêm thí sinh: ' + tsResult.error);
    }

  } catch (err) {
    console.error(err);
    alert('Có lỗi xảy ra: ' + err.message);
  }
};

// OnLoad() function
document.addEventListener("DOMContentLoaded", function() {
  const btnTimKiem = document.querySelector('#btnTimKiemKH');
  const addButton = document.getElementById("addThiSinhBtn");
  const container = document.getElementById("thiSinhContainer");
  const btnDangKy = document.querySelector('#btnDangKy');
  const txtthiSinhCCCD = document.querySelector('#thiSinhCCCD');

  btnTimKiem.addEventListener("click", btnTimKiemKH_Click);

  addButton.addEventListener("click", addThiSinhBtn_Click);

  container.addEventListener("click", function(e) {
    if (e.target.classList.contains("deleteBtn")) {
      const row = e.target.closest(".thiSinhRow");
      if (row) row.remove();
    }
  });

  btnDangKy.addEventListener("click", btnDangKy_Click);

  LayDSChungChi();
  txtLoaiKhachHang_OnChange();
  addThiSinhBtn_Click();

});



