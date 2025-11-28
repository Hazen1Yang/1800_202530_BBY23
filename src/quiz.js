// src/quiz.js

// Map A–E answers to categories
// T = Tech, H = Health, E = Engineering/Trades, C = Creative, B = Business
const answerMapping = {
  A: "T",
  B: "H",
  C: "E",
  D: "C",
  E: "B"
};

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

// Main scoring logic
function calculateCategoryScores(formData) {
  const scores = { T: 0, H: 0, E: 0, C: 0, B: 0 };

  // Questions 1–4, 9, 10, 11 use A–E
  const letterQuestions = ["q1", "q2", "q3", "q4", "q9", "q10", "q11"];
  letterQuestions.forEach((q) => {
    const answer = formData[q];
    if (!answer) return;
    const category = answerMapping[answer];
    if (category) {
      scores[category] += 2; // interests & goals are heavier
    }
  });

  // Skill questions 5–8 use 1–5
  const math = Number(formData.q5 || 0);     // math → T, E, B
  const comps = Number(formData.q6 || 0);    // computers → T
  const comm = Number(formData.q7 || 0);     // communication → H, C, B
  const handsOn = Number(formData.q8 || 0);  // hands-on → E, T

  scores.T += Math.round(math * 0.7 + comps * 1.2 + handsOn * 0.6);
  scores.E += Math.round(math * 0.5 + handsOn * 1.3);
  scores.B += Math.round(math * 0.6 + comm * 0.7);
  scores.H += Math.round(comm * 1.1);
  scores.C += Math.round(comm * 0.8);

  // Q12: timing preference → slight nudge
  const q12 = formData.q12;
  if (q12 === "A") {
    scores.E += 1;
    scores.T += 1;
  } else if (q12 === "C") {
    scores.B += 1;
    scores.H += 1;
  }

  return scores;
}

function getTopCategory(scores) {
  let bestCategory = null;
  let bestScore = -Infinity;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }
  return bestCategory;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quiz-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {};
    for (let i = 1; i <= 12; i += 1) {
      const name = `q${i}`;
      const val = getRadioValue(name);
      formData[name] = val;
    }

    // make sure all questions answered
    const missing = Object.entries(formData)
      .filter(([, v]) => v === null)
      .map(([k]) => k);

    if (missing.length > 0) {
      alert("Please answer all questions before submitting the quiz.");
      return;
    }

    const scores = calculateCategoryScores(formData);
    const topCategory = getTopCategory(scores);

    // SAVE RESULT FOR RESULTS PAGE
    try {
      localStorage.setItem("pathfinderTopCategory", topCategory);
      localStorage.setItem("pathfinderScores", JSON.stringify(scores));
    } catch (e) {
      console.warn("Could not save quiz results to localStorage", e);
    }

    // GO TO RESULTS PAGE
    window.location.href = "quizResults.html";
  });
});
