import "./styles/task.css";
import "./app.js";
import { onAuthReady } from "./authentication.js";
import { auth, db } from "./firebaseConfig.js";
import {
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	updateDoc,
} from "firebase/firestore";

export const CATEGORY_MAP = {
	T: "software",
	H: "health",
	E: "engineering",
	C: "creative",
	B: "business",
};

export const TASKS = {
	software: [
		"Watch a 5-minute tutorial on HTML/CSS.",
		"Organize your coding workspace for 5 minutes.",
		"Create a new folder for your future projects.",
		"Try inspecting a website using Chrome DevTools.",
		"Watch a short introduction to JavaScript variables.",
		"Take a 10-minute walk to reset your brain.",
		"Write a simple 'Hello World' program.",
		"Explore GitHub and bookmark one interesting project.",
		"Clean up old files on your desktop.",
		"Review BCIT CST program requirements for 2 minutes.",
	],
	health: [
		"Watch a 3-minute video on communication in healthcare.",
		"Read a short article on patient empathy.",
		"Stretch your shoulders for 30 seconds.",
		"Drink a glass of water and take a breath break.",
		"Learn what 'confidentiality' means in healthcare.",
		"Organize your notes or school materials.",
		"Skim BCIT Nursing admission requirements.",
		"Watch a short 'day in the life of a nurse' video.",
		"Practice writing a short reflection on why you want to help others.",
		"Take a short walk to clear your head.",
	],
	engineering: [
		"Watch a 5-minute video on how electricity works.",
		"Pick up a simple tool at home and identify its components.",
		"Organize your workspace or toolbox.",
		"Learn what an HVAC technician does in under 3 minutes.",
		"Try tightening or adjusting something safely at home.",
		"Stretch your hands and wrists for 30 seconds.",
		"Explore a blueprint or diagram online.",
		"Check BCIT Engineering or Trades prerequisites.",
		"Look at a simple wiring diagram and identify symbols.",
		"Take a 5-minute break to walk or stretch.",
	],
	creative: [
		"Sketch something for 2 minutes — anything.",
		"Watch a short tutorial on color theory.",
		"Analyze the UI of an app you like for 1 minute.",
		"Organize your creative workspace or tools.",
		"Take a picture of something inspiring.",
		"Try redesigning a small icon or button you see online.",
		"Browse Figma community templates.",
		"Do a 2-minute breathing exercise to refresh your creativity.",
		"Read BCIT Graphic Design requirements.",
		"Pick one product you use and critique its design.",
	],
	business: [
		"Watch a 5-minute intro to marketing or business management.",
		"Create a quick SWOT analysis of a brand you like.",
		"Write a list of 3 businesses you admire.",
		"Organize your notes or digital folders.",
		"Watch a short video on leadership or teamwork.",
		"Review BCIT Business program admission details.",
		"Take a 2-minute break to stretch or walk.",
		"Practice writing a short professional email.",
		"Identify a problem in your school or daily life and propose a solution.",
		"Read one page of a business article or news update.",
	],
};

const LOCAL_STORAGE_KEY = "pf_local_goals_v1";
const FALLBACK_CATEGORY = "business";

let currentUser = null;
let currentGoals = [];
let activeGoalId = null;
let unsubscribeGoals = null;

let goalsGrid;
let goalsSectionTitle;
let activeGoalContainer;
let activeGoalTitle;
let activeGoalCareer;
let activeGoalDate;
let closeGoalViewBtn;
let addTaskForm;
let newTaskInput;
let goalTasksList;
let suggestedTasksList;
let backToGoalsBtn;

