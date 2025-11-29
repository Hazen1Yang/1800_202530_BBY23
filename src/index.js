import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import {
  doc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./app.js";

// This might be better as a .js for main.html instead,
// but only if we ever have the time to even work on the main.html, for now, keep it like this.
function showDashboard() {
  // the <h1> element to display "Hello, {name}"
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady(async (user) => {
    // Does not check if user is singed in, that is handled in app.js.
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const name = userDoc.exists()
      ? userDoc.data().name
      : user.displayName || user.email;

    // Update the welcome message with their name/email.
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}

showDashboard();

// Populate name/quote placeholders from localStorage (safe fallback to defaults)
document.addEventListener('DOMContentLoaded', () => {
  try {
    const nameEl = document.getElementById('name-goes-here');
    const quoteEl = document.getElementById('quote-goes-here');
    const storedName = localStorage.getItem('pf_user_name');
    const storedQuote = localStorage.getItem('pf_quote');

    if (nameEl) nameEl.textContent = storedName || 'my friend!';
    if (quoteEl) quoteEl.textContent = storedQuote || 'Join other students like yourself.';
  } catch (err) {
    // Do not break page if anything goes wrong here
    // Log for debugging in dev tools
    // eslint-disable-next-line no-console
    console.error('Initialization error:', err);
  }
});