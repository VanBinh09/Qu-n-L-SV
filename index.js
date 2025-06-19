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
  document.getElementById("userProfile").style.display = "flex";
}

function hideStudentSection() {
  document.getElementById("studentSection").style.display = "none";
  document.getElementById("userProfile").style.display = "none";
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
    document.getElementById("userName").textContent = currentUser.username;
    alert("Cập nhật thông tin thành công!");
  }
};

document.getElementById("btnLogout").onclick = () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  hideStudentSection();
  toggleForm("login");
};

window.addEventListener("DOMContentLoaded", () => {
  currentUser = loadFromStorage("currentUser");
  if (currentUser && currentUser.username) {
    document.getElementById("userAvatar").src = currentUser.avatar || "data:image/jpeg;base64,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";
    document.getElementById("userName").textContent = currentUser.username;
    showStudentSection();
    renderTable();
  } else {
    currentUser = null;
    hideStudentSection();
    toggleForm("login");
  }
});