document.addEventListener("DOMContentLoaded", () => {
	goalsGrid = document.getElementById("goals-grid");
	goalsSectionTitle = document.querySelector(".section-title");
	activeGoalContainer = document.getElementById("active-goal-container");
	activeGoalTitle = document.getElementById("active-goal-title");
	activeGoalCareer = document.getElementById("active-goal-career");
	activeGoalDate = document.getElementById("active-goal-date");
	closeGoalViewBtn = document.getElementById("close-goal-view");
	addTaskForm = document.getElementById("add-task-form");
	newTaskInput = document.getElementById("new-task-input");
	goalTasksList = document.getElementById("goal-tasks-list");
	suggestedTasksList = document.getElementById("suggested-tasks-list");
	backToGoalsBtn = document.getElementById("back-to-goals");

	// Render existing local data while auth resolves so the UI isn't empty
	loadLocalGoals();
	renderGoalsGrid();
	refreshActiveGoalView();

	const cancelAuthListener = onAuthReady((user) => {
		currentUser = user || null;
		if (currentUser && db) {
			loadCloudGoals(currentUser);
		} else {
			cleanupCloudSubscription();
			loadLocalGoals();
			renderGoalsGrid();
			refreshActiveGoalView();
		}
	});

	if (!cancelAuthListener && !auth) {
		currentUser = null;
		loadLocalGoals();
		renderGoalsGrid();
		refreshActiveGoalView();
	}

	if (closeGoalViewBtn) {
		closeGoalViewBtn.addEventListener("click", () => {
			activeGoalId = null;
			toggleActiveView(false);
			highlightActiveGoalCard();
		});
	}

	if (backToGoalsBtn) {
		backToGoalsBtn.addEventListener("click", () => {
			activeGoalId = null;
			toggleActiveView(false);
			highlightActiveGoalCard();
			goalsGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	}

	if (addTaskForm) {
		addTaskForm.addEventListener("submit", async (event) => {
			event.preventDefault();
			if (!activeGoalId) return;
			const text = newTaskInput.value.trim();
			if (!text) return;
			await addTaskToGoal(activeGoalId, text);
			newTaskInput.value = "";
		});
	}

	window.addEventListener("storage", (event) => {
		if (currentUser || event.key !== LOCAL_STORAGE_KEY) return;
		loadLocalGoals();
		renderGoalsGrid();
		refreshActiveGoalView();
	});
});

function loadCloudGoals(user) {
	cleanupCloudSubscription();
	try {
		const goalsRef = collection(db, "users", user.uid, "goals");
		const q = query(goalsRef, orderBy("createdAt", "desc"));
		unsubscribeGoals = onSnapshot(
			q,
			(snapshot) => {
				currentGoals = snapshot.docs.map((docSnap) => normalizeGoal({
					id: docSnap.id,
					...docSnap.data(),
				}));
				renderGoalsGrid();
				refreshActiveGoalView();
			},
			(error) => {
				console.error("Error streaming goals:", error);
				if (goalsGrid) {
					goalsGrid.innerHTML = `<p class="error-msg">Unable to load goals right now.</p>`;
				}
			}
		);
	} catch (err) {
		console.error("Failed to subscribe to goals:", err);
	}
}

function cleanupCloudSubscription() {
	if (unsubscribeGoals) {
		unsubscribeGoals();
		unsubscribeGoals = null;
	}
}

function loadLocalGoals() {
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		currentGoals = Array.isArray(parsed)
			? parsed.map((goal) => normalizeGoal(goal))
			: [];
	} catch (err) {
		console.error("Error loading local goals:", err);
		currentGoals = [];
	}
}

function renderGoalsGrid() {
	if (!goalsGrid) return;

	if (!Array.isArray(currentGoals) || currentGoals.length === 0) {
		goalsGrid.innerHTML = `
			<div class="empty-goals-state">
				<p>No goals found yet. Head to the Goals page to create one.</p>
				<a href="goals.html" class="btn btn-primary">Create a Goal</a>
			</div>
		`;
		return;
	}

	const sortedGoals = [...currentGoals].sort((a, b) => getSortableTime(a.byDate) - getSortableTime(b.byDate));

	goalsGrid.innerHTML = sortedGoals
		.map((goal) => buildGoalCard(goal))
		.join("");

	goalsGrid.querySelectorAll(".goal-card-item").forEach((card) => {
		card.addEventListener("click", () => {
			const { id } = card.dataset;
			if (id) openGoalView(id);
		});
	});

	highlightActiveGoalCard();
}

function buildGoalCard(goal) {
	const tasks = goal.tasks || [];
	const completed = tasks.filter((task) => task.completed).length;
	const total = tasks.length;
	const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
	const goalDate = formatDate(goal.byDate);
	const isPastDue = isPastDate(goal.byDate);
	const dateLabel = isPastDue ? "Past Due" : "Target";
	const isActive = goal.id === activeGoalId ? "active" : "";

	return `
		<article class="goal-card-item ${isActive}" data-id="${goal.id}">
			<header class="goal-card-top">
				<span class="goal-category">${escapeHtml(goal.career || "General")}</span>
				<span class="goal-date ${isPastDue ? "overdue" : ""}">${dateLabel}: ${goalDate}</span>
			</header>
			<h3 class="goal-title">${escapeHtml(goal.title || "Untitled goal")}</h3>
			<div class="goal-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width:${progress}%"></div>
				</div>
				<span class="progress-text">${completed}/${total} tasks</span>
			</div>
			<button type="button" class="btn btn-secondary btn-sm view-tasks-btn">Manage Tasks</button>
		</article>
	`;
}

function openGoalView(goalId) {
	const goal = currentGoals.find((g) => g.id === goalId);
	if (!goal) return;

	activeGoalId = goalId;
	if (activeGoalTitle) activeGoalTitle.textContent = goal.title || "Untitled goal";
	if (activeGoalCareer) activeGoalCareer.textContent = goal.career || "General";
	if (activeGoalDate) activeGoalDate.textContent = `Target: ${formatDate(goal.byDate)}`;

	renderTasksList(goal);
	renderSuggestedTasks(goal);
	toggleActiveView(true);
	highlightActiveGoalCard();
}

function refreshActiveGoalView() {
	if (!activeGoalId) return;
	const goal = currentGoals.find((g) => g.id === activeGoalId);
	if (!goal) {
		activeGoalId = null;
		toggleActiveView(false);
		return;
	}
	if (activeGoalTitle) activeGoalTitle.textContent = goal.title || "Untitled goal";
	if (activeGoalCareer) activeGoalCareer.textContent = goal.career || "General";
	if (activeGoalDate) activeGoalDate.textContent = `Target: ${formatDate(goal.byDate)}`;
	renderTasksList(goal);
	renderSuggestedTasks(goal);
	highlightActiveGoalCard();
}

function renderTasksList(goal) {
	if (!goalTasksList) return;
	const tasks = goal.tasks || [];

	if (tasks.length === 0) {
		goalTasksList.innerHTML = `<p class="muted">No tasks yet. Add one above!</p>`;
		return;
	}

	goalTasksList.innerHTML = tasks
		.map(
			(task, index) => `
				<div class="task-item ${task.completed ? "completed" : ""}">
					<label class="custom-checkbox">
						<input type="checkbox" data-index="${index}" ${task.completed ? "checked" : ""}>
						<span class="checkmark"></span>
						<span class="task-text">${escapeHtml(task.text)}</span>
					</label>
					<button class="delete-task-btn" data-index="${index}" title="Delete Task">&times;</button>
				</div>
			`
		)
		.join("");

	goalTasksList.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
		checkbox.addEventListener("change", (event) => {
			const index = Number(event.target.dataset.index);
			toggleTaskCompletion(activeGoalId, index, event.target.checked);
		});
	});

	goalTasksList.querySelectorAll(".delete-task-btn").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			const index = Number(event.target.dataset.index);
			deleteTask(activeGoalId, index);
		});
	});
}

