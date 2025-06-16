import { saveToStorage, loadFromStorage } from "./store.js";

let students = loadFromStorage();
let editingId = null;
let currentUser = null; // Thêm biến lưu tài khoản hiện tại

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable").querySelector("tbody");
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
  document.getElementById("userProfile").style.display = "flex";
}

function renderTable() {
 const studentTable = document.getElementById("studentTable");
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
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('${student.id}')">Xóa</button>
        <button class="btn btn-warning btn-sm" onclick="editStudent('${student.id}')">Sửa</button>
      </td>
    `;
    studentTable.appendChild(row);
  });
}

window.confirmDelete = function (id) {
  modalConfirm.show();
  modalConfirmBtn.onclick = () => {
    students = students.filter((s) => s.id !== id);
    saveToStorage(students);
    renderTable();
    modalConfirm.hide();
  };
};

window.editStudent = function (id) {
  const student = students.find((s) => s.id === id);
  document.getElementById("id").value = student.id;
  document.getElementById("name").value = student.name;
  document.getElementById("dob").value = student.dob;
  document.getElementById("gender").value = student.gender;
  document.getElementById("class").value = student.class;
  document.getElementById("avatar").value = student.avatar;
  editingId = id;
};

studentForm.onsubmit = (e) => {
  e.preventDefault();
  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const className = document.getElementById("class").value;
  const avatar = document.getElementById("avatar").value;

  if (editingId && editingId === id) {
    const index = students.findIndex((s) => s.id === id);
    students[index] = { id, name, dob, gender, class: className, avatar };
    editingId = null;
  } else {
    students.push({ id, name, dob, gender, class: className, avatar });
  }
  saveToStorage(students);
  studentForm.reset();
  renderTable();
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
    document.getElementById("userAvatar").src = currentUser.avatar || "https://via.placeholder.com/40";
    document.getElementById("userName").textContent = currentUser.username;
    showStudentSection();
    renderTable();
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
  accounts.push({ email, phone, username, password });
  saveToStorage(accounts, "accounts");
  alert("Đăng ký thành công! Bạn có thể đăng nhập.");
  toggleForm("login");
};

document.getElementById("btnUserInfo").onclick = () => {
  if (currentUser) {
    document.getElementById("infoEmail").textContent = currentUser.email;
    document.getElementById("infoPhone").textContent = currentUser.phone;
    document.getElementById("infoUsername").textContent = currentUser.username;
    const modal = new bootstrap.Modal(document.getElementById("modalUserInfo"));
    modal.show();
  }
};

window.onload = () => {
  toggleForm("login");
};

