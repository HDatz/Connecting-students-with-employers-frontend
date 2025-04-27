document.addEventListener("DOMContentLoaded", function() {
    // Lấy token và tên nhà tuyển dụng từ localStorage
    const token = localStorage.getItem("token");
    const tenSinhVien = localStorage.getItem("ten");
    const loginItem = document.getElementById("login-item");

    // Nếu đã đăng nhập (có token) và có tên, thay thế nội dung nút đăng nhập:
    if (token && tenSinhVien && loginItem) {
        // Thêm class dropdown cho li
        loginItem.classList.add("dropdown");
        loginItem.innerHTML = `
        <li class="dropdown">
            <a href="#" class="dropdown-toggle">
                <i class=""></i> <span id="ten-sv">${tenSinhVien}</span>
            </a>
            <ul class="dropdown-menu">
                <li><a href="/NhaTuyenDung/sua-thong-tin.html">Tài Khoản</a></li>
                <li><a href="/SinhVien/totaldonungtuyen.html">Đơn Ứng Tuyển</a></li>
                <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
            </ul>
        </li>
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
    window.location.href = "/SinhVien/login.html";
}