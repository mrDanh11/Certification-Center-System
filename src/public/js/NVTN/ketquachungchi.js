// document.addEventListener('DOMContentLoaded', () => {
//   const btnSearch        = document.getElementById('btnSearch');
//   const btnProceedConfirm = document.getElementById('btnProceedConfirm');
//   const cccdInput        = document.getElementById('cccdInput');
//   const customerSection  = document.getElementById('customerSection');
//   const certTableSection = document.getElementById('certTableSection');
//   const certTableBody    = document.getElementById('certTableBody');

//   // Khi nhấn “Tìm kiếm”
//   btnSearch.addEventListener('click', async () => {
//     const cccd = cccdInput.value.trim();
//     if (!cccd) return alert('Hãy nhập CCCD trước khi tra cứu');

//     try {
//       const res = await fetch(`/NVTN/KetQuaChungChi/api?cccd=${encodeURIComponent(cccd)}`);
//       if (!res.ok) throw await res.json();
//       const { customer, certificates } = await res.json();

//       // Hiển thị thông tin khách hàng vào các <input readonly>
//       document.getElementById('c_cccd').value  = customer.CCCD;
//       document.getElementById('c_hoten').value = customer.Hoten;
//       document.getElementById('c_email').value = customer.Email;
//       document.getElementById('c_phone').value = customer.Dienthoai;
//       document.getElementById('c_type').value  = customer.LoaiKH;
//       document.getElementById('c_count').value = customer.SoLuong;

//       customerSection.classList.remove('hidden');
//       certTableSection.classList.remove('hidden');

//       // Đổ bảng chứng chỉ
//       certTableBody.innerHTML = '';
//       certificates.forEach((row, idx) => {
//         // chỉ cho check khi đang "Chờ xác nhận"
//         const rawStatus = String(row.TrangThai || '');
//         const statusTrim = rawStatus.trim();
//         const normalized = statusTrim.toLowerCase();
//         const canCheck = normalized === 'chờ xác nhận';
//         const isPending = normalized === 'chờ xác nhận';

//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//           <td class="border px-4 py-2 text-center">${idx + 1}</td>
//           <td class="border px-4 py-2">${row.LoaiChungChi}</td>
//           <td class="border px-4 py-2">${row.TenChungChi}</td>
//           <td class="border px-4 py-2">${new Date(row.NgayThi).toLocaleDateString('vi-VN')}</td>
//           <td class="border px-4 py-2">${row.DiaDiemThi}</td>
//           <td class="border px-4 py-2 ${isPending}">${row.TrangThai}</td>
//           <td class="border px-4 py-2 text-center">
//             ${canCheck 
//               ? `<input type="checkbox" class="cert-checkbox" value="${row.KetQuaID}" />`
//               : ``
//             }
//           </td>
//         `;
//         certTableBody.appendChild(tr);
//       });

//     } catch (err) {
//       alert(err.error || err);
//     }
//   });

//   // Khi nhấn “Nhận chứng chỉ”
//   btnProceedConfirm.addEventListener('click', () => {
//     const selected = Array.from(document.querySelectorAll('.cert-checkbox:checked'))
//                           .map(cb => cb.value);
//     if (selected.length === 0) {
//       return alert('Chọn ít nhất một chứng chỉ để cấp.');
//     }
//     // chuyển qua màn confirm, truyền CCCD và mảng IDs
//     const cccd = document.getElementById('c_cccd').value.trim();
//     const ids  = selected.join(',');
//     window.location = `/NVTN/KetQuaChungChi/confirm?cccd=${encodeURIComponent(cccd)}&ids=${ids}`;
//   });
// });

document.addEventListener('DOMContentLoaded', () => {
  const btnSearch         = document.getElementById('btnSearch');
  const btnProceedConfirm = document.getElementById('btnProceedConfirm');
  const cccdInput         = document.getElementById('cccdInput');
  const customerSection   = document.getElementById('customerSection');
  const certTableSection  = document.getElementById('certTableSection');
  const certTableBody     = document.getElementById('certTableBody');
  let currentCustomerType = null;

  // 1) Khi nhấn “Tìm kiếm”
  btnSearch.addEventListener('click', async () => {
    const cccd = cccdInput.value.trim();
    if (!cccd) return alert('Hãy nhập CCCD trước khi tra cứu');

    try {
      const res = await fetch(
        `/NVTN/KetQuaChungChi/api?cccd=${encodeURIComponent(cccd)}`
      );
      if (!res.ok) throw await res.json();
      const { customer, certificates } = await res.json();

      // Lưu loại khách để xử lý sau
      currentCustomerType = customer.LoaiKH;

      // 2) Hiển thị thông tin khách hàng
      document.getElementById('c_cccd').value  = customer.CCCD;
      document.getElementById('c_hoten').value = customer.Hoten;
      document.getElementById('c_email').value = customer.Email;
      document.getElementById('c_phone').value = customer.Dienthoai;
      document.getElementById('c_type').value  = customer.LoaiKH;
      document.getElementById('c_count').value = customer.SoLuong;

      customerSection.classList.remove('hidden');
      certTableSection.classList.remove('hidden');

      // 3) Đổ bảng chứng chỉ
      certTableBody.innerHTML = '';
      certificates.forEach((row, idx) => {
        const rawStatus  = String(row.TrangThai || '');
        const statusTrim = rawStatus.trim();
        const normalized = statusTrim.toLowerCase();
        const isPending  = normalized === 'chờ xác nhận';

        // In đậm status nếu đang chờ
        const statusHtml   = isPending 
          ? `<strong>${statusTrim}</strong>` 
          : statusTrim;

        // Chỉ render checkbox khi status là Chờ xác nhận
        const checkboxHtml = isPending
          ? `<input type="checkbox" class="cert-checkbox" value="${row.KetQuaID}" />`
          : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="border px-4 py-2 text-center">${idx + 1}</td>
          <td class="border px-4 py-2">${row.LoaiChungChi}</td>
          <td class="border px-4 py-2">${row.TenChungChi}</td>
          <td class="border px-4 py-2">${new Date(row.NgayThi).toLocaleDateString('vi-VN')}</td>
          <td class="border px-4 py-2">${row.DiaDiemThi}</td>
          <td class="border px-4 py-2">${statusHtml}</td>
          <td class="border px-4 py-2 text-center">${checkboxHtml}</td>
        `;
        certTableBody.appendChild(tr);
      });

      // 4) Nếu là Đơn Vị thì chỉ cho tick 1 checkbox
      if (currentCustomerType === 'Đơn Vị') {
        document.querySelectorAll('.cert-checkbox').forEach(cb => {
          cb.addEventListener('change', () => {
            if (cb.checked) {
              document
                .querySelectorAll('.cert-checkbox')
                .forEach(other => { if (other !== cb) other.checked = false });
            }
          });
        });
      }

    } catch (err) {
      alert(err.error || err);
    }
  });

  // 5) Khi nhấn “Nhận chứng chỉ”
  btnProceedConfirm.addEventListener('click', () => {
    const selected = Array.from(
      document.querySelectorAll('.cert-checkbox:checked')
    ).map(cb => cb.value);

    if (selected.length === 0) {
      return alert('Chọn ít nhất một chứng chỉ để cấp.');
    }

    const cccd = document.getElementById('c_cccd').value.trim();
    const ids  = selected.join(',');

    // Chuyển qua màn confirm, truyền CCCD và danh sách IDs
    window.location = `/NVTN/KetQuaChungChi/confirm?cccd=${encodeURIComponent(cccd)}&ids=${ids}`;
  });
});
