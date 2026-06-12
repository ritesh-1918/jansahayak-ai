document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById("chat-container");
    const inputField = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", sender);
        msgDiv.textContent = text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, "user");
        inputField.value = "";

        // Simulate bot typing/response (Frontend only for now)
        setTimeout(() => {
            addMessage("This is a placeholder response from JanSahayak AI.", "bot");
        }, 800);
    }

    sendBtn.addEventListener("click", handleSend);

    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });
});
