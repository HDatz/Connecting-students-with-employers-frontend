document.addEventListener('DOMContentLoaded', function() {
    // Hàm lấy danh sách nhà tuyển dụng từ API
    fetch('http://localhost:8080/api/SinhVien/NhaTuyenDung')
        .then(response => response.json())
        .then(data => {
            const companyList = document.querySelector('.company-list');
            companyList.innerHTML = ''; // Xóa nội dung cũ

            // Duyệt qua dữ liệu và thêm vào HTML
            data.forEach(company => {
                const companyItem = document.createElement('article');
                companyItem.classList.add('company-item');

                // Tạo phần tử logo công ty
                const companyLogo = document.createElement('img');
                companyLogo.src = `http://localhost:8080/api/SinhVien/company_logos/${company.avatar}`; // Lấy ảnh từ API
                companyLogo.alt = `Logo ${company.tenCongTy}`;

                // Tạo phần tử tên công ty
                const companyName = document.createElement('h4');
                companyName.textContent = company.tenCongTy;

                // Tạo phần tử mô tả công ty
                const companyDescription = document.createElement('p');
                companyDescription.textContent = company.moTaCongTy || 'Chưa có mô tả';
                companyDescription.style.display = 'none';

                // Tạo phần tử liên kết xem chi tiết
                const viewDetailsLink = document.createElement('a');
                viewDetailsLink.href = `#`; // Hoặc đường dẫn chi tiết công ty nếu có
                viewDetailsLink.textContent = 'Xem chi tiết';

                // Thêm tất cả phần tử vào companyItem
                companyItem.appendChild(companyLogo);
                companyItem.appendChild(companyName);
                companyItem.appendChild(companyDescription);
                companyItem.appendChild(viewDetailsLink);

                // Thêm companyItem vào danh sách công ty
                companyList.appendChild(companyItem);

                viewDetailsLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    companyDescription.style.display = companyDescription.style.display === 'none' ? 'block' : 'none';
                });
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy dữ liệu nhà tuyển dụng:', error);
        });

    // Thêm đoạn mã login vào sau khi trang đã tải
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

// Hàm đăng xuất
function dangXuat() {
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/SinhVien/login.html";
}