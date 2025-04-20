// Biến lưu trạng thái filter hiện tại
let currentFilter = 'all';

// Khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '/login.html';
    });

    // Gán sự kiện cho dropdown lọc
    document.querySelectorAll('.dropdown-item[data-filter]').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            currentFilter = item.getAttribute('data-filter');
            document.getElementById('filterDropdown').innerText = item.innerText;
            loadBaiDangList();
        });
    });

    checkLoginAndLoad();
});

// Kiểm tra token & load dữ liệu
function checkLoginAndLoad() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn cần đăng nhập!');
        window.location.href = '/login.html';
        return;
    }
    loadBaiDangList();
}

// Load toàn bộ danh sách rồi lọc theo currentFilter
async function loadBaiDangList() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:8080/api/QuanTriVien/BaiDang/danhsach', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 403) {
            alert('Phiên đăng nhập hết hạn hoặc không đủ quyền. Vui lòng đăng nhập lại.');
            localStorage.clear();
            window.location.href = '/QuanTriVien/login.html';
            return;
        }
        if (!res.ok) {
            throw new Error('Lỗi khi lấy danh sách bài đăng');
        }

        let data = await res.json();

        // Lọc theo trạng thái
        if (currentFilter === 'approved') {
            data = data.filter(p => p.trangThai === 'DA_DUYET');
        } else if (currentFilter === 'pending') {
            data = data.filter(p => p.trangThai === 'CHO_DUYET');
        } else if (currentFilter === 'rejected') {
            data = data.filter(p => p.trangThai === 'TU_CHOI');
        }

        renderBaiDangList(data);

    } catch (err) {
        console.error(err);
        alert('Không thể tải dữ liệu!');
    }
}

// Render tbody
function renderBaiDangList(data) {
    const tbody = document.getElementById('baiDangTableBody');
    tbody.innerHTML = '';

    data.forEach(post => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
      <td>${post.idBaiDang}</td>
      <td>${post.tieuDe}</td>
      <td>${post.tenCongTy || ''}</td>
      <td>${post.ngayDang ? new Date(post.ngayDang).toLocaleDateString() : ''}</td>
      <td>${post.hanNop ? new Date(post.hanNop).toLocaleDateString() : ''}</td>
      <td>${renderTrangThai(post.trangThai)}</td>
      <td>${renderActionButtons(post)}</td>
    `;
        tbody.appendChild(tr);
    });
}

// Badge trạng thái
function renderTrangThai(status) {
    switch (status) {
        case 'CHO_DUYET':
            return '<span class="badge badge-pending">Đợi Duyệt</span>';
        case 'DA_DUYET':
            return '<span class="badge badge-approved">Đã Duyệt</span>';
        case 'TU_CHOI':
            return '<span class="badge badge-rejected">Đã Từ Chối</span>';
        default:
            return `<span class="badge badge-secondary">${status}</span>`;
    }
}

// Nút thao tác tuỳ trạng thái
function renderActionButtons(post) {
    const id = post.idBaiDang;
    let btns = `
    <button class="btn btn-info btn-sm action-btn" onclick="xemChiTietBaiDang(${id})">Chi tiết</button>
  `;

    if (post.trangThai === 'CHO_DUYET') {
        btns += `
      <button class="btn btn-success btn-sm action-btn" onclick="duyetBaiDang(${id})">Duyệt</button>
      <button class="btn btn-danger btn-sm action-btn" onclick="tuChoiBaiDang(${id})">Từ chối</button>
    `;
    } else if (post.trangThai === 'DA_DUYET') {
        btns += `
      <button class="btn btn-warning btn-sm action-btn" onclick="huyBaiDang(${id})">Hủy</button>
    `;
    } else if (post.trangThai === 'TU_CHOI') {
        btns += `
      <button class="btn btn-primary btn-sm action-btn" onclick="duaLaiBaiDang(${id})">Đưa lại</button>
      <button class="btn btn-danger btn-sm action-btn" onclick="xoaBaiDang(${id})">Xóa</button>
    `;
    }

    return btns;
}

// === Các hàm thao tác ===

// Duyệt (CHO_DUYET → DA_DUYET)
async function duyetBaiDang(id) {
    if (!confirm('Bạn chắc chắn muốn duyệt bài này?')) return;
    await handleAction(id, 'duyet');
}

// Từ chối (CHO_DUYET → TU_CHOI)
async function tuChoiBaiDang(id) {
    if (!confirm('Bạn chắc chắn muốn từ chối bài này?')) return;
    await handleAction(id, 'tuchoi');
}

// Hủy (DA_DUYET → TU_CHOI)
async function huyBaiDang(id) {
    if (!confirm('Bạn chắc chắn muốn hủy duyệt bài này?')) return;
    await handleAction(id, 'tuchoi');
}

// Đưa lại (TU_CHOI → CHO_DUYET)
async function duaLaiBaiDang(id) {
    if (!confirm('Bạn chắc chắn muốn đưa bài này trở lại chờ duyệt?')) return;
    await handleAction(id, 'choduyet');
}

// Xóa (DELETE)
async function xoaBaiDang(id) {
    if (!confirm('Bạn chắc chắn muốn xóa bài này vĩnh viễn?')) return;
    const token = localStorage.getItem('token');
    const idNguoiXoa = localStorage.getItem('userId') || 0; // Bạn có thể lưu userId lên localStorage khi login
    try {
        const res = await fetch(`http://localhost:8080/api/QuanTriVien/BaiDang/${id}?idNguoiXoa=${idNguoiXoa}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Xóa bài đăng thành công!');
        loadBaiDangList();
    } catch (err) {
        console.error(err);
        alert('Lỗi: ' + err.message);
    }
}

// Xem chi tiết (chuyển trang)
function xemChiTietBaiDang(id) {
    window.location.href = `/QuanTriVien/baidang_chitiet.html?id=${id}`;
}

// Xử lý chung PUT cho các action: duyet, tuchoi, choduyet
async function handleAction(id, action) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:8080/api/QuanTriVien/BaiDang/${id}/${action}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.status === 403) {
            alert('Phiên hết hạn hoặc không đủ quyền. Vui lòng đăng nhập lại.');
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }
        if (!res.ok) {
            throw new Error(await res.text());
        }

        alert('Thao tác thành công!');
        loadBaiDangList();
    } catch (err) {
        console.error(err);
        alert('Lỗi: ' + err.message);
    }
}