function renderSuggestedTasks(goal) {
	if (!suggestedTasksList) return;
	const categoryKey = getCategoryForCareer(goal.career);
	const suggestions = TASKS[categoryKey] || TASKS[FALLBACK_CATEGORY] || [];

	if (suggestions.length === 0) {
		suggestedTasksList.innerHTML = `<li class="muted">No suggestions available.</li>`;
		return;
	}

	suggestedTasksList.innerHTML = suggestions
		.slice(0, 5)
		.map((task) => `<li>${escapeHtml(task)}</li>`)
		.join("");
}

async function addTaskToGoal(goalId, text) {
	const goalIndex = currentGoals.findIndex((goal) => goal.id === goalId);
	if (goalIndex === -1) return;

	const goal = currentGoals[goalIndex];
	const newTasks = [...goal.tasks, { text, completed: false, createdAt: Date.now() }];
	goal.tasks = newTasks;

	renderTasksList(goal);
	renderGoalsGrid();
	persistTasks(goalId, newTasks, {
		onError: () => alert("Unable to save task. Please try again."),
	});
}

async function toggleTaskCompletion(goalId, taskIndex, isComplete) {
	const goalIndex = currentGoals.findIndex((goal) => goal.id === goalId);
	if (goalIndex === -1) return;
	const goal = currentGoals[goalIndex];
	if (!goal.tasks[taskIndex]) return;

	goal.tasks[taskIndex].completed = isComplete;
	renderTasksList(goal);
	renderGoalsGrid();
	persistTasks(goalId, goal.tasks);
}

