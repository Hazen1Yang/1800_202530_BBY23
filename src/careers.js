const OUTLOOK_PRIORITY = ["excellent", "very good", "good", "fair", "limited"];
const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0
});

const state = {
  searchTerm: "",
  outlook: "all",
  minSalary: 0,
  sort: "recommended",
  programId: null,
  allCareers: [],
  baseCareers: [],
  careersById: new Map()
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  loadCareers();
});

function cacheElements() {
  els.grid = document.getElementById("careerGrid");
  els.search = document.getElementById("careerSearch");
  els.clearSearch = document.getElementById("clearSearch");
  els.outlookChips = Array.from(document.querySelectorAll(".filter-chip"));
  els.salaryRange = document.getElementById("salaryRange");
  els.salaryValue = document.getElementById("salaryValue");
  els.sortSelect = document.getElementById("sortSelect");
  els.emptyState = document.getElementById("careerEmpty");
  els.modal = document.getElementById("careerModal");
  els.modalBody = document.getElementById("modalBody");
  els.closeModal = document.getElementById("closeModal");
  els.statCount = document.querySelector('[data-stat="count"]');
  els.statMedian = document.querySelector('[data-stat="median"]');
  els.statOutlook = document.querySelector('[data-stat="outlook"]');
}

function bindEvents() {
  els.search?.addEventListener("input", e => {
    state.searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  els.clearSearch?.addEventListener("click", () => {
    if (!els.search) return;
    els.search.value = "";
    state.searchTerm = "";
    render();
  });

  els.outlookChips?.forEach(chip => {
    chip.addEventListener("click", () => {
      state.outlook = chip.dataset.outlook || "all";
      els.outlookChips.forEach(c => c.classList.toggle("is-active", c === chip));
      render();
    });
  });

  els.salaryRange?.addEventListener("input", e => {
    state.minSalary = Number(e.target.value) || 0;
    updateSalaryLabel();
    render();
  });

  els.sortSelect?.addEventListener("change", e => {
    state.sort = e.target.value;
    render();
  });

  els.grid?.addEventListener("click", event => {
    const button = event.target.closest(".view-btn");
    if (!button) return;
    const { careerId } = button.dataset;
    if (careerId) {
      openCareerModal(state.careersById.get(careerId));
    }
  });

  els.closeModal?.addEventListener("click", closeCareerModal);

  els.modal?.addEventListener("click", event => {
    if (event.target === els.modal) {
      closeCareerModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCareerModal();
    }
  });
}

async function loadCareers() {
  state.programId = new URLSearchParams(location.search).get("program");

  try {
    const [careers, programMap] = await Promise.all([
      fetchJson("data/careers.json"),
      fetchJson("data/program-careers.json")
    ]);

    state.allCareers = careers;
    state.careersById = new Map(careers.map(item => [item.id, item]));
    state.baseCareers = careers;

    if (state.programId && programMap[state.programId]) {
      const ids = new Set(programMap[state.programId]);
      const programCareers = careers.filter(c => ids.has(c.id));
      state.baseCareers = programCareers.length ? programCareers : careers;
    }

    updateSalaryLabel();
    render();
  } catch (error) {
    console.error("Failed to load careers", error);
    showErrorState();
  }
}

function fetchJson(path) {
  return fetch(path).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}`);
    }
    return response.json();
  });
}

function render() {
  const list = getFilteredCareers();
  renderCareers(list);
  updateStats(list);
  toggleEmptyState(list.length === 0);
}

function getFilteredCareers() {
  const dataset = state.baseCareers.length ? state.baseCareers : state.allCareers;

  return dataset
    .filter(matchesSearch)
    .filter(matchesOutlook)
    .filter(meetsSalary)
    .sort(sortCareers);
}

function matchesSearch(career) {
  if (!state.searchTerm) return true;
  const haystack = [career.title, career.noc, ...(career.skills || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(state.searchTerm);
}

function matchesOutlook(career) {
  if (state.outlook === "all") return true;
  return (career.outlook_bc || "").toLowerCase() === state.outlook;
}

function meetsSalary(career) {
  const high = Number(career.salary_bc_high ?? career.salary_bc_low ?? 0);
  if (!state.minSalary) return true;
  return high >= state.minSalary;
}

function sortCareers(a, b) {
  switch (state.sort) {
    case "salary-high":
      return (b.salary_bc_high || 0) - (a.salary_bc_high || 0);
    case "salary-low":
      return (a.salary_bc_low || 0) - (b.salary_bc_low || 0);
    case "az":
      return a.title.localeCompare(b.title);
    default:
      return recommendedScore(b) - recommendedScore(a);
  }
}

function recommendedScore(career) {
  const outlookScore = getOutlookWeight((career.outlook_bc || "").toLowerCase());
  const salaryScore = (career.salary_bc_high || career.salary_bc_low || 0) / 10;
  return outlookScore * 10 + salaryScore;
}

function renderCareers(list) {
  if (!els.grid) return;
  els.grid.innerHTML = list.map(career => {
    const skills = (career.skills || []).slice(0, 3);
    const remainingSkillCount = (career.skills || []).length - skills.length;
    const outlookClass = getOutlookClass(career.outlook_bc);
    return `
      <article class="career-card">
        <span class="career-chip ${outlookClass}">${career.outlook_bc || "Outlook TBD"}</span>
        <h3>${career.title}</h3>
        <p class="career-noc">NOC ${career.noc || "—"}</p>
        <p class="career-salary">${formatSalaryRange(career)}</p>
        <div class="career-skills">
          ${skills.map(skill => `<span class="skill-chip">${skill}</span>`).join("")}
          ${remainingSkillCount > 0 ? `<span class="skill-chip">+${remainingSkillCount} more</span>` : ""}
        </div>
        <button class="view-btn" type="button" data-career-id="${career.id}">View details</button>
      </article>
    `;
  }).join("");
}

function updateStats(list) {
  if (!els.statCount || !els.statMedian || !els.statOutlook) return;

  els.statCount.textContent = list.length.toString();

  if (list.length === 0) {
    els.statMedian.textContent = `${formatCurrency(0)}/hr`;
    els.statOutlook.textContent = "—";
    return;
  }

  const medianSalary = computeMedian(list.map(avgSalary));
  els.statMedian.textContent = `${formatCurrency(medianSalary)}/hr`;

  const bestOutlook = computeBestOutlook(list);
  els.statOutlook.textContent = bestOutlook ? capitalize(bestOutlook) : "—";
}

function toggleEmptyState(isEmpty) {
  if (!els.emptyState) return;
  els.emptyState.classList.toggle("hidden", !isEmpty);
}

function showErrorState() {
  if (els.emptyState) {
    els.emptyState.textContent = "We couldn't load careers right now. Please try again later.";
    els.emptyState.classList.remove("hidden");
  }
}

function openCareerModal(career) {
  if (!career || !els.modal || !els.modalBody) return;
  els.modalBody.innerHTML = `
    <h2>${career.title}</h2>
    <div class="modal-section">
      <p><strong>NOC:</strong> ${career.noc || "—"}</p>
      <p><strong>Hourly salary (BC):</strong> ${formatSalaryRange(career)}</p>
      <p><strong>Outlook:</strong> ${career.outlook_bc || "—"}</p>
    </div>
    ${renderListSection("Skills", career.skills)}
    ${renderListSection("Daily duties", career.duties)}
    ${career.education ? `<div class="modal-section"><h3>Education</h3><p>${career.education}</p></div>` : ""}
    <div class="modal-section">
      <h3>Official sources</h3>
      ${renderLink("WorkBC", career.link_workbc)}
      ${renderLink("Job Bank", career.link_jobbank)}
    </div>
  `;
  els.modal.classList.remove("hidden");
}

function closeCareerModal() {
  els.modal?.classList.add("hidden");
}

function renderListSection(title, list) {
  if (!Array.isArray(list) || !list.length) return "";
  return `
    <div class="modal-section">
      <h3>${title}</h3>
      <ul>${list.map(item => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

function renderLink(label, url) {
  if (!url) return `<p>${label} link unavailable</p>`;
  return `<p><a href="${url}" target="_blank" rel="noreferrer">${label}</a></p>`;
}

function formatSalaryRange(career) {
  const low = Number(career.salary_bc_low || 0);
  const high = Number(career.salary_bc_high || 0);
  if (!low && !high) return "Salary data TBD";
  if (!low) return `${formatCurrency(high)}/hr`;
  if (!high || high === low) return `${formatCurrency(low)}/hr`;
  return `${formatCurrency(low)}–${formatCurrency(high)}/hr`;
}

function avgSalary(career) {
  const low = Number(career.salary_bc_low || career.salary_bc_high || 0);
  const high = Number(career.salary_bc_high || career.salary_bc_low || 0);
  return (low + high) / 2;
}

function computeMedian(values) {
  const nums = values.filter(v => typeof v === "number" && !Number.isNaN(v)).sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
}

function computeBestOutlook(list) {
  const ranked = list
    .map(c => (c.outlook_bc || "").toLowerCase())
    .map(value => ({ value, index: OUTLOOK_PRIORITY.indexOf(value) }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index);
  return ranked.length ? ranked[0].value : null;
}

function getOutlookClass(outlook) {
  if (!outlook) return "";
  const key = outlook.toLowerCase().replace(/\s+/g, "-");
  return `outlook-${key}`;
}

function updateSalaryLabel() {
  if (!els.salaryValue) return;
  const value = Math.max(0, Number(state.minSalary));
  els.salaryValue.textContent = value ? `${formatCurrency(value)}/hr+` : `${formatCurrency(0)}/hr`;
}

function formatCurrency(amount) {
  return currencyFormatter.format(Math.round(amount || 0));
}

function capitalize(value) {
  if (!value) return value;
  return value.replace(/(^|\s)\w/g, match => match.toUpperCase());
}

function getOutlookWeight(value) {
  const index = OUTLOOK_PRIORITY.indexOf(value);
  if (index === -1) return 0;
  return OUTLOOK_PRIORITY.length - index;
}
