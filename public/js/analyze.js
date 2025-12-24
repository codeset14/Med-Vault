// js/analyze.js
import { auth } from "./firebaseConfig.js";

const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("analysisResult");

analyzeBtn.addEventListener("click", async () => {
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;
  const age = document.getElementById("age").value;
  const activity = document.getElementById("activity").value;
  const sugar = document.getElementById("sugarLevel").value;
  const sys = document.getElementById("systolic").value;
  const dia = document.getElementById("diastolic").value;
  const image = document.getElementById("bodyImage").files[0];

  if (!height || !weight || !age || !activity) {
    resultBox.innerHTML = "Please fill required fields.";
    return;
  }

  let optionalData = "";
  if (sugar) optionalData += `- Blood sugar: ${sugar} mg/dL\n`;
  if (sys && dia) optionalData += `- Blood pressure: ${sys}/${dia}\n`;
  if (!optionalData) optionalData = "No additional clinical data provided.";

  let imageContext = image
    ? "A body image is provided for visual body composition estimation."
    : "No body image provided.";

  const prompt = `
You are a health analysis assistant.

User profile:
- Age: ${age}
- Height: ${height} cm
- Weight: ${weight} kg
- Activity level: ${activity}

Optional health data:
${optionalData}

Image context:
${imageContext}

Tasks:
1. Estimate BMI and body condition
2. Explain confidence level
3. Give 3 practical lifestyle suggestions
4. Avoid medical diagnosis language
`;

  resultBox.innerHTML = "Analyzing…";

  //  TEMP mock response (replace with real API later)
  setTimeout(() => {
    resultBox.innerHTML = `
      <strong>BMI Estimate:</strong> Normal range<br><br>
      <strong>Condition:</strong> Balanced body composition based on inputs.<br><br>
      <strong>Suggestions:</strong>
      <ul>
        <li>Maintain consistent activity</li>
        <li>Track weight weekly</li>
        <li>Hydration & sleep focus</li>
      </ul>
      <span class="confidence">Confidence: Medium (based on provided data)</span>
    `;
  }, 1500);
});
