document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Bạn cần đăng nhập!");
        return window.location.href = "/NhaTuyenDung/login.html";
    }

    const parseJwt = t => {
        try {
            let b = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(b));
        } catch { return {}; }
    };
    const payload = parseJwt(token);
    const idNtd = localStorage.getItem("idNhaTuyenDung") || payload.id;
    if (!idNtd) {
        alert("Bạn cần đăng nhập!");
        return window.location.href = "/NhaTuyenDung/login.html";
    }
    localStorage.setItem("idNhaTuyenDung", idNtd);

    // Header user dropdown
    const loginItem = document.getElementById("login-item");
    const ten = payload.ten || localStorage.getItem("ten");
    if (ten) {
        loginItem.classList.add("dropdown");
        loginItem.innerHTML = `
        <a href="#" class="dropdown-toggle"><i class="fa"></i> ${ten}</a>
        <ul class="dropdown-menu">
        <li><a href="/NhaTuyenDung/sua-thong-tin.html">Tài Khoản</a></li>
        <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
        </ul>`;
        document.getElementById("logout-btn").onclick = () => {
            localStorage.clear();
            location.href = "/NhaTuyenDung/login.html";
        };
    }

    // === Form tạo mới ===
    document.getElementById("dangBaiForm").onsubmit = async e => {
        e.preventDefault();
        const form = e.target;

        // Append thủ công tất cả các trường trong form
        const formData = new FormData();
        formData.append("tieuDe", document.getElementById("tieuDe").value);
        formData.append("moTa", document.getElementById("moTa").value);
        formData.append("yeuCau", document.getElementById("yeuCau").value);
        formData.append("diaDiem", document.getElementById("diaDiem").value);
        formData.append("loaiCongViec", document.getElementById("loaiCongViec").value);
        formData.append("mucLuong", document.getElementById("mucLuong").value);
        formData.append("hanNop", document.getElementById("hanNop").value);
        formData.append("soLuongTuyen", document.getElementById("soLuongTuyen").value);
        formData.append("email", payload.email || localStorage.getItem("email") || "");
        formData.append("idNguoiDang", idNtd);

        // Nếu có file banner thì append
        const bannerInput = document.getElementById("banner");
        if (bannerInput.files.length > 0) {
            formData.append("banner", bannerInput.files[0]);
        }

        try {
            let res = await fetch(`http://localhost:8080/api/nha-tuyen-dung/bai-dang`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                alert("Đăng bài thành công!");
                form.reset();
                loadPosts(); // Cập nhật danh sách bài đăng sau khi đăng bài
            } else {
                alert("Lỗi: " + await res.text());
            }
        } catch (err) {
            alert("Lỗi kết nối: " + err.message);
        }
    };

    // === Load & render danh sách ===
    async function loadPosts() {
        const container = document.getElementById("dsBaiDang");
        container.innerHTML = `<p>Đang tải...</p>`;
        try {
            const res = await fetch(`http://localhost:8080/api/nha-tuyen-dung/${idNtd}/bai-dang`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            const list = await res.json();

            if (!list.length) {
                container.innerHTML = `<p>Chưa có bài đăng nào.</p>`;
                return;
            }
            container.innerHTML = "";
            list.forEach(p => {
                const card = document.createElement("div");
                card.className = "post-card";
                card.innerHTML = `
            <h3>${p.tieuDe}</h3>
            <p><strong>Địa điểm:</strong> ${p.diaDiem||'—'}</p>
            <p><strong>Loại:</strong> ${p.loaiCongViec}</p>
            <p><strong>Hạn nộp:</strong> ${new Date(p.hanNop).toLocaleDateString()}</p>
            <p><strong>Trạng thái:</strong>
              <span class="badge ${p.trangThai}">${p.trangThai}</span>
            </p>
            <div class="actions"></div>
          `;
                const actions = card.querySelector(".actions");

                // Chi tiết luôn có
                const btnDetail = document.createElement("button");
                btnDetail.className = "btn-primary";
                btnDetail.innerHTML = `<i class="fa fa-eye"></i> Chi tiết`;
                btnDetail.onclick = () => viewPostDetail(p.idBaiDang);
                actions.appendChild(btnDetail);

                // Xóa chỉ khi CHO_DUYET
                if (p.trangThai === "CHO_DUYET" || p.trangThai === "TU_CHOI") {
                    const btnDelete = document.createElement("button");
                    btnDelete.className = "btn-danger";
                    btnDelete.innerHTML = `<i class="fa fa-trash"></i> Xóa`;
                    btnDelete.onclick = () => {
                        if (confirm("Bạn có chắc muốn xóa bài này?")) {
                            deletePost(p.idBaiDang);
                        }
                    };
                    actions.appendChild(btnDelete);
                }

                container.appendChild(card);
            });
        } catch (err) {
            container.innerHTML = `<p class="error">Không tải được: ${err.message}</p>`;
        }
    }

    // === Xem chi tiết & gắn modal ===
    async function viewPostDetail(idBaiDang) {
        const modal = document.getElementById("detail-modal");
        const form = document.getElementById("modal-form");
        const saveBtn = document.getElementById("md-save-btn");
        const deleteBtn = document.getElementById("md-delete-btn");

        modal.dataset.id = idBaiDang;

        try {
            const res = await fetch(
                `http://localhost:8080/api/nha-tuyen-dung/bai-dang/${idBaiDang}?idNhaTuyenDung=${idNtd}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );
            if (!res.ok) throw new Error(await res.text());
            const detail = await res.json();

            // Fill form
            form.elements["md-tieuDe"].value = detail.tieuDe;
            form.elements["md-moTa"].value = detail.moTa;
            form.elements["md-yeuCau"].value = detail.yeuCau;
            form.elements["md-diaDiem"].value = detail.diaDiem;
            form.elements["md-loaiCongViec"].value = detail.loaiCongViec;
            form.elements["md-mucLuong"].value = detail.mucLuong;
            form.elements["md-soLuongTuyen"].value = detail.soLuongTuyen;
            form.elements["md-hanNop"].value = detail.hanNop ? detail.hanNop.split("T")[0] : ""

            if (detail.trangThai === "CHO_DUYET") {
                saveBtn.disabled = false;
                deleteBtn.style.display = "inline-block";
                Array.from(form.elements).forEach(el => el.disabled = false);
            } else {
                saveBtn.disabled = true;
                deleteBtn.style.display = "none";
                Array.from(form.elements).forEach(el => el.disabled = true);
            }

            const bannerPreview = document.getElementById("md-banner-preview");
            if (bannerPreview) {
                if (detail.banner) {
                    bannerPreview.src = `http://localhost:8080/api/nha-tuyen-dung/banners/${detail.banner}`;
                    bannerPreview.style.display = "block";
                } else {
                    bannerPreview.style.display = "none";
                    bannerPreview.src = "";
                }
            }

            modal.style.display = "block";
        } catch (err) {
            alert("Không thể lấy chi tiết: " + err.message);
        }
    }

    // === Submit chỉnh sửa (PUT) ===
    document.getElementById("modal-form").onsubmit = async e => {
        e.preventDefault();
        const modal = document.getElementById("detail-modal");
        const idBaiDang = modal.dataset.id;
        const form = e.target;

        // Tạo FormData và append từng field bắt buộc
        const formData = new FormData();
        formData.append("tieuDe", form.elements["md-tieuDe"].value);
        formData.append("moTa", form.elements["md-moTa"].value);
        formData.append("yeuCau", form.elements["md-yeuCau"].value);
        formData.append("diaDiem", form.elements["md-diaDiem"].value);
        formData.append("loaiCongViec", form.elements["md-loaiCongViec"].value);
        formData.append("mucLuong", form.elements["md-mucLuong"].value);
        formData.append("soLuongTuyen", form.elements["md-soLuongTuyen"].value);

        // Đảm bảo hanNop đúng định dạng yyyy-MM-dd
        const rawHanNop = form.elements["md-hanNop"].value;
        const hanNopFormatted = rawHanNop.split("T")[0];
        formData.append("hanNop", hanNopFormatted);

        // Thông tin cập nhật và email
        formData.append("email", payload.email || localStorage.getItem("email") || "");
        formData.append("idNguoiCapNhat", idNtd);

        // Chỉ append banner nếu có file thật sự
        const bannerInput = form.elements["md-banner"];
        if (bannerInput && bannerInput.files.length > 0) {
            formData.append("banner", bannerInput.files[0]);
        }

        try {
            const res = await fetch(
                `http://localhost:8080/api/nha-tuyen-dung/bai-dang/${idBaiDang}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                }
            );
            if (res.ok) {
                alert("Cập nhật thành công!");
                modal.style.display = "none";
                loadPosts();
            } else {
                alert("Lỗi: " + await res.text());
            }
        } catch (err) {
            alert("Lỗi kết nối: " + err.message);
        }
    };


    // === Xóa bài đăng ===
    async function deletePost(idBaiDang, fromModal = false) {
        try {
            const res = await fetch(
                `http://localhost:8080/api/nha-tuyen-dung/bai-dang/${idBaiDang}/xoa?idNguoiXoa=${idNtd}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );
            if (!res.ok) throw new Error(await res.text());
            alert("Xóa thành công!");
            if (fromModal) document.getElementById("detail-modal").style.display = "none";
            loadPosts();
        } catch (err) {
            alert("Xóa thất bại: " + err.message);
        }
    }

    // Gắn cho nút xóa trong modal
    document.getElementById("md-delete-btn").onclick = () => {
        const modal = document.getElementById("detail-modal");
        const idBaiDang = modal.dataset.id;
        if (confirm("Bạn có chắc muốn xóa bài này?")) {
            deletePost(idBaiDang, true);
        }
    };

    // Đóng modal
    document.querySelector(".close-btn").onclick = () => {
        document.getElementById("detail-modal").style.display = "none";
    };

    // Khởi chạy
    loadPosts();

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
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}