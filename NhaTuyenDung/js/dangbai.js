document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Bạn cần đăng nhập!"), location.href = "/NhaTuyenDung/login.html";

    const parseJwt = t => {
        try {
            let b = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(b));
        } catch { return {}; }
    };
    const payload = parseJwt(token);
    const idNtd = localStorage.getItem("idNhaTuyenDung") || payload.id;
    if (!idNtd) return alert("Bạn cần đăng nhập!"), location.href = "/NhaTuyenDung/login.html";
    localStorage.setItem("idNhaTuyenDung", idNtd);

    // Header user dropdown
    const loginItem = document.getElementById("login-item");
    const ten = payload.ten || localStorage.getItem("ten");
    if (ten && loginItem) {
        loginItem.classList.add("dropdown");
        loginItem.innerHTML = `
        <a href="#" class="dropdown-toggle">
          <i class="fa "></i> ${ten}
        </a>
        <ul class="dropdown-menu">
          <li><a href="/NhaTuyenDung/sua-thong-tin.html">Tài Khoản</a></li>
          <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
        </ul>`;
        document.getElementById("logout-btn").onclick = () => {
            localStorage.clear();
            location.href = "/NhaTuyenDung/login.html";
        };
    }

    // Submit đăng bài
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

    // Load tất cả bài đăng ngay khi load
    const loadPosts = async() => {
        const container = document.getElementById("dsBaiDang");
        container.innerHTML = `<p>Đang tải...</p>`;
        try {
            let res = await fetch(`http://localhost:8080/api/nha-tuyen-dung/${idNtd}/bai-dang`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            let list = await res.json();
            if (!list.length) return container.innerHTML = `<p>Chưa có bài đăng nào.</p>`;
            container.innerHTML = "";
            list.forEach(p => {
                let card = document.createElement("div");
                card.className = "post-card";
                card.innerHTML = `
            <h3>${p.tieuDe}</h3>
            <p><strong>Địa điểm:</strong> ${p.diaDiem||'—'}</p>
            <p><strong>Loại:</strong> ${p.loaiCongViec}</p>
            <p><strong>Hạn nộp:</strong> ${new Date(p.hanNop).toLocaleDateString()}</p>
            <p><strong>Trạng thái:</strong>
              <span class="badge ${p.trangThai}">${p.trangThai}</span>
            </p>`;
                container.appendChild(card);
            });
        } catch (err) {
            container.innerHTML = `<p class="error">Không tải được: ${err.message}</p>`;
        }
    };

    loadPosts();
});

function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}