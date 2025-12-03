// Load data + apply program filter if exists
async function loadCareers() {
  const params = new URLSearchParams(location.search);
  const programId = params.get("program");

  const careers = await fetch("data/careers.json").then(r => r.json());
  const programMap = await fetch("data/program-careers.json").then(r => r.json());

  let filtered = careers;

  // If we came from a specific BCIT program
  if (programId && programMap[programId]) {
    const careerIds = programMap[programId];
    filtered = careers.filter(c => careerIds.includes(c.id));
  }

  displayCareers(filtered);

  setupSearch(careers);
}

// Display career cards
function displayCareers(list) {
  const grid = document.getElementById("careerGrid");

  grid.innerHTML = list.map(c => `
    <div class="career-card">
      <h3>${c.title}</h3>
      <p><strong>NOC:</strong> ${c.noc}</p>
      <p><strong>Salary (BC):</strong> $${c.salary_bc_low}–$${c.salary_bc_high}/hr</p>
      <p><strong>Outlook:</strong> ${c.outlook_bc}</p>

      <button class="view-btn" onclick='openCareerModal(${JSON.stringify(c)})'>
        More Info
      </button>
    </div>
  `).join("");
}

// Search bar
function setupSearch(careers) {
  const search = document.getElementById("careerSearch");

  search.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    const filtered = careers.filter(c =>
      c.title.toLowerCase().includes(term)
    );
    displayCareers(filtered);
  });
}

// Modal
function openCareerModal(c) {
  const modal = document.getElementById("careerModal");
  const body = document.getElementById("modalBody");

  modal.classList.remove("hidden");

  body.innerHTML = `
    <h2>${c.title}</h2>
    <p><strong>NOC:</strong> ${c.noc}</p>
    <p><strong>Salary in BC:</strong> $${c.salary_bc_low}–$${c.salary_bc_high}/hr</p>
    <p><strong>Outlook:</strong> ${c.outlook_bc}</p>

    <h3>Skills</h3>
    <ul>${c.skills.map(s => `<li>${s}</li>`).join("")}</ul>

    <h3>Duties</h3>
    <ul>${c.duties.map(d => `<li>${d}</li>`).join("")}</ul>

    <h3>Education</h3>
    <p>${c.education}</p>

    <h3>Official Sources</h3>
    <p><a href="${c.link_workbc}" target="_blank">WorkBC</a></p>
    <p><a href="${c.link_jobbank}" target="_blank">Job Bank</a></p>
  `;
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("careerModal").classList.add("hidden");
});

loadCareers();
