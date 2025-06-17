const btnTimKiemKH_Click = async () => {
  const maKhachHangInput = document.querySelector("#maKhachHang");

  const maKhachHang = maKhachHangInput.value.trim();

  if (!maKhachHang) {
    alert("Vui lòng nhập Mã khách hàng.");
    return;
  }
  console.log(maKhachHang);

  try {
    const url = `/api/khachhang/${maKhachHang}`

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

  const url = `/api/chungchi?fields=ChungChiID,TenChungChi`

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
  }
};

// OnLoad() function
document.addEventListener("DOMContentLoaded", function() {
  const btnTimKiem = document.querySelector('#btnTimKiemKH');
  const addButton = document.getElementById("addThiSinhBtn");
  const container = document.getElementById("thiSinhContainer");

  btnTimKiem.addEventListener("click", btnTimKiemKH_Click);

  addButton.addEventListener("click", function() {
    const newRow = document.createElement("div");
    newRow.className = "grid grid-cols-3 gap-4 m-4 relative thiSinhRow";
    newRow.innerHTML = `
        <div>
          <label>* Họ tên</label>
          <input type="text" name="thiSinhHoTen[]" class="ml-auto w-50 px-2 border border-gray-200 bg-gray-100 rounded-lg" value="">
        </div>
        <div>
          <label>* CCCD</label>
          <input type="text" name="thiSinhCCCD[]" class="ml-auto w-50 px-2 border border-gray-200 bg-gray-100 rounded-lg" value="">
        </div>
        <div>
          <label>* Giới tính</label>
          <select name="thiSinhGioiTinh[]" class="ml-auto w-60 px-2 border border-gray-200 bg-gray-100 rounded-lg">
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
        <button type="button" class="absolute -right-10 top-4 p-1 px-2 bg-red-500 text-white rounded deleteBtn">X</button>
      `;
    container.appendChild(newRow);
  });

  // Event delegation for delete buttons
  container.addEventListener("click", function(e) {
    if (e.target.classList.contains("deleteBtn")) {
      const row = e.target.closest(".thiSinhRow");
      if (row) row.remove();
    }
  });

  LayDSChungChi();
  txtLoaiKhachHang_OnChange();
});
