// -------------------------------------------------------------
// QUIZ.JS — with Firestore integration for careerInterest
// -------------------------------------------------------------

console.log("quiz.js loaded");

// Firebase + category mapping
import { auth, db } from "./firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import { CATEGORY_MAP } from "./tasks.js";

// -------------------------------------------------------------
// SAVE QUIZ RESULT TO FIRESTORE
// -------------------------------------------------------------
async function saveQuizResultToFirestore(topCategory) {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No logged-in user — cannot save quiz result.");
    return;
  }

  const mapped = CATEGORY_MAP[topCategory]; // e.g. "T" -> "software"
  if (!mapped) {
    console.warn("Invalid topCategory:", topCategory);
    return;
  }

  try {
    await setDoc(
      doc(db, "users", user.uid),
      { careerInterest: mapped },
      { merge: true }
    );
    console.log("Saved careerInterest to Firestore:", mapped);
  } catch (err) {
    console.error("Error writing quiz result to Firestore:", err);
  }
}

// -------------------------------------------------------------
// ORIGINAL QUIZ LOGIC
// -------------------------------------------------------------

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

// Main scoring logic
function calculateCategoryScores(formData) {
  const scores = { T: 0, H: 0, E: 0, C: 0, B: 0 };
  // Mapping: (index - 1) % 5
  // 0 -> T, 1 -> H, 2 -> E, 3 -> C, 4 -> B
  const categories = ["T", "H", "E", "C", "B"];

  for (let i = 1; i <= 20; i++) {
    const val = Number(formData[`q${i}`] || 0);
    const catIndex = (i - 1) % 5;
    const category = categories[catIndex];
    scores[category] += val;
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {};
    for (let i = 1; i <= 20; i += 1) {
      const name = `q${i}`;
      const val = getRadioValue(name);
      formData[name] = val;
    }

    // Make sure all questions answered
    const missing = Object.entries(formData)
      .filter(([, v]) => v === null)
      .map(([k]) => k);

    if (missing.length > 0) {
      alert("Please answer all questions before submitting the quiz.");
      return;
    }

    const scores = calculateCategoryScores(formData);
    const topCategory = getTopCategory(scores);

    console.log("Top quiz category:", topCategory);

    // SAVE RESULT FOR RESULTS PAGE
    try {
      localStorage.setItem("pathfinderTopCategory", topCategory);
      localStorage.setItem("pathfinderScores", JSON.stringify(scores));
    } catch (e) {
      console.warn("Could not save quiz results to localStorage", e);
    }

    // SAVE TO FIRESTORE FOR TASK SYSTEM
    await saveQuizResultToFirestore(topCategory);

    // GO TO RESULTS PAGE
    window.location.href = "quizResults.html";
  });
});

