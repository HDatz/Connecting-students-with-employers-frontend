document.addEventListener('DOMContentLoaded', () => {
    const companyList = document.querySelector('.company-list');
    const loginItem = document.getElementById('login-item');
    const token = localStorage.getItem('token');
    const tenSinhVien = localStorage.getItem('ten');

    // Hiển thị dropdown khi đã login
    if (token && tenSinhVien && loginItem) {
        loginItem.classList.add('dropdown');
        loginItem.innerHTML = `
        <a href="#" class="dropdown-toggle">
          <span id="ten-sv">${tenSinhVien}</span>
        </a>
        <ul class="dropdown-menu">
          <li><a href="/SinhVien/taikhoan.html">Tài Khoản</a></li>
          <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
        </ul>
      `;
        document.getElementById('logout-btn').addEventListener('click', e => {
            e.preventDefault();
            localStorage.clear();
            window.location.reload();
        });
    }

    // Tạo modal hiển thị chi tiết
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'post-detail-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <img id="detail-banner" class="detail-banner" src="" alt="Banner">
        <div class="detail-body">
          <h2 id="detail-title"></h2>
          <p id="detail-description"></p>
          <p><strong>Yêu cầu:</strong> <span id="detail-requirements"></span></p>
          <p><strong>Địa điểm:</strong> <span id="detail-location"></span></p>
          <p><strong>Loại công việc:</strong> <span id="detail-type"></span></p>
          <p><strong>Mức lương:</strong> <span id="detail-salary"></span></p>
          <p><strong>Ngày đăng:</strong> <span id="detail-posted"></span></p>
          <p><strong>Hạn nộp:</strong> <span id="detail-deadline"></span></p>
          <p><strong>Số lượng tuyển:</strong> <span id="detail-quantity"></span></p>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Đóng modal khi nhấn close hoặc click ngoài
    modalOverlay.querySelector('.close-btn').addEventListener('click', () => modalOverlay.style.display = 'none');
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });

    // Fetch và hiển thị danh sách bài tuyển dụng
    fetch('http://127.0.0.1:8080/api/SinhVien/bai-dang', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    console.error('Server response error:', text);
                    throw new Error(`HTTP ${res.status}`);
                });
            }
            return res.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                console.error('Unexpected response format:', data);
                return;
            }
            renderList(data);
        })
        .catch(err => console.error('Lỗi khi fetch bài đăng:', err));

    function renderList(posts) {
        companyList.innerHTML = '';
        posts.forEach(post => {
            const item = document.createElement('div');
            item.className = 'company-item';
            const bannerUrl = `http://127.0.0.1:8080/api/SinhVien/banners/${post.banner}`;
            item.innerHTML = `
                <img src="${bannerUrl}" alt="Banner">
                <h4>${post.tieuDe}</h4>
                <p>${post.moTa.slice(0, 80)}...</p>
                <button class="detail-btn" data-id="${post.idBaiDang}">Xem chi tiết</button>
            `;
            companyList.appendChild(item);
        });
        bindDetailButtons(posts);
    }

    function bindDetailButtons(posts) {
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = parseInt(btn.getAttribute('data-id'), 10);
                const post = posts.find(p => p.idBaiDang === postId);
                if (post) showDetail(post);
            });
        });
    }

    function showDetail(post) {
        modalOverlay.style.display = 'flex';
        const bannerUrl = `http://127.0.0.1:8080/api/SinhVien/banners/${post.banner}`;
        modalOverlay.querySelector('#detail-banner').src = bannerUrl;
        modalOverlay.querySelector('#detail-title').textContent = post.tieuDe;
        modalOverlay.querySelector('#detail-description').textContent = post.moTa;
        modalOverlay.querySelector('#detail-requirements').textContent = post.yeuCau;
        modalOverlay.querySelector('#detail-location').textContent = post.diaDiem;
        modalOverlay.querySelector('#detail-type').textContent = post.loaiCongViec;
        modalOverlay.querySelector('#detail-salary').textContent = post.mucLuong;
        modalOverlay.querySelector('#detail-posted').textContent = new Date(post.ngayDang).toLocaleDateString();
        modalOverlay.querySelector('#detail-deadline').textContent = new Date(post.hanNop).toLocaleDateString();
        modalOverlay.querySelector('#detail-quantity').textContent = post.soLuongTuyen;
    }
});


function dangXuat() {
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/SinhVien/login.html";
}