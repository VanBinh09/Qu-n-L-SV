

export function saveToStorage(data, key = "students") {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage(key = "students") {
  return JSON.parse(localStorage.getItem(key)) || [];
}
