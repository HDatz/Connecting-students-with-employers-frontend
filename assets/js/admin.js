// Kiểm tra quyền truy cập ngay khi trang tải
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ROLE_QUANTRIVIEN") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/login.html";
        return;
    }

    document.getElementById("avatar").addEventListener("change", handleFileChange);
    showSinhVienPanel();
});

// Đăng xuất
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.clear(); // Xóa token và thông tin người dùng
    window.location.href = "/login.html";
});

// Hiển thị các bảng và tải dữ liệu
function showSinhVienPanel() {
    showPanel("sinhVienPanel");
    loadSinhVien();
}


function showPanel(panelId) {
    document.querySelectorAll(".content-panel").forEach(panel => panel.style.display = "none");
    document.getElementById(panelId).style.display = "block";
}

// Xử lý thay đổi tệp ảnh đại diện
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

// Quản lý sinh viên
function loadSinhVien() {
    fetchWithAuth("http://localhost:8080/api/QuanTriVien/SinhVien")
        .then(response => response.json())
        .then(data => {
            danhSachSinhVien = data;
            currentPage = 1;
            renderTable();
        })
        .catch(error => {
            console.error("Error loading sinh viên:", error);
            alert("Không thể tải danh sách sinh viên. Vui lòng thử lại sau.");
        });
}

function searchSinhVien() {
    let keyword = document.getElementById("searchSinhVien").value.toLowerCase();
    let rows = document.querySelectorAll("#sinhVienTableBody tr");

    rows.forEach(row => {
        let hoTen = row.cells[1].textContent.toLowerCase();
        let email = row.cells[2].textContent.toLowerCase();

        row.style.display = hoTen.includes(keyword) || email.includes(keyword) ? "" : "none";
    });
}

document.getElementById("searchSinhVien").addEventListener("input", searchSinhVien);

// Hiển thị và chỉnh sửa thông tin sinh viên
function showEditModal(studentId) {
    fetchWithAuth(`http://localhost:8080/api/QuanTriVien/SinhVien/${studentId}`)
        .then(response => response.json())
        .then(student => {
            document.getElementById("editId").value = student.idSinhVien || "";
            document.getElementById("editName").value = student.hoTen || "";
            document.getElementById("editEmail").value = student.email || "";
            document.getElementById("editPhone").value = student.soDienThoai || "";
            document.getElementById("editAddress").value = student.diaChi || "";
            document.getElementById("editDob").value = student.ngaySinh ? new Date(student.ngaySinh).toISOString().split('T')[0] : "";
            document.getElementById("editMajor").value = student.nganhHoc || "";
            document.getElementById("editGraduationYear").value = student.namTotNghiep || "";
            document.getElementById("editIntro").value = student.gioiThieu || "";

            $("#editStudentModal").modal("show");
        })
        .catch(error => {
            console.error("Lỗi khi tải thông tin sinh viên:", error);
            alert("Không thể tải thông tin sinh viên.");
        });
}

function updateSinhVien() {
    console.log("Cập nhật sinh viên đang được thực hiện...");

    const idElement = document.getElementById("editId");
    if (!idElement) {
        console.error("Không tìm thấy phần tử 'editId'.");
        return;
    }
    const id = idElement.value;
    const hoTen = document.getElementById("editName").value;
    const email = document.getElementById("editEmail").value;
    const matKhau = ""; // Chưa thay đổi mật khẩu, có thể để trống
    const soDienThoai = document.getElementById("editPhone").value;
    const diaChi = document.getElementById("editAddress").value;
    const dob = document.getElementById("editDob").value;
    const major = document.getElementById("editMajor").value;
    const graduationYear = document.getElementById("editGraduationYear").value;
    const intro = document.getElementById("editIntro").value;
    const avatarFile = document.getElementById("editAvatar").files[0];

    if (!dob) {
        alert("Ngày sinh không thể để trống.");
        return;
    }

    // Chuyển đổi ngày sinh sang định dạng "yyyy-MM-dd"
    const formattedDob = new Date(dob).toISOString().split('T')[0];
    console.log("Formatted Date of Birth:", formattedDob);

    const formData = new FormData();
    formData.append("hoTen", hoTen);
    formData.append("email", email);
    formData.append("matKhau", matKhau);
    formData.append("soDienThoai", soDienThoai);
    formData.append("diaChi", diaChi);
    formData.append("ngaySinh", formattedDob);
    formData.append("nganhHoc", major);
    formData.append("namTotNghiep", graduationYear);
    formData.append("gioiThieu", intro);

    if (avatarFile) {
        formData.append("avatar", avatarFile);
    }

    fetchWithAuth(`http://localhost:8080/api/QuanTriVien/SinhVien/${id}`, {
            method: "PUT",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // Parse response body as JSON
        })
        .then(data => {
            alert("Cập nhật sinh viên thành công!");

            // Cập nhật lại avatar nếu có trong dữ liệu trả về
            const avatarImage = document.getElementById("detailAvatar");

            if (data.avatar) {
                avatarImage.src = `http://localhost:8080/avatars/${data.avatar}`; // Cập nhật avatar
            } else {
                avatarImage.src = "http://localhost:8080/avatars/default-avatar.png"; // Avatar mặc định nếu không có avatar
            }

            loadSinhVien(); // Tải lại danh sách sinh viên nếu cần
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật sinh viên:", error);
            alert("Không thể cập nhật sinh viên. Lỗi: " + error.message);
        });
}





