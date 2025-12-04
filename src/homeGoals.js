// src/homeGoalsPreview.js
import { auth, db } from "./firebaseConfig.js";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const PREVIEW_ID = "goalsPreview";

/* ------------------------------------------
   Utility: Get preview container on main.html
------------------------------------------- */
function getPreviewContainer() {
  return document.getElementById(PREVIEW_ID);
}

/* ------------------------------------------
   Escape HTML for safe display
------------------------------------------- */
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[ch]);
}

/* ------------------------------------------
   Format date nicely
------------------------------------------- */
function formatDate(date) {
  if (!date) return "Date TBA";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "Date TBA";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

/* ------------------------------------------
   RENDER GOAL PREVIEW (Dashboard)
------------------------------------------- */
function renderPreview(goals) {
  const box = getPreviewContainer();
  if (!box) return; // Only runs on main.html

  if (!goals || goals.length === 0) {
    box.innerHTML = `<p class="dashboard-empty">No goals yet. Create one on the Goals page.</p>`;
    return;
  }

  const preview = goals.slice(0, 3);

  box.innerHTML = preview
    .map(
      (g) => `
      <article class="dash-card dash-goal">
        <h3>${escapeHtml(g.title || "Untitled goal")}</h3>
        <p class="dash-goal-career">${escapeHtml(g.career || "General")}</p>
        <p class="dash-goal-date">🎯 ${formatDate(g.byDate)}</p>
      </article>
    `
    )
    .join("");
}

/* ------------------------------------------
   Real-time listener for user's goals
------------------------------------------- */
auth.onAuthStateChanged((user) => {
  const box = getPreviewContainer();
  if (!box) return; // Only run on main page

  if (!user) {
    box.innerHTML = "<p>Please sign in to view your goals.</p>";
    return;
  }

  const ref = collection(db, "users", user.uid, "goals");
  const q = query(ref, orderBy("createdAt", "desc"), limit(5));

  onSnapshot(q, (snap) => {
    const goals = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderPreview(goals);
  });
});
