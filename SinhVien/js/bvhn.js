document.addEventListener("DOMContentLoaded", function() {
    let articlesData = []; // Lưu dữ liệu bài viết toàn bộ

    // Hàm render bài viết, chỉ cập nhật nội dung của #articles-list
    function renderArticles(data) {
        const articlesList = document.getElementById('articles-list');
        articlesList.innerHTML = ''; // Xóa danh sách cũ nếu có
        data.forEach(baiViet => {
            const article = document.createElement('article');
            article.classList.add('bai-viet');

            const title = document.createElement('h4');
            title.textContent = baiViet.tieuDe;

            const viewDetailsLink = document.createElement('a');
            viewDetailsLink.href = '#';
            viewDetailsLink.textContent = 'Xem chi tiết';

            const content = document.createElement('div');
            content.classList.add('noi-dung');
            content.style.display = 'none';
            content.innerHTML = baiViet.noiDung;

            //Xem chi tiết model
            viewDetailsLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Gán nội dung cho modal
                document.getElementById('modal-title').textContent = baiViet.tieuDe;
                document.getElementById('modal-body').innerHTML = baiViet.noiDung;
                // Hiển thị modal
                document.getElementById('modal').style.display = 'block';
            });

            article.appendChild(title);
            article.appendChild(viewDetailsLink);
            article.appendChild(content);
            articlesList.appendChild(article);
        });
    }

    // Gọi API lấy danh sách bài viết hướng nghiệp
    fetch('http://localhost:8080/api/SinhVien/BaiVietHuongNghiep')
        .then(response => response.json())
        .then(data => {
            articlesData = data; // Lưu dữ liệu vào biến toàn cục
            renderArticles(articlesData);
        })
        .catch(error => {
            console.error('Lỗi khi lấy bài viết hướng nghiệp:', error);
        });

    // Xử lý sự kiện tìm kiếm theo tiêu đề
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-title');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();

        // Lọc bài viết theo tiêu đề
        const filteredArticles = articlesData.filter(baiViet =>
            baiViet.tieuDe.toLowerCase().includes(query)
        );

        renderArticles(filteredArticles);
    });

    // Đóng model
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.modal .close');

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Đóng modal khi click bên ngoài nội dung modal
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
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