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

function getPreviewContainer() {
  return document.getElementById(PREVIEW_ID);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[ch]);
}

function formatDate(date) {
  if (!date) return "Date TBA";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "Date TBA";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

function renderPreview(goals) {
  const box = getPreviewContainer();
  if (!box) return;

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

auth.onAuthStateChanged((user) => {
  const box = getPreviewContainer();
  if (!box) return; // only run on home page

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
