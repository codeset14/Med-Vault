// js/appointments.js
import { auth } from "./firebaseConfig.js";

/*
Responsibilities:
- Create appointment
- List upcoming appointments
- (Later) trigger reminders
*/

const form = document.getElementById("appointmentForm");
const list = document.getElementById("appointmentsList");

auth.onAuthStateChanged((user) => {
  if (!user) return;
  loadAppointments(user.uid);
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = form.title.value;
  const date = form.date.value;
  const note = form.note.value;

  if (!title || !date) return alert("Missing required fields");

  saveAppointment({ title, date, note });
});

function saveAppointment(data) {
  // 🔌 BACKEND DEV:
  // Replace this with Firestore or API call
  console.log("Saving appointment:", data);

  renderAppointment(data);
}

function loadAppointments(uid) {
  // 🔌 BACKEND DEV:
  // Fetch appointments for this user
  console.log("Load appointments for:", uid);
}

function renderAppointment({ title, date, note }) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${title}</strong> — ${date}<br>${note || ""}`;
  list.appendChild(li);
}
