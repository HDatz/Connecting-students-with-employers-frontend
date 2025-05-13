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
                    <li><a href="/SinhVien/capnhattaikhoan.html">Tài Khoản</a></li>
                    <li><a href="/SinhVien/totaldonungtuyen.html">Đơn</a></li>
                    <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
                </ul>
            </li>
        `;
        const notificationItem = document.getElementById("notification-item");
        if (notificationItem) {
            notificationItem.style.display = "block";
        }

        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(e) {
                e.preventDefault();
                dangXuat();
            });
        }
    } else {
        // 👉 Ẩn icon thông báo nếu chưa đăng nhập
        if (notificationItem) {
            notificationItem.style.display = "none";
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

// Hàm đăng xuất
function dangXuat() {
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/SinhVien/login.html";
}