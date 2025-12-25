// js/documents.js
import { auth } from "./firebaseConfig.js";

const fileInput = document.getElementById("docFile");
const uploadBtn = document.getElementById("uploadDocBtn");
const status = document.getElementById("docStatus");
const list = document.getElementById("documentsList");

uploadBtn?.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file");

  status.textContent = "Uploading…";

  // 🔌 BACKEND DEV:
  // Upload to Firebase Storage / backend
  setTimeout(() => {
    status.textContent = "Uploaded successfully";
    addDocument(file.name);
  }, 1200);
});

function addDocument(name) {
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
}
