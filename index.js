import { saveToStorage, loadFromStorage } from "./store.js";

let students = loadFromStorage();
let editingId = null;
let currentUser = null;

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const modalConfirm = new bootstrap.Modal(document.getElementById("modalConfirm"));
const modalConfirmBtn = document.getElementById("modalConfirmBtn");


window.toggleForm = function(type) {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("registerBox").style.display = "none";
  if (type === "login") {
    document.getElementById("loginBox").style.display = "block";
  } else if (type === "register") {
    document.getElementById("registerBox").style.display = "block";
  }
};

function showStudentSection() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("registerBox").style.display = "none";
  document.getElementById("studentSection").style.display = "block";
  document.getElementById("userProfile").style.display = "flex"; // Đã thêm để hiển thị userProfile
  document.getElementById("studentDashboard").style.display = "none";
}

function showStudentDashboard() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("registerBox").style.display = "none";
  document.getElementById("studentSection").style.display = "none";
  document.getElementById("userProfile").style.display = "none"; // Đã thêm để ẩn userProfile khi ở dashboard
  document.getElementById("studentDashboard").style.display = "block";
  document.getElementById("studentName").textContent = currentUser.username;
}

function hideAllSections() {
  document.getElementById("studentSection").style.display = "none";
  document.getElementById("userProfile").style.display = "none"; // Đã thêm để ẩn userProfile khi ẩn tất cả
  document.getElementById("studentDashboard").style.display = "none";
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("registerBox").style.display = "none";
}

