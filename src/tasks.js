import "./styles/task.css";
import "./app.js";
import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc 
} from "firebase/firestore";

const LOCAL_STORAGE_KEY = "pf_local_goals_v1";
let currentUser = null;
let currentGoals = [];
let activeGoalId = null;

// DOM Elements
const goalsGrid = document.getElementById("goals-grid");
const activeGoalContainer = document.getElementById("active-goal-container");
const activeGoalTitle = document.getElementById("active-goal-title");
const activeGoalCareer = document.getElementById("active-goal-career");
const activeGoalDate = document.getElementById("active-goal-date");
const closeGoalViewBtn = document.getElementById("close-goal-view");
const addTaskForm = document.getElementById("add-task-form");
const newTaskInput = document.getElementById("new-task-input");
const goalTasksList = document.getElementById("goal-tasks-list");

document.addEventListener("DOMContentLoaded", () => {
  onAuthReady(async (user) => {
    currentUser = user;
    if (user) {
      await loadCloudGoals(user);
    } else {
      loadLocalGoals();
    }
    renderGoalsGrid();
  });

  if (closeGoalViewBtn) {
    closeGoalViewBtn.addEventListener("click", () => {
      activeGoalId = null;
      toggleActiveView(false);
    });
  }

  if (addTaskForm) {
    addTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = newTaskInput.value.trim();
      if (!text || !activeGoalId) return;
      
      await addTaskToGoal(activeGoalId, text);
      newTaskInput.value = "";
    });
  }
});

async function loadCloudGoals(user) {
  try {
    const q = query(collection(db, "users", user.uid, "goals"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    currentGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error loading cloud goals:", e);
    if (goalsGrid) goalsGrid.innerHTML = `<p class="error-msg">Failed to load goals. Please try refreshing.</p>`;
  }
}

function loadLocalGoals() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    currentGoals = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error loading local goals:", e);
  }
}

function renderGoalsGrid() {
  if (!goalsGrid) return;

  if (currentGoals.length === 0) {
    goalsGrid.innerHTML = `
      <div class="empty-goals-state">
        <p>No goals found.</p>
        <a href="goals.html" class="btn btn-primary">Create a Goal</a>
      </div>
    `;
    return;
  }

  goalsGrid.innerHTML = currentGoals.map(goal => {
    const isPast = new Date(goal.byDate) < new Date().setHours(0,0,0,0);
    const dateLabel = isPast ? "Past Due" : "Target";
    
    // Calculate progress
    const tasks = goal.tasks || [];
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return `
      <div class="goal-card-item" data-id="${goal.id}">
        <div class="goal-card-top">
          <span class="goal-category">${escapeHtml(goal.career || "General")}</span>
          <span class="goal-date ${isPast ? 'overdue' : ''}">${dateLabel}: ${formatDate(goal.byDate)}</span>
        </div>
        <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="progress-text">${completed}/${total} tasks</span>
        </div>
        <button class="btn btn-secondary btn-sm view-tasks-btn">View Tasks</button>
      </div>
    `;
  }).join("");

  // Attach click listeners
  goalsGrid.querySelectorAll(".goal-card-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      openGoalView(id);
    });
  });
}

function openGoalView(id) {
  const goal = currentGoals.find(g => g.id === id);
  if (!goal) return;

  activeGoalId = id;
  
  // Update Header
  if (activeGoalTitle) activeGoalTitle.textContent = goal.title;
  if (activeGoalCareer) activeGoalCareer.textContent = goal.career || "General";
  if (activeGoalDate) activeGoalDate.textContent = `Target: ${formatDate(goal.byDate)}`;

  renderTasksList(goal);
  toggleActiveView(true);
}

function renderTasksList(goal) {
  if (!goalTasksList) return;

  const tasks = goal.tasks || [];
  
  if (tasks.length === 0) {
    goalTasksList.innerHTML = `<p class="muted">No tasks yet. Add one above!</p>`;
    return;
  }

  goalTasksList.innerHTML = tasks.map((task, index) => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <label class="custom-checkbox">
        <input type="checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
        <span class="task-text">${escapeHtml(task.text)}</span>
      </label>
      <button class="delete-task-btn" data-index="${index}" title="Delete Task">&times;</button>
    </div>
  `).join("");

  // Attach listeners
  goalTasksList.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      toggleTaskCompletion(activeGoalId, index, e.target.checked);
    });
  });

  goalTasksList.querySelectorAll(".delete-task-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent bubbling
      const index = parseInt(e.target.dataset.index);
      deleteTask(activeGoalId, index);
    });
  });
}

async function addTaskToGoal(goalId, text) {
  const goalIndex = currentGoals.findIndex(g => g.id === goalId);
  if (goalIndex === -1) return;

  const goal = currentGoals[goalIndex];
  const newTasks = [...(goal.tasks || []), { text, completed: false, createdAt: Date.now() }];

  // Optimistic update
  goal.tasks = newTasks;
  renderTasksList(goal);
  renderGoalsGrid(); // update progress bar

  if (currentUser) {
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "goals", goalId), {
        tasks: newTasks
      });
    } catch (e) {
      console.error("Error saving task:", e);
      alert("Failed to save task. Please check your connection.");
    }
  } else {
    saveLocalGoalsToStorage();
  }
}

async function toggleTaskCompletion(goalId, taskIndex, isComplete) {
  const goalIndex = currentGoals.findIndex(g => g.id === goalId);
  if (goalIndex === -1) return;

  const goal = currentGoals[goalIndex];
  if (!goal.tasks || !goal.tasks[taskIndex]) return;

  goal.tasks[taskIndex].completed = isComplete;
  
  // UI Update
  renderTasksList(goal);
  renderGoalsGrid(); // update progress bar

  if (currentUser) {
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "goals", goalId), {
        tasks: goal.tasks
      });
    } catch (e) {
      console.error("Error updating task:", e);
    }
  } else {
    saveLocalGoalsToStorage();
  }
}

async function deleteTask(goalId, taskIndex) {
  if (!confirm("Delete this task?")) return;

  const goalIndex = currentGoals.findIndex(g => g.id === goalId);
  if (goalIndex === -1) return;

  const goal = currentGoals[goalIndex];
  const newTasks = goal.tasks.filter((_, i) => i !== taskIndex);

  goal.tasks = newTasks;
  renderTasksList(goal);
  renderGoalsGrid();

  if (currentUser) {
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "goals", goalId), {
        tasks: newTasks
      });
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  } else {
    saveLocalGoalsToStorage();
  }
}

function saveLocalGoalsToStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentGoals));
}

function toggleActiveView(show) {
  if (show) {
    if (goalsGrid) goalsGrid.style.display = "none";
    const title = document.querySelector(".section-title");
    if (title) title.style.display = "none";
    if (activeGoalContainer) activeGoalContainer.style.display = "block";
  } else {
    if (goalsGrid) goalsGrid.style.display = "grid";
    const title = document.querySelector(".section-title");
    if (title) title.style.display = "block";
    if (activeGoalContainer) activeGoalContainer.style.display = "none";
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

