document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ROLE_QUANTRIVIEN") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/login.html";
        return;
    }

    // document.getElementById("avatar").addEventListener("change", handleFileChange);
});

// Đăng xuất
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.clear(); // Xóa token và thông tin người dùng
    window.location.href = "/login.html";
});



document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ROLE_QUANTRIVIEN") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/login.html";
        return;
    }

    // Khởi tạo QuillJS
    const quill = new Quill("#editor", {
        theme: "snow",
        placeholder: "Nhập nội dung bài viết...",
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
            ],
        },
    });

    // Bắt sự kiện submit form thêm bài viết
    document.getElementById("addBaiVietForm").addEventListener("submit", function(event) {
        event.preventDefault();
        addBaiViet();
    });

    // Bắt sự kiện đăng xuất
    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.clear();
        window.location.href = "/login.html";
    });
});

// 🟢 Thêm bài viết mới
async function addBaiViet() {
    const tieuDe = document.getElementById("tieuDe").value;
    const noiDung = document.querySelector(".ql-editor").innerHTML;
    const ngayDang = new Date().toISOString(); // Lấy ngày hiện tại
    const idQuanTri = localStorage.getItem("userId"); // ID người đăng nhập
    const token = localStorage.getItem("token");

    if (!tieuDe || !noiDung || !idQuanTri) {
        alert("Vui lòng nhập tiêu đề, nội dung và đảm bảo đã đăng nhập!");
        return;
    }

    const baiViet = {
        tieuDe,
        noiDung,
        ngayDang,
        tacGia: { idQuanTri } // ✅ Đúng định dạng 
    };

    try {
        const response = await fetch("http://localhost:8080/api/QuanTriVien/BaiViet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(baiViet),
        });

        if (response.ok) {
            alert("Thêm bài viết thành công!");
            location.reload();
        } else {
            alert("Lỗi khi thêm bài viết! Hãy kiểm tra lại.");
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến server!");
    }
}




// 🟠 Cập nhật bài viết
async function updateBaiViet(id) {
    const tieuDe = document.getElementById("tieuDe").value;
    const noiDung = quill.root.innerHTML; // Lấy nội dung từ QuillJS

    const token = localStorage.getItem("token");

    if (!tieuDe || !noiDung) {
        alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
        return;
    }

    const baiViet = {
        tieuDe: tieuDe,
        noiDung: noiDung,
    };

    try {
        const response = await fetch(`http://localhost:8080/api/QuanTriVien/BaiViet/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(baiViet),
        });

        if (response.ok) {
            alert("Cập nhật bài viết thành công!");
            location.reload();
        } else {
            alert("Lỗi khi cập nhật bài viết!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến server!");
    }
}
async function deleteBaiViet(id) {
    const token = localStorage.getItem("token");

    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/QuanTriVien/BaiViet/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            alert("Xóa bài viết thành công!");
            location.reload();
        } else {
            alert("Lỗi khi xóa bài viết!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến server!");
    }
}

async function fetchBaiViet() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Không có token xác thực!");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/QuanTriVien/BaiViet", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Lỗi ${response.status}: Không thể lấy dữ liệu bài viết!`);
        }

        let baiViets;
        try {
            baiViets = await response.json();
        } catch (jsonError) {
            throw new Error("Dữ liệu phản hồi không hợp lệ!");
        }

        console.log("Danh sách bài viết:", baiViets);

        const tableBody = document.getElementById("baiVietTableBody");
        if (!tableBody) {
            console.error("Không tìm thấy phần tử bảng!");
            return;
        }

        tableBody.innerHTML = ""; // Xóa bảng trước khi cập nhật

        baiViets.forEach((baiViet) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${baiViet.idBaiViet ?? "N/A"}</td>
                <td>${baiViet.tieuDe ?? "Không có tiêu đề"}</td>
                <td>${getFirstWords(baiViet.noiDung)}</td>
                <td>${baiViet.tacGia?.hoTen ?? "Không có tác giả"}</td>
                <td>${baiViet.ngayDang ? new Date(baiViet.ngayDang).toLocaleDateString("vi-VN") : "Không có ngày đăng"}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewBaiViet(${baiViet.idBaiViet})">Xem</button>
                    <button class="btn btn-warning btn-sm" onclick="updateBaiViet(${baiViet.idBaiViet})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBaiViet(${baiViet.idBaiViet})">Xóa</button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bài viết:", error.message);
    }
}

function getFirstWords(htmlContent, wordCount = 20) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.split(/\s+/).slice(0, wordCount).join(" ") + "...";
}

// Gọi lại hàm khi trang tải
document.addEventListener("DOMContentLoaded", fetchBaiViet);