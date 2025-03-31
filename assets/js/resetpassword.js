document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    showResetPasswordPanel();
});

// Hàm kiểm tra quyền truy cập
function checkAccess() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ROLE_QUANTRIVIEN") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/login.html";
    }
}




// Đăng xuất
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        localStorage.clear();
        window.location.href = "/login.html";
    });
}

//show pannal
function showResetPasswordPanel() {
    showPanel("resetPasswordPanel");
}



// Ẩn tất cả panel và hiển thị panel được chọn
function showPanel(panelId) {
    document.querySelectorAll(".content-panel").forEach(panel => panel.style.display = "none");
    document.getElementById(panelId).style.display = "block";
}

// Gửi yêu cầu đặt lại mật khẩu
async function resetPassword() {
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    if (!validateEmail(email)) {
        alert("Email không hợp lệ!");
        return;
    }
    if (newPassword.length < 6) { // Kiểm tra độ dài mật khẩu
        alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/QuanTriVien/reset-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            throw new Error("Không thể gửi yêu cầu đặt lại mật khẩu");
        }

        alert("Mật khẩu đã được đặt lại thành công.");
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu đặt lại mật khẩu:", error);
        alert("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    }
}


// Kiểm tra email hợp lệ
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Gán sự kiện cho nút đặt lại mật khẩu
document.getElementById("resetPasswordBtn").addEventListener("click", resetPassword);
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener("click", resetPassword);
}