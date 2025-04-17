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
    // đóng model
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

    // Xử lý đăng nhập
    const token = localStorage.getItem("token");
    const tenNhaTuyenDung = localStorage.getItem("ten");
    const loginItem = document.getElementById("login-item");

    if (token && tenNhaTuyenDung && loginItem) {
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
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}