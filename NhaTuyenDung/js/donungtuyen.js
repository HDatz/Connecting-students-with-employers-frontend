document.addEventListener("DOMContentLoaded", async() => {
            const API = "http://localhost:8080/api/nha-tuyen-dung";
            const token = localStorage.getItem("token");
            if (!token) alert("Vui lòng đăng nhập!"), location.href = "/NhaTuyenDung/login.html";

            // parse JWT
            const parseJwt = t => {
                try { return JSON.parse(atob(t.split(".")[1])); } catch { return {}; }
            };
            const payload = parseJwt(token);
            const idNtd = payload.id || localStorage.getItem("idNhaTuyenDung");
            if (!idNtd) alert("Vui lòng đăng nhập!"), location.href = "/NhaTuyenDung/login.html";
            localStorage.setItem("idNhaTuyenDung", idNtd);

            // Header dropdown
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

            const selectPost = document.getElementById("select-post"),
                searchInput = document.getElementById("search-input"),
                listDiv = document.getElementById("applicant-list"),
                modal = document.getElementById("detail-modal"),
                closeBtn = modal.querySelector(".close-btn");

            let currentApps = [];

            // 1. load bài đăng
            try {
                const res = await fetch(`${API}/${idNtd}/bai-dang`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const allPosts = await res.json();
                const approvedPosts = allPosts.filter(p => p.trangThai === 'DA_DUYET');

                if (!approvedPosts.length) {
                    selectPost.innerHTML = '<option>Không có bài đăng đã duyệt</option>';
                    return;
                }

                selectPost.innerHTML = approvedPosts.map(p =>
                    `<option value="${p.idBaiDang}">${p.tieuDe}</option>`
                ).join("");

                // Tải ứng viên của bài đầu tiên
                loadApplicants(approvedPosts[0].idBaiDang);
            } catch {
                selectPost.innerHTML = '<option>Không tải được bài đăng</option>';
            }

            selectPost.onchange = () => loadApplicants(+selectPost.value);
            searchInput.oninput = () => renderApplicants(filterApps(searchInput.value));

            async function loadApplicants(postId) {
                listDiv.innerHTML = "<p>Đang tải...</p>";
                try {
                    const res = await fetch(`${API}/bai-dang/${postId}/ung-vien`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    currentApps = await res.json();
                    renderApplicants(currentApps);
                } catch {
                    listDiv.innerHTML = `<p class="error">Lỗi tải dữ liệu!</p>`;
                }
            }

            function filterApps(term) {
                term = term.trim().toLowerCase();
                if (!term) return currentApps;
                return currentApps.filter(a =>
                    a.sinhVien.hoTen.toLowerCase().includes(term)
                );
            }

            function renderApplicants(apps) {
                if (!apps.length) {
                    listDiv.innerHTML = "<p>Không tìm thấy ứng viên.</p>";
                    return;
                }
                listDiv.innerHTML = apps.map(app => `
            <div class="card grid grid-2">
            <div>
                <h4>${app.sinhVien.hoTen}</h4>
                <p><strong>Email:</strong> ${app.sinhVien.email}</p>
                <p><strong>Ngành:</strong> ${app.sinhVien.nganhHoc}</p>
                <p><strong>Địa chỉ:</strong> ${app.sinhVien.diaChi}</p>
                <p><strong>Ngày Ứng tuyển:</strong> ${new Date(app.ngayUngTuyen).toLocaleDateString()}</p>
                <p><strong>Trạng thái:</strong> ${app.trangThai}</p>
            </div>
            <div>
                <h4>${app.baiDangTuyenDung.tieuDe}</h4>
                <p><strong>Mức lương:</strong> ${app.baiDangTuyenDung.mucLuong}</p>
                <p><strong>Địa điểm:</strong> ${app.baiDangTuyenDung.diaDiem}</p>
                <p><strong>Loại:</strong> ${app.baiDangTuyenDung.loaiCongViec}</p>
                <div class="actions">
                ${app.trangThai === 'Chờ duyệt'
                    ? `<button class="btn accept-btn" data-id="${app.idDon}">Chấp nhận</button>
                       <button class="btn reject-btn" data-id="${app.idDon}">Từ chối</button>`
                    : `<span class="status-badge ${app.trangThai === 'Đã chấp nhận' ? 'accepted' : 'rejected'}">
                         ${app.trangThai}
                       </span>
                       ${app.trangThai === 'Bị từ chối'
                         ? `<button class="btn delete-btn" data-id="${app.idDon}">Xóa</button>`
                         : ``}`}
                <button class="btn detail-btn" data-id="${app.idDon}">Chi tiết</button>
                
                    </div>
            </div>
            </div>
        `).join("");

        // gán event
        document.querySelectorAll(".accept-btn")
            .forEach(b => b.onclick = e => handle(+e.target.dataset.id, true));
        document.querySelectorAll(".reject-btn")
            .forEach(b => b.onclick = e => handle(+e.target.dataset.id, false));
        document.querySelectorAll(".delete-btn")
            .forEach(b => b.onclick = e => del(+e.target.dataset.id));
        document.querySelectorAll(".detail-btn")
            .forEach(b => b.onclick = e => showDetail(
                apps.find(a => a.idDon === +e.target.dataset.id)
            ));
    }

    async function handle(idDon, chapNhan) {
        try {
            await fetch(`${API}/ung-vien/${idDon}?chapNhan=${chapNhan}&idNhaTuyenDung=${idNtd}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert(chapNhan ? "Đã chấp nhận" : "Đã từ chối");
            loadApplicants(+selectPost.value);
        } catch {
            alert("Lỗi xử lý!");
        }
    }

    async function del(idDon) {
        if (!confirm("Bạn có chắc muốn xóa đơn này?")) return;
        try {
          const res = await fetch(`${API}/ung-vien/${idDon}?idNhaTuyenDung=${idNtd}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (!res.ok) throw new Error(await res.text());
          alert("Xóa thành công!");
          loadApplicants(+selectPost.value);
        } catch (err) {
          console.error(err);
          alert("Xóa thất bại: " + err.message);
        }
      }
      

    function showDetail(app) {
        // Sinh viên
        const svAvatar = document.getElementById("sv-avatar");
        svAvatar.src = app.sinhVien.avatar
            ? `http://localhost:8080/api/QuanTriVien/avatars/${app.sinhVien.avatar}`
            : '/default-avatar.png';
        document.getElementById("sv-name").textContent = app.sinhVien.hoTen;
        document.getElementById("sv-email").textContent = app.sinhVien.email;
        document.getElementById("sv-major").textContent = app.sinhVien.nganhHoc;
        document.getElementById("sv-address").textContent = app.sinhVien.diaChi;
        document.getElementById("sv-gradyear").textContent = app.sinhVien.namTotNghiep;
        document.getElementById("sv-applied").textContent = new Date(app.ngayUngTuyen).toLocaleString();
        document.getElementById("sv-status").textContent = app.trangThai;
        // Bài đăng

        const postBanner = document.getElementById("post-banner");
        if (postBanner) {
        postBanner.onerror = () => postBanner.src = '/default-banner.jpg';
        postBanner.src = app.baiDangTuyenDung.banner
            ? `http://localhost:8080/api/SinhVien/banners/${app.baiDangTuyenDung.banner}`
            : '/default-banner.jpg';
        }
        document.getElementById("post-title").textContent = app.baiDangTuyenDung.tieuDe;
        document.getElementById("post-desc").textContent = app.baiDangTuyenDung.moTa;
        document.getElementById("post-req").textContent = app.baiDangTuyenDung.yeuCau;
        document.getElementById("post-loc").textContent = app.baiDangTuyenDung.diaDiem;
        document.getElementById("post-type").textContent = app.baiDangTuyenDung.loaiCongViec;
        document.getElementById("post-salary").textContent = app.baiDangTuyenDung.mucLuong;
        document.getElementById("post-date").textContent = new Date(app.baiDangTuyenDung.ngayDang).toLocaleDateString();
        document.getElementById("post-deadline").textContent = new Date(app.baiDangTuyenDung.hanNop).toLocaleDateString();
        document.getElementById("post-company").textContent = app.baiDangTuyenDung.nhaTuyenDung.tenCongTy;
        modal.classList.remove("hidden");

        const svCvLink = document.getElementById("sv-cv-link");
        if (app.duongDanCv) {
            svCvLink.href        = `http://localhost:8080/api/nha-tuyen-dung/cv/${app.duongDanCv}`;
            svCvLink.textContent = "Xem CV (PDF)";
            svCvLink.style.display = "inline";
            svCvLink.target      = "_blank";
        } else {
            svCvLink.href        = "#";
            svCvLink.textContent = "Không có CV";
            svCvLink.style.display = "inline";
            svCvLink.target    
        }
    }
    closeBtn.onclick = () => modal.classList.add("hidden");
    modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

}); // end DOMContentLoaded

function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}