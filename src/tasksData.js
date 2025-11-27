import { auth, db } from "./firebaseConfig.js";
import { setDoc, doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { TASKS } from "./tasks.js";
import "./app.js";
import "./styles/task.css";

const FAKE_DEBUG_MODE = false;

async function loadUserProfile() {
  const uid = auth.currentUser.uid;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log("User profile missing!");
    return;
  }

  const data = userSnap.data();
  return {
    path: data.careerInterest,
    level: data.skillLevel
  };
}


function getTodaysTasks(path, level) {
  const availableTasks = TASKS[path]?.[level];

  if (!availableTasks || availableTasks.length === 0) {
    return ["No tasks found. Please update your survey."];
  }

  // If <= 3 tasks → return all
  if (availableTasks.length <= 3) {
    return availableTasks;
  }

  // Pick 3 random unique tasks
  const chosen = [];
  while (chosen.length < 3) {
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    const task = availableTasks[randomIndex];

    if (!chosen.includes(task)) {
      chosen.push(task);
    }
  }

  return chosen;
}

function displayTasks(taskList) {
  const container = document.getElementById("task-container");
  container.innerHTML = "";

  taskList.forEach((task, index) => {
    container.innerHTML += `
      <div class="task-card">
        <input type="checkbox" id="task-${index}">
        <label for="task-${index}">${task}</label>
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

  const profile = await loadUserProfile();
  const tasks = getTodaysTasks(profile.path, profile.level);
  displayTasks(tasks);
});
