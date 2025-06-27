export function saveToStorage(data, key = "students") {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage(key = "students") {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Khởi tạo tài khoản admin nếu chưa tồn tại
(function initAdminAccount() {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const hasAdmin = accounts.some(acc => acc.role === "admin");
  if (!hasAdmin) {
    accounts.push({
      email: "admin@gmail.com",
      phone: "0123456789",
      username: "admin",
      password: "admin123",
      role: "admin"
    });
    localStorage.setItem("accounts", JSON.stringify(accounts));
    console.log("✅ Đã tạo tài khoản admin mặc định");
  }
})();

// Gán role "user" cho các tài khoản cũ chưa có role
(function ensureUserRoles() {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  let changed = false;
  accounts.forEach(acc => {
    if (!acc.role) {
      acc.role = "user";
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    console.log("✅ Đã cập nhật role = user cho tài khoản cũ.");
  }
})();
