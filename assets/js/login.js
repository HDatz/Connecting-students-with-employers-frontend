document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = ""; // Reset thông báo lỗi

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Bổ sung thêm trường userType với giá trị "qt"
            body: JSON.stringify({ email, password, userType: "qt" })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data || "Sai tài khoản hoặc mật khẩu");
        }

        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("ten", data.ten);

        // Kiểm tra vai trò, nếu là QUANTRIVIEN thì chuyển vào trang admin
        if (data.role === "ROLE_QUANTRIVIEN") {
            window.location.href = "/QuanTriVien/bieudo.html";
        } else {
            errorMessage.textContent = "Bạn không có quyền truy cập trang quản trị!";
        }

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        errorMessage.textContent = "Sai tài khoản hoặc mật khẩu!";
    }
});