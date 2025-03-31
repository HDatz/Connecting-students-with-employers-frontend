// Kiểm tra quyền truy cập ngay khi trang tải
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ROLE_QUANTRIVIEN") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/login.html";
        return;
    }

    document.getElementById("logo").addEventListener("change", handleFileChange);
    showNhaTuyenDungPanel();
});

// Đăng xuất
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.clear(); // Xóa token và thông tin người dùng
    window.location.href = "/login.html";
});

// Hiển thị các bảng và tải dữ liệu
function showNhaTuyenDungPanel() {
    showPanel("nhaTuyenDungPanel");
    loadNhaTuyenDung();
}

function showPanel(panelId) {
    document.querySelectorAll(".content-panel").forEach(panel => panel.style.display = "none");
    document.getElementById(panelId).style.display = "block";
}

// Xử lý thay đổi tệp ảnh logo
function handleFileChange() {
    let file = this.files[0];
    let fileNameDisplay = document.getElementById("file-name");

    if (file) {
        let allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            alert("Chỉ được chọn file ảnh (JPG, JPEG, PNG, GIF)!");
            this.value = ""; // Reset input file
            fileNameDisplay.textContent = "Chưa có file nào được chọn";
            return;
        }
        document.querySelector(".custom-file-label").textContent = file.name;
        fileNameDisplay.textContent = "File đã chọn: " + file.name;
    } else {
        fileNameDisplay.textContent = "Chưa có file nào được chọn";
    }
}

// Gửi request có token
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    options.headers = options.headers || {};
    options.headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, options);
}

// Quản lý nhà tuyển dụng
function loadNhaTuyenDung() {
    fetchWithAuth("http://localhost:8080/api/QuanTriVien/NhaTuyenDung")
        .then(response => response.json())
        .then(data => {
            danhSachNhaTuyenDung = data;
            currentPage = 1;
            renderTable();
        })
        .catch(error => {
            console.error("Lỗi khi tải danh sách nhà tuyển dụng:", error);
            alert("Không thể tải danh sách nhà tuyển dụng. Vui lòng thử lại sau.");
        });
}

// Tìm kiếm nhà tuyển dụng
function searchNhaTuyenDung() {
    let keyword = document.getElementById("searchNhaTuyenDung").value.toLowerCase();
    let rows = document.querySelectorAll("#nhaTuyenDungTableBody tr");

    rows.forEach(row => {
        let tenCongTy = row.cells[1].textContent.toLowerCase();
        let email = row.cells[2].textContent.toLowerCase();

        row.style.display = tenCongTy.includes(keyword) || email.includes(keyword) ? "" : "none";
    });
}

document.getElementById("searchNhaTuyenDung").addEventListener("input", searchNhaTuyenDung);

// Hiển thị và chỉnh sửa thông tin nhà tuyển dụng
function showEditModal(recruiterId) {
    fetchWithAuth(`http://localhost:8080/api/QuanTriVien/NhaTuyenDung/${recruiterId}`)
        .then(response => response.json())
        .then(recruiter => {
            document.getElementById("editId").value = recruiter.idNhaTuyenDung || "";
            document.getElementById("editCompanyName").value = recruiter.tenCongTy || "";
            document.getElementById("editEmail").value = recruiter.email || "";
            document.getElementById("editPhone").value = recruiter.soDienThoai || "";
            document.getElementById("editAddress").value = recruiter.diaChi || "";
            document.getElementById("editField").value = recruiter.linhVuc || "";
            document.getElementById("editWebsite").value = recruiter.trangWeb || "";
            document.getElementById("editDescription").value = recruiter.moTaCongTy || "";

            $("#editRecruiterModal").modal("show");
        })
        .catch(error => {
            console.error("Lỗi khi tải thông tin nhà tuyển dụng:", error);
            alert("Không thể tải thông tin nhà tuyển dụng.");
        });
}

function updateNhaTuyenDung() {
    console.log("Cập nhật nhà tuyển dụng đang được thực hiện...");

    const id = document.getElementById("editId").value;
    const tenCongTy = document.getElementById("editCompanyName").value;
    const email = document.getElementById("editEmail").value;
    const matKhau = "";
    const soDienThoai = document.getElementById("editPhone").value;
    const diaChi = document.getElementById("editAddress").value;
    const linhVuc = document.getElementById("editField").value;
    const trangWeb = document.getElementById("editWebsite").value;
    const moTaCongTy = document.getElementById("editDescription").value;
    const logoFile = document.getElementById("editLogo").files[0];

    const formData = new FormData();
    formData.append("tenCongTy", tenCongTy);
    formData.append("email", email);
    formData.append("matKhau", matKhau);
    formData.append("soDienThoai", soDienThoai);
    formData.append("diaChi", diaChi);
    formData.append("linhVuc", linhVuc);
    formData.append("trangWeb", trangWeb);
    formData.append("moTaCongTy", moTaCongTy);

    if (logoFile) {
        formData.append("avatar", logoFile);
    }

    fetchWithAuth(`http://localhost:8080/api/QuanTriVien/NhaTuyenDung/${id}`, {
            method: "PUT",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert("Cập nhật nhà tuyển dụng thành công!");
            loadNhaTuyenDung();
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật nhà tuyển dụng:", error);
            alert("Không thể cập nhật nhà tuyển dụng.");
        });
}

