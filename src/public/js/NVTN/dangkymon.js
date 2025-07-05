const input = document.getElementById('cmbMaKH');

const FilterBaiThiDaDangKy = async () => {
  /*Lọc các bài thi đã đăng ký khỏi danh sách lịch thi*/
  const firstListBtns = document.querySelectorAll('.btnXoaDangKy[data-baithi-id]');
  const registeredBaiThiIDs = Array.from(firstListBtns).map(btn => btn.dataset.baithiId);

  const secondListRows = document.querySelectorAll('.cardBaiThi[data-mabaithi]');

  secondListRows.forEach(row => {
    const baiThiID = row.dataset.mabaithi;
    if (registeredBaiThiIDs.includes(baiThiID)) {
      row.style.display = 'none';
    }
    else {
      row.style.display = '';
    }
  });
}

const LayDSBaiThiDaDangKy = async (PhieuID) => {
  const daDangKyContainer = document.getElementById('daDangKyContainer');

  const url = `/NVKT/danhsachDKThi?maDangKy=${PhieuID}`
  const response = await fetch(url);
  if (!response.ok) { throw new error('Không thể lấy được danh sách đăng ký của khách hàng'); }
  console.log(response);

  const daDangKyList = await response.json();
  console.log(daDangKyList);

  daDangKyContainer.innerHTML = daDangKyList.map((item, index) => `
    <div class="border rounded p-2 flex justify-between items-center">
      <div>
        <p class="font-semibold">${item.TenChungChi}</p>
        <p class="text-xs text-gray-500">${new Date(item.ThoiGianThi).toLocaleDateString('vi-VN')}<br>${item.DiaDiemThi}</p>
      </div>
      <button class="rounded shadow-lg text-gray-500 hover:text-red-500 btnXoaDangKy"
      data-baithi-id=${item.BaiThiID}
      data-phieu-id=${PhieuID}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `).join('');

  FilterBaiThiDaDangKy();

  const btnXoaDangKy = document.querySelectorAll('.btnXoaDangKy');
  btnXoaDangKy.forEach(item => {
    item.addEventListener('click', btn_xoaDangKy_Click)
  })
};

const btn_xoaDangKy_Click = async function() {
  try {
    const baithiId = this.dataset.baithiId;
    const phieuID = this.dataset.phieuId;
    const url = `/NVTN/api/danhsachDKThi`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BaiThiID: baithiId,
        phieuID: phieuID
      })
    })

    if (!response.ok) throw new Error('Lỗi không thể xóa môn đăng ký thi');
    alert('🎉 Xóa môn thành công!');

    LayDSBaiThiDaDangKy(phieuID);
  } catch (error) {
    console.error(error);
    alert('Có lỗi khi xóa đăng ký thi');
  }
};

const btn_dangKy_Click = async function() {
  try {
    const DSDangKyThi = {
      phieuID: input.value,
      BaiThiID: this.dataset.baithiId
    }
    const url = `/NVTN/api/danhsachDKThi`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DSDangKyThi),
    });

    let datatemp = await response.json();
    console.log(datatemp);
    if (!response.ok) throw new Error(`${datatemp.message}`);

    LayDSBaiThiDaDangKy(DSDangKyThi.phieuID);
    alert('🎉 Đăng ký thành công!');

  } catch ({ name, message }) {
    console.log(message);
    alert(`Có lỗi khi đăng ký lịch thi: ${message}`);
  }
};

