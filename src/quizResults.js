// src/quizResults.js

// Same data structure as in quiz.js so results page works standalone
const bcitPrograms = {
  T: {
    name: "Tech Programs",
    description:
      "You enjoy logic, problem-solving, and working with technology. Tech programs at BCIT might be a strong fit.",
    programs: [
      {
        title: "CST – Computer Systems Technology",
        url: "https://www.bcit.ca/programs/computer-systems-technology-diploma-full-time-5500dipma/",
        advisor: "cst@bcit.ca"
      },
      {
        title: "CIT – Computer Information Technology",
        url: "https://www.bcit.ca/programs/computer-information-technology-diploma-full-time-5510dipma/",
        advisor: "cit@bcit.ca"
      },
      {
        title: "Technology Support Professional",
        url: "https://www.bcit.ca/programs/technology-support-professional-certificate-full-time-6445cert/",
        advisor: "tsp@bcit.ca"
      }
    ]
  },

  H: {
    name: "Health Programs",
    description:
      "You are people-focused and care about helping others. A health-related BCIT program could be a great match.",
    programs: [
      {
        title: "Nursing",
        url: "https://www.bcit.ca/programs/bachelor-of-science-in-nursing-full-time-810fbscn/",
        advisor: "nursing@bcit.ca"
      },
      {
        title: "Medical Laboratory Science",
        url: "https://www.bcit.ca/programs/medical-laboratory-science-diploma-full-time-1070diplt/",
        advisor: "medlab@bcit.ca"
      }
    ]
  },

  E: {
    name: "Engineering & Trades",
    description:
      "You enjoy working with your hands, tools, and equipment. Engineering or trades programs may fit your style.",
    programs: [
      {
        title: "Electrical",
        url: "https://www.bcit.ca/programs/electrical-foundation-full-time-icci/",
        advisor: "electrical@bcit.ca"
      },
      {
        title: "Welding",
        url: "https://www.bcit.ca/programs/welding-foundation-full-time-icwp/",
        advisor: "welding@bcit.ca"
      },
      {
        title: "HVAC & Refrigeration",
        url: "https://www.bcit.ca/programs/hvac-refrigeration-technician-foundation-full-time-icpr/",
        advisor: "hvac@bcit.ca"
      }
    ]
  },

  C: {
    name: "Creative Programs",
    description:
      "You lean toward design, visuals, and creative work. Creative-focused programs could help you grow that strength.",
    programs: [
      {
        title: "Graphic Design",
        url: "https://www.bcit.ca/programs/graphic-communications-technology-management-diploma-full-time-6515diplt/",
        advisor: "design@bcit.ca"
      },
      {
        title: "Animation or Media",
        url: "https://www.bcit.ca/study/creative-arts-media/",
        advisor: "media@bcit.ca"
      }
    ]
  },

  B: {
    name: "Business Programs",
    description:
      "You like organizing, planning, and understanding how organizations work. Business programs may be a good direction.",
    programs: [
      {
        title: "Business Administration",
        url: "https://www.bcit.ca/programs/business-administration-diploma-full-time-500adipma/",
        advisor: "business@bcit.ca"
      },
      {
        title: "Marketing",
        url: "https://www.bcit.ca/programs/marketing-management-diploma-full-time-630adipma/",
        advisor: "marketing@bcit.ca"
      }
    ]
  }
};

function renderNoData() {
  const container = document.getElementById("quiz-result");
  if (!container) return;

  container.innerHTML = `
    <div class="quiz-result-card">
      <h2>No quiz results found</h2>
      <p>
        It looks like you haven’t completed the program-matching quiz yet, or
        your results have been cleared.
      </p>
      <p>
        Take the quiz to get a personalized list of BCIT programs based on your
        interests, skills, and goals.
      </p>
      <a href="quiz.html" class="btn">Take the Quiz</a>
    </div>
  `;
}

function renderResult(category, scores) {
  const container = document.getElementById("quiz-result");
  if (!container) return;

  const data = bcitPrograms[category];
  if (!data) {
    renderNoData();
    return;
  }

  const programsHtml = data.programs
    .map(
      (p) => `
      <li>
        <strong>${p.title}</strong><br>
        <a href="${p.url}" target="_blank" rel="noopener noreferrer">
          View program details
        </a><br>
        <span class="advisor-email">Advisor: ${p.advisor}</span>
      </li>
    `
    )
    .join("");

  let scoresHtml = "";
  if (scores && typeof scores === "object") {
    scoresHtml = `
      <div class="score-summary">
        <h4>Your category scores</h4>
        <p>
          Tech (T): ${scores.T ?? 0} &nbsp;·&nbsp;
          Health (H): ${scores.H ?? 0} &nbsp;·&nbsp;
          Eng/Trades (E): ${scores.E ?? 0} &nbsp;·&nbsp;
          Creative (C): ${scores.C ?? 0} &nbsp;·&nbsp;
          Business (B): ${scores.B ?? 0}
        </p>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="quiz-result-card">
      <h2>Your Recommended Direction: ${data.name}</h2>
      <p>${data.description}</p>

      ${scoresHtml}

      <h3>Suggested BCIT Programs</h3>
      <ul class="program-list">
        ${programsHtml}
      </ul>

      <h3>Next Steps</h3>
      <ol class="next-steps">
        <li>Open the BCIT program pages that interest you and check admission requirements.</li>
        <li>Note any missing courses (like Math 12, English 12) and plan how to complete them.</li>
        <li>Contact a program advisor if you have questions about prerequisites or the application process.</li>
      </ol>

      <div class="result-actions">
        <a href="programs.html" class="btn">Explore programs in Pathfinder</a>
        <a href="https://www.bcit.ca/advising/" target="_blank" class="btn secondary">
          Talk to a BCIT Advisor
        </a>
        <a href="quiz.html" class="btn secondary">
          Retake Quiz
        </a>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  let topCategory = null;
  let scores = null;

  try {
    topCategory = localStorage.getItem("pathfinderTopCategory");
    const scoresRaw = localStorage.getItem("pathfinderScores");
    scores = scoresRaw ? JSON.parse(scoresRaw) : null;
  } catch (e) {
    // ignore storage errors
  }

  if (!topCategory) {
    renderNoData();
  } else {
    renderResult(topCategory, scores);
  }
});
