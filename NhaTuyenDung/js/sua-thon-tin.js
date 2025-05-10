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
});

// Hàm đăng xuất, nếu cần gọi riêng
function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}