async function deleteTask(goalId, taskIndex) {
	if (!confirm("Delete this task?")) return;
	const goalIndex = currentGoals.findIndex((goal) => goal.id === goalId);
	if (goalIndex === -1) return;
	const goal = currentGoals[goalIndex];
	const updatedTasks = goal.tasks.filter((_, index) => index !== taskIndex);

	goal.tasks = updatedTasks;
	renderTasksList(goal);
	renderGoalsGrid();
	persistTasks(goalId, updatedTasks);
}

function persistTasks(goalId, tasks, options = {}) {
	if (currentUser && db) {
		updateDoc(doc(db, "users", currentUser.uid, "goals", goalId), {
			tasks,
		}).catch((error) => {
			console.error("Failed to sync tasks:", error);
			if (options.onError) options.onError(error);
		});
	} else {
		saveLocalGoalsToStorage();
	}
}

function saveLocalGoalsToStorage() {
	try {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentGoals));
	} catch (err) {
		console.warn("Unable to save tasks locally", err);
	}
}

function toggleActiveView(show) {
	if (!goalsGrid || !activeGoalContainer) return;
	if (show) {
		goalsGrid.style.display = "none";
		if (goalsSectionTitle) goalsSectionTitle.style.display = "none";
		activeGoalContainer.style.display = "block";
	} else {
		goalsGrid.style.display = "grid";
		if (goalsSectionTitle) goalsSectionTitle.style.display = "block";
		activeGoalContainer.style.display = "none";
	}
}

function highlightActiveGoalCard() {
	if (!goalsGrid) return;
	goalsGrid.querySelectorAll(".goal-card-item").forEach((card) => {
		if (card.dataset.id === activeGoalId) {
			card.classList.add("active");
		} else {
			card.classList.remove("active");
		}
	});
}

function formatDate(value) {
	if (!value) return "Date TBA";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "Date TBA";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	}).format(parsed);
}

function isPastDate(dateValue) {
	if (!dateValue) return false;
	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) return false;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return parsed < today;
}

function escapeHtml(text = "") {
	return String(text).replace(/[&<>"']/g, (char) => (
		{
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		}[char] || char
	));
}

function normalizeGoal(goal = {}) {
	return {
		...goal,
		tasks: Array.isArray(goal.tasks) ? goal.tasks : [],
	};
}

function getSortableTime(value) {
	if (!value) return Number.POSITIVE_INFINITY;
	const parsed = new Date(value);
	const time = parsed.getTime();
	return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

function getCategoryForCareer(career) {
	if (!career) return FALLBACK_CATEGORY;
	const c = career.toLowerCase();
	if (c.includes("developer") || c.includes("software") || c.includes("web") || c.includes("data") || c.includes("system")) {
		return "software";
	}
	if (c.includes("nurse") || c.includes("medical") || c.includes("health") || c.includes("doctor")) {
		return "health";
	}
	if (c.includes("engineer") || c.includes("technician") || c.includes("electric") || c.includes("mechanic")) {
		return "engineering";
	}
	if (c.includes("design") || c.includes("art") || c.includes("creative") || c.includes("ux")) {
		return "creative";
	}
	return "business";
}

