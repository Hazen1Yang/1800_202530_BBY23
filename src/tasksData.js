import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { CATEGORY_MAP, TASKS } from "./tasks.js";
import "./styles/task.css";
import "./app.js";
const FAKE_DEBUG_MODE = false;

async function loadUserProfile() {
  const uid = auth.currentUser.uid;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log("User profile missing!");
    return null;
  }

  const data = userSnap.data();
  return {
    path: data.careerInterest // ex: "software"
  };
}

// 🟢 NEW VERSION — no level
function getTodaysTasks(path) {
  const availableTasks = TASKS[path];

  if (!availableTasks || availableTasks.length === 0) {
    return ["No tasks found. Please update your survey."];
  }

  if (availableTasks.length <= 3) return availableTasks;

  const chosen = [];
  while (chosen.length < 3) {
    const t = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    if (!chosen.includes(t)) chosen.push(t);
  }

  return chosen;
}

function displayTasks(list) {
  const container = document.getElementById("task-container");
  container.innerHTML = "";

  list.forEach((task, i) => {
    container.innerHTML += `
      <div class="task-card">
        <input type="checkbox" id="task-${i}">
        <label for="task-${i}">${task}</label>
      </div>
    `;
  });
}

async function recordTaskCompletion() {
  const uid = auth.currentUser.uid;
  const progressRef = doc(db, "userProgress", uid);

  await updateDoc(progressRef, {
    completedCount: increment(1)
  });
}

document.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    recordTaskCompletion();
  }
});

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const profile = FAKE_DEBUG_MODE
    ? { path: "software" }
    : await loadUserProfile();

  if (!profile || !profile.path) {
    displayTasks(["Please complete your quiz and survey first."]);
    return;
  }

  const tasks = getTodaysTasks(profile.path);
  displayTasks(tasks);
});
