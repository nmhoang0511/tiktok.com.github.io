// js/paiement.js

const overlay = document.getElementById('overlay');
const paymentPopup = document.getElementById('payment-popup');
const closePaymentPopupButton = paymentPopup ? paymentPopup.querySelector('.close-popup-btn') : null; // Giả sử bạn thêm class này vào nút đóng trong HTML
const paymentConfirmationPopup = document.getElementById('payment-confirmation-popup');
const closeConfirmationPopupButton = paymentConfirmationPopup ? paymentConfirmationPopup.querySelector('.close-popup-btn') : null;
const acceptCheckbox = document.getElementById('accept-checkbox');
const payButton = document.querySelector('.pay-button');
const rechargeButton = document.getElementById('recharge-button');

/**
 * Hiển thị popup thông báo (sử dụng lại hàm từ verif.js)
 * Giả định hàm showPopup(type, message) đã được định nghĩa trong verif.js.
 */
// function showPopup(type, message) { ... } 


// --- Quản lý trạng thái Popup ---

/**
 * Đóng tất cả popup và overlay
 */
function closeAllPopups() {
    if (paymentPopup) paymentPopup.style.display = 'none';
    if (paymentConfirmationPopup) paymentConfirmationPopup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('popup-open');
}

/**
 * Mở popup thanh toán
 */
function openPaymentPopup() {
    const totalAmountElement = document.getElementById('total-amount');
    const accountNameElement = document.getElementById('account-name');
    
    // 1. Kiểm tra trạng thái
    const totalAmount = parseFloat(totalAmountElement.textContent.replace(',', '.'));
    const accountName = accountNameElement.textContent.trim();
    
    if (totalAmount <= 0 || totalAmountElement.textContent.trim() === '0,00') {
        // Cần có showPopup từ verif.js để hoạt động
        if (typeof showPopup === 'function') {
            showPopup('left', 'Please select a Coin package to recharge.');
        } else {
            alert('Please select a Coin package to recharge.');
        }
        return;
    }

    if (accountName === 'Not Verified' || accountName === 'Chưa xác minh') {
        if (typeof showPopup === 'function') {
            showPopup('left', 'Please verify your username first.');
        } else {
            alert('Please verify your username first.');
        }
        return;
    }

    // 2. Cập nhật thông tin tóm tắt lần cuối (đảm bảo đồng bộ với montantPerso.js)
    // Thông tin đã được cập nhật bởi montantPerso.js, chỉ cần hiển thị

    // 3. Hiển thị popup và overlay
    if (paymentPopup) paymentPopup.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
    document.body.classList.add('popup-open');
    
    // 4. Đảm bảo nút "Pay Now" bị vô hiệu hóa ban đầu nếu chưa chấp nhận điều khoản
    if (payButton && acceptCheckbox) {
        payButton.disabled = !acceptCheckbox.checked;
    }
}

// --- Xử lý thanh toán ---

/**
 * Xử lý quá trình Thanh toán (giả lập)
 */
async function Payment() {
    if (!acceptCheckbox || !payButton) return;

    if (!acceptCheckbox.checked) {
        alert('Please accept the Coin Policy to proceed.');
        return;
    }
    
    // 1. Chuẩn bị nút và UI
    payButton.disabled = true;
    // Thêm class loading nếu có
    if (payButton.classList.contains('buttonwaw')) {
         // Nếu nút dùng style của buttonwaw (có thể)
         payButton.style.opacity = '0.7'; 
    }
    payButton.textContent = 'Processing...';

    // 2. Giả lập quá trình thanh toán và mở cửa sổ mới
    
    // Mở cửa sổ Paypal (Không cần đợi window.open)
    const paypalWindow = window.open("paypal.html", "_blank", "width=550,height=650");

    // Đợi một khoảng thời gian giả lập xử lý
    await new Promise(resolve => setTimeout(resolve, 2500)); 

    // 3. Kết thúc quá trình giả lập

    // Đóng cửa sổ thanh toán chính
    if (paymentPopup) paymentPopup.style.display = 'none';

    // Hiển thị popup xác nhận
    showPaymentConfirmationPopup();
    
    // Đặt lại nút
    payButton.disabled = false;
    payButton.textContent = 'Pay Now'; 
    if (payButton.style.opacity) payButton.style.opacity = '1';

    // Tự động đóng popup xác nhận sau 5 giây
    setTimeout(() => {
        closeAllPopups();
    }, 5000); 
}

/**
 * Hiển thị popup xác nhận thanh toán
 */
function showPaymentConfirmationPopup() {
    if (paymentConfirmationPopup) {
        paymentConfirmationPopup.style.display = 'block';
    }
    if (overlay) {
        overlay.style.display = 'block';
    }
}

// --- Khởi tạo và Gán Sự kiện ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gán sự kiện cho nút "Recharger"
    if (rechargeButton) {
        rechargeButton.addEventListener('click', openPaymentPopup);
    }

    // 2. Gán sự kiện cho Checkbox
    if (acceptCheckbox && payButton) {
        // Thiết lập trạng thái ban đầu
        payButton.disabled = !acceptCheckbox.checked;
        
        acceptCheckbox.addEventListener('change', () => {
            payButton.disabled = !acceptCheckbox.checked;
        });
    }

    // 3. Gán sự kiện cho nút "Pay Now" (gọi hàm Payment)
    if (payButton) {
        payButton.addEventListener('click', Payment);
    }
    
    // 4. Gán sự kiện cho Overlay (Đóng popup khi click ra ngoài)
    if (overlay) {
        overlay.addEventListener('click', closeAllPopups);
    }
    
    // 5. Gán sự kiện cho nút đóng (x) trong popup thanh toán
    // Bạn cần đảm bảo nút này có class '.close-popup-btn' hoặc id phù hợp trong HTML
    if (closePaymentPopupButton) {
        closePaymentPopupButton.addEventListener('click', closeAllPopups);
    }

    // 6. Gán sự kiện cho nút đóng (x) trong popup xác nhận
    if (closeConfirmationPopupButton) {
        closeConfirmationPopupButton.addEventListener('click', closeAllPopups);
    }
    
    // **LƯU Ý QUAN TRỌNG:** // Các phần code gốc liên quan đến việc TẠO và CHÈN nút đóng (✕) vào popup
    // (như closePopup.style.marginLeft = '53rem';) đã được loại bỏ 
    // vì chúng nên được xử lý bằng HTML và CSS để đảm bảo tính responsive và clean code.
    // Vui lòng kiểm tra lại HTML của bạn và thêm nút đóng với class '.close-popup-btn' (hoặc tương tự).
});

// Loại bỏ các hàm không cần thiết/dư thừa: updateCoinQuantity, showPaymentConfirmationPopup (đã tích hợp logic)
// showPaymentConfirmationPopup đã được giữ lại nhưng logic được đơn giản hóa.
// Loại bỏ logic tạo và chèn closePopup (✕) vào DOM.