// Thêm nhà tuyển dụng
function addNhaTuyenDung() {
    const tenCongTy = document.getElementById("tenCongTy").value.trim();
    const email = document.getElementById("email").value.trim();
    const soDienThoai = document.getElementById("sdt").value.trim();
    const matKhau = document.getElementById("matKhau").value.trim();
    const linhVuc = document.getElementById("linhVuc").value.trim();
    const trangWeb = document.getElementById("trangWeb").value.trim();
    const moTaCongTy = document.getElementById("moTaCongTy").value.trim();
    const diaChi = document.getElementById("diaChi").value.trim();
    const logoFile = document.getElementById("logo").files[0];

    if (!tenCongTy || !email || !soDienThoai || !matKhau || !diaChi) {
        alert("Vui lòng nhập đầy đủ thông tin nhà tuyển dụng!");
        return;
    }

    if (!validateEmail(email)) {
        alert("Email không hợp lệ!");
        return;
    }

    const formData = new FormData();
    formData.append("tenCongTy", tenCongTy);
    formData.append("email", email);
    formData.append("soDienThoai", soDienThoai);
    formData.append("matKhau", matKhau);
    formData.append("linhVuc", linhVuc);
    formData.append("trangWeb", trangWeb);
    formData.append("moTaCongTy", moTaCongTy);
    formData.append("diaChi", diaChi);
    if (logoFile) {
        formData.append("avatar", logoFile);
    }

    fetchWithAuth("http://localhost:8080/api/QuanTriVien/NhaTuyenDung", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(() => {
            alert("Thêm nhà tuyển dụng thành công!");
            document.getElementById("addNhaTuyenDungForm").reset();
            loadNhaTuyenDung();
        })
        .catch(error => {
            console.error("Lỗi khi thêm nhà tuyển dụng:", error);
            alert("Không thể thêm nhà tuyển dụng.");
        });
}


// Kiểm tra email hợp lệ
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Biến toàn cục để lưu danh sách nhà tuyển dụng và trang hiện tại
let danhSachNhaTuyenDung = [];
let currentPage = 1;
const pageSize = 5;

// Hiển thị bảng nhà tuyển dụng
function renderTable() {
    const tableBody = document.getElementById("nhaTuyenDungTableBody");
    if (!tableBody) {
        console.error("Không tìm thấy phần tử 'nhaTuyenDungTableBody'");
        return;
    }

    tableBody.innerHTML = "";
    let start = (currentPage - 1) * pageSize;
    let end = start + pageSize;
    let dataToShow = danhSachNhaTuyenDung.slice(start, end);

    dataToShow.forEach(ntd => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${ntd.idNhaTuyenDung || ""}</td>
            <td>${ntd.tenCongTy || ""}</td>
            <td>${ntd.email || ""}</td>
            <td>${ntd.soDienThoai || ""}</td>
            <td>${ntd.linhVuc || ""}</td>
            <td>${ntd.trangWeb || ""}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showRecruiterDetail(${ntd.idNhaTuyenDung})">
                    <i class="fas fa-info-circle"></i> Chi tiết
                </button>
                <button class="btn btn-warning btn-sm" onclick="showEditModal(${ntd.idNhaTuyenDung})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteNhaTuyenDung('${ntd.email}')">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    renderPagination();
}


//Xoa Nha Tuyen Dung

function deleteNhaTuyenDung(email) {
    if (confirm("Bạn có chắc muốn xóa Nhà Tuyển Dụng này?")) {
        fetchWithAuth(`http://localhost:8080/api/QuanTriVien/NhaTuyenDung/${email}`, { method: "DELETE" })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể xóa Nhà Tuyển Dụng");
                }
                alert("Xóa Nhà Tuyển Dụng thành công!");
                loadNhaTuyenDung();
            })
            .catch(error => {
                console.error("Error deleting Nhà Tuyển Dụng:", error);
                alert("Không thể xóa Nhà Tuyển Dụng. Vui lòng thử lại sau.");
            });
    }
}

// Hiển thị thông tin chi tiết nhà tuyển dụng
async function showRecruiterDetail(recruiterId) {
    try {
        const response = await fetchWithAuth(`http://localhost:8080/api/QuanTriVien/NhaTuyenDung/${recruiterId}`);

        if (!response.ok) {
            throw new Error("Không thể lấy thông tin nhà tuyển dụng");
        }

        const recruiter = await response.json();

        document.getElementById("detailId").textContent = recruiter.idNhaTuyenDung || "N/A";
        document.getElementById("detailCompanyName").textContent = recruiter.tenCongTy || "N/A";
        document.getElementById("detailEmail").textContent = recruiter.email || "N/A";
        document.getElementById("detailPhone").textContent = recruiter.soDienThoai || "N/A";
        document.getElementById("detailAddress").textContent = recruiter.diaChi || "N/A";
        document.getElementById("detailField").textContent = recruiter.linhVuc || "N/A";
        document.getElementById("detailWebsite").textContent = recruiter.trangWeb || "N/A";
        document.getElementById("detailWebsite").href = recruiter.trangWeb || "#";
        document.getElementById("detailDescription").textContent = recruiter.moTaCongTy || "N/A";

        if (recruiter.avatar) {
            document.getElementById("detailLogo").src = `http://localhost:8080/api/QuanTriVien/avatars/${recruiter.avatar}`;
        } else {
            document.getElementById("detailLogo").src = "/assets/images/default-company-logo.jpg";
        }

        // Hiển thị modal nếu tất cả thông tin được tải thành công
        $("#recruiterDetailModal").modal("show");

    } catch (error) {
        console.error("Lỗi khi lấy thông tin nhà tuyển dụng:", error);
        alert("Không thể tải thông tin chi tiết nhà tuyển dụng.");
    }
}

// Hiển thị phân trang
function renderPagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) {
        console.error("Không tìm thấy phần tử 'pagination'");
        return;
    }

    pagination.innerHTML = "";
    let totalPages = Math.ceil(danhSachNhaTuyenDung.length / pageSize);

    for (let i = 1; i <= totalPages; i++) {
        let li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener("click", function() {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(li);
    }
}