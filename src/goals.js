import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  getDocs
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js";
import "./app.js";
import "./goalsPage.js";

//-----------------------------------------------------------
// Display Job / Goal Title
// (e.g., "Software Developer at Google" or "Learn ReactJS")
//-----------------------------------------------------------
const goalDocID = localStorage.getItem("goalDocID");

async function displayGoalName(id) {
  if (!id) return console.warn("No goal ID found");
  try {
    const snap = await getDoc(doc(db, "careerGoals", id));
    if (snap.exists()) {
      document.getElementById("goalTitle").textContent = snap.data().title;
    } else {
      console.log("No such career goal found!");
    }
  } catch (err) {
    console.error("Error getting goal document:", err);
  }
}

displayGoalName(goalDocID);

//-----------------------------------------------------------
// Submit Career Goal / Progress Entry
// Triggered when a signed-in user submits the form
// e.g., “Apply for UX Designer,” “Complete Java Course,” etc.
//-----------------------------------------------------------
async function saveGoalProgress() {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const progress = document.getElementById("progress").value;
  const notes = document.getElementById("notes").value.trim();
  const status = document.querySelector('input[name="status"]:checked')?.value;

  if (!title || !progress) return alert("Please complete all required fields.");

  const user = auth.currentUser;
  if (!user) return alert("You must be signed in to track progress.");

  try {
    await addDoc(collection(db, "careerProgress"), {
      goalDocID,
      userID: user.uid,
      title,
      category,
      progress,
      notes,
      status,
      timestamp: serverTimestamp(),
    });

    console.log("✅ Career progress saved!");
    window.location.href = `careerGoal.html?docID=${goalDocID}`;
  } catch (err) {
    console.error("Error saving progress:", err);
  }
}
