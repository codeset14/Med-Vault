// js/chatbot.js

const API_KEY = "PASTE_YOUR_GEMINI_API_KEY";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
  API_KEY;

const messagesDiv = document.getElementById("chatMessages");
const input = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendChatBtn");

function addMessage(text, type) {
  const div = document.createElement("div");
  div.classList.add("message", type);
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  addMessage("Thinking...", "bot");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "You are a health assistant. Give general advice only, no diagnosis.\n\nUser: " +
                  userText,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't answer that.";

    // Remove "Thinking..."
    messagesDiv.removeChild(messagesDiv.lastChild);

    addMessage(botReply, "bot");
  } catch (err) {
    console.error(err);
    messagesDiv.removeChild(messagesDiv.lastChild);
    addMessage("Error connecting to AI.", "bot");
  }
});