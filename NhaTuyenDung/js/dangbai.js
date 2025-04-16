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
                <i class="fa fa-user"></i> <span id="ten-ntd">${tenNhaTuyenDung}</span>
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

document.getElementById('dangBaiForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const baiViet = {
        tieuDe: document.getElementById('tieuDe').value,
        moTa: document.getElementById('moTa').value,
        yeuCau: document.getElementById('yeuCau').value,
        diaDiem: document.getElementById('diaDiem').value,
        loaiCongViec: document.getElementById('loaiCongViec').value,
        mucLuong: document.getElementById('mucLuong').value,
        hanNop: document.getElementById('hanNop').value,
        soLuongTuyen: parseInt(document.getElementById('soLuongTuyen').value),
        trangThai: "CHO_DUYET" // mặc định khi đăng bài
    };

    const token = localStorage.getItem('token');
    const idNhaTuyenDung = localStorage.getItem('idNhaTuyenDung');

    try {
        const response = await fetch(`http://localhost:8080/api/nhatuyendung/${idNhaTuyenDung}/baiviet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(baiViet)
        });

        if (response.ok) {
            alert("Đăng bài thành công!");
            document.getElementById('dangBaiForm').reset();
        } else {
            const error = await response.text();
            alert("Lỗi khi đăng bài: " + error);
        }
    } catch (err) {
        alert("Lỗi kết nối đến server: " + err.message);
    }
});