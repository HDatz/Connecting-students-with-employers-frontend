document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Kiểm tra token và role hợp lệ
    if (!token || role !== "ROLE_QUANTRIVIEN") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/login.html";
        return;
    }

    try {
        // Gửi yêu cầu GET đến API
        const response = await fetch("http://localhost:8080/api/QuanTriVien/dashboard", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu thống kê");
        }

        const data = await response.json();
        console.log(data); // In ra console để kiểm tra

        // Tạo biểu đồ
        const ctx = document.getElementById("adminChart").getContext("2d");
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Sinh Viên', 'Nhà Tuyển Dụng', 'Bài Viết Hướng Nghiệp', 'Bài Tuyển Dụng'],
                datasets: [{
                    label: 'Số lượng',
                    data: [
                        data.totalSinhVien,
                        data.totalNhaTuyenDung,
                        data.totalBaiVietHuongNghiep,
                        data.totalBaiTuyenDung
                    ],
                    backgroundColor: 'rgba(54, 162, 335, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                onClick: function(e) {
                    const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (activePoints.length > 0) {
                        const index = activePoints[0].index;
                        const label = chart.data.labels[index];

                        // Chuyển hướng đến trang admin.html khi click vào "Sinh Viên"
                        if (label === 'Sinh Viên') {
                            window.location.href = "http://127.0.0.1:5500/QuanTriVien/admin.html"; // Chuyển sang trang admin.html
                        }
                        if (label === 'Nhà Tuyển Dụng') {
                            window.location.href = "http://127.0.0.1:5500/QuanTriVien/nhaTuyenDung.htm"; // Chuyển sang trang admin.html
                        }
                        if (label === 'Bài Viết Hướng Nghiệp') {
                            window.location.href = "http://127.0.0.1:5500/QuanTriVien/baiviethuongnghiep.htm"; // Chuyển sang trang admin.html
                        }
                        if (label === 'Bài Tuyển Dụng') {
                            window.location.href = "http://127.0.0.1:5500/QuanTriVien/baidang.html"; // Chuyển sang trang admin.html
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Lỗi khi lấy dữ liệu thống kê.");
    }
});

// Đăng xuất
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.clear();
    window.location.href = "/login.html";
});