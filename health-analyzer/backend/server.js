import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ✅ VERY IMPORTANT */
app.use(cors());
app.use(express.json()); // <-- REQUIRED to read req.body

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

app.post("/chat", async (req, res) => {
  try {
    console.log("Raw body:", req.body);

    // ✅ SAFETY CHECK
    if (!req.body || !req.body.message) {
      return res.status(400).json({
        error: "Invalid request body. Expected { message: string }"
      });
    }

    const userMessage = req.body.message;

    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Gemini server running on http://localhost:3000");
});
