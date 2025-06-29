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
        .then(data => {
            console.log('Response data:', data);
            if (data.success || data.message) {
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
}

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
    if (!actionButtons) {
        console.error('actionButtons element not found!');
        return;
    }
    
    // Clear existing buttons
    actionButtons.innerHTML = '';
    
    console.log('Rendering buttons for status:', tinhTrang);
    
    // Normalize the status (trim whitespace)
    const normalizedStatus = tinhTrang ? tinhTrang.trim() : '';
    console.log('Normalized status:', normalizedStatus);
    
    // Logic nghiệp vụ theo yêu cầu:
    // 1. Chờ duyệt: Có thể Duyệt, Thanh toán, Từ chối
    // 2. Đã thanh toán: Chỉ có thể Duyệt
    // 3. Đã duyệt, Từ chối: Chỉ có thể xem (chỉ nút Quay lại)
    
    if (normalizedStatus === 'Chờ duyệt') {
        console.log('Status: Chờ duyệt - Adding approve, reject, and payment buttons');
        
        // Nút Duyệt
        actionButtons.innerHTML += `
            <button 
                id="approveBtn"
                type="button" 
                onclick="handleApprove()"
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
        
        // Nút Thanh toán
        actionButtons.innerHTML += `
            <button 
                id="paymentBtn"
                type="button" 
                onclick="handlePayment()"
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-md text-sky-900 bg-sky-200 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200 min-w-24"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                Thanh toán
            </button>
        `;
    } 
    else if (normalizedStatus === 'Đã thanh toán') {
        console.log('Status: Đã thanh toán - Adding only approve button');
        
        // Chỉ nút Duyệt
        actionButtons.innerHTML += `
            <button 
                id="approveBtn"
                type="button" 
                onclick="handleApprove()"
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 min-w-24"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Duyệt
            </button>
        `;
    }
    else if (normalizedStatus === 'Đã duyệt' || normalizedStatus === 'Từ chối') {
        console.log('Status: ' + normalizedStatus + ' - Read only mode, only back button');
        // Chỉ cho phép xem, không có nút thao tác nào khác
    }
    else {
        console.log('Unknown status: ' + normalizedStatus + ' - Fallback to read only mode');
        // Trạng thái không xác định, chỉ cho phép xem
    }
    
    // Luôn luôn hiển thị nút Quay lại
    console.log('Adding back button');
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
    
    console.log('Final buttons HTML:', actionButtons.innerHTML);
    console.log('Number of buttons rendered:', actionButtons.children.length);
}
