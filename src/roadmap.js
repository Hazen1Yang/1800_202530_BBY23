// src/roadmap.js

// Same category codes as the quiz:
// T = Tech, H = Health, E = Engineering/Trades, C = Creative, B = Business
const trackConfig = {
  T: {
    label: "Tech Track – for programs like CST, CIT, and TSP.",
    blurb:
      "Your quiz suggests you’re a strong fit for technology programs that focus on problem-solving, coding, and working with systems."
  },
  H: {
    label: "Health Track – for programs like Nursing and Medical Laboratory Science.",
    blurb:
      "Your quiz suggests you’re people-focused and value helping others in healthcare or support roles."
  },
  E: {
    label: "Engineering & Trades Track – for programs like Electrical, Welding, and HVAC.",
    blurb:
      "Your quiz suggests you enjoy hands-on work, tools, equipment, and practical problem-solving."
  },
  C: {
    label: "Creative Track – for programs like Graphic Communications and Media Arts.",
    blurb:
      "Your quiz suggests you’re drawn to visual design, communication, and creative projects."
  },
  B: {
    label: "Business Track – for programs like Business Administration and Marketing.",
    blurb:
      "Your quiz suggests you’re interested in planning, organizing, and understanding how organizations work."
  }
};

function getQuizCategoryFromStorage() {
  try {
    return localStorage.getItem("pathfinderTopCategory");
  } catch (e) {
    return null;
  }
}

function getScoresFromStorage() {
  try {
    const raw = localStorage.getItem("pathfinderScores");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function renderTrackInfo(categoryCode, scores) {
  const labelEl = document.getElementById("roadmap-track-label");
  if (!labelEl) return;

  const container = labelEl.parentElement; // roadmap-hero section

  if (!categoryCode || !trackConfig[categoryCode]) {
    // No quiz yet or unknown category → generic text
    labelEl.textContent =
      "You can use this roadmap with any BCIT program. For a more personalized track, try the Program Match Quiz first.";
    return;
  }

  const config = trackConfig[categoryCode];

  // Update the subtitle line
  labelEl.textContent = config.label;

  // Optional: add a short blurb under it
  const blurbEl = document.createElement("p");
  blurbEl.className = "roadmap-subtitle track-blurb";
  blurbEl.textContent = config.blurb;

  container.appendChild(blurbEl);

  // Optional: display category scores if available
  if (scores && typeof scores === "object") {
    const scoresEl = document.createElement("p");
    scoresEl.className = "roadmap-subtitle score-line";
    scoresEl.textContent =
      `Category scores – ` +
      `Tech (T): ${scores.T ?? 0} · ` +
      `Health (H): ${scores.H ?? 0} · ` +
      `Eng/Trades (E): ${scores.E ?? 0} · ` +
      `Creative (C): ${scores.C ?? 0} · ` +
      `Business (B): ${scores.B ?? 0}`;
    container.appendChild(scoresEl);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const categoryCode = getQuizCategoryFromStorage();
  const scores = getScoresFromStorage();

  renderTrackInfo(categoryCode, scores);

  // Later we could also customize steps based on track
  // e.g., highlight tech links more if categoryCode === 'T'
});
.track-blurb {
  margin-top: 0.25rem;
}

.score-line {
  margin-top: 0.15rem;
  font-size: 0.85rem;
  color: #6b7280;
}