let pageSize = 5;
// Hiển thị bảng sinh viên
function renderTable() {
    sinhVienTableBody.innerHTML = "";
    let start = (currentPage - 1) * pageSize;
    let end = start + pageSize;
    let dataToShow = danhSachSinhVien.slice(start, end);

    dataToShow.forEach(sv => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${sv.idSinhVien || ""}</td>
            <td>${sv.hoTen || ""}</td>
            <td>${sv.email || ""}</td>
            <td>${sv.diaChi || ""}</td>
            <td>${sv.ngaySinh ? new Date(sv.ngaySinh).toLocaleDateString() : ""}</td>
            <td>${sv.nganhHoc || ""}</td>
            <td>${sv.soDienThoai || ""}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showStudentDetail('${sv.idSinhVien}')">
                    <i class="fas fa-info-circle"></i> Chi tiết
                </button>
                <button class="btn btn-warning btn-sm" onclick="showEditModal('${sv.idSinhVien}')">
                <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSinhVien('${sv.email}')">Xóa</button>
            </td>
        `;
        sinhVienTableBody.appendChild(row);
    });

    renderPagination();
}

function renderPagination() {
    pagination.innerHTML = "";
    let totalPages = Math.ceil(danhSachSinhVien.length / pageSize);

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

// Xóa sinh viên
function deleteSinhVien(email) {
    if (confirm("Bạn có chắc muốn xóa sinh viên này?")) {
        fetchWithAuth(`http://localhost:8080/api/QuanTriVien/SinhVien/${email}`, { method: "DELETE" })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể xóa sinh viên");
                }
                alert("Xóa sinh viên thành công!");
                loadSinhVien();
            })
            .catch(error => {
                console.error("Error deleting sinh viên:", error);
                alert("Không thể xóa sinh viên. Vui lòng thử lại sau.");
            });
    }
}

// Thêm sinh viên
function addSinhVien() {
    const hoTen = document.getElementById("hoTen").value.trim();
    const email = document.getElementById("email").value.trim();
    const soDienThoai = document.getElementById("sdt").value.trim();
    const matKhau = document.getElementById("matKhau").value.trim();
    const avatarFile = document.getElementById("avatar").files[0];

    if (!hoTen || !email || !soDienThoai || !matKhau) {
        alert("Vui lòng nhập đầy đủ thông tin sinh viên!");
        return;
    }

    if (!validateEmail(email)) {
        alert("Email không hợp lệ!");
        return;
    }

    if (!/^\d{10,11}$/.test(soDienThoai)) {
        alert("Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.");
        return;
    }

    const formData = new FormData();
    formData.append("hoTen", hoTen);
    formData.append("email", email);
    formData.append("soDienThoai", soDienThoai);
    formData.append("matKhau", matKhau);
    if (avatarFile) {
        formData.append("avatar", avatarFile);
    }

    fetchWithAuth("http://localhost:8080/api/QuanTriVien/SinhVien", {
            method: "POST",
            body: formData
        })
        .then(response => response.ok ? response.json() : Promise.reject("Không thể thêm sinh viên"))
        .then(() => {
            alert("Thêm sinh viên thành công!");
            document.getElementById("addSinhVienForm").reset();
            loadSinhVien();
        })
        .catch(error => {
            console.error("Error adding sinh viên:", error);
            alert("Không thể thêm sinh viên. Vui lòng thử lại sau.");
        });
}

async function showStudentDetail(studentId) {
    try {
        const response = await fetchWithAuth(`http://localhost:8080/api/QuanTriVien/SinhVien/${studentId}`);

        if (!response.ok) {
            throw new Error("Không thể lấy thông tin sinh viên");
        }

        const student = await response.json();

        document.getElementById("detailId").textContent = student.idSinhVien || "N/A";
        document.getElementById("detailName").textContent = student.hoTen || "N/A";
        document.getElementById("detailEmail").textContent = student.email || "N/A";
        document.getElementById("detailPhone").textContent = student.soDienThoai || "N/A";
        document.getElementById("detailAddress").textContent = student.diaChi || "N/A";
        document.getElementById("detailDob").textContent = student.ngaySinh ? new Date(student.ngaySinh).toLocaleDateString() : "N/A";
        document.getElementById("detailMajor").textContent = student.nganhHoc || "N/A";
        document.getElementById("detailGraduationYear").textContent = student.namTotNghiep || "N/A";
        document.getElementById("detailIntro").textContent = student.gioiThieu || "N/A";

        if (student.avatar) {
            document.getElementById("detailAvatar").src = `http://localhost:8080/api/QuanTriVien/avatars/${student.avatar}`;
        } else {
            document.getElementById("detailAvatar").src = "/assets/images/default-avatar.jpg";
        }
        //Hien thu model neu tat ca tt dc tai thanh cong
        $("#studentDetailModal").modal("show");

    } catch (error) {
        console.error("Lỗi khi lấy thông tin sinh viên:", error);
        alert("Không thể tải thông tin chi tiết sinh viên.");
    }
}


// Kiểm tra email hợp lệ
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}