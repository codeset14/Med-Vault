// 🔥 Firebase imports
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔑 Firebase config
import { firebaseConfig } from "./firebaseConfig.js";


// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const storage = getStorage(app);


// 📊 Chart refs
let bmiChart, bpChart, sugarChart;

// 👤 Current user
let currentUserId = null;

// 🧮 BMI
function calculateBMI(weight, height) {
  return (weight / (height * height)).toFixed(2);
}

// 🏷️ Status helpers
function bmiStatus(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function bpStatus(sys, dia) {
  if (sys < 120 && dia < 80) return "Normal";
  if (sys < 130 && dia < 80) return "Elevated";
  if (sys < 140 || dia < 90) return "High (Stage 1)";
  return "High (Stage 2)";
}

function sugarStatus(sugar) {
  if (sugar < 100) return "Normal";
  if (sugar < 126) return "Prediabetic";
  return "Diabetic";
}

/* ================= AUTH ================= */

// Sign up
document.getElementById("signupBtn").onclick = async () => {
  const emailVal = document.getElementById("email").value;
  const passwordVal = document.getElementById("password").value;

  if (!emailVal || !passwordVal) {
    alert("Enter email and password");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, emailVal, passwordVal);
    alert("Signup successful ✅");
  } catch (err) {
    alert(err.message);
  }
};


// Login
document.getElementById("loginBtn").onclick = async () => {
  const emailVal = document.getElementById("email").value;
  const passwordVal = document.getElementById("password").value;

  if (!emailVal || !passwordVal) {
    alert("Enter email and password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, emailVal, passwordVal);
    alert("Login successful ✅");
  } catch (err) {
    alert(err.message);
  }
};


// Logout
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
};

// Auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    currentUserId = user.uid;
    logoutBtn.style.display = "inline";
    fetchHealthRecords();
    fetchReports();

  } else {
    currentUserId = null;
    output.innerHTML = "";
    logoutBtn.style.display = "none";
    reportsList.innerHTML = "";

  }
});

/* ================= SAVE RECORD ================= */

document.getElementById("saveBtn").onclick = async () => {
  if (!currentUserId) {
    alert("Please login first");
    return;
  }

  const height = parseFloat(height.value);
  const weight = parseFloat(weight.value);
  const bpSys = parseInt(bp_sys.value);
  const bpDia = parseInt(bp_dia.value);
  const sugar = parseInt(sugar.value);

  const bmi = calculateBMI(weight, height);

  await addDoc(collection(db, "users", currentUserId, "records"), {
    height,
    weight,
    bmi,
    bp_systolic: bpSys,
    bp_diastolic: bpDia,
    sugar,
    date: Timestamp.now()
  });

  alert("Record saved ✅");
  fetchHealthRecords();
};

/* ================= FETCH + GRAPHS ================= */

async function fetchHealthRecords() {
  if (!currentUserId) return;

  output.innerHTML = "";

  const dates = [], bmiVals = [], sysVals = [], diaVals = [], sugarVals = [];

  const q = query(
    collection(db, "users", currentUserId, "records"),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const d = doc.data();

    dates.push(d.date.toDate().toLocaleDateString());
    bmiVals.push(d.bmi);
    sysVals.push(d.bp_systolic);
    diaVals.push(d.bp_diastolic);
    sugarVals.push(d.sugar);

    output.innerHTML += `
      <div class="record">
        BMI: ${d.bmi} (${bmiStatus(d.bmi)})<br>
        BP: ${d.bp_systolic}/${d.bp_diastolic} (${bpStatus(d.bp_systolic, d.bp_diastolic)})<br>
        Sugar: ${d.sugar} (${sugarStatus(d.sugar)})
      </div>
    `;
  });

  drawBMIChart(dates, bmiVals);
  drawBPChart(dates, sysVals, diaVals);
  drawSugarChart(dates, sugarVals);
}

// Charts (same as before)
function drawBMIChart(l, d) {
  if (bmiChart) bmiChart.destroy();
  bmiChart = new Chart(bmiChartCanvas.getContext("2d"), {
    type: "line",
    data: { labels: l, datasets: [{ label: "BMI", data: d }] }
  });
}

function drawBPChart(l, s, d) {
  if (bpChart) bpChart.destroy();
  bpChart = new Chart(bpChartCanvas.getContext("2d"), {
    type: "line",
    data: { labels: l, datasets: [
      { label: "Systolic", data: s },
      { label: "Diastolic", data: d }
    ]}
  });
}

function drawSugarChart(l, d) {
  if (sugarChart) sugarChart.destroy();
  sugarChart = new Chart(sugarChartCanvas.getContext("2d"), {
    type: "line",
    data: { labels: l, datasets: [{ label: "Sugar", data: d }] }
  });
}

document.getElementById("uploadBtn").onclick = async () => {
  if (!currentUserId) {
    alert("Please login first");
    return;
  }

  const fileInput = document.getElementById("reportFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file");
    return;
  }

  const status = document.getElementById("uploadStatus");
  status.innerText = "Uploading...";

  try {
    const fileRef = ref(
      storage,
      `reports/${currentUserId}/${Date.now()}_${file.name}`
    );

    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    await addDoc(collection(db, "users", currentUserId, "reports"), {
      fileName: file.name,
      url: downloadURL,
      uploadedAt: Timestamp.now()
    });

    status.innerText = "Upload successful ✅";
    fileInput.value = "";
    fetchReports();

  } catch (err) {
    status.innerText = err.message;
  }
};


async function fetchReports() {
  if (!currentUserId) return;

  const reportsDiv = document.getElementById("reportsList");
  reportsDiv.innerHTML = "";

  const q = query(
    collection(db, "users", currentUserId, "reports"),
    orderBy("uploadedAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    reportsDiv.innerHTML = "<p>No reports uploaded yet.</p>";
    return;
  }

  snapshot.forEach(doc => {
    const d = doc.data();

    reportsDiv.innerHTML += `
      <div class="record">
        <strong>${d.fileName}</strong><br>
        <small>${d.uploadedAt.toDate().toLocaleString()}</small><br>
        <a href="${d.url}" target="_blank">View / Download</a>
      </div>
    `;
  });
}

document.getElementById("exportCSVBtn").onclick = async () => {
  if (!currentUserId) {
    alert("Please login first");
    return;
  }

  const q = query(
    collection(db, "users", currentUserId, "records"),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    alert("No data to export");
    return;
  }

  let csv = "Date,Height,Weight,BMI,BP Systolic,BP Diastolic,Sugar\n";

  snapshot.forEach(doc => {
    const d = doc.data();
    const date = d.date.toDate().toLocaleDateString();

    csv += `${date},${d.height},${d.weight},${d.bmi},${d.bp_systolic},${d.bp_diastolic},${d.sugar}\n`;
  });

  downloadCSV(csv, "health_data.csv");
};


function downloadCSV(content, fileName) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}

