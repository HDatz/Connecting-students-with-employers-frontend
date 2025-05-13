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
                 <i class="fa "></i> <span id="ten-ntd">${tenNhaTuyenDung}</span>
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

    const userId = localStorage.getItem("userId");
    const notifBtn = document.getElementById("notif-btn");
    const notifDropdown = document.getElementById("notif-dropdown");
    const notifList = document.getElementById("notif-list");
    const notifCount = document.getElementById("notif-count");
    const notifEmpty = document.getElementById("notif-empty");

    if (token && userId && notifBtn) {
        notifBtn.addEventListener("click", async e => {
            e.preventDefault();
            notifDropdown.classList.toggle("hidden");
            if (!notifDropdown.classList.contains("hidden")) {
                await loadNotifications();
                await markAllNotificationsAsRead();
            }
        });
    }

    // ——————————————————————
    // 3. Hàm lấy và hiển thị Thông báo
    // ——————————————————————
    async function loadNotifications() {
        console.log("👉 Loading notifications for user", userId);
        try {
            const res = await fetch(`http://localhost:8080/api/thongbao/nguoi/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Fetch status:", res.status);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const items = await res.json();
            console.log("Parsed items:", items);
            renderNotifications(items);
        } catch (err) {
            console.error("Lỗi lấy thông báo:", err);
            notifEmpty.textContent = "Không thể tải thông báo.";
            notifEmpty.style.display = "block";
        }
    }

    async function markAllNotificationsAsRead() {
        try {
            const res = await fetch(`http://localhost:8080/api/thongbao/nguoi/${userId}/mark-read-all`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log("Tất cả thông báo đã được đánh dấu là đã đọc");
        } catch (err) {
            console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", err);
        }
    }

    function renderNotifications(items) {
        notifList.innerHTML = "";

        // Cập nhật badge số lượng chưa đọc
        const unread = items.filter(i => !i.daXem);
        if (unread.length) {
            notifCount.textContent = unread.length;
            notifCount.classList.remove("hidden");
        } else {
            notifCount.classList.add("hidden");
        }

        if (items.length === 0) {
            notifEmpty.textContent = "Không có thông báo mới";
            notifEmpty.style.display = "block";
            return;
        }
        notifEmpty.style.display = "none";

        items.forEach(item => {
            const dt = new Date(item.ngayGui);
            const dateStr = dt.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const li = document.createElement("li");
            li.classList.toggle("unread", !item.daXem);
            li.innerHTML = `
        <div class="notif-date">${dateStr}</div>
        <div class="notif-content">${item.noiDung}</div>
      `;
            li.addEventListener("click", () => markAsRead(item.idThongBao, li));
            notifList.appendChild(li);
        });
    }

    // ——————————————————————
    // 4. Hàm đánh dấu đã đọc
    // ——————————————————————
    async function markAsRead(idThongBao, li) {
        try {
            const res = await fetch(`http://localhost:8080/api/thongbao/${idThongBao}/mark-read`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            li.classList.remove("unread");

            // Cập nhật lại badge
            const count = parseInt(notifCount.textContent) - 1;
            if (count > 0) {
                notifCount.textContent = count;
            } else {
                notifCount.classList.add("hidden");
            }
        } catch (err) {
            console.error("Lỗi đánh dấu đã đọc:", err);
        }
    }
});

function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}