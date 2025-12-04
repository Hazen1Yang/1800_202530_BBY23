import "./app.js";
import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const LOCAL_STORAGE_KEY = "pf_local_goals_v1";
const domReady = new Promise((resolve) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resolve, { once: true });
  } else {
    resolve();
  }
});

let currentUser = null;
let editingId = null;
let editingTasks = null;
let usingLocal = true;
let unsubscribe = null;

let listEl;
let formEl;
let clearBtn;
let saveBtn;
let modeBadge;
let summaryCountEls = [];
let summaryNextEls = [];
let dockAddBtn;
let dockListBtn;

onAuthReady((user) => {
  domReady.then(() => {
    cleanupSubscription();
    currentUser = user || null;
    editingId = null;
    editingTasks = null;
    updateSaveButtonLabel();

    if (user && db) {
      usingLocal = false;
      updateModeBadge(
        "Synced to your account — sign in on any device to keep goals aligned.",
        "mode-cloud"
      );
      subscribeToCloudGoals();
    } else {
      usingLocal = true;
      updateModeBadge(
        "Offline mode — goals stay on this device until you sign in.",
        "mode-local"
      );
      renderGoalList(getLocalGoals());
    }
  });
});

domReady.then(() => {
  listEl = document.getElementById("goalsList");
  formEl = document.getElementById("goalForm");
  clearBtn = document.getElementById("clearBtn");
  saveBtn = document.getElementById("saveBtn");
  modeBadge = document.getElementById("goalMode");
  summaryCountEls = Array.from(document.querySelectorAll("[data-goal-summary='count']"));
  summaryNextEls = Array.from(document.querySelectorAll("[data-goal-summary='next']"));
  dockAddBtn = document.querySelector("[data-goal-action='add']");
  dockListBtn = document.querySelector("[data-goal-action='list']");

  attachFormHandlers();
  attachListHandlers();
  attachDockHandlers();
  renderGoalList(getLocalGoals());
});

function attachFormHandlers() {
  if (!formEl) return;

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const career = formEl.career.value.trim();
    const title = formEl.title.value.trim();
    const details = formEl.details.value.trim();
    const byDate = formEl.byDate.value;

    if (!career || !title || !byDate) {
      alert("Please fill career, title, and target date.");
      return;
    }

    if (usingLocal) {
      saveLocalGoal({ career, title, details, byDate });
    } else {
      await saveCloudGoal({ career, title, details, byDate });
    }

    formEl.reset();
    editingId = null;
    editingTasks = null;
    updateSaveButtonLabel();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      if (usingLocal) {
        if (confirm("Clear all saved goals on this device?")) {
          setLocalGoals([]);
          renderGoalList([]);
        }
      } else if (currentUser) {
        if (!confirm("Delete every saved goal from your account?")) return;
        const colRef = collection(db, "users", currentUser.uid, "goals");
        const snap = await getDocs(colRef);
        await Promise.all(
          snap.docs.map((docSnap) =>
            deleteDoc(doc(db, "users", currentUser.uid, "goals", docSnap.id))
          )
        );
      }
    });
  }
}

function attachListHandlers() {
  if (!listEl) return;

  listEl.addEventListener("click", async (event) => {
    const actionBtn = event.target.closest("[data-action]");
    if (!actionBtn) return;

    const { action, id } = actionBtn.dataset;

    if (action === "edit") {
      if (usingLocal) {
        const goal = getLocalGoals().find((item) => item.id === id);
        if (goal) populateForm(goal);
      } else if (currentUser) {
        const docSnap = await getDoc(
          doc(db, "users", currentUser.uid, "goals", id)
        );
        if (docSnap.exists()) {
          populateForm({ id: docSnap.id, ...docSnap.data() });
        }
      }
    }

    if (action === "delete") {
      if (!confirm("Delete this goal?")) return;

      if (usingLocal) {
        setLocalGoals(getLocalGoals().filter((goal) => goal.id !== id));
        renderGoalList(getLocalGoals());
      } else if (currentUser) {
        await deleteDoc(doc(db, "users", currentUser.uid, "goals", id));
      }
    }
  });
}

