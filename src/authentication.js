console.log("authentication.js loaded");

import { auth, db } from "./firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export async function loginUser(email, password) {
  if (!auth) throw new Error("Authentication service not available");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signupUser(name, email, password) {
  if (!auth) throw new Error("Authentication service not available");
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  try {
    if (db) {
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        country: "Canada", // Default value
        school: "BCIT", // Default value
      });
      console.log("Firestore user document created successfully!");
    }
  } catch (err) {
    console.error("Error creating Firestore document:", err);
  }

  return user;
}

export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
  window.location.href = "index.html";
}

export function checkAuthState() {
  if (!auth) return;
  onAuthStateChanged(auth, (user) => {
    if (window.location.pathname.endsWith("main.html")) {
      if (user) {
        const displayName = user.displayName || user.email;
        const welcomeMsg = document.getElementById("welcomeMessage");
        if (welcomeMsg) welcomeMsg.textContent = `Hello, ${displayName}!`;
      } else {
        window.location.href = "main.html";
      }
    }
  });
}

export function onAuthReady(callback) {
  if (!auth) return;
  return onAuthStateChanged(auth, callback);
}

export function authErrorMessage(error) {
  const code = (error?.code || "").toLowerCase();
  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/user-not-found": "No account found.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "Email already exists.",
    "auth/weak-password": "Password too weak (min 6 chars).",
    "auth/missing-password": "Password cannot be empty.",
    "auth/network-request-failed": "Network error. Try again.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
