// src/homeTasksDashboard.js
import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { TASKS } from "./tasks.js"; // just reads data, does NOT replace your old page

const TASK_CONTAINER_ID = "taskCards";

function getTaskContainer() {
  return document.getElementById(TASK_CONTAINER_ID);
}

function renderDashboardTasks(tasks) {
  const el = getTaskContainer();
  if (!el) return; // only run on pages that have the dashboard section

  if (!tasks || tasks.length === 0) {
    el.innerHTML = `<p class="dashboard-empty">No tasks for today.</p>`;
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

async function getUserPath() {
  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;

  return snap.data().careerInterest || null; // e.g. "software"
}

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

auth.onAuthStateChanged(async (user) => {
  const el = getTaskContainer();
  if (!el) return; // do nothing on other pages

  if (!user) {
    renderDashboardTasks(["Sign in to see your tasks."]);
    return;
  }

  const path = await getUserPath();
  if (!path) {
    renderDashboardTasks(["Take the quiz to set your career path."]);
    return;
  }

  const tasks = pickTasksForPath(path);
  renderDashboardTasks(tasks);
});
