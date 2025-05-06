document.addEventListener("DOMContentLoaded", function() {
    // Lấy dữ liệu từ localStorage
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
                 <li><a href="/SinhVien/totaldonungtuyen.html">Đơn Ứng Tuyển</a></li>
                 <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
             </ul>
         </li>
     `;
        // Gán sự kiện cho nút Đăng Xuất
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(e) {
                e.preventDefault();
                dangXuat();
            });
        }
    }

    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
    const view = id => document.getElementById(id);
    const form = document.getElementById("form-cap-nhat");
    const profile = document.getElementById("profile-view");
    const msgEl = view("message");
    const btnEdit = view("btn-edit");
    const btnCancel = view("btn-cancel");
    const fields = ["hoTen", "soDienThoai", "diaChi", "ngaySinh", "nganhHoc", "namTotNghiep", "gioiThieu"];

    // Lấy dữ liệu để hiển thị view
    fetch("http://localhost:8080/api/SinhVien/me", { headers })
        .then(r => r.ok ? r.json() : Promise.reject("Lỗi khi load thông tin"))
        .then(data => {
            view("view-hoTen").textContent = data.hoTen || "";
            view("view-email").textContent = data.email || "";
            view("view-soDienThoai").textContent = data.soDienThoai || "";
            view("view-diaChi").textContent = data.diaChi || "";
            view("view-ngaySinh").textContent = data.ngaySinh ? new Date(data.ngaySinh).toLocaleDateString() : "";
            view("view-nganhHoc").textContent = data.nganhHoc || "";
            view("view-namTotNghiep").textContent = data.namTotNghiep || "";
            view("view-gioiThieu").textContent = data.gioiThieu || "";
            view("view-avatar").src = `http://localhost:8080/api/SinhVien/avatars/${data.avatar}`;

            // Prefill form (chỉ cho phép sửa các trường ngoài email và avatar)
            fields.forEach(f => {
                const el = view(f);
                if (!el) return;
                if (f === "ngaySinh" && data.ngaySinh) {
                    el.value = new Date(data.ngaySinh).toISOString().split('T')[0];
                } else {
                    el.value = data[f] || '';
                }
            });
        })
        .catch(err => {
            msgEl.textContent = err;
            msgEl.classList.add('error');
        });

    // Chuyển sang form edit
    btnEdit.addEventListener('click', () => {
        profile.classList.add('hidden');
        form.classList.remove('hidden');
    });

    // Hủy edit
    btnCancel.addEventListener('click', () => {
        form.classList.add('hidden');
        profile.classList.remove('hidden');
        msgEl.textContent = '';
    });

    // Submit form
    form.addEventListener('submit', e => {
        console.log('Form submitted');
        e.preventDefault();
        msgEl.textContent = '';
        msgEl.className = 'message';

        // Build payload (loại trừ email & avatar nếu không cho sửa)
        const payload = {
            hoTen: view('hoTen').value,
            soDienThoai: view('soDienThoai').value || null,
            diaChi: view('diaChi').value || null,
            ngaySinh: view('ngaySinh').value || null,
            gioiThieu: view('gioiThieu').value || null,
            // Không gửi avatar và email để tránh chỉnh sửa
        };

        fetch("http://localhost:8080/api/SinhVien/me", {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            })
            .then(r => r.ok ? r.json() : r.json().then(j => Promise.reject(j.message || 'Lỗi')))
            .then(data => {
                msgEl.textContent = 'Cập nhật thành công!';
                msgEl.classList.add('success');
                // Cập nhật view ngay
                btnCancel.click();
                view('view-hoTen').textContent = data.hoTen;
                view('view-soDienThoai').textContent = data.soDienThoai || '';
                view('view-diaChi').textContent = data.diaChi || '';
                view('view-ngaySinh').textContent = data.ngaySinh ? new Date(data.ngaySinh).toLocaleDateString() : '';
                view('view-gioiThieu').textContent = data.gioiThieu || '';
            })
            .catch(err => {
                msgEl.textContent = err;
                msgEl.classList.add('error');
            });
    });
});

// Hàm đăng xuất
function dangXuat() {
    // Xóa các thông tin đăng nhập khi đăng xuất
    localStorage.clear();
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/SinhVien/login.html";
}