function handleApprove() {
    if (confirm('Bạn có chắc chắn muốn duyệt phiếu gia hạn này?')) {
        // Disable button để tránh double click
        const approveBtn = document.getElementById('approveBtn');
        approveBtn.disabled = true;
        approveBtn.innerHTML = 'Đang xử lý...';
        
        // Lấy ID từ URL hoặc từ window object
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];
        
        // Lấy dữ liệu từ window object
        const chiTietGiaHan = window.chiTietGiaHan || {};
        
        // Tạo data object
        const requestData = {
            action: 'approve',
            extensionReason: chiTietGiaHan.liDoGiaHan || 'Duyệt gia hạn',
            replacementDate: chiTietGiaHan.ngayThayThe || null
        };
        
        console.log('Sending approve request:', {
            id: id,
            data: requestData
        });
        
        fetch(`/NVKT/quanligiahan/duyet/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async (data) => {
            console.log('Response data:', data);
            if (data.success || data.message) {
                // ✅ THÊM: Ghi vào danh sách chờ sau khi duyệt thành công
                try {
                    await fetch('/NVKT/dsCho', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            thiSinhID: chiTietGiaHan.maThiSinh || chiTietGiaHan.ThiSinhID,
                            phieuID: id,
                            tinhTrang: 0 // 0: chờ xử lý
                        })
                    });
                    console.log('✅ Đã thêm vào danh sách chờ');
                } catch (err) {
                    console.error('❌ Lỗi khi thêm vào danh sách chờ:', err);
                    // Không throw error để không làm gián đoạn flow chính
                }

                alert('Duyệt phiếu gia hạn thành công!');
                // Reload trang để cập nhật trạng thái
                window.location.reload();
            } else {
                throw new Error(data.error || 'Có lỗi xảy ra');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi duyệt phiếu gia hạn: ' + error.message);
            
            // Re-enable button
            approveBtn.disabled = false;
            approveBtn.innerHTML = `
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Duyệt
            `;
        });
    }
}-

function handleReject() {
    const lyDoTuChoi = prompt('Nhập lý do từ chối:', 'Không đủ điều kiện');
    
    if (lyDoTuChoi && lyDoTuChoi.trim()) {
        if (confirm('Bạn có chắc chắn muốn từ chối phiếu gia hạn này?')) {
            // Disable button để tránh double click
            const rejectBtn = document.getElementById('rejectBtn');
            rejectBtn.disabled = true;
            rejectBtn.innerHTML = 'Đang xử lý...';
            
            // Lấy ID từ URL
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            
            // Tạo data object
            const requestData = {
                action: 'reject',
                lyDoTuChoi: lyDoTuChoi.trim()
            };
            
            console.log('Sending reject request:', {
                id: id,
                data: requestData
            });
            
            fetch(`/NVKT/quanligiahan/tuchoi/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success || data.message) {
                    alert('Từ chối phiếu gia hạn thành công!');
                    // Reload trang để cập nhật trạng thái
                    window.location.reload();
                } else {
                    throw new Error(data.error || 'Có lỗi xảy ra');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi từ chối phiếu gia hạn: ' + error.message);
                
                // Re-enable button
                rejectBtn.disabled = false;
                rejectBtn.innerHTML = `
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Từ chối
                `;
            });
        }
    }
}

function handlePayment() {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    window.location.href = `/NVKT/quanligiahan/thanhtoan/${id}`;
}

function handleCancel() {
    window.location.href = '/NVKT/quanligiahan';
}

// Kiểm tra trạng thái khi trang load
document.addEventListener('DOMContentLoaded', function() {
    const chiTietGiaHan = window.chiTietGiaHan || {};
    console.log('Chi tiết gia hạn:', chiTietGiaHan);
    
    // Log trạng thái hiện tại
    console.log('Trạng thái phiếu gia hạn:', chiTietGiaHan.tinhTrang);
    console.log('Type of tinhTrang:', typeof chiTietGiaHan.tinhTrang);
    console.log('tinhTrang === "Chờ duyệt":', chiTietGiaHan.tinhTrang === 'Chờ duyệt');
    
    // Fallback for testing - nếu không có dữ liệu thì dùng "Chờ duyệt"
    let tinhTrang = chiTietGiaHan.tinhTrang;
    if (!tinhTrang || tinhTrang === '' || tinhTrang === 'undefined') {
        console.log('No status found, using fallback: Chờ duyệt');
        tinhTrang = 'Chờ duyệt';
    }
    
    // Render status badge
    renderStatusBadge(tinhTrang);
    
    // Render action buttons based on status
    renderActionButtons(tinhTrang);
});

function renderStatusBadge(tinhTrang) {
    const statusBadge = document.getElementById('statusBadge');
    if (!statusBadge) return;
    
    // Remove existing classes
    statusBadge.className = 'px-4 py-2 rounded-full text-sm font-semibold';
    
    // Add status-specific classes
    switch(tinhTrang) {
        case 'Chờ duyệt':
            statusBadge.classList.add('bg-yellow-200', 'text-yellow-800');
            break;
        case 'Đã duyệt':
            statusBadge.classList.add('bg-green-200', 'text-green-800');
            break;
        case 'Đã thanh toán':
            statusBadge.classList.add('bg-blue-200', 'text-blue-800');
            break;
        case 'Từ chối':
            statusBadge.classList.add('bg-red-200', 'text-red-800');
            break;
        default:
            statusBadge.classList.add('bg-gray-200', 'text-gray-800');
    }
}

function renderActionButtons(tinhTrang) {
    const actionButtons = document.getElementById('actionButtons');
    if (!actionButtons) return;
    actionButtons.innerHTML = '';

    const chiTietGiaHan = window.chiTietGiaHan || {};
    const loaiGiaHan = chiTietGiaHan.loaiGiaHan ? chiTietGiaHan.loaiGiaHan.trim() : '';

    // Chỉ hiển thị nút Duyệt và Từ chối khi trạng thái là "Chờ duyệt"
    if (tinhTrang === 'Chờ duyệt') {
        // Nút Duyệt
        actionButtons.innerHTML += `
            <button 
                id="approveBtn"
                type="button" 
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 min-w-24"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Duyệt
            </button>
        `;
        // Nút Từ chối
        actionButtons.innerHTML += `
            <button 
                id="rejectBtn"
                type="button" 
                onclick="handleReject()"
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 min-w-24"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Từ chối
            </button>
        `;

        // Gán sự kiện cho nút Duyệt
        setTimeout(() => {
            const approveBtn = document.getElementById('approveBtn');
            if (approveBtn) {
                approveBtn.onclick = function() {
                    if (loaiGiaHan === 'Bình Thường') {
                        // Chuyển sang trang thanh toán
                        window.location.href = `/NVKT/quanligiahan/thanhtoan/${chiTietGiaHan.id}`;
                    } else if (loaiGiaHan === 'Đặc biệt') {
                        // Duyệt luôn
                        handleApprove();

                    } else {
                        alert('Loại gia hạn không hợp lệ!');
                    }
                };
            }
        }, 0);
    }

    // Luôn có nút Quay lại
    actionButtons.innerHTML += `
        <button 
            type="button" 
            onclick="handleCancel()"
            class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 min-w-24"
        >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Quay lại
        </button>
    `;
}