function renderTable() {
  studentTable.innerHTML = "";
  students.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.dob}</td>
      <td>${student.gender}</td>
      <td>${student.class}</td>
      <td><img src="${student.avatar}" width="70"></td>
      <td>
        <button class="btn btn-danger btn-sm" data-id="${student.id}" data-action="delete">Xóa</button>
        <button class="btn btn-warning btn-sm" data-id="${student.id}" data-action="edit">Sửa</button>
      </td>
    `;
    studentTable.appendChild(row);
  });
}

studentTable.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "delete") confirmDelete(id);
  else if (action === "edit") editStudent(id);
});

function confirmDelete(id) {
  modalConfirm.show();
  modalConfirmBtn.onclick = () => {
    students = students.filter((s) => s.id !== id);
    saveToStorage(students);
    renderTable();
    modalConfirm.hide();
  };
}

function editStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;
  document.getElementById("id").value = student.id;
  document.getElementById("name").value = student.name;
  document.getElementById("dob").value = student.dob;
  document.getElementById("gender").value = student.gender;
  document.getElementById("class").value = student.class;
  document.getElementById("avatar").value = student.avatar;
  editingId = id;
  document.getElementById("studentFormContainer").style.display = "block";
}

document.getElementById("btnAdd").onclick = () => {
  editingId = null;
  studentForm.reset();
  document.getElementById("studentFormContainer").style.display = "block";
};

studentForm.onsubmit = (e) => {
  e.preventDefault();
  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const className = document.getElementById("class").value;
  const avatar = document.getElementById("avatar").value;

  if (!editingId) {
    if (students.some(s => s.id === id)) {
      alert("ID đã tồn tại!");
      return;
    }
    students.push({ id, name, dob, gender, class: className, avatar });
  } else {
    const index = students.findIndex((s) => s.id === editingId);
    students[index] = { id, name, dob, gender, class: className, avatar };
    editingId = null;
  }

  saveToStorage(students);
  studentForm.reset();
  renderTable();
  document.getElementById("studentFormContainer").style.display = "none";
};

const loginForm = document.getElementById("loginForm");
loginForm.onsubmit = (e) => {
  e.preventDefault();
  const emailOrId = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const accounts = loadFromStorage("accounts") || [];

  const found = accounts.find(acc => (acc.email === emailOrId || acc.username === emailOrId) && acc.password === password);
  if (found) {
    currentUser = found;
    saveToStorage(currentUser, "currentUser");
    if (currentUser.role === "admin") {
      document.getElementById("userAvatar").src = currentUser.avatar || "https://via.placeholder.com/40"; // Đã sửa currentUser.userAvatar thành currentUser.avatar
      document.getElementById("userName").textContent = currentUser.username;
      showStudentSection();
      renderTable(); // Gọi renderTable cho admin
    } else if (currentUser.role === "user") {
      showStudentDashboard();
    } else {
      alert("Tài khoản không hợp lệ.");
    }
  } else {
    alert("Tài khoản hoặc mật khẩu không đúng!");
  }
};

const registerForm = document.getElementById("registerForm");
registerForm.onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmail").value;
  const phone = document.getElementById("regPhone").value;
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const accounts = loadFromStorage("accounts") || [];
  if (accounts.some(acc => acc.email === email || acc.username === username)) {
    alert("Tài khoản đã tồn tại!");
    return;
  }
  accounts.push({ email, phone, username, password , role: "user" });
  saveToStorage(accounts, "accounts");
  alert("Đăng ký thành công! Bạn có thể đăng nhập.");
  toggleForm("login");
};

// Sử dụng ủy quyền sự kiện hoặc đảm bảo ID duy nhất cho các nút này
document.getElementById("btnUserInfo").onclick = () => { // Xử lý cho nút "Thông tin" của Admin
  if (currentUser) {
    document.getElementById("infoEmail").value = currentUser.email || "";
    document.getElementById("infoPhone").value = currentUser.phone || "";
    document.getElementById("infoUsername").value = currentUser.username || "";
    const modal = new bootstrap.Modal(document.getElementById("modalUserInfo"));
    modal.show();
  }
};

document.getElementById("btnStudentInfo").onclick = () => { // Xử lý cho nút "Cập nhật thông tin cá nhân" của User
  if (currentUser) {
    document.getElementById("infoEmail").value = currentUser.email || "";
    document.getElementById("infoPhone").value = currentUser.phone || "";
    document.getElementById("infoUsername").value = currentUser.username || "";
    const modal = new bootstrap.Modal(document.getElementById("modalUserInfo"));
    modal.show();
  }
};


document.getElementById("btnEditUser").onclick = () => {
  const newEmail = document.getElementById("infoEmail").value;
  const newPhone = document.getElementById("infoPhone").value;
  const newUsername = document.getElementById("infoUsername").value;

  const accounts = loadFromStorage("accounts") || [];
  const index = accounts.findIndex(acc => acc.email === currentUser.email);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], email: newEmail, phone: newPhone, username: newUsername };
    currentUser = accounts[index];
    saveToStorage(currentUser, "currentUser");
    saveToStorage(accounts, "accounts");
    
    const userNameLabel = document.getElementById("userName");
    if (userNameLabel) userNameLabel.textContent = currentUser.username;
    const studentNameLabel = document.getElementById("studentName");
    if (studentNameLabel) studentNameLabel.textContent = currentUser.username;

    alert("Cập nhật thông tin thành công!");
  }
};

document.getElementById("btnLogout").onclick = () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  hideAllSections(); // Đã sửa từ hideStudentSection()
  toggleForm("login");
};

document.getElementById("btnUserLogout").onclick = () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  hideAllSections(); // Đã sửa logic để chỉ đăng xuất và hiển thị form đăng nhập
  toggleForm("login");
};

document.getElementById("btnCreateUser")?.addEventListener("click", () => {
  const email = prompt("Nhập email người dùng:");
  const phone = prompt("Nhập số điện thoại:");
  const username = prompt("Nhập tên đăng nhập:");
  const password = prompt("Nhập mật khẩu:");

  if (!email || !phone || !username || !password) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const accounts = loadFromStorage("accounts") || [];
  if (accounts.some(acc => acc.email === email || acc.username === username)) {
    alert("Email hoặc tên đăng nhập đã tồn tại!");
    return;
  }

  accounts.push({ email, phone, username, password, role: "user" });
  saveToStorage(accounts, "accounts");
  alert("Tạo tài khoản người dùng thành công!");
});

window.addEventListener("DOMContentLoaded", () => {
  currentUser = loadFromStorage("currentUser");
  if (currentUser && currentUser.username) {
    if (currentUser.role === "admin") {
      document.getElementById("userAvatar").src = currentUser.avatar || "https://via.placeholder.com/40"; // Đã sửa currentUser.userAvatar thành currentUser.avatar
      document.getElementById("userName").textContent = currentUser.username;
      showStudentSection();
      renderTable();
    } else if (currentUser.role === "user") {
      showStudentDashboard();
    } else {
      toggleForm("login");
    }
  } else {
    currentUser = null;
    hideAllSections(); // Đã thêm để đảm bảo tất cả các phần bị ẩn khi không có người dùng đăng nhập
    toggleForm("login");
  }
});