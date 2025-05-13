document.addEventListener('DOMContentLoaded', () => {
    const companyList = document.querySelector('.company-list');
    const loginItem = document.getElementById('login-item');
    const token = localStorage.getItem('token');
    const sinhVienId = localStorage.getItem('userId');
    const tenSV = localStorage.getItem('ten');
    const notificationItem = document.getElementById("notification-item");

    // Backend URL
    const API_BASE_URL = 'http://localhost:8080';

    // Dropdown login
    if (token && tenSV) {
        loginItem.classList.add('dropdown');
        loginItem.innerHTML = `
        <a href="#" class="dropdown-toggle">
          ${tenSV} <i class="fas "></i>
        </a>
        <ul class="dropdown-menu">
          <li><a href="/SinhVien/capnhattaikhoan.html">Tài Khoản</a></li>
          <li><a href="/SinhVien/totaldonungtuyen.html">Đơn</a></li>
          <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
        </ul>
      `;
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

    // Modal & Apply init
    const modal = document.getElementById('post-detail-modal');
    const showApplyBtn = document.getElementById('apply-btn'); // nút Ứng tuyển bước 1
    const cvUploadDiv = document.getElementById('cv-upload'); // div chứa form upload (ẩn sẵn)
    const applyForm = document.getElementById('apply-form'); // form bước 2
    showApplyBtn.style.display = 'none';
    cvUploadDiv.style.display = 'none';

    let appliedPosts = [];

    // Fetch already applied posts if logged in
    if (token && sinhVienId) {
        fetch(`${API_BASE_URL}/api/SinhVien/ung-tuyen?sinhVienId=${sinhVienId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.ok ? r.json() : [])
            .then(list => {
                appliedPosts = list.map(d => d.baiDangTuyenDung.idBaiDang);
            })
            .catch(console.error);
    }

    // Fetch all posts
    fetch(`${API_BASE_URL}/api/SinhVien/bai-dang`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        .then(r => r.ok ? r.json() : Promise.reject('Cannot load posts'))
        .then(posts => renderList(posts))
        .catch(err => console.error(err));

    function renderList(posts) {
        companyList.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'company-item';
            const bannerUrl = post.banner ?
                `${API_BASE_URL}/api/SinhVien/banners/${post.banner}` :
                '/default-banner.jpg';
            card.innerHTML = `
          <img src="${bannerUrl}" alt="Banner" />
          <div class="info">
            <h4>${post.tieuDe}</h4>
            <p>${post.moTa.slice(0,100)}...</p>
            <button class="btn detail-btn" data-id="${post.idBaiDang}">Xem chi tiết</button>
          </div>
        `;
            companyList.append(card);
        });
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pid = +btn.dataset.id;
                const post = posts.find(p => p.idBaiDang === pid);
                showDetail(post);
            });
        });
    }

    function showDetail(post) {
        // Populate modal content
        document.getElementById('detail-banner').src = post.banner ?
            `${API_BASE_URL}/api/SinhVien/banners/${post.banner}` :
            '/default-banner.jpg';
        document.getElementById('detail-title').textContent = post.tieuDe;
        document.getElementById('detail-description').textContent = post.moTa;
        document.getElementById('detail-requirements').textContent = post.yeuCau;
        document.getElementById('detail-location').textContent = post.diaDiem;
        document.getElementById('detail-type').textContent = post.loaiCongViec;
        document.getElementById('detail-salary').textContent = post.mucLuong;
        document.getElementById('detail-posted').textContent = new Date(post.ngayDang).toLocaleDateString();
        document.getElementById('detail-deadline').textContent = new Date(post.hanNop).toLocaleDateString();
        document.getElementById('detail-quantity').textContent = post.soLuongTuyen;

        // Store postId lên form
        applyForm.dataset.postId = post.idBaiDang;

        // Reset nút & form
        showApplyBtn.textContent = 'Ứng tuyển';
        showApplyBtn.disabled = appliedPosts.includes(post.idBaiDang);
        showApplyBtn.style.display = token ? 'block' : 'none';
        cvUploadDiv.style.display = 'none';
        applyForm.reset();

        // Show modal
        modal.style.display = 'flex';
    }

    // Bước 1: khi bấm nút Apply
    showApplyBtn.addEventListener('click', () => {
        showApplyBtn.style.display = 'none';
        cvUploadDiv.style.display = 'block';
    });

    // Bước 2: gửi form upload CV
    applyForm.addEventListener('submit', e => {
        e.preventDefault();

        // Kiểm tra đăng nhập
        if (!sinhVienId || !token) {
            alert('Bạn cần đăng nhập trước khi ứng tuyển!');
            window.location.href = '/SinhVien/login.html';
            return;
        }

        const fileInput = document.getElementById('cv-file');
        if (!fileInput.files[0]) {
            alert('Vui lòng chọn file CV (PDF)!');
            return;
        }

        const pid = applyForm.dataset.postId;
        const formData = new FormData();
        formData.append('sinhVienId', sinhVienId);
        formData.append('baiDangId', pid);
        formData.append('duongDanCv', fileInput.files[0]);

        fetch(`${API_BASE_URL}/api/SinhVien/ung-tuyen`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            .then(res => {
                if (!res.ok) return res.text().then(t => { throw new Error(t); });
                return res.json();
            })
            .then(() => {
                alert('Ứng tuyển thành công!');
                appliedPosts.push(+pid);
                modal.style.display = 'none';
            })
            .catch(err => alert('Lỗi: ' + err.message));
    });

    // Close modal
    document.querySelector('.close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });
});

// Hàm logout
function dangXuat() {
    localStorage.clear();
    window.location.href = "/SinhVien/login.html";
}