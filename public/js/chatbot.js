// js/chatbot.js

const API_KEY = "AIzaSyArjErCxO6ETxkqG3ArCnRrlUsr5aZ3dfU";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
  API_KEY;

// Global send function for inline onclick
window.sendChatMessage = async function() {
  const messagesDiv = document.getElementById("chatMessages");
  const input = document.getElementById("userMessage");
  
  const userText = input.value.trim();
  if (!userText) return;

  // Add user message
  const userDiv = document.createElement("div");
  userDiv.classList.add("message", "user");
  userDiv.textContent = userText;
  messagesDiv.appendChild(userDiv);
  input.value = "";

  // Add thinking message
  const thinkingDiv = document.createElement("div");
  thinkingDiv.classList.add("message", "bot");
  thinkingDiv.textContent = "Thinking...";
  messagesDiv.appendChild(thinkingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

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

    // Remove thinking message
    messagesDiv.removeChild(thinkingDiv);

    // Add bot reply
    const botDiv = document.createElement("div");
    botDiv.classList.add("message", "bot");
    botDiv.textContent = botReply;
    messagesDiv.appendChild(botDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (err) {
    console.error(err);
    messagesDiv.removeChild(thinkingDiv);
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("message", "bot");
    errorDiv.textContent = "Error connecting to AI.";
    messagesDiv.appendChild(errorDiv);
  }
};

// Allow Enter key to send
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userMessage");
  if (input) {
    input.onkeypress = function(e) {
      if (e.key === "Enter") {
        window.sendChatMessage();
      }
    };
  }
});
