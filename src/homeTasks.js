// src/homeTasksDashboard.js
import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { TASKS } from "./tasks.js";

// Dashboard container ID (main.html)
const DASHBOARD_CONTAINER_ID = "taskCards";

/* -----------------------------------------------------
   Utility: Get dashboard container if we're on main.html
----------------------------------------------------- */
function getDashboardContainer() {
  return document.getElementById(DASHBOARD_CONTAINER_ID);
}

/* -----------------------------------------------------
   DASHBOARD RENDERER (main.html only)
----------------------------------------------------- */
function renderDashboardTasks(tasks) {
  const el = getDashboardContainer();
  if (!el) return; // Exit if NOT on main.html

  if (!tasks || tasks.length === 0) {
    el.innerHTML = `<p class="dashboard-empty">No tasks available.</p>`;
    return;
  }

  el.innerHTML = tasks
    .map(
      (t) => `
      <article class="dash-card dash-task">
        <div class="dash-task-body">
          <p>${t}</p>
        </div>
      </article>
    `
    )
    .join("");
}

/* -----------------------------------------------------
   GET USER QUIZ PATH
----------------------------------------------------- */
async function getUserPath() {
  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;

  return snap.data().careerInterest || null; 
}

/* -----------------------------------------------------
   CHOOSE 3 RANDOM TASKS FOR DASHBOARD
----------------------------------------------------- */
function pickTasksForPath(path) {
  const list = TASKS[path];

  if (!Array.isArray(list) || list.length === 0) {
    return ["Complete the quiz to get personalized tasks!"];
  }

  if (list.length <= 3) return list;

  const chosen = new Set();
  while (chosen.size < 3) {
    const t = list[Math.floor(Math.random() * list.length)];
    chosen.add(t);
  }

  return [...chosen];
}

/* -----------------------------------------------------
   MAIN AUTH LISTENER — ONLY RENDERS ON main.html
----------------------------------------------------- */
auth.onAuthStateChanged(async (user) => {
  const el = getDashboardContainer();
  if (!el) return; // Prevent interfering with task.html

  if (!user) {
    renderDashboardTasks(["Sign in to see your tasks."]);
    return;
  }

  const path = await getUserPath();
  if (!path) {
    renderDashboardTasks(["Take the quiz to set your career direction."]);
    return;
  }

  const tasks = pickTasksForPath(path);
  renderDashboardTasks(tasks);
});

/* -----------------------------------------------------
   FULL TASKS PAGE RENDERER (task.html)
   DOES NOT RUN on main.html
----------------------------------------------------- */
export function displayTasks(list) {
  const container = document.getElementById("fullTaskList");
  if (!container) return; // Only run on task.html

  container.innerHTML = "";

  list.forEach((task, i) => {
    container.innerHTML += `
      <div class="task-item">
        <input type="checkbox" id="task-${i}">
        <label for="task-${i}">${task}</label>
      </div>
    `;
  });
}
