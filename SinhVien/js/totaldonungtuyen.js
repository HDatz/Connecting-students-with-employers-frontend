document.addEventListener('DOMContentLoaded', () => {
            const API_BASE = 'http://localhost:8080/api/SinhVien';
            const token = localStorage.getItem('token');
            const sinhVienId = localStorage.getItem('userId');
            const userName = localStorage.getItem('ten');
            const appList = document.querySelector('.application-list');
            const loginItem = document.getElementById('login-item');

            // Login dropdown
            if (token && userName) {
                loginItem.classList.add('dropdown');
                loginItem.innerHTML = `<a href="#">${userName} <i class="fas "></i></a>` +
                    `<ul class="dropdown-menu"><li><a href="/SinhVien/capnhattaikhoan.html">Tài Khoản</a></li><li><a href="/SinhVien/totaldonungtuyen.html">Đơn</a></li><li><a href="#" id="logout-btn">Đăng Xuất</a></li></ul>`;
                document.getElementById('logout-btn').addEventListener('click', e => {
                    e.preventDefault();
                    localStorage.clear();
                    window.location.href = '/';
                });
            }

            // Fetch applications
            fetch(`${API_BASE}/ung-tuyen?sinhVienId=${sinhVienId}`, {
                    headers: token ? {
                        'Authorization': `Bearer ${token}`
                    } : {}
                })
                .then(res => res.ok ? res.json() : Promise.reject('Không tải được'))
                .then(apps => renderApps(apps))
                .catch(err => appList.innerHTML = `<p class="error">${err}</p>`);

            function renderApps(apps) {
                if (!apps.length) return appList.innerHTML = '<p>Chưa có đơn ứng tuyển nào.</p>';
                apps.forEach(app => {
                            const card = document.createElement('div');
                            card.className = 'application-card';
                            card.innerHTML = `
    <h4>${app.baiDangTuyenDung.tieuDe}</h4>
    <p><strong>Công ty:</strong> ${app.nhaTuyenDung.tenCongTy}</p>
    <p><strong>Trạng thái:</strong> <span class="status ${app.trangThai.replace(/\s+/g,'-').toLowerCase()}">${app.trangThai}</span></p>
    <div class="card-actions">
        <button class="btn detail-btn" data-id="${app.idDon}">Chi tiết</button>
        ${app.trangThai === 'Chờ duyệt' ? `<button class="btn btn-danger cancel-btn" data-id="${app.idDon}">Hủy đơn</button>` : ''}
    </div>
`;
appList.append(card);
});
document.querySelectorAll('.detail-btn').forEach(btn => btn.addEventListener('click', () => showDetail(btn.dataset.id)));
document.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', () => confirmCancel(btn.dataset.id)));

}

// Detail modal handlers
const detailModal = document.getElementById('detail-modal');
const closeDetail = detailModal.querySelector('.close-detail');

function showDetail(idDon) {
fetch(`${API_BASE}/ung-tuyen?sinhVienId=${sinhVienId}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
.then(r => r.ok ? r.json() : [])
.then(apps => apps.find(a => a.idDon == idDon))
.then(app => {
    const post = app.baiDangTuyenDung;
    const emp = app.nhaTuyenDung;
    // Job
    document.getElementById('detail-banner').src = post.banner ? `${API_BASE}/banners/${post.banner}` : '/default-banner.jpg';
    document.getElementById('detail-title').textContent = post.tieuDe;
    document.getElementById('detail-description').textContent = post.moTa;
    document.getElementById('detail-requirements').textContent = post.yeuCau;
    document.getElementById('detail-location').textContent = post.diaDiem;
    document.getElementById('detail-type').textContent = post.loaiCongViec;
    document.getElementById('detail-salary').textContent = post.mucLuong;
    document.getElementById('detail-posted').textContent = new Date(post.ngayDang).toLocaleDateString();
    document.getElementById('detail-deadline').textContent = new Date(post.hanNop).toLocaleDateString();
    document.getElementById('detail-quantity').textContent = post.soLuongTuyen;
    const cvRow = document.getElementById('cv-row');
    const cvLink = document.getElementById('detail-cv-link');

    if (app.duongDanCv) {
        cvRow.classList.remove('hidden');
        cvLink.href = `http://localhost:8080/api/nha-tuyen-dung/cv/${app.duongDanCv}`;
    } else {
        cvRow.classList.add('hidden');
        cvLink.href = '#';
    }


    document.getElementById('employer-avatar').src = emp.avatar ? `http://localhost:8080/api/SinhVien/company_logos/${emp.avatar}` : '/default-avatar.png';
    document.getElementById('employer-name').textContent = emp.tenCongTy;
    document.getElementById('employer-location').textContent = emp.diaChi;
    document.getElementById('employer-phone').textContent = emp.soDienThoai;
    document.getElementById('employer-email').textContent = emp.email;
    const websiteEl = document.getElementById('employer-website'); websiteEl.textContent = emp.trangWeb; websiteEl.href = emp.trangWeb;
    detailModal.classList.remove('hidden');
});
}
closeDetail.addEventListener('click', () => detailModal.classList.add('hidden'));
detailModal.addEventListener('click', e => e.target === detailModal && detailModal.classList.add('hidden'));

// Cancel modal logic unchanged
const cancelModal = document.getElementById('cancel-modal');
const confirmBtn = document.getElementById('confirm-cancel');
const closeBtn = document.getElementById('close-cancel');
let toCancelId = null;
function confirmCancel(id) { toCancelId = id; cancelModal.classList.remove('hidden'); }
confirmBtn.addEventListener('click', () => {
fetch(`${API_BASE}/huy-ung-tuyen/${toCancelId}?sinhVienId=${sinhVienId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
.then(res => res.ok ? location.reload() : res.text().then(t => { throw new Error(t); })).catch(err => alert('Lỗi: ' + err));
});
closeBtn.addEventListener('click', () => cancelModal.classList.add('hidden'));
cancelModal.addEventListener('click', e => e.target === cancelModal && cancelModal.classList.add('hidden'));
});