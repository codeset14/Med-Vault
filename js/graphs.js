// js/graphs.js
import { auth, db } from "./firebaseConfig.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const ChartJS = window.Chart;

  const bmiChart = new ChartJS(document.getElementById("bmiChart"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "BMI", data: [] }] }
  });

  const sugarChart = new ChartJS(document.getElementById("sugarChart"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Sugar (mg/dL)", data: [] }] }
  });

  const bpChart = new ChartJS(document.getElementById("bpChart"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Systolic", data: [] },
        { label: "Diastolic", data: [] }
      ]
    }
  });

  const tableBody = document.getElementById("recordsTableBody");

  auth.onAuthStateChanged((user) => {
    if (!user) return;

    const recordsRef = query(
      collection(db, "users", user.uid, "healthRecords"),
      orderBy("timestamp")
    );

    // 🔥 REAL-TIME LISTENER
    onSnapshot(recordsRef, (snapshot) => {

      // Clear previous UI
      bmiChart.data.labels = [];
      bmiChart.data.datasets[0].data = [];

      sugarChart.data.labels = [];
      sugarChart.data.datasets[0].data = [];

      bpChart.data.labels = [];
      bpChart.data.datasets[0].data = [];
      bpChart.data.datasets[1].data = [];

      tableBody.innerHTML = "";

      let index = 1;

      snapshot.forEach((doc) => {
        const d = doc.data();
        const label = `Record ${index}`;

        // Charts
        bmiChart.data.labels.push(label);
        bmiChart.data.datasets[0].data.push(d.bmi);

        sugarChart.data.labels.push(label);
        sugarChart.data.datasets[0].data.push(d.sugar);

        bpChart.data.labels.push(label);
        bpChart.data.datasets[0].data.push(d.systolic);
        bpChart.data.datasets[1].data.push(d.diastolic);

        // Table
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index}</td>
          <td>${d.bmi}</td>
          <td>${d.sugar}</td>
          <td>${d.systolic}/${d.diastolic}</td>
          <td>${d.timestamp?.toDate().toLocaleString() || "-"}</td>
        `;
        tableBody.appendChild(tr);

        index++;
      });

      // Update charts
      bmiChart.update();
      sugarChart.update();
      bpChart.update();

      console.log("Realtime update applied ✅");
    });
  });

});
