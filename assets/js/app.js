// const sinhVienTableBody = document.getElementById("sinhVienTableBody");
// const pagination = document.getElementById("pagination");

// let danhSachSinhVien = []; // Mảng chứa dữ liệu sinh viên từ API
// const pageSize = 5; // Số sinh viên hiển thị mỗi trang
// let currentPage = 1;

// // Hàm lấy danh sách sinh viên từ API
// function loadSinhVien() {
//     fetch('http://localhost:8080/api/QuanTriVien/SinhVien')
//         .then(response => response.json())
//         .then(data => {
//             danhSachSinhVien = data; // Lưu dữ liệu vào biến toàn cục
//             currentPage = 1; // Reset về trang đầu tiên
//             renderTable();
//         })
//         .catch(error => {
//             console.error('Error loading sinh viên:', error);
//             alert('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
//         });
// }

// // Hàm hiển thị dữ liệu theo trang
// function renderTable() {
//     sinhVienTableBody.innerHTML = ""; // Xóa dữ liệu cũ
//     let start = (currentPage - 1) * pageSize;
//     let end = start + pageSize;
//     let dataToShow = danhSachSinhVien.slice(start, end);

//     dataToShow.forEach((sv) => {
//         let row = document.createElement("tr");
//         row.innerHTML = `
//             <td>${sv.idSinhVien || ''}</td>
//             <td>${sv.hoTen || ''}</td>
//             <td>${sv.email || ''}</td>
//             <td>${sv.soDienThoai || ''}</td>
//             <td>
//                 <button class="btn btn-sm btn-danger" onclick="deleteSinhVien('${sv.email}')">Xóa</button>
//             </td>
//         `;
//         sinhVienTableBody.appendChild(row);
//     });

//     renderPagination();
// }

// // Hàm tạo các nút phân trang
// function renderPagination() {
//     pagination.innerHTML = "";
//     let totalPages = Math.ceil(danhSachSinhVien.length / pageSize);

//     for (let i = 1; i <= totalPages; i++) {
//         let li = document.createElement("li");
//         li.className = `page-item ${i === currentPage ? "active" : ""}`;
//         li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
//         li.addEventListener("click", function() {
//             currentPage = i;
//             renderTable();
//         });
//         pagination.appendChild(li);
//     }
// }

// // Hàm xóa sinh viên
// function deleteSinhVien(email) {
//     if (confirm('Bạn có chắc muốn xóa sinh viên này?')) {
//         fetch(`http://localhost:8080/api/QuanTriVien/SinhVien/${email}`, {
//                 method: 'DELETE'
//             })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 alert('Xóa sinh viên thành công!');
//                 loadSinhVien(); // Reload danh sách sau khi xóa
//             })
//             .catch(error => {
//                 console.error('Error deleting sinh viên:', error);
//                 alert('Không thể xóa sinh viên. Vui lòng thử lại sau.');
//             });
//     }
// }

// // Gọi dữ liệu khi trang tải
// document.addEventListener('DOMContentLoaded', function() {
//     showSinhVienPanel();
// });