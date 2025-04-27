document.addEventListener('DOMContentLoaded', () => {
    const companyList = document.querySelector('.company-list');
    const loginItem = document.getElementById('login-item');
    const token = localStorage.getItem('token');
    const sinhVienId = localStorage.getItem('userId');
    const tenSV = localStorage.getItem('ten');

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
          <li><a href="/SinhVien/taikhoan.html">Tài Khoản</a></li>
          <li><a href="/SinhVien/totaldonungtuyen.html">Đơn Ứng Tuyển</a></li>
          <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
        </ul>
      `;
        document.getElementById('logout-btn').addEventListener('click', e => {
            e.preventDefault();
            localStorage.clear();
            window.location.reload();
        });
    }

    // Modal & Apply init
    const modal = document.getElementById('post-detail-modal');
    const applyBtn = document.getElementById('apply-btn');
    applyBtn.style.display = 'none'; // hide by default
    let appliedPosts = [];

    // Fetch already applied posts if logged in
    if (token && sinhVienId) {
        fetch(`${API_BASE_URL}/api/SinhVien/ung-tuyen?sinhVienId=${sinhVienId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.ok ? r.json() : [])
            .then(list => appliedPosts = list.map(d => d.baiDangTuyenDung.idBaiDang))
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

        // Show modal
        modal.style.display = 'flex';

        // Show apply button only if logged in
        if (token) {
            applyBtn.style.display = 'block';
            if (appliedPosts.includes(post.idBaiDang)) {
                applyBtn.textContent = 'Đã Ứng tuyển';
                applyBtn.disabled = true;
            } else {
                applyBtn.textContent = 'Ứng tuyển';
                applyBtn.disabled = false;
            }
        } else {
            applyBtn.style.display = 'none';
        }
        applyBtn.dataset.id = post.idBaiDang;
    }

    // Close modal
    document.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => e.target === modal && (modal.style.display = 'none'));

    // Apply post
    applyBtn.addEventListener('click', () => {
        const pid = +applyBtn.dataset.id;
        const sinhVienId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!sinhVienId || !token) {
            alert('Bạn cần đăng nhập trước khi ứng tuyển!');
            window.location.href = '/login.html';
            return;
        }

        fetch(`${API_BASE_URL}/api/SinhVien/ung-tuyen?sinhVienId=${sinhVienId}&baiDangId=${pid}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
            .then(() => {
                alert('Ứng tuyển thành công!');
                appliedPosts.push(pid);
                applyBtn.textContent = 'Đã Ứng tuyển';
                applyBtn.disabled = true;
                modal.style.display = 'none';
            })
            .catch(err => alert('Lỗi: ' + err.message));
    });
});




function dangXuat() {
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/SinhVien/login.html";
}