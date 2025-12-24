// js/auth.js
// Handles Login + Signup using Firebase Auth (Email/Password)

import { auth } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// DOM elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const errorText = document.getElementById("authError");

// 🔐 If already logged in → go to dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

// 🔑 LOGIN
loginBtn.addEventListener("click", async () => {
  errorText.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorText.textContent = "Please enter email and password";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // redirect handled by onAuthStateChanged
  } catch (err) {
    errorText.textContent = err.message;
  }
});

// 🆕 SIGN UP
signupBtn.addEventListener("click", async () => {
  errorText.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorText.textContent = "Please enter email and password";
    return;
  }

  if (password.length < 6) {
    errorText.textContent = "Password must be at least 6 characters";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // redirect handled by onAuthStateChanged
  } catch (err) {
    errorText.textContent = err.message;
  }
});
