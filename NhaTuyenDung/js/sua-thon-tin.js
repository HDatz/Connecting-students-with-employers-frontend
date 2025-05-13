document.addEventListener("DOMContentLoaded", async() => {
    const API = "http://localhost:8080/api/nha-tuyen-dung";
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập!");
        return location.href = "/NhaTuyenDung/login.html";
    }

    // Parse JWT để lấy id và tên cho header
    const parseJwt = t => {
        try { return JSON.parse(atob(t.split(".")[1])); } catch { return {}; }
    };
    const payload = parseJwt(token);
    const ten = payload.ten || localStorage.getItem("ten");
    const idNtdFromToken = payload.id;
    if (!idNtdFromToken) {
        alert("Không xác định được tài khoản");
        return location.href = "/NhaTuyenDung/login.html";
    }

    // Header dropdown
    const loginItem = document.getElementById("login-item");
    if (ten) {
        loginItem.classList.add("dropdown");
        loginItem.innerHTML = `
        <a href="#" class="dropdown-toggle">${ten}</a>
        <ul class="dropdown-menu">
          <li><a href="/NhaTuyenDung/sua-thong-tin.html">Tài Khoản</a></li>
          <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
        </ul>`;
        document.getElementById("logout-btn").onclick = () => {
            localStorage.clear();
            location.href = "/NhaTuyenDung/login.html";
        };
    }

    // DOM elements
    const view = document.getElementById("view-profile");
    const form = document.getElementById("form-edit");
    const btnEdit = document.getElementById("btn-edit");
    const btnCancel = document.getElementById("btn-cancel");

    // Biến global chứa data nhà tuyển dụng
    let ntd = null;

    // 1) GET profile
    const res = await fetch(`${API}/company`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        alert("Không tải được hồ sơ");
        return;
    }
    ntd = await res.json(); // Gán ngay vào ntd

    // 2) Điền view
    if (ntd.avatar) {
        const img = document.createElement("img");
        img.src = `${API}/company_logos/${ntd.avatar}`;
        img.alt = "Logo công ty";
        img.style.maxWidth = "100px";
        document.getElementById("view-logo").appendChild(img);
    }
    document.getElementById("view-tenCongTy").textContent = ntd.tenCongTy || "";
    document.getElementById("view-email").textContent = ntd.email || "";
    document.getElementById("view-soDienThoai").textContent = ntd.soDienThoai || "";
    document.getElementById("view-diaChi").textContent = ntd.diaChi || "";
    document.getElementById("view-linhVuc").textContent = ntd.linhVuc || "";
    document.getElementById("view-trangWeb").textContent = ntd.trangWeb || "";
    document.getElementById("view-moTaCongTy").textContent = ntd.moTaCongTy || "";

    // 3) Điền form
    document.getElementById("tenCongTy").value = ntd.tenCongTy || "";
    document.getElementById("soDienThoai").value = ntd.soDienThoai || "";
    document.getElementById("diaChi").value = ntd.diaChi || "";
    document.getElementById("linhVuc").value = ntd.linhVuc || "";
    document.getElementById("trangWeb").value = ntd.trangWeb || "";
    document.getElementById("moTaCongTy").value = ntd.moTaCongTy || "";

    // 4) Toggle view/edit
    btnEdit.onclick = () => {
        view.classList.add("hidden");
        form.classList.remove("hidden");
    };
    btnCancel.onclick = () => {
        form.classList.add("hidden");
        view.classList.remove("hidden");
    };

    // 5) Submit PUT
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const payload = {
            tenCongTy: document.getElementById("tenCongTy").value,
            soDienThoai: document.getElementById("soDienThoai").value,
            diaChi: document.getElementById("diaChi").value,
            linhVuc: document.getElementById("linhVuc").value,
            trangWeb: document.getElementById("trangWeb").value,
            moTaCongTy: document.getElementById("moTaCongTy").value,
        };

        const updateRes = await fetch(`${API}/${ntd.idNhaTuyenDung}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            alert("Cập nhật thành công!");
            window.location.reload();
        } else {
            const err = await updateRes.text();
            alert("Lỗi khi cập nhật: " + err);
        }
    });
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

// Hàm đăng xuất, nếu cần gọi riêng
function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}