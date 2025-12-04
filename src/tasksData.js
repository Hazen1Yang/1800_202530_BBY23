import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc, increment, updateDoc, serverTimestamp } from "firebase/firestore";
import { TASKS } from "./tasks.js";
import { arrayUnion } from "firebase/firestore";

import "./styles/task.css";
import "./app.js";

const FAKE_DEBUG_MODE = false;

/* ---------------------------------------------
   LOAD USER PROFILE → to get careerInterest
--------------------------------------------- */
async function loadUserProfile() {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return null;

  return { path: snap.data().careerInterest };
}

/* ---------------------------------------------
   PICK 3 RANDOM TASKS BASED ON CAREER PATH
--------------------------------------------- */
function chooseThreeTasks(path) {
  const list = TASKS[path];
  if (!list || list.length === 0) return ["No tasks found."];

  if (list.length <= 3) return list;

  const chosen = new Set();
  while (chosen.size < 3) {
    chosen.add(list[Math.floor(Math.random() * list.length)]);
  }
  return [...chosen];
}

/* ---------------------------------------------
   DISPLAY CHECKABLE TASKS ON THE TASK PAGE
--------------------------------------------- */
function displayTasks(list) {
  const container = document.getElementById("task-container");
  if (!container) return;

  container.innerHTML = list
    .map(
      (task, i) => `
        <div class="task-card">
          <input type="checkbox" id="task-${i}">
          <label for="task-${i}">${task}</label>
        </div>`
    )
    .join("");

  // 🔥 update the counter
  updateTaskCount(list.length);
}


/* ---------------------------------------------
   DISPLAY TASKS ON DASHBOARD PREVIEW
--------------------------------------------- */
function displayTasksOnDashboard(list) {
  const container = document.getElementById("taskCards");
  if (!container) return;

  container.innerHTML = list
    .map(
      (task) => `
        <article class="dash-card dash-task">
          <p>${task}</p>
        </article>`
    )
    .join("");
}

/* ---------------------------------------------
   SAVE COMPLETION CHECKBOXES
--------------------------------------------- */
async function recordTaskCompletion(index) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const dailyRef = doc(db, "dailyTasks", uid);

  await updateDoc(dailyRef, {
    completed: increment(0), // ensures field exists
    completedTasks: arrayUnion(index)
  });
}


document.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    const index = parseInt(e.target.id.replace("task-", ""));
    recordTaskCompletion(index);
    removeTaskFromUI(index);
  }
});


/* ---------------------------------------------
   ⭐ DAILY TASK MANAGER (24-HOUR RESET)
--------------------------------------------- */
function removeTaskFromUI(index) {
  const card = document.getElementById(`task-${index}`)?.closest(".task-card");
  if (!card) return;

  // play animation
  card.classList.add("completed");

  // wait for animation, THEN remove, THEN update count
  setTimeout(() => {
    card.remove();
    updateRemainingTaskCount(); // 🔥 ALWAYS accurate now
  }, 250);
}



async function loadDailyTasks() {
  const user = auth.currentUser;
  if (!user) {
    displayTasksOnDashboard(["Sign in to view daily tasks."]);
    return;
  }

  const dailyRef = doc(db, "dailyTasks", user.uid);
  const dailySnap = await getDoc(dailyRef);

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // 🔹 Step 1: If a saved set exists & is <24 hrs old → reuse it
  if (dailySnap.exists()) {
  const data = dailySnap.data();
  const last = data.tasksLastGenerated?.toMillis() || 0;

  if (now - last < DAY_MS) {
    let tasks = data.todayTasks;
    let completed = data.completedTasks || [];

    // remove completed tasks
    let remaining = removeCompletedTasksFromList(tasks, completed);

    displayTasks(remaining);
    displayTasksOnDashboard(remaining);
    return;
  }
}


  // 🔹 Step 2: No tasks or 24 hours passed → generate NEW tasks
  const profile = FAKE_DEBUG_MODE
    ? { path: "software" }
    : await loadUserProfile();

  if (!profile || !profile.path) {
    displayTasks(["Please complete the survey first."]);
    displayTasksOnDashboard(["Please complete the survey first."]);
    return;
  }

  const newTasks = chooseThreeTasks(profile.path);

  // Save new daily tasks
  await setDoc(dailyRef, {
    todayTasks: newTasks,
    tasksLastGenerated: serverTimestamp(),
  });

  displayTasks(newTasks);
  displayTasksOnDashboard(newTasks);
}

/* ---------------------------------------------
   AUTH LISTENER → Load tasks
--------------------------------------------- */
auth.onAuthStateChanged((user) => {
  if (user) loadDailyTasks();
});

function updateTaskCount(count) {
  const el = document.getElementById("taskCount");
  if (el) el.textContent = count;
}

function updateRemainingTaskCount() {
  const remaining = document.querySelectorAll(
    "#task-container .task-card:not(.completed)"
  ).length;

  updateTaskCount(remaining);
}

function removeCompletedTasksFromList(tasks, completedIndexes) {
  return tasks.filter((task, index) => !completedIndexes.includes(index));
}

