function handleRoleChange() {
    const role = document.getElementById("role").value;
    if (role === "admin") {
        window.location.href = "/login.html";
    } else if (role === "employer") {
        window.location.href = "/NhaTuyenDung/login.html";
    }
}