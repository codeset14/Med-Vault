// js/records.js
import { auth, db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const saveBtn = document.getElementById("saveRecordBtn");

  saveBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    const sugar = document.getElementById("sugarLevel").value;
    const systolic = document.getElementById("systolic").value;
    const diastolic = document.getElementById("diastolic").value;

    if (!window.latestBMI || !sugar || !systolic || !diastolic) {
      alert("Enter all health values first");
      return;
    }

    try {
      console.log("Saving record for user:", user.uid);

      await addDoc(
        collection(db, "users", user.uid, "healthRecords"),
        {
          bmi: Number(window.latestBMI),
          sugar: Number(sugar),
          systolic: Number(systolic),
          diastolic: Number(diastolic),
          timestamp: serverTimestamp()
        }
      );

      alert("Medical record saved ✅");
      document.dispatchEvent(new Event("record-added"));
      console.log("Record saved successfully");

    } catch (error) {
      console.error("Firestore save error:", error);
      alert("Failed to save record");
    }

  });

});