const btn_chonLichThi_Click = async function() {
  const chungChiID = this.dataset.chungchiId;
  const TenChungChi = this.dataset.tenchungchi;

  try {
    const response = await fetch(`/NVTN/api/lichthi?chungChiID=${encodeURIComponent(chungChiID)}`);
    if (!response.ok) throw new Error('Không thể lấy lịch thi');

    const data = await response.json();
    const lichthiList = data.lichthiList;
    console.log('Lịch thi cho ChungChiID', chungChiID, data);

    // Here you could render the fetched data into the page, e.g.:
    document.getElementById('lichThiContainer').innerHTML = lichthiList.map((item, index) => `
      <tr class="border-b last:border-none even:bg-[#E6F0FF] cardBaiThi"
        data-mabaithi=${item.BaiThiID}
        data-diadiemthi="${item.DiaDiemThi}"
        data-ngaythi=${new Date(item.ThoiGianThi).toLocaleDateString('vi-VN')}
      >
        <td class="py-2 px-3 whitespace-nowrap">${item.BaiThiID}</td>
        <td class="py-2 px-3 whitespace-nowrap">${TenChungChi}</td>
        <td class="py-2 px-3">${item.DiaDiemThi}</td>
        <td class="py-2 px-3">${new Date(item.ThoiGianThi).toLocaleDateString('vi-VN')}</td>
        <td class="py-2 px-3 text-left">
          <button
            class="bg-babyblue hover:bg-darkblue hover:text-white transition text-xs rounded px-3 py-1 btnDangKy"
            data-baithi-id=${item.BaiThiID}
          >Đăng Ký</button>
        </td>
      </tr>
    `).join('');

    FilterBaiThiDaDangKy();

    const btnDangKy = document.querySelectorAll('.btnDangKy');
    btnDangKy.forEach(btnDK => {
      btnDK.addEventListener('click', btn_dangKy_Click)
    });
  } catch (error) {
    console.error(error);
    alert('Có lỗi khi lấy lịch thi');
  }
};

const txt_phieuDangKy_Change = function() {
  const nameDisplay = document.getElementById('lblHoTenKH');
  const options = document.querySelectorAll('#phieuDangKy option');
  const selectedID = input.value;
  let matchedName = '';

  options.forEach(option => {
    if (option.value === selectedID) {
      matchedName = option.dataset.hoten;
    }
  });

  // Update the displayed customer name
  nameDisplay.textContent = matchedName || '---';
  LayDSBaiThiDaDangKy(selectedID);
}

const txt_baiThiSearch_Change = function() {
  const query = this.value.toLowerCase();
  // console.log(query);
  const BaiThiItems = Array.from(document.querySelectorAll('.cardBaiThi'));

  BaiThiItems.forEach(item => {
    const textMa = item.dataset.mabaithi.toLowerCase();
    const textDiaDiem = item.dataset.diadiemthi.toLowerCase();
    const textNgayThi = item.dataset.ngaythi.toLowerCase();

    console.log(textDiaDiem);

    const match =
      textMa.includes(query) ||
      textDiaDiem.includes(query) ||
      textNgayThi.includes(query);

    item.style.display = match ? '' : 'none';
  });
};

const txt_chungChiSearch_Change = function() {
  const ChungChiContainer = document.getElementById('ChungChiContainer');
  const ChungChiItems = Array.from(ChungChiContainer.querySelectorAll('.cardChungChi'));
  const query = this.value.trim().toLowerCase();

  ChungChiItems.forEach(item => {
    const textTen = item.dataset.tenchungchi.toLowerCase();
    const textLoai = item.dataset.loaichungchi.toLowerCase();
    const textGia = item.dataset.gia.toLowerCase();
    const textID = item.dataset.chungchiid.toLowerCase();

    const match =
      textTen.includes(query) ||
      textLoai.includes(query) ||
      textGia.includes(query) ||
      textID.includes(query);

    item.style.display = match ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  input.value = '';
  input.addEventListener('input', txt_phieuDangKy_Change);

  const btnChonChungChi = document.querySelectorAll('.btnChonLichThi');

  btnChonChungChi.forEach(btn => {
    btn.addEventListener('click', btn_chonLichThi_Click);
  });

  const ChungChiSearchInput = document.getElementById('txtTimChungChi');

  ChungChiSearchInput.addEventListener('input', txt_chungChiSearch_Change);

  const BaiThiSearchInput = document.getElementById('txtTimBaiThi');

  BaiThiSearchInput.addEventListener('input', txt_baiThiSearch_Change);
});

