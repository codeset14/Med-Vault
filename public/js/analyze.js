// js/analyze.js
// Purpose:
// - Collect body assessment inputs
// - Build AI prompt template
// - Provide backend-ready hook
// - Render demo AI output

const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("analysisResult");

analyzeBtn.addEventListener("click", async () => {
  const data = collectUserInput();

  if (!data.valid) {
    renderMessage("Please fill height, weight, age, and activity level.");
    return;
  }

  renderMessage("Analyzing your health profile…");

  const prompt = buildPrompt(data);

  /**
   * 🔑 BACKEND NOTE
   * Replace mockAIResponse(prompt) with:
   * fetch("/api/analyze", { prompt })
   * API key MUST stay server-side
   */

  try {
    const aiResult = await mockAIResponse(prompt);
    renderResult(aiResult);
  } catch (err) {
    console.error(err);
    renderMessage("Analysis failed. Please try again.");
  }
});

/* ---------- INPUT COLLECTION ---------- */
function collectUserInput() {
  const data = {
    height: val("height"),
    weight: val("weight"),
    age: val("age"),
    activity: val("activity"),

    sugar: val("sugarLevel", true),
    bpSys: val("systolic", true),
    bpDia: val("diastolic", true),

    imageProvided: Boolean(
      document.getElementById("bodyImage")?.files?.length
    ),
  };

  data.valid =
    data.height &&
    data.weight &&
    data.age &&
    data.activity;

  return data;
}

function val(id, optional = false) {
  const el = document.getElementById(id);
  if (!el || !el.value) return optional ? null : "";
  return el.value.trim();
}

/* ---------- PROMPT TEMPLATE ---------- */
function buildPrompt(data) {
  return `
You are a calm, privacy-aware health analysis assistant.

User profile:
- Age: ${data.age}
- Height: ${data.height} cm
- Weight: ${data.weight} kg
- Activity level: ${data.activity}

Optional signals:
- Blood sugar: ${data.sugar || "Not provided"}
- Blood pressure: ${
    data.bpSys && data.bpDia
      ? `${data.bpSys}/${data.bpDia}`
      : "Not provided"
  }

Image context:
${data.imageProvided
  ? "Body image provided for visual context."
  : "No body image provided."
}

Tasks:
1. Estimate BMI and body condition
2. Explain confidence level
3. Provide 3 practical lifestyle suggestions
4. Avoid diagnosis or alarming language
`;
}

/* ---------- MOCK AI (DEMO ONLY) ---------- */
async function mockAIResponse(prompt) {
  console.log("AI PROMPT:\n", prompt);
  await new Promise((r) => setTimeout(r, 1200));

  return {
    bmi: "Normal range",
    condition:
      "Balanced body composition based on multiple signals.",
    suggestions: [
      "Maintain consistent physical activity",
      "Track trends monthly",
      "Prioritize sleep and hydration",
    ],
    confidence: "Medium",
  };
}

/* ---------- UI RENDER ---------- */
function renderResult(data) {
  resultBox.innerHTML = `
    <strong>BMI Estimate:</strong> ${data.bmi}<br><br>
    <strong>Condition:</strong> ${data.condition}<br><br>
    <strong>Suggestions:</strong>
    <ul>
      ${data.suggestions.map(s => `<li>${s}</li>`).join("")}
    </ul>
    <span class="confidence">
      Confidence level: ${data.confidence}
    </span>
  `;
}

function renderMessage(msg) {
  resultBox.textContent = msg;
}
