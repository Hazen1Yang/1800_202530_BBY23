console.log("app.js loaded");

// IMPORTS MUST BE IN THIS ORDER OR IT MESSES UP THE CSS!!!
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
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

// Global Footer and Navbar components:
import "./components/site-footer.js";
import "./components/site-navbar.js";

// Global style for all pages (you can still import a different css file after):
import "./styles/style.css";

// Custom global JS code (shared with all pages):
onAuthReady(async (user) => {
  if (!user) {
    const currentPage = window.location.pathname.split("/").pop();
    // Pages the user should not access even when logged in.
    const hiddenPages = ["template.html"];
    // These are the only pages where it won't redirect to login if not signed in.
    const allowedPages = ["login.html", "index.html"];
    // Prevent access to hidden pages
    if (hiddenPages.includes(currentPage)) {
      alert("You're not supposed to be here....");
      location.href = "index.html";
      // Else if no user is signed in it redirects back to login page.
    } else if (!allowedPages.includes(currentPage)) {
      // Shows a message telling user to log in and waits for user to click OK
      alert("You need to be signed in to view this page.");
      // And then it redirects back to login page.
      location.href = "login.html";
    }
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const name = userDoc.exists()
    ? userDoc.data().name
    : user.displayName || user.email;
});
