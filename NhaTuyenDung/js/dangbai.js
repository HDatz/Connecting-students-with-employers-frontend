document.addEventListener("DOMContentLoaded", function() {
    // --- Lấy token & decode payload JWT để lấy id nếu cần ---
    const token = localStorage.getItem("token");
    if (token === null) {
        alert("Bạn cần đăng nhập lại!");
        return window.location.href = "/NhaTuyenDung/login.html";
    }

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
    // Lấy id từ localStorage nếu có, nếu không thì fallback sang payload.id
    let idNhaTuyenDung = localStorage.getItem("idNhaTuyenDung");
    if (!idNhaTuyenDung && payload.id) {
        idNhaTuyenDung = payload.id;
        localStorage.setItem("idNhaTuyenDung", idNhaTuyenDung);
    }

    console.log("DEBUG token:", token);
    console.log("DEBUG payload:", payload);
    console.log("DEBUG idNhaTuyenDung:", idNhaTuyenDung);

    if (!idNhaTuyenDung) {
        alert("Bạn cần đăng nhập lại!");
        return window.location.href = "/NhaTuyenDung/login.html";
    }

    // --- Hiển thị dropdown tên NTD ---
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
            dangXuat();
        });
    }

    // --- Submit form đăng bài ---
    const dangBaiForm = document.getElementById("dangBaiForm");
    if (!dangBaiForm) {
        return console.error("Không tìm thấy form đăng bài!");
    }

    dangBaiForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        // Gom data
        const baiViet = {
            tieuDe: document.getElementById("tieuDe").value,
            moTa: document.getElementById("moTa").value,
            yeuCau: document.getElementById("yeuCau").value,
            diaDiem: document.getElementById("diaDiem").value,
            loaiCongViec: document.getElementById("loaiCongViec").value,
            mucLuong: document.getElementById("mucLuong").value,
            hanNop: document.getElementById("hanNop").value,
            soLuongTuyen: parseInt(document.getElementById("soLuongTuyen").value, 10),
            trangThai: "CHO_DUYET",
            nhaTuyenDung: { idNhaTuyenDung: parseInt(idNhaTuyenDung, 10) }
        };

        try {
            const res = await fetch(
                `http://localhost:8080/api/nha-tuyen-dung/bai-dang?idNguoiDang=${idNhaTuyenDung}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(baiViet)
                }
            );

            if (res.ok) {
                alert("Đăng bài thành công!");
                dangBaiForm.reset();
            } else {
                const err = await res.text();
                alert("Lỗi khi đăng bài: " + err);
            }
        } catch (err) {
            alert("Lỗi kết nối đến server: " + err.message);
        }
    });
});

function dangXuat() {
    localStorage.clear();
    window.location.href = "/NhaTuyenDung/login.html";
}