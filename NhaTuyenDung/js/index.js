const imgPosition = document.querySelectorAll('.slides img');
const imgContainer = document.querySelector('.slides');
let ingNumber = imgPosition.length;
let index = 0;

imgPosition.forEach((img, index) => {
    img.style.left = index * 100 + '%';
});

function imgSlider() {
    index++;
    if (index >= ingNumber) {
        index = 0;
    }
    imgContainer.style.transform = 'translateX(' + (-index * 100) + '%)';
}
setInterval(imgSlider, 5000);

document.addEventListener("DOMContentLoaded", function() {
    // Nếu không có token trong localStorage, chuyển hướng về trang đăng nhập
    if (!localStorage.getItem("token")) {
        window.location.href = "/NhaTuyenDung/login.html";
    }
});