function populateForm(goal) {
  if (!formEl) return;

  formEl.career.value = goal.career || "";
  formEl.title.value = goal.title || "";
  formEl.details.value = goal.details || "";
  formEl.byDate.value = goal.byDate || "";

  editingId = goal.id || null;
  editingTasks = Array.isArray(goal.tasks) ? goal.tasks : null;
  updateSaveButtonLabel();
  formEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateSaveButtonLabel() {
  if (!saveBtn) return;
  saveBtn.textContent = editingId ? "Save Changes" : "Save Goal";
}

function updateModeBadge(message, modeClass) {
  if (!modeBadge) return;
  modeBadge.textContent = message;
  modeBadge.classList.remove("mode-cloud", "mode-local");
  if (modeClass) modeBadge.classList.add(modeClass);
}

function attachDockHandlers() {
  if (dockAddBtn) {
    dockAddBtn.addEventListener("click", () => {
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        const firstField = formEl.querySelector("input, textarea");
        if (firstField) firstField.focus();
      }
    });
  }

  if (dockListBtn) {
    dockListBtn.addEventListener("click", () => {
      if (listEl) {
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

function subscribeToCloudGoals() {
  if (!currentUser) return;

  const goalsCol = collection(db, "users", currentUser.uid, "goals");
  const q = query(goalsCol, orderBy("createdAt", "desc"));

  unsubscribe = onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderGoalList(docs);
  });
}

function cleanupSubscription() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

function saveLocalGoal(goal) {
  const goals = getLocalGoals();
  if (editingId) {
    const index = goals.findIndex((item) => item.id === editingId);
    if (index > -1) {
      const preservedTasks = goals[index].tasks || [];
      goals[index] = { ...goals[index], ...goal, tasks: preservedTasks };
    }
  } else {
    goals.unshift({ id: createLocalId(), tasks: [], ...goal });
  }
  setLocalGoals(goals);
  renderGoalList(goals);
  editingTasks = null;
}

async function saveCloudGoal(goal) {
  if (!currentUser) return;
  const goalsCol = collection(db, "users", currentUser.uid, "goals");

  if (editingId) {
    const docRef = doc(db, "users", currentUser.uid, "goals", editingId);
    const payload = {
      ...goal,
      updatedAt: serverTimestamp(),
    };
    if (Array.isArray(editingTasks)) {
      payload.tasks = editingTasks;
    }
    await updateDoc(docRef, payload);
    editingTasks = null;
  } else {
    await addDoc(goalsCol, {
      ...goal,
      tasks: [],
      createdAt: serverTimestamp(),
    });
  }
}

function renderGoalList(goals) {
  if (!listEl) return;

  if (!Array.isArray(goals) || goals.length === 0) {
    listEl.innerHTML = `<p class="empty-state">No saved goals yet. Add your first milestone above.</p>`;
    updateSummary(0, null);
    return;
  }

  // Sort by date: Soonest first. Past dates still appear but sorted correctly.
  const sortedGoals = [...goals].sort((a, b) => {
    const dateA = new Date(a.byDate);
    const dateB = new Date(b.byDate);
    return dateA - dateB;
  });

  listEl.innerHTML = sortedGoals
    .map((goal) => createGoalCard(goal))
    .join("");

  updateSummary(goals.length, getNextDate(sortedGoals));
}

function createGoalCard(goal) {
  const details = goal.details ? escapeHtml(goal.details) : "No details added yet.";
  const byDate = formatDate(goal.byDate);
  
  // Check if date is in the past
  const isPast = new Date(goal.byDate) < new Date().setHours(0,0,0,0);
  const pastClass = isPast ? "goal-past" : "";
  const dateLabel = isPast ? "Past Due" : "Target Date";

  return `
    <article class="goal-card ${pastClass}">
      <div class="goal-card-head">
        <div>
          <p class="goal-label">${escapeHtml(goal.career || "General")}</p>
          <h3>${escapeHtml(goal.title || "Untitled goal")}</h3>
        </div>
        <div class="goal-date-badge ${pastClass}">
          <span class="date-label">${dateLabel}</span>
          <span class="date-value">${byDate}</span>
        </div>
      </div>
      <p class="goal-details">${details}</p>
      <div class="goal-controls">
        <button class="small-btn btn-secondary" data-action="edit" data-id="${goal.id}">Edit</button>
        <button class="small-btn btn-primary" data-action="delete" data-id="${goal.id}">Delete</button>
      </div>
    </article>
  `;
}

function getNextDate(goals) {
  const now = new Date().setHours(0,0,0,0);
  const validDates = goals
    .map((goal) => goal.byDate)
    .filter(Boolean)
    .map((dateStr) => new Date(dateStr))
    .filter((date) => !Number.isNaN(date.getTime()) && date >= now) // Only future dates
    .sort((a, b) => a - b);

  return validDates[0] || null;
}

function updateSummary(count, nextDate) {
  summaryCountEls.forEach((el) => {
    el.textContent = count;
  });

  const nextText = nextDate ? formatDate(nextDate) : "—";
  summaryNextEls.forEach((el) => {
    el.textContent = nextText;
  });
}

function formatDate(date) {
  if (!date) return "Date TBA";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "Date TBA";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function getLocalGoals() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Unable to parse local goals", err);
    return [];
  }
}

function setLocalGoals(goals) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
}

function createLocalId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `goal-${Date.now()}`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
  );
}
