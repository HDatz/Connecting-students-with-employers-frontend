document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, userType: "sv" })
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("userId", data.id);
                localStorage.setItem("ten", data.ten);

                if (data.role === "ROLE_SINHVIEN") {
                    window.location.href = "/SinhVien/trangchu.html";
                } else {
                    if (errorMessage) errorMessage.textContent = "Bạn không có quyền truy cập Sinh Viên!";
                }
            } else {
                const text = await response.text();
                console.error("Lỗi đăng nhập:", text);
                if (errorMessage) errorMessage.textContent = "Sai tài khoản hoặc mật khẩu!";
            }

        } catch (error) {
            console.error("Lỗi:", error);
            if (errorMessage) errorMessage.textContent = "Lỗi hệ thống! Vui lòng thử lại.";
        }
    });
});

function handleRoleChange() {
    const role = document.getElementById("role").value;
    if (role === "admin") {
        window.location.href = "/login.html";
    } else if (role === "employer") {
        window.location.href = "/NhaTuyenDung/login.html";
    }
}