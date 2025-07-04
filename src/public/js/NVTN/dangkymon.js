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
      <button class="rounded shadow-lg text-gray-500 hover:text-red-500 btn_xoaDangKy"
      data-baithi-id=${item.BaiThiID}
      data-phieu-id=${PhieuID}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `).join('');

  const btnXoaDangKy = document.querySelectorAll('.btn_xoaDangKy');
  btnXoaDangKy.forEach(item => {
    item.addEventListener('click', async function() {
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

        LayDSBaiThiDaDangKy(PhieuID);
      } catch (error) {
        console.error(error);
        alert('Có lỗi khi xóa đăng ký thi');
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('phieuDangKyInput');
  const nameDisplay = document.getElementById('tenKhachHang');
  const options = document.querySelectorAll('#phieuDangKy option');

  input.value = '';
  input.addEventListener('input', function() {
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
  });

  const btnChonChungChi = document.querySelectorAll('.btn-chon-lich-thi');
  btnChonChungChi.forEach(btn => {
    btn.addEventListener('click', async function() {
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
          <tr class="border-b last:border-none even:bg-[#E6F0FF]">
            <td class="py-2 px-3 whitespace-nowrap">${item.BaiThiID}</td>
            <td class="py-2 px-3 whitespace-nowrap">${TenChungChi}</td>
            <td class="py-2 px-3">${item.DiaDiemThi}</td>
            <td class="py-2 px-3">${new Date(item.ThoiGianThi).toLocaleDateString('vi-VN')}</td>
            <td class="py-2 px-3 text-left">
              <button
                class="bg-babyblue hover:bg-darkblue hover:text-white transition text-xs rounded px-3 py-1 btn-dang-ky"
                data-baithi-id=${item.BaiThiID}
              >Đăng Ký</button>
            </td>
          </tr>
        `).join('');

        const btnDangKy = document.querySelectorAll('.btn-dang-ky');
        btnDangKy.forEach(btnDK => {
          btnDK.addEventListener('click', async function() {
            try {
              const DSDangKyThi = {
                phieuID: input.value,
                BaiThiID: this.dataset.baithiId
              }
              const url = `
              /NVTN/api/danhsachDKThi
              `
              const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(DSDangKyThi),
              });

              if (!response.ok) throw new Error('Có lỗi khi đăng ký bài thi cho phiếu');

              LayDSBaiThiDaDangKy(DSDangKyThi.phieuID);
              alert('🎉 Đăng ký thành công!');

            } catch (error) {
              console.error(error);
              alert('Có lỗi khi đăng ký lịch thi');
            }
          })
        });
      } catch (error) {
        console.error(error);
        alert('Có lỗi khi lấy lịch thi');
      }
    });
    // const { errorMonitor } = require("nodemailer/lib/xoauth2");
  });

});

