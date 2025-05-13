document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const container = document.getElementById("company-info");

    if (!id) {
        container.innerHTML = "<p>Không tìm thấy công ty.</p>";
        return;
    }

    fetch(`http://localhost:8080/api/SinhVien/NhaTuyenDung/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("Không tìm thấy công ty");
            return res.json();
        })
        .then(data => {
            // 1. Avatar
            const img = document.getElementById("company-avatar");
            img.src = `http://localhost:8080/api/SinhVien/company_logos/${data.avatar}`;
            img.alt = `Logo ${data.tenCongTy}`;

            // 2. Điền info
            document.getElementById("company-name").textContent = data.tenCongTy;
            document.getElementById("company-email").textContent = data.email;
            document.getElementById("company-phone").textContent = data.soDienThoai;
            document.getElementById("company-address").textContent = data.diaChi;
            document.getElementById("company-field").textContent = data.linhVuc;

            const webA = document.getElementById("company-website");
            webA.href = data.trangWeb;
            webA.textContent = data.trangWeb;

            document.getElementById("company-created").textContent =
                new Date(data.ngayTao).toLocaleDateString("vi-VN");

            // 3. Giới thiệu
            document.getElementById("company-description").textContent =
                data.moTaCongTy || "Chưa có mô tả.";

            // 4. Map
            const mapDiv = document.getElementById("company-map");
            mapDiv.innerHTML = ""; // chắc chắn sạch
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(data.diaChi)}&output=embed`;
            iframe.loading = "lazy";
            iframe.width = "100%";
            iframe.height = "500";
            iframe.style.border = "0";
            mapDiv.appendChild(iframe);
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = "<p>Lỗi khi tải thông tin công ty.</p>";
        });
    const token = localStorage.getItem("token");
    const tenSinhVien = localStorage.getItem("ten");
    const userId = localStorage.getItem("userId");
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
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/SinhVien/login.html";
}