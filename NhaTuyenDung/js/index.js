// ----------- Slider -----------
const imgPosition = document.querySelectorAll('.slides img');
const imgContainer = document.querySelector('.slides');
let ingNumber = imgPosition.length;
let index = 0;

imgPosition.forEach((img, index) => {
    img.style.left = index * 100 + '%';
});

function imgSlider() {
    index++;
    if (index >= ingNumber) {
        index = 0;
    }
    imgContainer.style.transform = 'translateX(' + (-index * 100) + '%)';
}
setInterval(imgSlider, 5000);


// ----------- Kiểm tra đăng nhập & hiển thị tên NTD -----------
document.addEventListener("DOMContentLoaded", function() {
    // Lấy token và tên nhà tuyển dụng từ localStorage
    const token = localStorage.getItem("token");
    const tenNhaTuyenDung = localStorage.getItem("ten");
    const loginItem = document.getElementById("login-item");

    // Nếu đã đăng nhập (có token) và có tên, thay thế nội dung nút đăng nhập:
    if (token && tenNhaTuyenDung && loginItem) {
        // Thêm class dropdown cho li
        loginItem.classList.add("dropdown");
        loginItem.innerHTML = `
            <a href="#" class="dropdown-toggle">
                <i class="fa fa"></i> <span id="ten-ntd">${tenNhaTuyenDung}</span>
            </a>
            <ul class="dropdown-menu">
                <li><a href="/NhaTuyenDung/sua-thong-tin.html">Tài Khoản</a></li>
                <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
            </ul>
        `;
        // Gán sự kiện cho nút Đăng Xuất
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(e) {
                e.preventDefault();
                dangXuat();
            });
        }
    }
});


function dangXuat() {
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/NhaTuyenDung/login.html";
}