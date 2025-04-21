document.addEventListener("DOMContentLoaded", function() {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Bạn cần đăng nhập lại!");
        return window.location.href = "/NhaTuyenDung/login.html";
    }

    // Giải mã payload JWT để lấy thông tin user (nếu cần)
    function parseJwt(token) {
        try {
            const base64Payload = token.split('.')[1];
            const json = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        } catch (e) {
            console.error("Lỗi parse JWT:", e);
            return {};
        }
    }
    const payload = parseJwt(token);

    // Lấy idNhaTuyenDung: ưu tiên localStorage, fallback payload.id
    let idNhaTuyenDung = localStorage.getItem("idNhaTuyenDung");
    if (!idNhaTuyenDung && payload.id) {
        idNhaTuyenDung = payload.id;
        localStorage.setItem("idNhaTuyenDung", idNhaTuyenDung);
    }
    if (!idNhaTuyenDung) {
        alert("Bạn cần đăng nhập lại!");
        return window.location.href = "/NhaTuyenDung/login.html";
    }

    // Thay đổi nút Đăng Nhập thành dropdown hiển thị tên
    const tenNhaTuyenDung = payload.ten || localStorage.getItem("ten");
    const loginItem = document.getElementById("login-item");
    if (tenNhaTuyenDung && loginItem) {
        loginItem.classList.add("dropdown");
        loginItem.innerHTML = `
            <a href="#" class="dropdown-toggle">
                <i class="fa fa-user"></i> <span id="ten-ntd">${tenNhaTuyenDung}</span>
            </a>
            <ul class="dropdown-menu">
                <li><a href="/NhaTuyenDung/sua-thong-tin.html">Tài Khoản</a></li>
                <li><a href="#" id="logout-btn">Đăng Xuất</a></li>
            </ul>
        `;
        document.getElementById("logout-btn").addEventListener("click", e => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/NhaTuyenDung/login.html";
        });
    }

    // Thêm enctype cho form (mặc định HTML cũng gửi multipart nếu dùng FormData)
    const dangBaiForm = document.getElementById("dangBaiForm");
    dangBaiForm.setAttribute("enctype", "multipart/form-data");

    // Bắt submit form
    dangBaiForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        // Khởi tạo FormData, append tất cả field
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
        formData.append("idNguoiDang", idNhaTuyenDung);

        // Nếu có file banner thì append
        const bannerInput = document.getElementById("banner");
        if (bannerInput.files.length > 0) {
            formData.append("banner", bannerInput.files[0]);
        }

        try {
            const res = await fetch(
                "http://localhost:8080/api/nha-tuyen-dung/bai-dang", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                            // CHÚ Ý: không set Content-Type, để browser tự thêm boundary
                    },
                    body: formData
                }
            );

            if (res.ok) {
                alert("Đăng bài thành công!");
                dangBaiForm.reset();
            } else {
                const errText = await res.text();
                alert("Lỗi khi đăng bài: " + errText);
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối đến server: " + err.message);
        }
    });
});


function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}