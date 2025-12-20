// js/bmi.js
document.addEventListener("DOMContentLoaded", () => {
  const heightInput = document.getElementById("height");
  const weightInput = document.getElementById("weight");
  const btn = document.getElementById("calculateBMI");
  const result = document.getElementById("bmiResult");

  btn.addEventListener("click", () => {
    const heightCm = heightInput.value;
    const weightKg = weightInput.value;

    if (!heightCm || !weightKg) {
      alert("Please enter height and weight");
      return;
    }

    const heightM = heightCm / 100;
    const bmi = (weightKg / (heightM * heightM)).toFixed(2);

    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";

    result.textContent = `BMI: ${bmi} (${category})`;
    window.latestBMI = bmi;
  });
});
 