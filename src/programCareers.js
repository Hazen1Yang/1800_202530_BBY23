async function openProgramCareers(programId) {
  const [programCareersRes, careersRes] = await Promise.all([
    fetch("/data/program-careers.json"),
    fetch("/data/careers.json")
  ]);

  const programMap = await programCareersRes.json();
  const careers = await careersRes.json();

  const relatedIds = programMap[programId];
  const relatedCareers = careers.filter(c => relatedIds.includes(c.id));

  displayCareers(relatedCareers);
}

function displayCareers(list) {
  const container = document.getElementById("careerResults");
  container.innerHTML = list.map(c => `
    <div class="career-card">
      <h3>${c.title}</h3>
      <p><strong>NOC:</strong> ${c.noc}</p>
      <p><strong>Salary in BC:</strong> $${c.salary_bc_low}–$${c.salary_bc_high}/hr</p>
      <p><strong>Outlook:</strong> ${c.outlook_bc}</p>
      <button onclick='showMore(${JSON.stringify(c)})'>More Info</button>
    </div>
  `).join("");
}
