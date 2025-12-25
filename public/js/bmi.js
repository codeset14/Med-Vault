// js/bmi.js
// BMI Analysis with AI Integration

const API_KEY = "AIzaSyDvhQ3Qi9iGs0otkwNhbIp2tRzQm5IYRuw"; // Gemini API key
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("calculateBMI");
  const resultBox = document.getElementById("bmiResult");
  const loadingSpan = document.getElementById("bmiLoading");
  
  // Image upload elements
  const bodyImageInput = document.getElementById("bodyImage");
  const fileNameSpan = document.getElementById("fileName");
  const imagePreview = document.getElementById("imagePreview");
  const removeFileBtn = document.getElementById("removeFile");

  // Handle image selection
  bodyImageInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameSpan.textContent = file.name;
      removeFileBtn.style.display = "inline";
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle remove file
  removeFileBtn?.addEventListener("click", () => {
    bodyImageInput.value = "";
    fileNameSpan.textContent = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";
    removeFileBtn.style.display = "none";
  });

  analyzeBtn?.addEventListener("click", async () => {
    const data = {
      height: getValue("height"),
      weight: getValue("weight"),
      age: getValue("age"),
      gender: getValue("gender") || "male",
      activity: getValue("activity"),
      imageFile: document.getElementById("bodyImage")?.files[0] || null
    };

    // REQUIRED CHECK
    if (!data.height || !data.weight || !data.age || !data.activity) {
      alert("Please fill all required fields (height, weight, age, activity level)");
      return;
    }

    // Show loading state
    if (loadingSpan) loadingSpan.style.display = "inline";
    if (resultBox) resultBox.innerHTML = "";

    try {
      // Build the prompt
      const prompt = buildBMIPrompt(data);
      
      // Prepare request parts
      const parts = [{ text: prompt }];
      
      // If image provided, convert to base64 and add
      if (data.imageFile) {
        const base64Image = await fileToBase64(data.imageFile);
        parts.push({
          inline_data: {
            mime_type: data.imageFile.type,
            data: base64Image
          }
        });
      }

      // Call Gemini API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      });

      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Parse JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        
        // Store BMI globally for records.js
        window.latestBMI = analysisData.bmi;
        
        // Store full data for other uses
        window.bodyAssessmentInput = data;
        window.bmiAnalysisResult = analysisData;
        
        // Render result
        renderBMIResult(analysisData);
      } else {
        throw new Error("Invalid AI response format");
      }

    } catch (error) {
      console.error("BMI Analysis error:", error);
      
      // Fallback: Calculate BMI locally
      const heightM = parseFloat(data.height) / 100;
      const weightKg = parseFloat(data.weight);
      const bmi = (weightKg / (heightM * heightM)).toFixed(1);
      
      window.latestBMI = bmi;
      
      let category = "";
      const bmiNum = parseFloat(bmi);
      if (bmiNum < 18.5) category = "Underweight";
      else if (bmiNum < 25) category = "Normal";
      else if (bmiNum < 30) category = "Overweight";
      else category = "Obese";
      
      renderBMIResult({
        bmi: parseFloat(bmi),
        bmiCategory: category,
        bodyFatPercentage: null,
        summary: "Calculated using standard BMI formula. AI analysis unavailable.",
        suggestions: [
          "Maintain a balanced diet with whole foods",
          "Stay physically active with regular exercise",
          "Get adequate sleep and manage stress"
        ],
        confidence: "Medium (Fallback calculation)"
      });
    } finally {
      if (loadingSpan) loadingSpan.style.display = "none";
    }
  });
});

// Build the AI prompt with user data
function buildBMIPrompt(data) {
  const hasImage = data.imageFile ? "A body image is provided for rough body composition context." : "No body image provided. Rely purely on numerical estimation.";
  
  return `You are a calm, privacy-aware health analysis assistant.

Your task is to analyze basic body metrics and return a non-medical, informational assessment.
Do NOT give diagnoses, warnings, or alarming language.

User profile:
- Age: ${data.age} years
- Height: ${data.height} cm
- Weight: ${data.weight} kg
- Gender: ${data.gender} (if unknown, assume male)
- Activity level: ${data.activity}

Optional context:
- ${hasImage}

Tasks:
1. Calculate BMI using the standard formula.
2. Estimate Body Fat Percentage using a well-known approximation formula (e.g. BMI-based estimation).
3. Classify BMI into one of: Underweight, Normal, Overweight, Obese.
4. Explain the result in simple, reassuring language.
5. Provide exactly 3 practical lifestyle suggestions (general wellness only).
6. Include a confidence level (Low / Medium / High) based on data completeness.
7. Avoid medical diagnosis terms and do not suggest medication or treatment.

Response format (STRICT):
Return JSON ONLY in the following structure:

{
  "bmi": number,
  "bmiCategory": string,
  "bodyFatPercentage": number,
  "summary": string,
  "suggestions": [
    string,
    string,
    string
  ],
  "confidence": string
}`;
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Render BMI analysis result
function renderBMIResult(data) {
  const resultBox = document.getElementById("bmiResult");
  if (!resultBox) return;
  
  resultBox.innerHTML = `
    <div class="bmi-result-grid">
      <div class="bmi-stat">
        <span class="bmi-value">${data.bmi}</span>
        <span class="bmi-label">BMI</span>
      </div>
      <div class="bmi-stat">
        <span class="bmi-value">${data.bmiCategory}</span>
        <span class="bmi-label">Category</span>
      </div>
      ${data.bodyFatPercentage ? `
      <div class="bmi-stat">
        <span class="bmi-value">${data.bodyFatPercentage}%</span>
        <span class="bmi-label">Est. Body Fat</span>
      </div>
      ` : ""}
    </div>
    
    <p class="bmi-summary">${data.summary}</p>
    
    <div class="bmi-suggestions">
      <strong>Suggestions:</strong>
      <ul>
        ${data.suggestions.map(s => `<li>${s}</li>`).join("")}
      </ul>
    </div>
    
    <span class="confidence">Confidence: ${data.confidence}</span>
  `;
}

// Helper to get input value
function getValue(id, optional = false) {
  const el = document.getElementById(id);
  if (!el || !el.value) return optional ? null : "";
  return el.value.trim();
}
