// js/documents.js
import { auth, db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const storage = getStorage(auth.app);

  const fileInput = document.getElementById("docFile");
  const uploadBtn = document.getElementById("uploadDocBtn");
  const status = document.getElementById("docStatus");
  const list = document.getElementById("documentsList");

  // 🔐 Wait for auth
  auth.onAuthStateChanged((user) => {
    if (!user) return;

    const docsRef = collection(db, "users", user.uid, "documents");
    const q = query(docsRef, orderBy("uploadedAt", "desc"));

    // 🔁 Realtime list of documents
    onSnapshot(q, (snapshot) => {
      list.innerHTML = "";
      snapshot.forEach((doc) => {
        const d = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="${d.fileURL}" target="_blank">
            ${d.fileName}
          </a>
          <small> (${new Date(d.uploadedAt?.toDate()).toLocaleString()})</small>
        `;
        list.appendChild(li);
      });
    });

    // ⬆️ Upload
    uploadBtn.addEventListener("click", async () => {
      const file = fileInput.files[0];
      if (!file) {
        status.textContent = "Please select a file.";
        return;
      }

      try {
        status.textContent = "Uploading...";
        const filePath = `documents/${user.uid}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, filePath);

        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        await addDoc(docsRef, {
          fileName: file.name,
          fileType: file.type,
          fileURL: url,
          uploadedAt: serverTimestamp()
        });

        status.textContent = "Document uploaded ✅";
        fileInput.value = "";
      } catch (err) {
        console.error(err);
        status.textContent = "Upload failed ❌";
      }
    });
  });
});
